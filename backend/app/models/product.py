import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Enum as SAEnum, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    tags = Column(ARRAY(String), default=[])

    # Source (buy side)
    source_platform = Column(
        SAEnum("temu", "aliexpress", "alibaba", name="source_platform_enum"),
        nullable=False,
    )
    source_url = Column(String)
    source_price_usd = Column(Numeric(10, 2))
    source_min_order_qty = Column(Integer, default=1)
    source_shipping_estimate_usd = Column(Numeric(10, 2))
    source_image_url = Column(String)

    # Market data (sell side)
    best_sell_platform = Column(
        SAEnum("amazon", "ebay", "etsy", "shopify", name="sell_platform_enum"),
    )
    amazon_asin = Column(String)
    ebay_item_id = Column(String)
    etsy_listing_id = Column(String)
    avg_sell_price_usd = Column(Numeric(10, 2))
    estimated_monthly_sales = Column(Integer)
    sales_rank = Column(Integer)
    review_count = Column(Integer)
    avg_review_score = Column(Numeric(3, 2))

    # Trend data
    trend_data = Column(JSONB, default=[])

    # Meta
    scraped_at = Column(DateTime, default=datetime.utcnow)
    last_refreshed = Column(DateTime, default=datetime.utcnow)
    is_trending = Column(Boolean, default=False)
