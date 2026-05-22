/**
 * Seed the database with fresh dropshipping products.
 * Usage:
 *   node scripts/seed.mjs              — adds only new products
 *   node scripts/seed.mjs --clear      — wipes products table first, then seeds
 *
 * DATABASE_URL can be passed as env var or falls back to the hardcoded RDS string.
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')

const CONN = process.env.DATABASE_URL ||
  'postgresql://bigidea_admin:BigIdea_Prod_2026xK9q@the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com:5432/the_big_idea'

const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } })
const CLEAR = process.argv.includes('--clear')

function makeTrendData(months = 12, direction = 'up') {
  const base = 30 + Math.floor(Math.random() * 40)
  return Array.from({ length: months }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (months - i))
    let vol
    if (direction === 'up')   vol = Math.round(base * (1 + i * 0.09 + (Math.random() - 0.35) * 0.12))
    else if (direction === 'down') vol = Math.round(base * Math.max(0.3, 1 - i * 0.06 + (Math.random() - 0.5) * 0.06))
    else vol = Math.round(base * (1 + (Math.random() - 0.5) * 0.18))
    vol = Math.max(5, Math.min(100, vol))
    return {
      date: date.toISOString().slice(0, 10),
      searchVolume: vol,
      salesIndex: Math.max(5, Math.round(vol * (0.6 + Math.random() * 0.9))),
    }
  })
}

const PRODUCTS = [
  // ── Electronics & Tech ──────────────────────────────────────────────────────
  {
    name: '3-in-1 Magnetic Wireless Charging Station',
    description: 'Charge your phone, earbuds, and smartwatch simultaneously. MagSafe-compatible 15W fast charging pad with 5W earbuds spot and 3W watch charger. LED night light mode. Includes 1.5m braided USB-C cable.',
    category: 'Electronics Accessories', tags: ['wireless charger','magsafe','charging station','3 in 1','desk'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520001001',
    source_price_usd: 12.50, source_min_order_qty: 20, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b83?w=400',
    best_sell_platform: 'amazon', amazon_asin: 'B0CH4QSXJW',
    avg_sell_price_usd: 44.99, estimated_monthly_sales: 3400, sales_rank: 38,
    review_count: 6200, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Clip-On Phone Lens Kit 4-in-1',
    description: '198° fisheye, 0.67× wide angle, 15× macro, and 2× telephoto lenses. Universal clip fits any smartphone. Includes carrying pouch and lens cloth. Perfect for travel, content creation, and photography.',
    category: 'Electronics Accessories', tags: ['phone lens','camera','photography','clip on','travel'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807001002003.html',
    source_price_usd: 3.20, source_min_order_qty: 50, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 18.99, estimated_monthly_sales: 4100, sales_rank: 29,
    review_count: 14300, avg_review_score: 4.1, is_trending: true, trend: 'up',
  },
  {
    name: 'Smart LED Desk Lamp with 10W Wireless Charger',
    description: 'Multi-level dimmable LED desk lamp (3 colour temperatures, 10 brightness levels) with integrated 10W Qi wireless charging base. USB-A port for second device. Touch control. Eye-care, flicker-free light.',
    category: 'Electronics Accessories', tags: ['desk lamp','wireless charger','LED','office','study'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/smart-lamp-charger_2100001002.html',
    source_price_usd: 14.80, source_min_order_qty: 20, source_shipping_estimate_usd: 5.50,
    source_image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 49.99, estimated_monthly_sales: 2600, sales_rank: 72,
    review_count: 5100, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'USB-C Hub 7-in-1 Multiport Adapter',
    description: '7-in-1 USB-C hub: 4K HDMI, 100W PD passthrough, 2× USB-A 3.0, SD & microSD card readers, and Gigabit Ethernet. Aluminium shell, bus-powered. Compatible with MacBook, iPad Pro, and Windows laptops.',
    category: 'Electronics Accessories', tags: ['usb hub','usb-c','hdmi','macbook','multiport'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807002003004.html',
    source_price_usd: 5.80, source_min_order_qty: 30, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 27.99, estimated_monthly_sales: 5200, sales_rank: 19,
    review_count: 19800, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Solar Portable Power Bank 20000mAh',
    description: '20000mAh power bank with dual solar panels and 22.5W fast charging. 3 outputs (USB-A × 2, USB-C) + flashlight. IP66 waterproof, drop-resistant. Charges 3 devices simultaneously. Perfect for camping and festivals.',
    category: 'Electronics Accessories', tags: ['power bank','solar','portable charger','camping','outdoor'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807003004005.html',
    source_price_usd: 9.50, source_min_order_qty: 30, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1609941960402-3c0c77cba4e1?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 34.99, estimated_monthly_sales: 3100, sales_rank: 54,
    review_count: 8700, avg_review_score: 4.2, is_trending: true, trend: 'up',
  },
  {
    name: 'ANC True Wireless Earbuds 30hr Battery',
    description: 'Active noise cancelling earbuds with 8-hour earbud + 22-hour case battery life. 4-mic call quality, transparency mode, IPX5 sweat resistant. Compatible with iPhone and Android. Includes 3 ear tip sizes.',
    category: 'Electronics Accessories', tags: ['earbuds','anc','wireless','noise cancelling','bluetooth'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/anc-earbuds-tws_2100002003.html',
    source_price_usd: 8.90, source_min_order_qty: 20, source_shipping_estimate_usd: 3.00,
    source_image_url: 'https://images.unsplash.com/photo-1590658165737-15a047b7c4b4?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 39.99, estimated_monthly_sales: 4800, sales_rank: 22,
    review_count: 12400, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Car Jump Starter 2000A Peak Power Bank',
    description: '2000A peak lithium jump starter for engines up to 8L petrol/6L diesel. Built-in 20800mAh power bank, USB-C fast charge, LED torch, compass. Safety protection against reverse polarity and overcharge.',
    category: 'Auto Accessories', tags: ['jump starter','power bank','car','emergency','battery'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807004005006.html',
    source_price_usd: 18.50, source_min_order_qty: 10, source_shipping_estimate_usd: 6.00,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 64.99, estimated_monthly_sales: 1900, sales_rank: 98,
    review_count: 7200, avg_review_score: 4.4, is_trending: false, trend: 'flat',
  },
  {
    name: 'Phone Ring Grip Stand MagSafe Compatible',
    description: 'Rotating 360° ring stand and grip that attaches magnetically. Doubles as a kickstand for hands-free viewing. Works with MagSafe cases. Ultra-slim 2.5mm profile. Available in 6 colours. Universal fit.',
    category: 'Electronics Accessories', tags: ['phone grip','ring stand','magsafe','holder','accessory'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520001009',
    source_price_usd: 1.20, source_min_order_qty: 100, source_shipping_estimate_usd: 1.50,
    source_image_url: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 9.99, estimated_monthly_sales: 8200, sales_rank: 6,
    review_count: 31000, avg_review_score: 4.2, is_trending: true, trend: 'up',
  },

  // ── Home & Garden ────────────────────────────────────────────────────────────
  {
    name: 'Over-Door Storage Organiser 6-Pocket',
    description: 'Heavy-duty over-door storage with 6 deep mesh pockets and stainless steel hooks. Fits doors up to 45mm thick. Perfect for bedroom, bathroom, pantry, and office. No drilling required. Load: 5kg.',
    category: 'Home & Garden', tags: ['door organiser','storage','bedroom','bathroom','hooks'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520002001',
    source_price_usd: 4.80, source_min_order_qty: 30, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 17.99, estimated_monthly_sales: 3400, sales_rank: 42,
    review_count: 9100, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Electric Spin Scrubber Cordless with 4 Heads',
    description: 'Rechargeable electric cleaning brush with 4 interchangeable heads (flat, corner, cone, dome). 360° auto rotation, adjustable arm for hard-to-reach spots. IPX7 waterproof. 90-min battery life. Ideal for tiles, bath, kitchen.',
    category: 'Home & Garden', tags: ['spin scrubber','cleaning','bathroom','electric','cordless'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/spin-scrubber_2100003001.html',
    source_price_usd: 16.50, source_min_order_qty: 15, source_shipping_estimate_usd: 6.00,
    source_image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 54.99, estimated_monthly_sales: 2200, sales_rank: 86,
    review_count: 6400, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Sous Vide Immersion Circulator 1100W',
    description: 'Precision sous vide cooker with temperature accuracy ±0.1°C, 1100W heating element, and 11L capacity. Quiet motor, touch display, WiFi app control. Clamps to any pot. Produces restaurant-quality results at home.',
    category: 'Kitchen', tags: ['sous vide','cooking','precision','chef','kitchen gadget'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/sous-vide-circulator_2100003002.html',
    source_price_usd: 22.50, source_min_order_qty: 10, source_shipping_estimate_usd: 8.00,
    source_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 79.99, estimated_monthly_sales: 1400, sales_rank: 167,
    review_count: 4300, avg_review_score: 4.6, is_trending: true, trend: 'up',
  },
  {
    name: 'Silicone Stretch Lids Set 6-Pack',
    description: 'Food-grade silicone stretch lids in 6 sizes (fits bowls, cans, glasses from 6cm to 26cm diameter). BPA-free, airtight seal. Dishwasher and freezer safe. Replaces cling film and foil. Eco-friendly kitchen essential.',
    category: 'Kitchen', tags: ['silicone lids','food storage','eco-friendly','reusable','kitchen'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520003003',
    source_price_usd: 3.80, source_min_order_qty: 50, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 14.99, estimated_monthly_sales: 4600, sales_rank: 26,
    review_count: 16800, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Magnetic Double-Sided Window Cleaner',
    description: 'Magnetic window cleaning tool for double-glazed windows 14–24mm thick. Cleans both sides simultaneously. Non-scratch microfibre pads, safety cord. Saves time on upstairs and hard-to-reach windows.',
    category: 'Home & Garden', tags: ['window cleaner','magnetic','cleaning','home','gadget'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807005001002.html',
    source_price_usd: 5.80, source_min_order_qty: 30, source_shipping_estimate_usd: 3.00,
    source_image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 22.99, estimated_monthly_sales: 2800, sales_rank: 68,
    review_count: 7600, avg_review_score: 4.2, is_trending: true, trend: 'up',
  },
  {
    name: 'Himalayan Salt Lamp USB Natural Crystal',
    description: 'Hand-carved natural Himalayan pink salt lamp, 1–2kg. Warm amber glow (2200K). USB power cable with inline dimmer switch. Wooden base. Creates a calming ambience. Makes a thoughtful gift.',
    category: 'Home & Garden', tags: ['salt lamp','himalayan','ambient light','wellness','gift'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807005002003.html',
    source_price_usd: 6.50, source_min_order_qty: 30, source_shipping_estimate_usd: 8.00,
    source_image_url: 'https://images.unsplash.com/photo-1524055988636-436cfa46e59e?w=400',
    best_sell_platform: 'etsy', avg_sell_price_usd: 24.99, estimated_monthly_sales: 1600, sales_rank: 198,
    review_count: 5200, avg_review_score: 4.7, is_trending: false, trend: 'flat',
  },
  {
    name: 'Magnetic Knife Strip Wall Mount 40cm',
    description: 'Stainless steel magnetic knife holder strip 40cm. Holds 8–10 knives without scratching blades. Includes all mounting hardware. Easy to install on any wall. Frees up drawer and counter space.',
    category: 'Kitchen', tags: ['knife strip','magnetic','kitchen storage','wall mount','knives'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807005003004.html',
    source_price_usd: 4.50, source_min_order_qty: 50, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 19.99, estimated_monthly_sales: 2100, sales_rank: 112,
    review_count: 8300, avg_review_score: 4.5, is_trending: false, trend: 'flat',
  },
  {
    name: 'Egg Cooker Electric 7-Egg Capacity',
    description: 'Electric egg cooker that hard-boils, soft-boils, poaches, and makes omelettes. 7-egg capacity, automatic shut-off buzzer. Includes measuring cup, egg piercer, and omelette tray. Ready in under 12 minutes.',
    category: 'Kitchen', tags: ['egg cooker','kitchen','breakfast','electric','appliance'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520003007',
    source_price_usd: 8.50, source_min_order_qty: 20, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 29.99, estimated_monthly_sales: 2700, sales_rank: 71,
    review_count: 9400, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'French Press Coffee Maker Borosilicate 800ml',
    description: 'Premium borosilicate glass French press with stainless steel double-screen filter. 800ml (4–6 cups). Thick glass, cool-touch handle, protective base. Produces a rich, full-body coffee. Dishwasher safe.',
    category: 'Kitchen', tags: ['french press','coffee','kitchen','borosilicate','glass'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/french-press_2100004001.html',
    source_price_usd: 7.50, source_min_order_qty: 30, source_shipping_estimate_usd: 5.00,
    source_image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 27.99, estimated_monthly_sales: 2300, sales_rank: 94,
    review_count: 6800, avg_review_score: 4.6, is_trending: false, trend: 'flat',
  },

  // ── Beauty & Health ──────────────────────────────────────────────────────────
  {
    name: 'Rose Quartz Gua Sha Facial Tool',
    description: 'Authentic rose quartz gua sha stone, hand-finished with smooth contoured edges. Reduces facial puffiness, promotes lymphatic drainage, and defines jawline. Includes velvet storage pouch and how-to card.',
    category: 'Beauty & Health', tags: ['gua sha','rose quartz','skincare','facial','wellness'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807006001002.html',
    source_price_usd: 1.80, source_min_order_qty: 100, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    best_sell_platform: 'etsy', avg_sell_price_usd: 14.99, estimated_monthly_sales: 3600, sales_rank: 44,
    review_count: 11200, avg_review_score: 4.7, is_trending: true, trend: 'up',
  },
  {
    name: 'Ice Roller Face Massager Stainless Steel',
    description: 'Stainless steel ice roller for face and neck. Reduces puffiness, soothes redness, shrinks pores. Stays cold for 15 minutes. Dishwasher safe, hygienic. Ideal morning skincare addition. Gift-boxed.',
    category: 'Beauty & Health', tags: ['ice roller','skincare','face massage','puffiness','beauty'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520004002',
    source_price_usd: 3.50, source_min_order_qty: 50, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 16.99, estimated_monthly_sales: 4100, sales_rank: 31,
    review_count: 14600, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Hydrocolloid Pimple Patches 108-Pack',
    description: 'Hydrocolloid acne patches in 3 sizes (10mm, 12mm, 14mm). Absorb pus overnight, protect against bacteria and picking. Transparent, nearly invisible. Vegan, cruelty-free. Dermatologist tested. 108 patches per pack.',
    category: 'Beauty & Health', tags: ['pimple patches','acne','skincare','hydrocolloid','beauty'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520004003',
    source_price_usd: 2.10, source_min_order_qty: 100, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1593179357196-e11d5a0e60d2?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 10.99, estimated_monthly_sales: 6800, sales_rank: 11,
    review_count: 28000, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'LED Face Mask 7-Colour Light Therapy',
    description: 'Professional LED photon therapy mask with 7 light modes (red, blue, green, yellow, cyan, purple, white). 192 LEDs. Reduces acne, boosts collagen, evens skin tone. USB-powered. Dermatologist-tested, CE certified.',
    category: 'Beauty & Health', tags: ['led mask','light therapy','skincare','anti aging','acne'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/led-face-mask_2100004002.html',
    source_price_usd: 18.50, source_min_order_qty: 10, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1629109682804-3c36c2f92b09?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 64.99, estimated_monthly_sales: 1800, sales_rank: 128,
    review_count: 5400, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Eyelash Lift & Tint Kit Professional',
    description: 'Salon-grade lash lift kit with lifting solution, setting solution, nourishing serum, and blue/black tint. Lasts 6–8 weeks. No mascara needed. Includes silicone lift pads in 5 sizes and full instructions.',
    category: 'Beauty & Health', tags: ['lash lift','eyelash','beauty','salon','tint'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520004005',
    source_price_usd: 5.80, source_min_order_qty: 30, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 22.99, estimated_monthly_sales: 2400, sales_rank: 87,
    review_count: 7100, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Scalp Massager Shampoo Brush Silicone',
    description: 'Deep-cleansing silicone scalp massager with 270 flexible bristles. Stimulates circulation, reduces dandruff, promotes hair growth. Works wet and dry. Ergonomic grip. Available in pink, blue, and black.',
    category: 'Beauty & Health', tags: ['scalp massager','hair growth','shampoo brush','silicone','wellness'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807006005002.html',
    source_price_usd: 1.50, source_min_order_qty: 100, source_shipping_estimate_usd: 1.50,
    source_image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 8.99, estimated_monthly_sales: 7400, sales_rank: 9,
    review_count: 34000, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Dermaplaning Facial Razor Set 12-Pack',
    description: 'Precision face razors for painless removal of peach fuzz and dead skin. 12 individually wrapped stainless-steel blades. Leaves skin silky smooth for better makeup application. Single use for hygiene.',
    category: 'Beauty & Health', tags: ['dermaplaning','facial razor','skincare','peach fuzz','beauty'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807006006003.html',
    source_price_usd: 2.40, source_min_order_qty: 100, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 11.99, estimated_monthly_sales: 5200, sales_rank: 18,
    review_count: 22000, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Teeth Whitening Strips Professional 28pc',
    description: 'Enamel-safe hydrogen peroxide whitening strips, 28 pieces (14-day supply). Dissolves after 30 minutes, no peeling. Removes coffee, wine, and tobacco stains. Dentist-recommended formula. Results in 7 days.',
    category: 'Beauty & Health', tags: ['teeth whitening','whitening strips','dental','smile','beauty'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/whitening-strips_2100005001.html',
    source_price_usd: 3.80, source_min_order_qty: 50, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 16.99, estimated_monthly_sales: 3900, sales_rank: 36,
    review_count: 13200, avg_review_score: 4.1, is_trending: true, trend: 'up',
  },
  {
    name: 'UV LED Nail Lamp 48W Gel Dryer',
    description: '48W UV/LED dual-light nail lamp for all gel types. Cures in 30 seconds. Auto-sensor, 3 timer settings, no-heat mode. 36 lamp beads, lifetime 50,000+ hours. Manicure tray removes for toenail curing.',
    category: 'Beauty & Health', tags: ['nail lamp','uv led','gel nails','nail art','manicure'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807006007004.html',
    source_price_usd: 6.50, source_min_order_qty: 30, source_shipping_estimate_usd: 3.00,
    source_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 24.99, estimated_monthly_sales: 3200, sales_rank: 49,
    review_count: 10800, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },

  // ── Fashion Accessories ───────────────────────────────────────────────────────
  {
    name: 'RFID Blocking Slim Minimalist Wallet',
    description: 'Slim leather-finish RFID-blocking bifold wallet. Holds 8 cards, cash slot, and SIM card tray. Brushed metal edge. Blocks contactless fraud. Lightweight 42g. Available in black, brown, and navy.',
    category: 'Fashion Accessories', tags: ['rfid wallet','slim wallet','minimalist','men','leather'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807007001002.html',
    source_price_usd: 1.90, source_min_order_qty: 100, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1559586912-3cf36c2f92b09?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 12.99, estimated_monthly_sales: 5100, sales_rank: 21,
    review_count: 19200, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'MagSafe Magnetic Phone Wallet Card Holder',
    description: 'Ultra-slim MagSafe-compatible wallet that sticks to the back of any iPhone 12–15. Holds 3 cards and cash. Vegan leather, RFID-blocking. Doubles as a card slot on non-MagSafe cases with included adhesive.',
    category: 'Fashion Accessories', tags: ['phone wallet','magsafe','card holder','iphone','slim'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520005002',
    source_price_usd: 2.80, source_min_order_qty: 50, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 13.99, estimated_monthly_sales: 6200, sales_rank: 14,
    review_count: 24000, avg_review_score: 4.2, is_trending: true, trend: 'up',
  },
  {
    name: 'Silk Satin Scrunchie Set 20-Pack',
    description: 'Luxurious satin scrunchies in 20 assorted colours. Large and small sizes. Gentle on hair, no creases or breakage. Perfect for thick and thin hair. Great gift. Each scrunchie individually bagged.',
    category: 'Fashion Accessories', tags: ['scrunchie','silk satin','hair accessory','women','gift'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520005003',
    source_price_usd: 3.20, source_min_order_qty: 100, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 14.99, estimated_monthly_sales: 4800, sales_rank: 27,
    review_count: 17400, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Wide Brim Packable Straw Sun Hat',
    description: 'Wide 10cm brim for maximum UV protection (UPF 50+). Lightweight natural straw, folds flat for luggage. Adjustable inner drawstring. Chin tie cord. Available in natural, black, and beige. Perfect for beach holidays.',
    category: 'Fashion Accessories', tags: ['sun hat','straw hat','beach','summer','UV protection'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807007004002.html',
    source_price_usd: 4.20, source_min_order_qty: 50, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 19.99, estimated_monthly_sales: 2900, sales_rank: 63,
    review_count: 8900, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },

  // ── Pet Supplies ─────────────────────────────────────────────────────────────
  {
    name: 'Automatic Cat Water Fountain 2.5L Silent',
    description: 'Ultra-quiet (< 30dB) cat water fountain with 2.5L capacity and triple filtration system. LED light, 3 flow modes. Encourages hydration in cats. BPA-free, dishwasher-safe. Includes 2 replacement filters.',
    category: 'Pet Supplies', tags: ['cat fountain','pet water','automatic','silent','filtration'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807008001002.html',
    source_price_usd: 9.50, source_min_order_qty: 20, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 34.99, estimated_monthly_sales: 3200, sales_rank: 51,
    review_count: 12600, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Interactive Automatic Laser Cat Toy',
    description: 'Automatic rotating laser pointer toy with 5-angle adjustment and randomised movement to keep cats engaged. 2-speed settings, auto 15-min shut-off. Includes USB cable and catnip bag. Suitable for cats and small dogs.',
    category: 'Pet Supplies', tags: ['cat toy','laser','interactive','automatic','entertainment'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520006002',
    source_price_usd: 4.80, source_min_order_qty: 30, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 18.99, estimated_monthly_sales: 2800, sales_rank: 69,
    review_count: 9200, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Slow Feeder Dog Bowl Anti-Bloat Puzzle',
    description: 'Slow feeder bowl with maze pattern that makes dogs eat 10× slower, reducing bloating, vomiting, and obesity. BPA-free food-grade PP. Non-slip base, dishwasher safe. Suitable for all dry food. 3 sizes available.',
    category: 'Pet Supplies', tags: ['slow feeder','dog bowl','anti bloat','puzzle','pet'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/slow-feeder-bowl_2100006001.html',
    source_price_usd: 5.80, source_min_order_qty: 30, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 19.99, estimated_monthly_sales: 2100, sales_rank: 104,
    review_count: 6800, avg_review_score: 4.5, is_trending: false, trend: 'flat',
  },
  {
    name: 'Pet Grooming Deshedding Glove',
    description: 'Five-finger pet grooming glove with 255 silicone tips for gentle deshedding. Works on all coat types — short, medium, and long. Left and right hand fit. Suitable for dogs, cats, and horses. Machine washable.',
    category: 'Pet Supplies', tags: ['grooming glove','deshedding','pet','dog','cat'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807008004002.html',
    source_price_usd: 2.80, source_min_order_qty: 50, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 12.99, estimated_monthly_sales: 3600, sales_rank: 43,
    review_count: 14800, avg_review_score: 4.4, is_trending: false, trend: 'flat',
  },

  // ── Sports & Outdoors ────────────────────────────────────────────────────────
  {
    name: 'Ultralight Nylon Camping Hammock 2-Person',
    description: '2-person camping hammock made from 210T ripstop nylon (max load 300kg). Packs down to the size of a grapefruit. Includes 2 tree straps (3m each), carabiners, and stuff sack. Set up in under 2 minutes.',
    category: 'Sports & Outdoors', tags: ['hammock','camping','outdoor','lightweight','nylon'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807009001002.html',
    source_price_usd: 8.50, source_min_order_qty: 20, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 29.99, estimated_monthly_sales: 2400, sales_rank: 82,
    review_count: 8100, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Speed Jump Rope with Digital Counter',
    description: 'Lightweight aluminium handle speed rope with digital jump counter and calorie tracker. Adjustable cable length (2.7m–3.2m). Bearing system for smooth rotation. Suitable for boxing, HIIT, CrossFit.',
    category: 'Sports & Outdoors', tags: ['jump rope','skipping','fitness','counter','boxing'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520007002',
    source_price_usd: 3.20, source_min_order_qty: 50, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 14.99, estimated_monthly_sales: 4100, sales_rank: 32,
    review_count: 11600, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Waterproof Gym Bag with Wet/Dry Compartment',
    description: 'Duffle bag with separate waterproof wet/dry compartment, shoe pocket, and 3 external zip pockets. 40L capacity. Reinforced handles and padded shoulder strap. Available in 5 colours. Great for gym, swimming, travel.',
    category: 'Sports & Outdoors', tags: ['gym bag','duffle','waterproof','wet dry','sports'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/gym-bag-wet-dry_2100007001.html',
    source_price_usd: 9.80, source_min_order_qty: 20, source_shipping_estimate_usd: 5.00,
    source_image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 34.99, estimated_monthly_sales: 2100, sales_rank: 109,
    review_count: 5900, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Collapsible Trekking Poles Carbon Look Pair',
    description: 'Pair of collapsible trekking/hiking poles with twist-lock mechanism. Adjustable 65–135cm. Aluminium alloy shaft, ergonomic cork-look grip, wrist straps. Includes rubber tips and carbide tips. 260g per pole.',
    category: 'Sports & Outdoors', tags: ['trekking poles','hiking','collapsible','outdoor','walking'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807009004002.html',
    source_price_usd: 12.50, source_min_order_qty: 20, source_shipping_estimate_usd: 6.00,
    source_image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 39.99, estimated_monthly_sales: 1700, sales_rank: 142,
    review_count: 4900, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Running Belt Waist Pack with Phone Holder',
    description: 'Water-resistant running belt with expandable phone pocket (fits up to iPhone 15 Pro Max). Adjustable waist strap 60–120cm. Zip closure, reflective strips for safety. Ideal for 5K and 10K running, cycling, hiking.',
    category: 'Sports & Outdoors', tags: ['running belt','waist pack','phone holder','running','fitness'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520007005',
    source_price_usd: 3.80, source_min_order_qty: 50, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 16.99, estimated_monthly_sales: 3300, sales_rank: 47,
    review_count: 10200, avg_review_score: 4.2, is_trending: true, trend: 'up',
  },

  // ── Auto Accessories ──────────────────────────────────────────────────────────
  {
    name: 'Portable Electric Tyre Inflator Digital',
    description: 'Cordless electric tyre inflator with digital pressure gauge (PSI/BAR/KPA/kg/cm²). 150 PSI max, inflates car tyre in 4 minutes. Auto-stop at set pressure. Built-in LED torch. Includes car adaptor and needle attachments.',
    category: 'Auto Accessories', tags: ['tyre inflator','portable','electric','digital','car'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807010001002.html',
    source_price_usd: 12.50, source_min_order_qty: 15, source_shipping_estimate_usd: 4.50,
    source_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 39.99, estimated_monthly_sales: 2600, sales_rank: 76,
    review_count: 9800, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Mini Cordless Car Vacuum Cleaner 8000Pa',
    description: '8000Pa suction cordless handheld car vacuum. Bagless with washable HEPA filter. 30-minute run time, USB-C charging. 5 attachments for vents, seats, and corners. Includes storage pouch. Weight: 480g.',
    category: 'Auto Accessories', tags: ['car vacuum','cordless','handheld','mini','cleaning'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520008002',
    source_price_usd: 8.90, source_min_order_qty: 20, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 29.99, estimated_monthly_sales: 2900, sales_rank: 64,
    review_count: 8600, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Wide-Angle Blind Spot Mirrors Adhesive 2-Pack',
    description: 'Convex blind spot mirrors (2 pack) with self-adhesive 3M pads. 360° adjustable. 54mm diameter, fits any vehicle mirror. Eliminates blind spots for lane changes and reversing. CE safety certified.',
    category: 'Auto Accessories', tags: ['blind spot mirror','car safety','convex','adhesive','driving'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807010003002.html',
    source_price_usd: 1.80, source_min_order_qty: 100, source_shipping_estimate_usd: 1.50,
    source_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 9.99, estimated_monthly_sales: 5600, sales_rank: 15,
    review_count: 21000, avg_review_score: 4.2, is_trending: false, trend: 'flat',
  },
  {
    name: 'Dual Dash Cam 4K Front and 1080P Rear',
    description: 'Dual-channel dash cam with 4K front camera and 1080P rear camera. 3-inch IPS screen, 170° wide angle, night vision, G-sensor, loop recording, and parking mode. 32GB microSD included. App-free playback.',
    category: 'Auto Accessories', tags: ['dash cam','4k','dual lens','car camera','driving recorder'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/dash-cam-4k_2100008001.html',
    source_price_usd: 22.50, source_min_order_qty: 10, source_shipping_estimate_usd: 5.00,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 74.99, estimated_monthly_sales: 1500, sales_rank: 158,
    review_count: 4100, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },

  // ── Toys & Games ─────────────────────────────────────────────────────────────
  {
    name: 'Magnetic Tiles Building Set 100 Pieces',
    description: 'STEM magnetic building tiles for ages 3+. 100 pieces in 6 shapes and 5 colours. Strong arc magnets, smooth safe edges. Supports open-ended creative play, geometry, and spatial reasoning. Storage bag included.',
    category: 'Toys & Games', tags: ['magnetic tiles','STEM','building blocks','kids','educational'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/magnetic-tiles_2100009001.html',
    source_price_usd: 18.50, source_min_order_qty: 10, source_shipping_estimate_usd: 8.00,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 59.99, estimated_monthly_sales: 2100, sales_rank: 107,
    review_count: 7300, avg_review_score: 4.7, is_trending: true, trend: 'up',
  },
  {
    name: 'Pop It Sensory Fidget Toys Pack of 5',
    description: 'Set of 5 silicone pop-it fidget toys in different shapes (circle, square, dinosaur, heart, rainbow). Food-grade silicone, BPA-free. Ideal for stress relief, focus, and sensory play for ADHD. Washable.',
    category: 'Toys & Games', tags: ['pop it','fidget toy','sensory','stress relief','kids'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807011002002.html',
    source_price_usd: 2.50, source_min_order_qty: 100, source_shipping_estimate_usd: 2.00,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 9.99, estimated_monthly_sales: 4600, sales_rank: 24,
    review_count: 18500, avg_review_score: 4.2, is_trending: false, trend: 'flat',
  },
  {
    name: 'Dinosaur Egg Excavation Kit Set of 12',
    description: 'Set of 12 excavation eggs, each containing a surprise miniature dinosaur skeleton. Chisels and brushes included. STEM activity for ages 6+. 12 different species (T-Rex, Triceratops, Brachiosaurus, etc.).',
    category: 'Toys & Games', tags: ['excavation kit','dinosaur','STEM','kids','science'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807011003003.html',
    source_price_usd: 5.80, source_min_order_qty: 30, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 19.99, estimated_monthly_sales: 2300, sales_rank: 91,
    review_count: 7100, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Kinetic Sand Moulding Set 1kg',
    description: '1kg of kinetic sand with 10 moulding tools including stamps, roller, and shapes. Never dries out, cleans up without mess. Non-toxic, safe for ages 3+. Stimulates sensory play and creativity.',
    category: 'Toys & Games', tags: ['kinetic sand','sensory','moulding','kids','creative play'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520009004',
    source_price_usd: 6.50, source_min_order_qty: 20, source_shipping_estimate_usd: 4.50,
    source_image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 22.99, estimated_monthly_sales: 1800, sales_rank: 134,
    review_count: 5200, avg_review_score: 4.4, is_trending: false, trend: 'flat',
  },

  // ── Office Supplies ───────────────────────────────────────────────────────────
  {
    name: 'Dual Monitor Arm Stand Fully Adjustable',
    description: 'Gas-spring dual monitor arm for screens 13–32 inches (max 9kg each). 360° rotation, ±45° tilt, height 0–45cm. C-clamp and grommet mount. Cable management channels. VESA 75×75 and 100×100 compatible.',
    category: 'Office Supplies', tags: ['monitor arm','dual monitor','desk mount','ergonomic','VESA'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/dual-monitor-arm_2100010001.html',
    source_price_usd: 24.50, source_min_order_qty: 10, source_shipping_estimate_usd: 9.00,
    source_image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 79.99, estimated_monthly_sales: 1600, sales_rank: 154,
    review_count: 4800, avg_review_score: 4.5, is_trending: true, trend: 'up',
  },
  {
    name: 'Wireless Ergonomic Vertical Mouse',
    description: 'Vertical ergonomic mouse that reduces wrist pronation by 60°. 2.4GHz wireless, 800/1200/1600 DPI. 6 buttons including forward/back. USB nano receiver. 12-month AA battery life. Left and right hand versions.',
    category: 'Office Supplies', tags: ['vertical mouse','ergonomic','wireless','office','wrist pain'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807012002002.html',
    source_price_usd: 7.80, source_min_order_qty: 20, source_shipping_estimate_usd: 3.00,
    source_image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 27.99, estimated_monthly_sales: 3200, sales_rank: 53,
    review_count: 11400, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Digital Kitchen Scales 5kg Precision',
    description: 'Precision kitchen scales accurate to 1g up to 5kg. 4-unit switching (g/oz/lb/ml). Tare function, low battery indicator. Tempered glass surface. Ultra-slim 15mm profile. Includes 2× AAA batteries.',
    category: 'Kitchen', tags: ['kitchen scales','digital','precision','baking','cooking'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520010003',
    source_price_usd: 4.80, source_min_order_qty: 50, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 16.99, estimated_monthly_sales: 3700, sales_rank: 39,
    review_count: 13800, avg_review_score: 4.5, is_trending: false, trend: 'flat',
  },
  {
    name: 'Portable Mini Projector 1080p Support',
    description: 'Mini LED projector supports 1080p input (native 720p). 100 ANSI lumens, 100-inch image at 3m. HDMI, USB, AV inputs. Built-in 2W speakers. Compatible with smartphone, laptop, stick PC. Carry bag included.',
    category: 'Electronics Accessories', tags: ['projector','mini','portable','home cinema','1080p'],
    source_platform: 'alibaba', source_url: 'https://www.alibaba.com/product-detail/mini-projector_2100011001.html',
    source_price_usd: 28.50, source_min_order_qty: 10, source_shipping_estimate_usd: 8.00,
    source_image_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 89.99, estimated_monthly_sales: 1400, sales_rank: 169,
    review_count: 3900, avg_review_score: 4.1, is_trending: true, trend: 'up',
  },
  {
    name: 'Avocado Slicer 3-in-1 Stainless Steel',
    description: '3-in-1 avocado tool: splits, de-stones, and slices in seconds. Stainless steel blade, safe finger guard, soft grip handle. Dishwasher safe. Also works on mangoes and kiwis. A viral kitchen essential.',
    category: 'Kitchen', tags: ['avocado slicer','kitchen tool','stainless steel','gadget','cooking'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807013001002.html',
    source_price_usd: 1.80, source_min_order_qty: 100, source_shipping_estimate_usd: 1.80,
    source_image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 9.99, estimated_monthly_sales: 5800, sales_rank: 13,
    review_count: 24600, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
  {
    name: 'Herb Keeper Fresh Container 2-Pack',
    description: 'Fridge herb keeper containers that keep fresh herbs and asparagus fresh 2–3× longer. BPA-free, airtight lid with water reservoir. Fits cilantro, parsley, mint, and more. Dishwasher safe. Stackable design.',
    category: 'Kitchen', tags: ['herb keeper','food storage','fresh','fridge','vegetable'],
    source_platform: 'aliexpress', source_url: 'https://www.aliexpress.com/item/3256807013002003.html',
    source_price_usd: 3.50, source_min_order_qty: 50, source_shipping_estimate_usd: 2.50,
    source_image_url: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 14.99, estimated_monthly_sales: 2900, sales_rank: 62,
    review_count: 9100, avg_review_score: 4.6, is_trending: true, trend: 'up',
  },
  {
    name: 'Portable UV Phone Sanitiser Box',
    description: 'UV-C light steriliser box kills 99.9% of bacteria and viruses in 3 minutes. Fits phones up to 6.7 inches, keys, jewellery, masks, and earbuds. USB-C powered. Aromatherapy pod included.',
    category: 'Beauty & Health', tags: ['uv sanitiser','phone cleaner','steriliser','hygiene','health'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520011005',
    source_price_usd: 9.80, source_min_order_qty: 20, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 34.99, estimated_monthly_sales: 1900, sales_rank: 119,
    review_count: 5700, avg_review_score: 4.2, is_trending: false, trend: 'flat',
  },
  {
    name: 'Electric Salt & Pepper Grinder Set USB',
    description: 'Rechargeable electric salt and pepper grinder set. One-handed auto grinding, adjustable coarseness (6 levels), clear glass body to check levels. USB-C charging lasts 3 months. Includes a stand.',
    category: 'Kitchen', tags: ['salt grinder','pepper mill','electric','rechargeable','kitchen'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520012001',
    source_price_usd: 7.80, source_min_order_qty: 20, source_shipping_estimate_usd: 4.00,
    source_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 27.99, estimated_monthly_sales: 2400, sales_rank: 83,
    review_count: 7900, avg_review_score: 4.4, is_trending: true, trend: 'up',
  },
  {
    name: 'Portable Blender USB-C Rechargeable 380ml',
    description: 'Personal smoothie blender in 380ml BPA-free bottle. USB-C rechargeable, makes 15 blends per charge. 6 stainless steel blades blends frozen fruit in 30 seconds. Travel lid included. 3 colours.',
    category: 'Kitchen', tags: ['portable blender','smoothie','USB-C','travel','fitness'],
    source_platform: 'temu', source_url: 'https://www.temu.com/goods.html?goods_id=601099520012002',
    source_price_usd: 8.20, source_min_order_qty: 20, source_shipping_estimate_usd: 3.50,
    source_image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    best_sell_platform: 'amazon', avg_sell_price_usd: 29.99, estimated_monthly_sales: 3100, sales_rank: 55,
    review_count: 9200, avg_review_score: 4.3, is_trending: true, trend: 'up',
  },
]

async function seed() {
  await client.connect()
  console.log('✅ Connected to database')

  if (CLEAR) {
    await client.query('DELETE FROM products')
    console.log('🗑️  Cleared all existing products')
  }

  let added = 0, skipped = 0

  for (const p of PRODUCTS) {
    const { trend, ...data } = p
    const trendData = makeTrendData(12, trend)

    const existing = await client.query('SELECT id FROM products WHERE name = $1', [p.name])
    if (existing.rows.length > 0) {
      console.log(`  ⏭  Skip (exists): ${p.name.slice(0, 50)}`)
      skipped++
      continue
    }

    await client.query(`
      INSERT INTO products (
        name, description, category, tags,
        source_platform, source_url, source_price_usd, source_min_order_qty,
        source_shipping_estimate_usd, source_image_url,
        best_sell_platform, amazon_asin, avg_sell_price_usd,
        estimated_monthly_sales, sales_rank, review_count, avg_review_score,
        trend_data, is_trending, scraped_at, last_refreshed
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW(),NOW()
      )
    `, [
      data.name, data.description, data.category, data.tags,
      data.source_platform, data.source_url, data.source_price_usd, data.source_min_order_qty,
      data.source_shipping_estimate_usd, data.source_image_url,
      data.best_sell_platform, data.amazon_asin || null, data.avg_sell_price_usd,
      data.estimated_monthly_sales, data.sales_rank, data.review_count, data.avg_review_score,
      JSON.stringify(trendData), data.is_trending,
    ])
    added++
    console.log(`  ✅ ${data.name.slice(0, 55)}`)
  }

  await client.end()
  console.log(`\n🎉 Done — ${added} added, ${skipped} skipped (${PRODUCTS.length} total in seed)`)
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1) })
