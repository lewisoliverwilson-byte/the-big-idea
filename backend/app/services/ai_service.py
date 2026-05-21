"""
AI analysis service — uses OpenAI to generate written market research.

Free tier  → generate_lite_analysis()  : gpt-4o-mini, 1 paragraph, ~120 words
Pro tier   → generate_full_analysis()  : gpt-4o, 5 paragraphs, ~500 words

Call generate_analysis(..., is_pro=True/False) as the single entry point.
"""
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

SYSTEM_PROMPT = """You are a professional e-commerce market research analyst specialising in
dropshipping. You write clear, data-driven, actionable reports for entrepreneurs
who want to find profitable products to buy from Asian wholesale platforms and resell
on Western marketplaces. Be specific, honest about risks, and always base your
analysis on the data provided. Write in a professional but approachable tone.
Do not use markdown headers or bullet points — write in plain prose paragraphs."""


def generate_lite_analysis(
    product_name: str,
    category: str,
    source_platform: str,
    source_price: float,
    best_sell_platform: str,
    avg_sell_price: float,
    monthly_sales: int,
    trend_summary: str,
    margin_pct: float,
) -> str:
    """
    Free-tier report: one concise paragraph — opportunity summary only.
    Uses gpt-4o-mini to keep costs low.
    """
    prompt = (
        f"Write ONE short paragraph (max 120 words) summarising this dropshipping opportunity: "
        f"{product_name} ({category}), sourced from {source_platform} at ${source_price:.2f}, "
        f"selling on {best_sell_platform} at ~${avg_sell_price:.2f}. "
        f"~{monthly_sales} monthly sales, trend is {trend_summary}, margin ~{margin_pct:.0f}%. "
        f"Cover: why this product is interesting right now, the single biggest risk, and whether "
        f"the margin justifies the investment. Be direct. No bullet points. No headers."
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )
    return response.choices[0].message.content or ""


def generate_full_analysis(
    product_name: str,
    description: str,
    category: str,
    source_platform: str,
    source_price: float,
    min_order_qty: int,
    best_sell_platform: str,
    avg_sell_price: float,
    monthly_sales: int,
    trend_summary: str,
    review_count: int,
    avg_score: float,
    margin_pct: float,
    user_budget: float,
) -> str:
    """
    Pro-tier report: full 5-paragraph research analysis.
    Uses gpt-4o for highest quality.
    """
    user_prompt = f"""Generate a market research analysis for the following dropshipping opportunity.

PRODUCT DATA:
{product_name}, {description[:300]}, Category: {category}
Source: {source_platform} at ${source_price:.2f} (MOQ: {min_order_qty})
Best sell platform: {best_sell_platform}
Average sell price: ${avg_sell_price:.2f}
Estimated monthly sales: {monthly_sales}
Sales trend (last 6 months): {trend_summary}
Review count: {review_count}, avg score: {avg_score:.1f}/5
Estimated profit margin: {margin_pct:.1f}%
User's budget: ${user_budget:.2f}

Write a structured analysis with these sections as continuous prose paragraphs:
1. Opportunity Summary (why this product, why now — 2-3 sentences)
2. Target Market (who buys this, why, seasonality)
3. Competitive Landscape (saturation level, key risks, main competitors)
4. Recommended Strategy (platform, pricing approach, differentiation tactics)
5. Trend Outlook (fad or sustained opportunity, 6-month prediction)

Total: under 500 words. Be direct and specific. Plain paragraphs, no section headers."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=700,
    )
    return response.choices[0].message.content or ""


def generate_analysis(
    product_name: str,
    description: str,
    category: str,
    source_platform: str,
    source_price: float,
    min_order_qty: int,
    best_sell_platform: str,
    avg_sell_price: float,
    monthly_sales: int,
    trend_summary: str,
    review_count: int,
    avg_score: float,
    margin_pct: float,
    user_budget: float,
    is_pro: bool = False,
) -> str:
    """Entry point — routes to lite or full analysis based on tier."""
    if is_pro:
        return generate_full_analysis(
            product_name=product_name,
            description=description,
            category=category,
            source_platform=source_platform,
            source_price=source_price,
            min_order_qty=min_order_qty,
            best_sell_platform=best_sell_platform,
            avg_sell_price=avg_sell_price,
            monthly_sales=monthly_sales,
            trend_summary=trend_summary,
            review_count=review_count,
            avg_score=avg_score,
            margin_pct=margin_pct,
            user_budget=user_budget,
        )
    return generate_lite_analysis(
        product_name=product_name,
        category=category,
        source_platform=source_platform,
        source_price=source_price,
        best_sell_platform=best_sell_platform,
        avg_sell_price=avg_sell_price,
        monthly_sales=monthly_sales,
        trend_summary=trend_summary,
        margin_pct=margin_pct,
    )
