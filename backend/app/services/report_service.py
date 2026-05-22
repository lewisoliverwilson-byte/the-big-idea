"""
Report assembly service — ties together product data, scoring, margin
calculation, and AI analysis into a complete report.

Pass is_pro=True for Pro-tier users to get full analysis + all platforms.
Pass is_pro=False (default) for free-tier users to get lite analysis + 1 platform.
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.report import Report
from app.models.user import User
from app.services.ai_service import generate_analysis


# ─── Platform fee table ───────────────────────────────────────────────────────
PLATFORM_FEES = {
    "amazon": 15.0,
    "ebay": 12.5,
    "etsy": 10.0,
    "shopify": 3.0,
}

PLATFORM_DIFFICULTY = {
    "amazon": "High",
    "ebay": "Medium",
    "etsy": "Medium",
    "shopify": "Low",
}


# ─── Scoring ──────────────────────────────────────────────────────────────────

def compute_opportunity_score(product: Product, margin_pct: float) -> Tuple[int, List[Dict[str, str]]]:
    monthly_sales = product.estimated_monthly_sales or 0
    review_score = float(product.avg_review_score or 4.0)

    trend_direction = 5
    trend_label = "flat"
    if product.trend_data and len(product.trend_data) >= 2:
        first = product.trend_data[0].get("searchVolume", 50)
        last = product.trend_data[-1].get("searchVolume", 50)
        if last > first * 1.1:
            trend_direction = 9
            pct = round((last - first) / max(first, 1) * 100)
            trend_label = f"up {pct}% over 6 months"
        elif last < first * 0.9:
            trend_direction = 2
            pct = round((first - last) / max(first, 1) * 100)
            trend_label = f"down {pct}% over 6 months"

    sales_norm = min(monthly_sales / 5000, 1.0) * 10
    margin_norm = min(margin_pct / 80, 1.0) * 10
    review_norm = (review_score / 5.0) * 10

    score = (
        sales_norm * 0.3
        + margin_norm * 0.3
        + trend_direction * 0.2
        + review_norm * 0.1
        + trend_direction * 0.1
    )
    final_score = max(1, min(10, round(score)))

    sources: List[Dict[str, str]] = [
        {"label": "Monthly sales est.", "value": f"~{monthly_sales:,} units"},
        {"label": "Margin", "value": f"{margin_pct:.1f}%"},
        {"label": "Trend", "value": trend_label},
    ]
    return final_score, sources


def compute_risk_score(product: Product, user_budget: float) -> Tuple[int, List[Dict[str, str]]]:
    review_count = product.review_count or 0
    source_price = float(product.source_price_usd or 1)
    min_order = product.source_min_order_qty or 1
    moq_cost = source_price * min_order

    saturation = min(review_count / 10000, 1.0) * 10
    budget_ratio = moq_cost / max(user_budget, 1)
    budget_risk = min(budget_ratio, 1.0) * 10

    trend_risk = 3
    trend_label = "stable"
    if product.trend_data and len(product.trend_data) >= 2:
        first = product.trend_data[0].get("searchVolume", 50)
        last = product.trend_data[-1].get("searchVolume", 50)
        if last < first * 0.9:
            trend_risk = 8
            trend_label = "declining"
        elif last > first * 1.1:
            trend_risk = 1
            trend_label = "rising"

    risk = (
        saturation * 0.3
        + 3.0 * 0.2
        + budget_risk * 0.2
        + trend_risk * 0.15
        + 3.0 * 0.15
    )
    final_score = max(1, min(10, round(risk)))

    if review_count < 500:
        comp_label = f"~{review_count:,} reviews (low competition)"
    elif review_count < 3000:
        comp_label = f"~{review_count:,} reviews (medium competition)"
    else:
        comp_label = f"~{review_count:,} reviews (high competition)"

    sources: List[Dict[str, str]] = [
        {"label": "Competition", "value": comp_label},
        {"label": "Min. order cost", "value": f"${moq_cost:.0f} vs ${user_budget:.0f} budget"},
        {"label": "Trend", "value": trend_label},
    ]
    return final_score, sources


# ─── Margin calculation ────────────────────────────────────────────────────────

def calculate_margin(product: Product, target_platform: str = "amazon") -> Dict[str, Any]:
    source_price = float(product.source_price_usd or 5)
    shipping = float(product.source_shipping_estimate_usd or 3)
    sell_price = float(product.avg_sell_price_usd or 20)
    fee_pct = PLATFORM_FEES.get(target_platform, 15.0)
    platform_fee = sell_price * (fee_pct / 100)

    profit_per_unit = sell_price - source_price - shipping - platform_fee
    margin_pct = (profit_per_unit / sell_price * 100) if sell_price > 0 else 0
    min_viable = (source_price + shipping) / (1 - fee_pct / 100) if fee_pct < 100 else 0

    return {
        "sourcePriceUsd": round(source_price, 2),
        "shippingToUkUsd": round(shipping, 2),
        "platformFeePercent": fee_pct,
        "estimatedSellPriceUsd": round(sell_price, 2),
        "profitPerUnit": round(profit_per_unit, 2),
        "profitAt50Units": round(profit_per_unit * 50, 2),
        "profitAt100Units": round(profit_per_unit * 100, 2),
        "profitAt200Units": round(profit_per_unit * 200, 2),
        "minimumViableSellPrice": round(min_viable, 2),
        "marginPercent": round(margin_pct, 1),
    }


# ─── Platform comparison ───────────────────────────────────────────────────────

def build_platform_comparison(product: Product, is_pro: bool = True) -> List[Dict[str, Any]]:
    base_price = float(product.avg_sell_price_usd or 20)
    source = float(product.source_price_usd or 5)
    shipping = float(product.source_shipping_estimate_usd or 3)

    price_multipliers = {"amazon": 1.0, "ebay": 0.88, "etsy": 1.15, "shopify": 1.08}
    sales_estimates = {
        "amazon": product.estimated_monthly_sales or 200,
        "ebay": int((product.estimated_monthly_sales or 200) * 0.7),
        "etsy": int((product.estimated_monthly_sales or 200) * 0.5),
        "shopify": int((product.estimated_monthly_sales or 200) * 0.3),
    }

    best_margin = -999
    best_platform = "amazon"
    result = []

    for platform in ["amazon", "ebay", "etsy", "shopify"]:
        sell_price = round(base_price * price_multipliers[platform], 2)
        fee = PLATFORM_FEES[platform]
        platform_fee = sell_price * (fee / 100)
        profit = sell_price - source - shipping - platform_fee
        net_margin = round((profit / sell_price) * 100, 1) if sell_price > 0 else 0

        if net_margin > best_margin:
            best_margin = net_margin
            best_platform = platform

        result.append({
            "platform": platform,
            "estimatedSellPrice": sell_price,
            "feePercent": fee,
            "netMargin": net_margin,
            "estimatedMonthlySales": sales_estimates[platform],
            "difficulty": PLATFORM_DIFFICULTY[platform],
            "recommended": False,
        })

    # Mark best
    for r in result:
        r["recommended"] = r["platform"] == best_platform

    # Free tier: only return the best/recommended platform
    if not is_pro:
        return [r for r in result if r["recommended"]]

    return result


# ─── Trend summary helper ─────────────────────────────────────────────────────

def trend_summary(product: Product) -> str:
    if not product.trend_data or len(product.trend_data) < 2:
        return "insufficient trend data"
    first = product.trend_data[0].get("searchVolume", 50)
    last = product.trend_data[-1].get("searchVolume", 50)
    pct = ((last - first) / first * 100) if first > 0 else 0
    direction = "up" if pct > 5 else ("down" if pct < -5 else "flat")
    return f"{direction} {abs(pct):.0f}% over 6 months"


# ─── Main assembly ────────────────────────────────────────────────────────────

def assemble_report(
    db: Session,
    report: Report,
    product: Product,
    user: User,
    search_params: dict,
    is_pro: bool = False,
) -> Report:
    """
    Fill in all computed fields on the report model and persist it.
    is_pro=True → full GPT-4o analysis + all 4 platforms
    is_pro=False → lite GPT-4o-mini analysis + 1 platform (best only)

    Wraps all work in a try/except so that any failure (OpenAI timeout,
    DB error, bad data) marks the report as "failed" rather than leaving
    it permanently stuck in "processing".
    """
    try:
        target_platform = str(product.best_sell_platform or "amazon")

        margin = calculate_margin(product, target_platform)
        margin_pct = margin["marginPercent"]

        opp_score, opp_sources = compute_opportunity_score(product, margin_pct)
        risk_score, risk_sources = compute_risk_score(product, float(search_params.get("budgetUsd", 200)))

        platform_comparison = build_platform_comparison(product, is_pro=is_pro)

        ai_text = generate_analysis(
            product_name=str(product.name),
            description=str(product.description or ""),
            category=str(product.category or "General"),
            source_platform=str(product.source_platform),
            source_price=float(product.source_price_usd or 5),
            min_order_qty=int(product.source_min_order_qty or 1),
            best_sell_platform=target_platform,
            avg_sell_price=float(product.avg_sell_price_usd or 20),
            monthly_sales=int(product.estimated_monthly_sales or 100),
            trend_summary=trend_summary(product),
            review_count=int(product.review_count or 0),
            avg_score=float(product.avg_review_score or 4.0),
            margin_pct=margin_pct,
            user_budget=float(search_params.get("budgetUsd", 200)),
            is_pro=is_pro,
        )

        report.margin_analysis = margin
        report.platform_comparison = platform_comparison
        report.ai_analysis = ai_text
        report.opportunity_score = opp_score
        report.risk_score = risk_score
        report.tier = "pro" if is_pro else "free"
        report.status = "ready"
        report.report_snapshot = {
            "opportunitySources": opp_sources,
            "riskSources": risk_sources,
        }

        db.commit()
        db.refresh(report)
        return report

    except Exception as exc:
        # Roll back any partial writes and permanently mark this report failed
        # so the frontend never polls forever waiting for it.
        try:
            db.rollback()
            report.status = "failed"
            db.commit()
        except Exception:
            pass
        raise exc
