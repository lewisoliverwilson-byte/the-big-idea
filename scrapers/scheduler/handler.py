"""
AWS EventBridge-triggered Lambda handler.
Runs all scrapers in parallel every 6 hours and upserts the product DB.
"""
from __future__ import annotations
import json
import os
import sys
from datetime import datetime, timedelta

# Make parent available
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.database import SessionLocal
from app.models.product import Product


def upsert_product(db, raw) -> None:
    """Upsert a scraped product into the DB."""
    existing = db.query(Product).filter(
        Product.name == raw.name,
        Product.source_platform == raw.source_platform,
    ).first()

    if existing:
        existing.source_price_usd = raw.source_price_usd
        existing.source_url = raw.source_url
        existing.source_image_url = raw.source_image_url
        existing.avg_sell_price_usd = raw.avg_sell_price_usd
        existing.estimated_monthly_sales = raw.estimated_monthly_sales
        existing.review_count = raw.review_count
        existing.avg_review_score = raw.avg_review_score
        existing.trend_data = raw.trend_data
        existing.last_refreshed = datetime.utcnow()
        # Check trending: > 20% increase in search volume last 30 days
        if raw.trend_data and len(raw.trend_data) >= 2:
            recent = raw.trend_data[-1].get("searchVolume", 50)
            older = raw.trend_data[max(0, len(raw.trend_data) - 5)].get("searchVolume", 50)
            existing.is_trending = recent > older * 1.2
    else:
        product = Product(
            name=raw.name,
            description=raw.description,
            category=raw.category,
            tags=raw.tags,
            source_platform=raw.source_platform,
            source_url=raw.source_url,
            source_price_usd=raw.source_price_usd,
            source_min_order_qty=raw.source_min_order_qty,
            source_shipping_estimate_usd=raw.source_shipping_estimate_usd,
            source_image_url=raw.source_image_url,
            best_sell_platform=raw.best_sell_platform,
            amazon_asin=raw.amazon_asin,
            ebay_item_id=raw.ebay_item_id,
            avg_sell_price_usd=raw.avg_sell_price_usd,
            estimated_monthly_sales=raw.estimated_monthly_sales,
            review_count=raw.review_count,
            avg_review_score=raw.avg_review_score,
            trend_data=raw.trend_data,
            is_trending=raw.is_trending,
            scraped_at=datetime.utcnow(),
            last_refreshed=datetime.utcnow(),
        )
        db.add(product)

    db.commit()


def lambda_handler(event: dict, context) -> dict:
    """Main EventBridge handler — runs all scrapers."""
    print(f"[scheduler] Starting scrape run at {datetime.utcnow().isoformat()}")

    db = SessionLocal()
    total_scraped = 0

    try:
        # Import scrapers
        from scrapers.sources.temu_scraper import TemuScraper
        from scrapers.sources.aliexpress_scraper import AliExpressScraper
        from scrapers.sources.alibaba_scraper import AlibabaScraper

        scrapers = [
            TemuScraper(),
            AliExpressScraper(),
            AlibabaScraper(),
        ]

        for scraper in scrapers:
            try:
                products = scraper.get_trending_products(limit=30)
                for raw in products:
                    # Enrich with Google Trends data
                    try:
                        from scrapers.trends import enrich_with_trends
                        raw = enrich_with_trends(raw)
                    except Exception as e:
                        print(f"[trends] Failed to enrich {raw.name}: {e}")

                    upsert_product(db, raw)
                    total_scraped += 1

                print(f"[scheduler] {scraper.__class__.__name__}: {len(products)} products")
            except Exception as e:
                print(f"[scheduler] Scraper {scraper.__class__.__name__} failed: {e}")
                continue

    finally:
        db.close()

    print(f"[scheduler] Completed. Total upserted: {total_scraped}")
    return {"status": "ok", "scraped": total_scraped}
