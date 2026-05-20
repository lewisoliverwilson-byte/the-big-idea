"""
Amazon sell-side scraper — extracts bestseller data.
Uses rotating user agents and request delays to avoid detection.
"""
from __future__ import annotations
import random
import time
import requests
from typing import List, Optional
from dataclasses import dataclass

try:
    from bs4 import BeautifulSoup
    from fake_useragent import UserAgent
    SCRAPING_AVAILABLE = True
    ua = UserAgent()
except ImportError:
    SCRAPING_AVAILABLE = False


BSR_CATEGORY_URLS = {
    "Electronics Accessories": "https://www.amazon.co.uk/Best-Sellers-Electronics/zgbs/electronics",
    "Home & Garden": "https://www.amazon.co.uk/Best-Sellers-Home-Kitchen/zgbs/kitchen",
    "Pet Supplies": "https://www.amazon.co.uk/Best-Sellers-Pet-Supplies/zgbs/pets",
    "General": "https://www.amazon.co.uk/Best-Sellers/zgbs",
}


@dataclass
class AmazonProduct:
    asin: str
    title: str
    price: float
    rank: int
    review_count: int
    avg_rating: float
    url: str


def get_bestsellers(category: str = "General", limit: int = 50) -> List[AmazonProduct]:
    if not SCRAPING_AVAILABLE:
        return []

    url = BSR_CATEGORY_URLS.get(category, BSR_CATEGORY_URLS["General"])
    products = []

    headers = {
        "User-Agent": ua.random if SCRAPING_AVAILABLE else "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(resp.text, "lxml")

        for i, card in enumerate(soup.select(".zg-item-immersion, .p13n-sc-uncoverable-faceout")[:limit]):
            try:
                title_el = card.select_one(".p13n-sc-truncate-desktop-type2, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1")
                price_el = card.select_one("._cDEzb_p13n-sc-price_3mJ9Z, .p13n-sc-price")
                link_el = card.select_one("a.a-link-normal")
                rating_el = card.select_one(".a-icon-alt")
                review_el = card.select_one(".a-size-small")

                title = title_el.get_text(strip=True) if title_el else ""
                price_text = price_el.get_text(strip=True) if price_el else "£10"
                price = float(
                    price_text.replace("£", "").replace(",", "").strip()
                )
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = f"https://www.amazon.co.uk{link}"

                asin = ""
                if "/dp/" in link:
                    asin = link.split("/dp/")[1].split("/")[0].split("?")[0]

                rating_text = rating_el.get_text() if rating_el else "4.0"
                rating = float(rating_text.split(" ")[0])

                if title and price > 0:
                    products.append(
                        AmazonProduct(
                            asin=asin,
                            title=title,
                            price=price,
                            rank=i + 1,
                            review_count=1000,  # Will be enriched
                            avg_rating=rating,
                            url=link,
                        )
                    )
                time.sleep(random.uniform(0.5, 1.5))
            except Exception:
                continue
    except Exception:
        pass

    return products
