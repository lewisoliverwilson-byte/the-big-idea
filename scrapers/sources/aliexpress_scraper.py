"""
AliExpress scraper — Playwright + BeautifulSoup.
Targets bestsellers and hot products by category.
"""
from __future__ import annotations
import random
import time
from typing import List, Optional
from scrapers.base_scraper import BaseScraper, ProductRaw

try:
    from playwright.sync_api import sync_playwright
    from bs4 import BeautifulSoup
    SCRAPING_AVAILABLE = True
except ImportError:
    SCRAPING_AVAILABLE = False


class AliExpressScraper(BaseScraper):
    BASE = "https://www.aliexpress.com"

    def get_trending_products(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[ProductRaw]:
        if not SCRAPING_AVAILABLE:
            return []

        url = f"{self.BASE}/wholesale?SearchText=bestseller&SortType=total_tranpro_desc"
        products = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            page = browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36"
            )
            try:
                page.goto(url, timeout=30000, wait_until="domcontentloaded")
                time.sleep(random.uniform(2, 4))
                html = page.content()
                soup = BeautifulSoup(html, "lxml")

                for card in soup.select(".search-item-card-wrapper-gallery")[:limit]:
                    try:
                        name_el = card.select_one("h1, .item-title")
                        price_el = card.select_one(".price-sale")
                        link_el = card.select_one("a")
                        img_el = card.select_one("img")

                        name = name_el.get_text(strip=True) if name_el else ""
                        price_text = price_el.get_text(strip=True) if price_el else "$3"
                        price = float(
                            price_text.replace("$", "").replace("US ", "").replace(",", "").strip().split("-")[0]
                        )
                        link = link_el.get("href", "") if link_el else ""
                        if link and not link.startswith("http"):
                            link = f"https:{link}"
                        img = img_el.get("src", "") if img_el else ""

                        if name and price > 0:
                            products.append(
                                ProductRaw(
                                    name=name,
                                    source_platform="aliexpress",
                                    source_url=link,
                                    source_price_usd=price,
                                    source_image_url=img,
                                    category=category or "General",
                                )
                            )
                    except Exception:
                        continue
            finally:
                browser.close()

        return products

    def get_product_detail(self, url: str) -> ProductRaw:
        return ProductRaw(name="", source_platform="aliexpress", source_url=url, source_price_usd=0)

    def search_products(self, query: str, budget_max: float) -> List[ProductRaw]:
        return self.get_trending_products(limit=20)
