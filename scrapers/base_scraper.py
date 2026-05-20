"""
Abstract base class for all scrapers.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ProductRaw:
    name: str
    source_platform: str
    source_url: str
    source_price_usd: float
    source_min_order_qty: int = 1
    source_shipping_estimate_usd: float = 3.0
    source_image_url: str = ""
    description: str = ""
    category: str = "General"
    tags: List[str] = field(default_factory=list)

    # Sell-side data (filled by market scrapers)
    best_sell_platform: str = "amazon"
    avg_sell_price_usd: float = 0.0
    estimated_monthly_sales: int = 0
    sales_rank: int = 0
    review_count: int = 0
    avg_review_score: float = 4.0
    amazon_asin: Optional[str] = None
    ebay_item_id: Optional[str] = None
    etsy_listing_id: Optional[str] = None

    # Trend data: list of {date, searchVolume, salesIndex}
    trend_data: List[dict] = field(default_factory=list)
    is_trending: bool = False


class BaseScraper(ABC):
    """
    Abstract base for all platform scrapers.
    Subclasses must implement get_trending_products, get_product_detail, search_products.
    """

    @abstractmethod
    def get_trending_products(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[ProductRaw]:
        """Return trending/bestselling products."""

    @abstractmethod
    def get_product_detail(self, url: str) -> ProductRaw:
        """Fetch detailed data for a specific product URL."""

    @abstractmethod
    def search_products(
        self,
        query: str,
        budget_max: float,
    ) -> List[ProductRaw]:
        """Search for products matching a query within a budget."""
