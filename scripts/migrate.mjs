/**
 * Database migration script — creates all tables for The Big Idea.
 * Run with: DATABASE_URL=... node scripts/migrate.mjs
 *
 * Safe to re-run — uses CREATE TABLE IF NOT EXISTS and ADD COLUMN IF NOT EXISTS.
 */
import pg from './node_modules/pg/lib/index.js'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

const SQL = `
-- Enums
DO $$ BEGIN
  CREATE TYPE subscription_status_enum AS ENUM ('free', 'active', 'cancelled', 'past_due');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_platform_enum AS ENUM ('temu', 'aliexpress', 'alibaba');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sell_platform_enum AS ENUM ('amazon', 'ebay', 'etsy', 'shopify');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status_enum AS ENUM ('processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_status subscription_status_enum DEFAULT 'free' NOT NULL,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  reports_used_free INT DEFAULT 0,
  plan_started_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_cognito_id ON users(cognito_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_sub ON users(stripe_subscription_id);

-- Add pro quota columns if they don't exist yet
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN pro_reports_used_this_week INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN pro_week_reset_at TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  tags TEXT[],

  source_platform source_platform_enum NOT NULL,
  source_url VARCHAR,
  source_price_usd DECIMAL(10,2),
  source_min_order_qty INT DEFAULT 1,
  source_shipping_estimate_usd DECIMAL(10,2),
  source_image_url VARCHAR,

  best_sell_platform sell_platform_enum,
  amazon_asin VARCHAR,
  ebay_item_id VARCHAR,
  etsy_listing_id VARCHAR,
  avg_sell_price_usd DECIMAL(10,2),
  estimated_monthly_sales INT,
  sales_rank INT,
  review_count INT,
  avg_review_score DECIMAL(3,2),

  trend_data JSONB DEFAULT '[]',

  scraped_at TIMESTAMP DEFAULT NOW(),
  last_refreshed TIMESTAMP DEFAULT NOW(),
  is_trending BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending);
CREATE INDEX IF NOT EXISTS idx_products_source_platform ON products(source_platform);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),

  search_budget_usd DECIMAL(10,2),
  search_unit_size VARCHAR,
  search_category VARCHAR,
  search_additional_params JSONB DEFAULT '{}',

  status report_status_enum DEFAULT 'processing',

  margin_analysis JSONB,
  platform_comparison JSONB,
  ai_analysis TEXT,
  risk_score INT,
  opportunity_score INT,

  created_at TIMESTAMP DEFAULT NOW(),
  report_snapshot JSONB
);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Add tier column to reports if it doesn't exist yet
DO $$ BEGIN
  ALTER TABLE reports ADD COLUMN tier VARCHAR DEFAULT 'free' NOT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

SELECT 'Migration complete ✅' AS result;
`

async function migrate() {
  await client.connect()
  console.log('Connected to database')
  const result = await client.query(SQL)
  console.log(result[result.length - 1].rows[0].result)
  await client.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
