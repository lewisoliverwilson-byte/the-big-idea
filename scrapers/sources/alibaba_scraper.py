"""
Alibaba scraper — requests + BeautifulSoup (less JS-heavy than Temu/AliExpress).
Targets trade assurance products and top-ranked suppliers.
"""
from __future__ import annotations
import random
import time
import requests
from typing import List, Optional
from scrapers.base_scraper import BaseScraper, ProductRaw

try:
    from bs4 import BeautifulSoup
    from fake_useragent import UserAgent
    SCRAPING_AVAILABLE = True
    ua = UserAgent()
except ImportError:
    SCRAPING_AVAILABLE = False

HEADERS_BASE = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.5",
    "Connection": "keep-alive",
}


class AlibabaScraper(BaseScraper):
    BASE = "https://www.alibaba.com"

    def _get_headers(self) -> dict:
        h = dict(HEADERS_BASE)
        if SCRAPING_AVAILABLE:
            h["User-Agent"] = ua.random
        return h

    def get_trending_products(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[ProductRaw]:
        if not SCRAPING_AVAILABLE:
            return []

        url = f"{self.BASE}/trade/search?SearchText=bestseller&tab=all&TradeType=y"
        products = []

        try:
            resp = requests.get(url, headers=self._get_headers(), timeout=15)
            soup = BeautifulSoup(resp.text, "lxml")

            for card in soup.select(".J-offer-wrapper, .organic-gallery-offer-inner")[:limit]:
                try:
                    name_el = card.select_one("h2, .elements-title-normal")
                    price_el = card.select_one(".elements-offer-price-normal")
                    link_el = card.select_one("a")
                    img_el = card.select_one("img")

                    name = name_el.get_text(strip=True) if name_el else ""
                    price_text = price_el.get_text(strip=True) if price_el else "$2.00"
                    price = float(
                        price_text.replace("$", "").replace("US", "").strip().split("-")[0].split("/")[0]
                    )
                    link = link_el.get("href", "") if link_el else ""
                    if link and not link.startswith("http"):
                        link = f"https:{link}"
                    img = img_el.get("src", img_el.get("data-src", "")) if img_el else ""

                    if name and price > 0:
                        products.append(
                            ProductRaw(
                                name=name,
                                source_platform="alibaba",
                                source_url=link,
                                source_price_usd=price,
                                source_min_order_qty=50,
                                source_image_url=img,
                                category=category or "General",
                            )
                        )
                except Exception:
                    continue

            time.sleep(random.uniform(1, 3))
        except Exception:
            pass

        return products

    def get_product_detail(self, url: str) -> ProductRaw:
        return ProductRaw(name="", source_platform="alibaba", source_url=url, source_price_usd=0)

    def search_products(self, query: str, budget_max: float) -> List[ProductRaw]:
        return self.get_trending_products(limit=20)
