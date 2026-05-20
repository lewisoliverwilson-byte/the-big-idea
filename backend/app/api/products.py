from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.product import Product
from app.schemas.report import ProductOut
from datetime import datetime

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/trending", response_model=List[ProductOut])
async def get_trending_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.is_trending == True)
        .order_by(Product.estimated_monthly_sales.desc())
        .limit(12)
        .all()
    )

    return [
        ProductOut(
            id=p.id,
            name=p.name,
            description=p.description or "",
            category=p.category or "General",
            tags=p.tags or [],
            sourcePlatform=p.source_platform,
            sourceUrl=p.source_url or "",
            sourcePriceUsd=float(p.source_price_usd or 0),
            sourceMinOrderQty=p.source_min_order_qty or 1,
            sourceShippingEstimateUsd=float(p.source_shipping_estimate_usd or 0),
            sourceImageUrl=p.source_image_url or "",
            bestSellPlatform=p.best_sell_platform or "amazon",
            amazonAsin=p.amazon_asin,
            ebayItemId=p.ebay_item_id,
            avgSellPriceUsd=float(p.avg_sell_price_usd or 0),
            estimatedMonthlySales=p.estimated_monthly_sales or 0,
            salesRank=p.sales_rank or 0,
            reviewCount=p.review_count or 0,
            avgReviewScore=float(p.avg_review_score or 4.0),
            trendData=p.trend_data or [],
            isTrending=p.is_trending or False,
            scrapedAt=p.scraped_at or datetime.utcnow(),
            lastRefreshed=p.last_refreshed or datetime.utcnow(),
        )
        for p in products
    ]
