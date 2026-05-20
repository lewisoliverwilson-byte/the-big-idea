"""
Reports API — search, status polling, fetch, list.
"""
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
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

FREE_REPORT_LIMIT = 2


def _get_db_user(sub: dict, db: Session) -> User:
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sync first.")
    return user


def _find_matching_product(db: Session, params: SearchRequest) -> Product | None:
    """Find a product from the DB that matches the search parameters."""
    query = db.query(Product)

    # Budget filter: source price should be no more than 30% of budget
    max_source_price = params.budgetUsd * 0.30
    query = query.filter(Product.source_price_usd <= max_source_price)

    # Category filter
    if params.category and params.category != "No preference":
        query = query.filter(Product.category.ilike(f"%{params.category}%"))

    # Trending filter
    if params.trendingOnly:
        query = query.filter(Product.is_trending == True)

    # Keywords to avoid
    if params.keywordsToAvoid:
        keywords = [k.strip().lower() for k in params.keywordsToAvoid.split(",")]
        for kw in keywords:
            query = query.filter(Product.name.notilike(f"%{kw}%"))

    # Freshness: prefer products updated within 24h
    cutoff = datetime.utcnow() - timedelta(hours=24)
    fresh_product = (
        query.filter(Product.last_refreshed >= cutoff)
        .order_by(Product.is_trending.desc(), Product.estimated_monthly_sales.desc())
        .first()
    )

    if fresh_product:
        return fresh_product

    # Fall back to any matching product
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
    background_tasks: BackgroundTasks,
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = _get_db_user(sub, db)

    # Free tier enforcement
    if user.subscription_status == "free" and user.reports_used_free >= FREE_REPORT_LIMIT:
        raise HTTPException(status_code=402, detail="Free report limit reached. Please upgrade.")

    # Find a matching product
    product = _find_matching_product(db, params)
    if not product:
        raise HTTPException(
            status_code=503,
            detail="No matching products found. Our database is being refreshed — please try again in a few minutes.",
        )

    # Create a pending report
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
    )
    db.add(report)

    # Increment free counter
    if user.subscription_status == "free":
        user.reports_used_free = (user.reports_used_free or 0) + 1

    db.commit()
    db.refresh(report)

    # Assemble report in background
    background_tasks.add_task(
        assemble_report,
        db=db,
        report=report,
        product=product,
        user=user,
        search_params=params.model_dump(),
    )

    return ReportStatusResponse(reportId=str(report.id), status="processing")


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
    if report.status == "processing":
        raise HTTPException(status_code=202, detail="Report still processing")

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
    )
