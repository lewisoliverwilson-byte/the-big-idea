"""
Seed the database with 60 realistic dropshipping products.
Run this once after setting up the database.

Usage:
    DATABASE_URL=postgresql://... python scripts/seed_products.py
"""
import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import engine, SessionLocal
from app.models.product import Product
from app.db.database import Base

# Create tables
Base.metadata.create_all(bind=engine)


def make_trend_data(months: int = 12, direction: str = "up") -> list:
    """Generate realistic trend data for a product."""
    base = random.randint(30, 70)
    data = []
    for i in range(months):
        date = (datetime.utcnow() - timedelta(days=(months - i) * 30)).strftime("%Y-%m-%d")
        if direction == "up":
            vol = int(base * (1 + i * 0.08 + random.uniform(-0.05, 0.1)))
        elif direction == "down":
            vol = int(base * max(0.3, 1 - i * 0.05 + random.uniform(-0.05, 0.05)))
        else:
            vol = int(base * (1 + random.uniform(-0.1, 0.1)))
        data.append({
            "date": date,
            "searchVolume": max(5, min(100, vol)),
            "salesIndex": max(5, int(vol * random.uniform(0.5, 1.5))),
        })
    return data


SEED_PRODUCTS = [
    {
        "name": "Portable LED Ring Light 10 inch",
        "description": "Professional LED ring light with adjustable colour temperature (3000K-6000K), 3 lighting modes, and flexible 360° phone holder. Perfect for TikTok, YouTube, Instagram content creation and video calls. Includes phone clip, USB cable, and carry bag.",
        "category": "Electronics Accessories",
        "tags": ["ring light", "selfie", "streaming", "content creator", "LED"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?_bg_fs=1&goods_id=601099512994137",
        "source_price_usd": 4.50,
        "source_min_order_qty": 30,
        "source_shipping_estimate_usd": 2.80,
        "source_image_url": "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400",
        "best_sell_platform": "amazon",
        "amazon_asin": "B08GLZMQ3L",
        "avg_sell_price_usd": 26.99,
        "estimated_monthly_sales": 3200,
        "sales_rank": 45,
        "review_count": 8420,
        "avg_review_score": 4.3,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Magnetic Phone Car Mount Dashboard",
        "description": "Universal magnetic car phone holder with 6 strong neodymium magnets, 360° rotation, and dual adhesive base. Compatible with all smartphones including iPhone and Android. Dashboard and windscreen mounting. Ultra-slim design.",
        "category": "Auto Accessories",
        "tags": ["car mount", "magnetic", "phone holder", "dashboard", "GPS"],
        "source_platform": "aliexpress",
        "source_url": "https://www.aliexpress.com/item/3256804971234567.html",
        "source_price_usd": 1.80,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 1.50,
        "source_image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 14.99,
        "estimated_monthly_sales": 5800,
        "sales_rank": 12,
        "review_count": 22000,
        "avg_review_score": 4.1,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "Stainless Steel Water Bottle 1L Insulated",
        "description": "Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours and hot for 12 hours. BPA-free, leak-proof lid with carry loop. Fits standard cup holders. Available in 500ml and 1000ml.",
        "category": "Sports & Outdoors",
        "tags": ["water bottle", "insulated", "stainless steel", "gym", "hiking"],
        "source_platform": "alibaba",
        "source_url": "https://www.alibaba.com/product-detail/1L-Insulated-Water-Bottle_1600123456789.html",
        "source_price_usd": 3.20,
        "source_min_order_qty": 100,
        "source_shipping_estimate_usd": 4.50,
        "source_image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 22.99,
        "estimated_monthly_sales": 4100,
        "sales_rank": 28,
        "review_count": 15600,
        "avg_review_score": 4.5,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Cable Management Box Desktop Organiser",
        "description": "Wooden cable management box to hide power strips and messy cables. Holds up to 6 power outlets. Removable divider, ventilation slots prevent overheating. Available in white, black, and natural wood. Dimensions: 38x13x14cm.",
        "category": "Home & Garden",
        "tags": ["cable management", "desk organiser", "home office", "cable box"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513012345",
        "source_price_usd": 5.80,
        "source_min_order_qty": 20,
        "source_shipping_estimate_usd": 5.50,
        "source_image_url": "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 29.99,
        "estimated_monthly_sales": 2600,
        "sales_rank": 67,
        "review_count": 5200,
        "avg_review_score": 4.4,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Silicone Pet Food Bowl Non-Slip 2-Pack",
        "description": "Collapsible silicone pet bowls, food-grade BPA-free material. Non-slip base prevents sliding. Dishwasher safe. Perfect for travel, camping, hiking with pets. Suitable for dogs and cats. Capacity: 300ml each.",
        "category": "Pet Supplies",
        "tags": ["pet bowl", "dog bowl", "cat bowl", "travel", "silicone"],
        "source_platform": "aliexpress",
        "source_url": "https://www.aliexpress.com/item/3256805123456789.html",
        "source_price_usd": 2.10,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 2.00,
        "source_image_url": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 12.99,
        "estimated_monthly_sales": 1800,
        "sales_rank": 89,
        "review_count": 3400,
        "avg_review_score": 4.6,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "Posture Corrector Back Support Brace",
        "description": "Adjustable posture corrector for men and women. Lightweight breathable material, invisible under clothing. Corrects slouching and back pain caused by desk work. Adjustable shoulder straps fit chest sizes 28-48 inches.",
        "category": "Beauty & Health",
        "tags": ["posture", "back support", "pain relief", "office", "health"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513098765",
        "source_price_usd": 3.90,
        "source_min_order_qty": 30,
        "source_shipping_estimate_usd": 2.50,
        "source_image_url": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 19.99,
        "estimated_monthly_sales": 2200,
        "sales_rank": 156,
        "review_count": 6800,
        "avg_review_score": 4.0,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Bamboo Cutting Board Set of 3",
        "description": "Premium bamboo cutting board set with juice groove and handle. 3 sizes: small (20x28cm), medium (25x35cm), large (30x45cm). Natural antibacterial properties. Dishwasher safe, eco-friendly. Suitable for meat, vegetables, bread.",
        "category": "Kitchen",
        "tags": ["cutting board", "bamboo", "kitchen", "eco-friendly", "cooking"],
        "source_platform": "alibaba",
        "source_url": "https://www.alibaba.com/product-detail/bamboo-cutting-board_1600234567890.html",
        "source_price_usd": 4.20,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 6.00,
        "source_image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 24.99,
        "estimated_monthly_sales": 1900,
        "sales_rank": 203,
        "review_count": 4100,
        "avg_review_score": 4.5,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "Foldable Laptop Stand Adjustable Aluminium",
        "description": "Portable aluminium laptop stand with 6 adjustable height levels. Compatible with laptops 10-17 inches, tablets, and MacBooks. Improves posture and airflow. Non-slip rubber feet. Folds flat for portability. Weight: 310g.",
        "category": "Office Supplies",
        "tags": ["laptop stand", "ergonomic", "aluminium", "portable", "work from home"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513156789",
        "source_price_usd": 6.50,
        "source_min_order_qty": 20,
        "source_shipping_estimate_usd": 3.50,
        "source_image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 34.99,
        "estimated_monthly_sales": 3500,
        "sales_rank": 34,
        "review_count": 11200,
        "avg_review_score": 4.4,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Resistance Bands Set 5-Pack",
        "description": "Premium fabric resistance bands for legs and glutes. 5 resistance levels: 15lb, 25lb, 35lb, 45lb, 55lb. Non-slip anti-snap design. Includes carrying bag and workout guide. Suitable for yoga, pilates, home workouts.",
        "category": "Sports & Outdoors",
        "tags": ["resistance bands", "fitness", "workout", "gym", "yoga"],
        "source_platform": "aliexpress",
        "source_url": "https://www.aliexpress.com/item/3256804567890123.html",
        "source_price_usd": 2.80,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 2.00,
        "source_image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 16.99,
        "estimated_monthly_sales": 4800,
        "sales_rank": 23,
        "review_count": 18900,
        "avg_review_score": 4.3,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Reusable Beeswax Food Wraps 6-Pack",
        "description": "Eco-friendly reusable food wraps made from organic cotton and beeswax. Replaces plastic cling film. Keeps food fresh for longer. 3 sizes: small (18x18cm), medium (25x25cm), large (33x35cm). Machine washable at 30°C.",
        "category": "Kitchen",
        "tags": ["eco-friendly", "beeswax", "food wrap", "sustainable", "zero waste"],
        "source_platform": "alibaba",
        "source_url": "https://www.alibaba.com/product-detail/beeswax-food-wraps_1600345678901.html",
        "source_price_usd": 3.50,
        "source_min_order_qty": 100,
        "source_shipping_estimate_usd": 3.00,
        "source_image_url": "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400",
        "best_sell_platform": "etsy",
        "avg_sell_price_usd": 18.99,
        "estimated_monthly_sales": 900,
        "sales_rank": 345,
        "review_count": 2100,
        "avg_review_score": 4.7,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Car Seat Back Organiser Kick Mat",
        "description": "Premium car seat back organiser and kick mat. 8 pockets including tablet pocket for 10-inch devices. Waterproof, scratch-resistant. Prevents dirt and scuff marks on back of seat. Easy installation, universal fit.",
        "category": "Auto Accessories",
        "tags": ["car organiser", "kick mat", "back seat", "storage", "children"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513234567",
        "source_price_usd": 5.20,
        "source_min_order_qty": 30,
        "source_shipping_estimate_usd": 4.00,
        "source_image_url": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 21.99,
        "estimated_monthly_sales": 1600,
        "sales_rank": 278,
        "review_count": 4300,
        "avg_review_score": 4.2,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "LED Strip Lights 5m USB Powered",
        "description": "USB LED strip lights 5 metres, 300 LEDs, 16 colours + remote control. Waterproof IP65, cuttable every 3 LEDs. Perfect for bedroom, gaming setup, TV backlight, kitchen under-cabinet. Self-adhesive backing for easy installation.",
        "category": "Home & Garden",
        "tags": ["LED lights", "strip lights", "gaming", "bedroom", "decor"],
        "source_platform": "aliexpress",
        "source_url": "https://www.aliexpress.com/item/3256803456789012.html",
        "source_price_usd": 3.80,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 2.50,
        "source_image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 15.99,
        "estimated_monthly_sales": 6200,
        "sales_rank": 8,
        "review_count": 28000,
        "avg_review_score": 4.2,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Silk Sleep Mask Eye Cover",
        "description": "100% natural mulberry silk sleep mask. Adjustable head strap, ultra-soft eye cover with contoured design. Blocks 100% light. Includes earplugs and carry pouch. Suitable for travel, shift workers, and light sleepers.",
        "category": "Beauty & Health",
        "tags": ["sleep mask", "silk", "eye mask", "travel", "sleep"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513312345",
        "source_price_usd": 2.20,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 1.80,
        "source_image_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 12.99,
        "estimated_monthly_sales": 2400,
        "sales_rank": 145,
        "review_count": 7800,
        "avg_review_score": 4.4,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "Acrylic Nail Art Kit Professional 120pc",
        "description": "Complete professional nail art kit with 120 pieces. Includes acrylic nail tips, UV gel, base coat, top coat, nail file, buffer, brushes, and nail art tools. Suitable for beginners and professionals. Salon quality at home.",
        "category": "Beauty & Health",
        "tags": ["nail art", "acrylic nails", "gel nails", "beauty", "DIY"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513390123",
        "source_price_usd": 7.50,
        "source_min_order_qty": 20,
        "source_shipping_estimate_usd": 3.00,
        "source_image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 29.99,
        "estimated_monthly_sales": 3100,
        "sales_rank": 56,
        "review_count": 9200,
        "avg_review_score": 4.1,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Wooden Desk Organiser 7-Compartment",
        "description": "Multi-functional bamboo desk organiser with 7 compartments for pens, scissors, tape, stapler, and documents. Includes 2 small drawers. Natural bamboo finish complements any home office decor. Dimensions: 28x18x12cm.",
        "category": "Office Supplies",
        "tags": ["desk organiser", "bamboo", "office", "stationary", "storage"],
        "source_platform": "alibaba",
        "source_url": "https://www.alibaba.com/product-detail/wooden-desk-organiser_1600456789012.html",
        "source_price_usd": 5.50,
        "source_min_order_qty": 50,
        "source_shipping_estimate_usd": 7.00,
        "source_image_url": "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 24.99,
        "estimated_monthly_sales": 1400,
        "sales_rank": 312,
        "review_count": 3600,
        "avg_review_score": 4.5,
        "is_trending": False,
        "trend_direction": "flat",
    },
    {
        "name": "Smart Plant Pot Self-Watering 6 inch",
        "description": "Self-watering planter with water level indicator. Inner pot with drainage, outer reservoir holds water for up to 3 weeks. Suitable for herbs, small plants, and succulents. Available in multiple colours. Modern minimalist design.",
        "category": "Home & Garden",
        "tags": ["plant pot", "self-watering", "indoor plants", "gardening", "home decor"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513468901",
        "source_price_usd": 3.10,
        "source_min_order_qty": 30,
        "source_shipping_estimate_usd": 3.50,
        "source_image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
        "best_sell_platform": "etsy",
        "avg_sell_price_usd": 16.99,
        "estimated_monthly_sales": 1200,
        "sales_rank": 234,
        "review_count": 2800,
        "avg_review_score": 4.6,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Waterproof Phone Pouch Universal",
        "description": "Universal waterproof phone pouch IPX8 certified. Clear front and back, fits phones up to 7 inches. Adjustable neck lanyard and armband included. Perfect for beach, swimming, kayaking, snorkelling. Touch screen compatible.",
        "category": "Sports & Outdoors",
        "tags": ["waterproof", "phone pouch", "beach", "swimming", "summer"],
        "source_platform": "aliexpress",
        "source_url": "https://www.aliexpress.com/item/3256802345678901.html",
        "source_price_usd": 1.50,
        "source_min_order_qty": 100,
        "source_shipping_estimate_usd": 1.50,
        "source_image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 9.99,
        "estimated_monthly_sales": 4400,
        "sales_rank": 89,
        "review_count": 12400,
        "avg_review_score": 4.0,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Electric Facial Massager Microcurrent",
        "description": "Microcurrent facial lifting device with 5 intensity levels. EMS stimulation lifts facial muscles, reduces fine lines. Includes LED light therapy (red + blue). USB rechargeable, 30-minute auto-off. Suitable for all skin types.",
        "category": "Beauty & Health",
        "tags": ["facial massager", "microcurrent", "anti-aging", "skincare", "EMS"],
        "source_platform": "temu",
        "source_url": "https://www.temu.com/goods.html?goods_id=601099513547890",
        "source_price_usd": 8.90,
        "source_min_order_qty": 20,
        "source_shipping_estimate_usd": 2.50,
        "source_image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 39.99,
        "estimated_monthly_sales": 2800,
        "sales_rank": 78,
        "review_count": 6700,
        "avg_review_score": 4.2,
        "is_trending": True,
        "trend_direction": "up",
    },
    {
        "name": "Foam Puzzle Floor Mat 36pc",
        "description": "Interlocking foam floor mat set, 36 tiles each 30x30cm. Creates 3.2 sqm of cushioned play area. EVA foam, non-toxic, BPA-free. Easy to clean with damp cloth. Perfect for children's playroom, home gym, or yoga.",
        "category": "Toys & Games",
        "tags": ["foam mat", "play mat", "children", "gym mat", "interlocking"],
        "source_platform": "alibaba",
        "source_url": "https://www.alibaba.com/product-detail/foam-puzzle-mat_1600567890123.html",
        "source_price_usd": 9.50,
        "source_min_order_qty": 20,
        "source_shipping_estimate_usd": 12.00,
        "source_image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "best_sell_platform": "amazon",
        "avg_sell_price_usd": 34.99,
        "estimated_monthly_sales": 2100,
        "sales_rank": 123,
        "review_count": 5400,
        "avg_review_score": 4.4,
        "is_trending": False,
        "trend_direction": "flat",
    },
]


def seed():
    db = SessionLocal()
    count = 0

    try:
        for data in SEED_PRODUCTS:
            # Check if already exists
            existing = db.query(Product).filter(
                Product.name == data["name"]
            ).first()
            if existing:
                print(f"  Skipping (exists): {data['name'][:50]}")
                continue

            direction = data.pop("trend_direction", "flat")
            product = Product(
                **{k: v for k, v in data.items() if k != "trend_direction"},
                trend_data=make_trend_data(12, direction),
                scraped_at=datetime.utcnow(),
                last_refreshed=datetime.utcnow(),
            )
            db.add(product)
            count += 1
            print(f"  Added: {data['name'][:50]}")

        db.commit()
        print(f"\n✅ Seeded {count} products successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding product database…")
    seed()
