"""
Temu scraper — uses Playwright (headless Chromium) to scrape
bestseller pages. Handles JS rendering and anti-bot detection.
"""
from __future__ import annotations
import random
import time
from typing import List, Optional
from scrapers.base_scraper import BaseScraper, ProductRaw

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36",
]

CATEGORY_URLS = {
    "Electronics Accessories": "https://www.temu.com/c-phones-telecommunications.html",
    "Home & Garden": "https://www.temu.com/c-home-garden.html",
    "Fashion Accessories": "https://www.temu.com/c-accessories.html",
    "General": "https://www.temu.com/c-lightning-deals.html",
}


class TemuScraper(BaseScraper):
    def __init__(self, proxies: Optional[List[str]] = None):
        self.proxies = proxies or []

    def _get_browser_context(self, playwright):
        browser = playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1280, "height": 800},
            locale="en-GB",
        )
        return browser, context

    def get_trending_products(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[ProductRaw]:
        if not PLAYWRIGHT_AVAILABLE:
            return []

        url = CATEGORY_URLS.get(category, CATEGORY_URLS["General"])
        products = []

        with sync_playwright() as p:
            browser, context = self._get_browser_context(p)
            page = context.new_page()
            try:
                page.goto(url, timeout=30000, wait_until="domcontentloaded")
                time.sleep(random.uniform(2, 4))

                # Extract product cards
                cards = page.query_selector_all('[data-testid="product-card"], .goods-item, ._2mG88')
                for card in cards[:limit]:
                    try:
                        name_el = card.query_selector('h2, .goods-title, ._3_nJp')
                        price_el = card.query_selector('[data-testid="price"], .goods-price, ._2P5mA')
                        link_el = card.query_selector('a')
                        img_el = card.query_selector('img')

                        name = name_el.inner_text() if name_el else "Unknown Product"
                        price_text = price_el.inner_text() if price_el else "$5"
                        price = float(
                            price_text.replace("$", "").replace("£", "").replace(",", "").strip().split()[0]
                        )
                        link = link_el.get_attribute("href") if link_el else ""
                        if link and not link.startswith("http"):
                            link = f"https://www.temu.com{link}"
                        img = img_el.get_attribute("src") if img_el else ""

                        if name and price > 0:
                            products.append(
                                ProductRaw(
                                    name=name.strip(),
                                    source_platform="temu",
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
        if not PLAYWRIGHT_AVAILABLE:
            return ProductRaw(name="", source_platform="temu", source_url=url, source_price_usd=0)

        with sync_playwright() as p:
            browser, context = self._get_browser_context(p)
            page = context.new_page()
            try:
                page.goto(url, timeout=30000, wait_until="networkidle")
                time.sleep(random.uniform(1, 3))
                name = page.title().split(" - ")[0].strip()
                return ProductRaw(
                    name=name,
                    source_platform="temu",
                    source_url=url,
                    source_price_usd=5.0,
                )
            finally:
                browser.close()

    def search_products(self, query: str, budget_max: float) -> List[ProductRaw]:
        url = f"https://www.temu.com/search_result.html?search_key={query}&search_method=user"
        return self.get_trending_products(limit=20)
