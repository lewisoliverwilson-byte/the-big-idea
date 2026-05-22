from datetime import datetime
from typing import Optional, List, Any, Literal
from pydantic import BaseModel
from uuid import UUID


class ScoreSource(BaseModel):
    label: str
    value: str


class SearchRequest(BaseModel):
    budgetUsd: float
    currency: str = "GBP"
    unitSize: str = "medium"
    category: Optional[str] = None
    targetPlatforms: Optional[List[str]] = None
    minMarginPercent: Optional[float] = None
    trendingOnly: Optional[bool] = False
    keywordsToAvoid: Optional[str] = None


class ReportStatusResponse(BaseModel):
    reportId: str
    status: str


class TrendDataPoint(BaseModel):
    date: str
    searchVolume: int
    salesIndex: int


class ProductOut(BaseModel):
    id: UUID
    name: str
    description: str
    category: str
    tags: List[str]
    sourcePlatform: str
    sourceUrl: str
    sourcePriceUsd: float
    sourceMinOrderQty: int
    sourceShippingEstimateUsd: float
    sourceImageUrl: str
    bestSellPlatform: str
    amazonAsin: Optional[str] = None
    ebayItemId: Optional[str] = None
    etsyListingId: Optional[str] = None
    avgSellPriceUsd: float
    estimatedMonthlySales: int
    salesRank: int
    reviewCount: int
    avgReviewScore: float
    trendData: List[Any]
    isTrending: bool
    scrapedAt: datetime
    lastRefreshed: datetime


class MarginAnalysis(BaseModel):
    sourcePriceUsd: float
    shippingToUkUsd: float
    platformFeePercent: float
    estimatedSellPriceUsd: float
    profitPerUnit: float
    profitAt50Units: float
    profitAt100Units: float
    profitAt200Units: float
    minimumViableSellPrice: float
    marginPercent: float


class PlatformComparison(BaseModel):
    platform: str
    estimatedSellPrice: float
    feePercent: float
    netMargin: float
    estimatedMonthlySales: int
    difficulty: str
    recommended: bool


class ReportOut(BaseModel):
    id: UUID
    userId: UUID
    product: ProductOut
    searchBudgetUsd: float
    searchUnitSize: str
    searchCategory: Optional[str] = None
    marginAnalysis: MarginAnalysis
    platformComparison: List[PlatformComparison]
    aiAnalysis: str
    riskScore: int
    opportunityScore: int
    opportunitySources: List[ScoreSource] = []
    riskSources: List[ScoreSource] = []
    createdAt: datetime
    tier: Literal["free", "pro"] = "free"


class ReportListItem(BaseModel):
    id: UUID
    productName: str
    category: str
    opportunityScore: int
    riskScore: int
    createdAt: datetime
    tier: Literal["free", "pro"] = "free"


class CompareRequest(BaseModel):
    report_ids: List[str]


class CompareItem(BaseModel):
    id: str
    name: str
    category: str
    opportunity_score: int
    opportunity_sources: List[ScoreSource]
    risk_score: int
    risk_sources: List[ScoreSource]
    summary: str
    tier: str


class CompareResponse(BaseModel):
    products: List[CompareItem]
    winner_id: str
    winner_reason: str
