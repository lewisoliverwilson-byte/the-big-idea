"""
AI analysis service — uses OpenAI GPT-4o to generate the written
market research section of each report.
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
) -> str:
    """
    Generate a 400-500 word written analysis for a dropshipping report.
    Returns the plain-text analysis string.
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
1. Opportunity Summary (2-3 sentences — the "why this product, why now")
2. Target Market (who buys this, why, seasonality)
3. Competitive Landscape (how saturated is this niche, key risks)
4. Recommended Strategy (which platform to sell on, pricing approach, how to differentiate)
5. Trend Outlook (is this a fad or sustained opportunity, 6-month prediction)

Keep the total analysis under 500 words. Be direct and specific. Write as plain paragraphs, no section headers."""

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
