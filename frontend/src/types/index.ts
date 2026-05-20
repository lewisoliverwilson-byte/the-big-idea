// ─── User ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'past_due'

export interface User {
  id: string
  email: string
  fullName?: string
  subscriptionStatus: SubscriptionStatus
  reportsUsedFree: number
  stripeCustomerId?: string
  createdAt: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type SourcePlatform = 'temu' | 'aliexpress' | 'alibaba'
export type SellPlatform = 'amazon' | 'ebay' | 'etsy' | 'shopify'

export interface TrendDataPoint {
  date: string
  searchVolume: number
  salesIndex: number
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  sourcePlatform: SourcePlatform
  sourceUrl: string
  sourcePriceUsd: number
  sourceMinOrderQty: number
  sourceShippingEstimateUsd: number
  sourceImageUrl: string
  bestSellPlatform: SellPlatform
  amazonAsin?: string
  ebayItemId?: string
  etsyListingId?: string
  avgSellPriceUsd: number
  estimatedMonthlySales: number
  salesRank: number
  reviewCount: number
  avgReviewScore: number
  trendData: TrendDataPoint[]
  isTrending: boolean
  scrapedAt: string
  lastRefreshed: string
}

// ─── Report ───────────────────────────────────────────────────────────────────

export interface MarginAnalysis {
  sourcePriceUsd: number
  shippingToUkUsd: number
  platformFeePercent: number
  estimatedSellPriceUsd: number
  profitPerUnit: number
  profitAt50Units: number
  profitAt100Units: number
  profitAt200Units: number
  minimumViableSellPrice: number
  marginPercent: number
}

export interface PlatformComparison {
  platform: SellPlatform
  estimatedSellPrice: number
  feePercent: number
  netMargin: number
  estimatedMonthlySales: number
  difficulty: 'Low' | 'Medium' | 'High'
  recommended: boolean
}

export interface Report {
  id: string
  userId: string
  product: Product
  searchBudgetUsd: number
  searchUnitSize: string
  searchCategory?: string
  marginAnalysis: MarginAnalysis
  platformComparison: PlatformComparison[]
  aiAnalysis: string
  riskScore: number
  opportunityScore: number
  createdAt: string
}

export type ReportStatus = 'processing' | 'ready' | 'failed'

export interface ReportStatusResponse {
  reportId: string
  status: ReportStatus
}

export interface ReportListItem {
  id: string
  productName: string
  category: string
  opportunityScore: number
  riskScore: number
  createdAt: string
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  budgetUsd: number
  currency: 'GBP' | 'USD'
  unitSize: 'small' | 'medium' | 'large' | 'xlarge'
  category?: string
  targetPlatforms?: SellPlatform[]
  minMarginPercent?: number
  trendingOnly?: boolean
  keywordsToAvoid?: string
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  url: string
}

export interface PortalSessionResponse {
  url: string
}
