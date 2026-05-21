"""
Reports API — search, status polling, fetch, list.

Free tier  : 2 lifetime reports, lite AI analysis, 1 platform
Pro tier   : 20 reports per rolling 7-day window, full AI analysis, all 4 platforms

NOTE: report assembly is done synchronously within the same Lambda invocation.
BackgroundTasks are intentionally not used here because Mangum/Lambda runs them
inside the invocation boundary anyway — using them gave no benefit while making
error propagation impossible and leaving reports stuck in "processing" forever.
"""
import uuid
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.report import Report
from app.schemas.report import (
    SearchRequest,
    ReportStatusResponse,
    ReportOut,
    ReportListItem,
    ProductOut,
    MarginAnalysis,
    PlatformComparison,
)
from app.api.deps import get_current_user_sub
from app.services.report_service import assemble_report

router = APIRouter(prefix="/reports", tags=["reports"])

FREE_REPORT_LIMIT = 2      # lifetime
PRO_WEEKLY_LIMIT = 20      # per rolling 7-day window


def _get_db_user(sub: dict, db: Session) -> User:
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sync first.")
    return user


def _find_matching_product(db: Session, params: SearchRequest, user_id) -> Product | None:
    # Exclude products this user has already received (any status — including failed
    # attempts where product was selected but report generation failed).
    seen_subq = (
        db.query(Report.product_id)
        .filter(Report.user_id == user_id)
        .subquery()
    )

    query = db.query(Product).filter(Product.id.notin_(seen_subq))

    max_source_price = params.budgetUsd * 0.30
    query = query.filter(Product.source_price_usd <= max_source_price)

    if params.category and params.category != "No preference":
        query = query.filter(Product.category.ilike(f"%{params.category}%"))

    if params.trendingOnly:
        query = query.filter(Product.is_trending == True)

    if params.keywordsToAvoid:
        keywords = [k.strip().lower() for k in params.keywordsToAvoid.split(",")]
        for kw in keywords:
            query = query.filter(Product.name.notilike(f"%{kw}%"))

    cutoff = datetime.utcnow() - timedelta(hours=24)
    fresh = (
        query.filter(Product.last_refreshed >= cutoff)
        .order_by(Product.is_trending.desc(), Product.estimated_monthly_sales.desc())
        .first()
    )
    if fresh:
        return fresh

    return (
        query.order_by(Product.is_trending.desc(), Product.last_refreshed.desc())
        .first()
    )


def _product_to_schema(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description or "",
        category=product.category or "General",
        tags=product.tags or [],
        sourcePlatform=product.source_platform,
        sourceUrl=product.source_url or "",
        sourcePriceUsd=float(product.source_price_usd or 0),
        sourceMinOrderQty=product.source_min_order_qty or 1,
        sourceShippingEstimateUsd=float(product.source_shipping_estimate_usd or 0),
        sourceImageUrl=product.source_image_url or "",
        bestSellPlatform=product.best_sell_platform or "amazon",
        amazonAsin=product.amazon_asin,
        ebayItemId=product.ebay_item_id,
        etsyListingId=product.etsy_listing_id,
        avgSellPriceUsd=float(product.avg_sell_price_usd or 0),
        estimatedMonthlySales=product.estimated_monthly_sales or 0,
        salesRank=product.sales_rank or 0,
        reviewCount=product.review_count or 0,
        avgReviewScore=float(product.avg_review_score or 4.0),
        trendData=product.trend_data or [],
        isTrending=product.is_trending or False,
        scrapedAt=product.scraped_at or datetime.utcnow(),
        lastRefreshed=product.last_refreshed or datetime.utcnow(),
    )


@router.post("/search", response_model=ReportStatusResponse)
async def search(
    params: SearchRequest,
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = _get_db_user(sub, db)
    now = datetime.utcnow()

    # ── Tier enforcement ────────────────────────────────────────────────────
    if user.subscription_status == "free":
        if (user.reports_used_free or 0) >= FREE_REPORT_LIMIT:
            raise HTTPException(
                status_code=402,
                detail="Free report limit reached. Upgrade to Pro for 20 ideas per week.",
            )
        is_pro = False

    elif user.subscription_status == "active":
        # Roll over weekly counter if 7 days have passed
        if (
            not user.pro_week_reset_at
            or (now - user.pro_week_reset_at) >= timedelta(days=7)
        ):
            user.pro_reports_used_this_week = 0
            user.pro_week_reset_at = now

        if (user.pro_reports_used_this_week or 0) >= PRO_WEEKLY_LIMIT:
            reset_date = user.pro_week_reset_at + timedelta(days=7)
            raise HTTPException(
                status_code=429,
                detail=f"Weekly Pro limit of {PRO_WEEKLY_LIMIT} reached. Resets {reset_date.strftime('%d %b')}.",
            )
        user.pro_reports_used_this_week = (user.pro_reports_used_this_week or 0) + 1
        is_pro = True

    else:
        # cancelled / past_due — treat as free tier ceiling
        raise HTTPException(
            status_code=402,
            detail="Your subscription is inactive. Please update your billing.",
        )

    # ── Find product ────────────────────────────────────────────────────────
    product = _find_matching_product(db, params, user.id)
    if not product:
        raise HTTPException(
            status_code=503,
            detail="No matching products found. Our database is being refreshed — please try again shortly.",
        )

    # ── Create pending report ───────────────────────────────────────────────
    report = Report(
        user_id=user.id,
        product_id=product.id,
        search_budget_usd=params.budgetUsd,
        search_unit_size=params.unitSize,
        search_category=params.category,
        search_additional_params={
            "targetPlatforms": params.targetPlatforms,
            "minMarginPercent": params.minMarginPercent,
            "trendingOnly": params.trendingOnly,
            "keywordsToAvoid": params.keywordsToAvoid,
            "budgetUsd": params.budgetUsd,
        },
        status="processing",
        tier="pro" if is_pro else "free",
    )
    db.add(report)

    # Increment free counter (only for free users)
    if user.subscription_status == "free":
        user.reports_used_free = (user.reports_used_free or 0) + 1

    db.commit()
    db.refresh(report)

    # ── Assemble synchronously ──────────────────────────────────────────────
    # We do NOT use BackgroundTasks: in Lambda/Mangum they run inside the
    # invocation anyway (blocking the response), while swallowing all exceptions
    # — leaving reports permanently stuck in "processing".  Inline execution
    # gives us proper error propagation, a clean DB session, and a definitive
    # "ready" or "failed" status before we respond.
    try:
        assemble_report(
            db=db,
            report=report,
            product=product,
            user=user,
            search_params=params.model_dump(),
            is_pro=is_pro,
        )
    except Exception:
        # assemble_report has already set report.status = "failed" and committed.
        pass

    db.refresh(report)
    return ReportStatusResponse(reportId=str(report.id), status=report.status)


@router.get("/{report_id}/status", response_model=ReportStatusResponse)
async def get_report_status(
    report_id: str,
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = _get_db_user(sub, db)
    report = (
        db.query(Report)
        .filter(Report.id == uuid.UUID(report_id), Report.user_id == user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportStatusResponse(reportId=str(report.id), status=report.status)


@router.get("", response_model=List[ReportListItem])
async def list_reports(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = _get_db_user(sub, db)
    reports = (
        db.query(Report)
        .filter(Report.user_id == user.id, Report.status == "ready")
        .order_by(Report.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        ReportListItem(
            id=r.id,
            productName=r.product.name if r.product else "Unknown",
            category=r.product.category if r.product else "General",
            opportunityScore=r.opportunity_score or 5,
            riskScore=r.risk_score or 5,
            createdAt=r.created_at,
            tier=r.tier or "free",
        )
        for r in reports
    ]


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: str,
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = _get_db_user(sub, db)
    report = (
        db.query(Report)
        .filter(Report.id == uuid.UUID(report_id), Report.user_id == user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.status == "failed":
        raise HTTPException(status_code=500, detail="Report generation failed. Please try again.")
    if report.status == "processing":
        # Sync processing means this should rarely happen, but handle gracefully
        raise HTTPException(status_code=425, detail="Report still processing")

    product = report.product
    return ReportOut(
        id=report.id,
        userId=report.user_id,
        product=_product_to_schema(product),
        searchBudgetUsd=float(report.search_budget_usd or 0),
        searchUnitSize=report.search_unit_size or "medium",
        searchCategory=report.search_category,
        marginAnalysis=MarginAnalysis(**report.margin_analysis),
        platformComparison=[PlatformComparison(**p) for p in report.platform_comparison],
        aiAnalysis=report.ai_analysis or "",
        riskScore=report.risk_score or 5,
        opportunityScore=report.opportunity_score or 5,
        createdAt=report.created_at,
        tier=report.tier or "free",
    )


@router.delete("/{report_id}", status_code=204)
async def delete_report(
    report_id: str,
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    """Delete a single report. Available to all tiers — users own their data."""
    user = _get_db_user(sub, db)
    report = (
        db.query(Report)
        .filter(Report.id == uuid.UUID(report_id), Report.user_id == user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()


@router.delete("", status_code=200)
async def delete_all_reports(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    """
    Delete all reports for the current user.
    Available to Pro (active) subscribers only — this also resets the seen-product
    list so their next spells surface fresh results.
    """
    user = _get_db_user(sub, db)
    if user.subscription_status != "active":
        raise HTTPException(
            status_code=403,
            detail="Clearing history is a Sorcerer feature. Upgrade to unlock.",
        )
    deleted = (
        db.query(Report)
        .filter(Report.user_id == user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"deleted": deleted}
