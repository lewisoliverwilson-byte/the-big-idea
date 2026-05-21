import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useReportStore } from '../store/reportStore'
import { useAuthStore } from '../store/authStore'
import { getReport } from '../services/api'
import { ReportLoading } from '../components/report/ReportLoading'
import { ReportCharts } from '../components/report/ReportCharts'
import { MarginCalculator } from '../components/report/MarginCalculator'
import { PlatformTable } from '../components/report/PlatformTable'
import { SourceCards } from '../components/report/SourceCards'
import { LockedSection } from '../components/report/LockedSection'
import { UpgradeBanner } from '../components/ui/UpgradeBanner'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge, ScoreBadge } from '../components/ui/Badge'
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters'
import { Bookmark, Star, Package, Tag, Crown, Lock } from 'lucide-react'

export function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { isGenerating } = useReportStore()
  const { user } = useAuthStore()

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReport(reportId!),
    enabled: !!reportId && !isGenerating,
    staleTime: 1000 * 60 * 60,
  })

  if (isGenerating && reportId) {
    return <ReportLoading reportId={reportId} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg font-medium">Report not found</p>
          <p className="text-slate-500 text-sm mt-1">
            This report may not exist or you don't have access.
          </p>
        </div>
      </div>
    )
  }

  const { product } = report
  const isFreeTier = report.tier === 'free'
  const isPro = user?.subscriptionStatus === 'active'

  // A report generated as 'free' tier shows locked sections even if user has since upgraded
  // — they can re-run it as a Pro report from dashboard
  const showLocked = isFreeTier

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Free tier nudge at top */}
        {showLocked && (
          <div className="bg-slate-900 border border-amber-400/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Free report</span> — AI analysis, trend charts, and 3 more platforms are locked.{' '}
                <span className="text-slate-500">Re-run this as a Pro report for the full picture.</span>
              </p>
            </div>
            <Link
              to="/pricing"
              className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap"
            >
              Unlock Pro
            </Link>
          </div>
        )}

        {/* ── Section 1: Product Hero ── */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product image */}
              <div className="flex-shrink-0">
                <img
                  src={product.sourceImageUrl || 'https://placehold.co/200x200?text=Product'}
                  alt={product.name}
                  className="w-36 h-36 object-cover rounded-xl border border-slate-700"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product'
                  }}
                />
              </div>

              {/* Product info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="blue" size="sm">{product.category}</Badge>
                      {product.isTrending && (
                        <Badge variant="green" size="sm">🔥 Trending</Badge>
                      )}
                      {showLocked ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                          Free report
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                          <Crown className="h-2.5 w-2.5" />
                          Pro report
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                      {product.description.slice(0, 200)}
                      {product.description.length > 200 ? '…' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <ScoreBadge score={report.opportunityScore} label="Opportunity" />
                    <ScoreBadge score={report.riskScore} label="Risk" />
                  </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Buy price', value: formatCurrency(product.sourcePriceUsd), sub: product.sourcePlatform },
                    { label: 'Avg. sell price', value: formatCurrency(product.avgSellPriceUsd), sub: product.bestSellPlatform },
                    { label: 'Est. monthly sales', value: formatNumber(product.estimatedMonthlySales), sub: 'units/month' },
                    { label: 'Avg. rating', value: `${product.avgReviewScore}/5`, sub: `${formatNumber(product.reviewCount)} reviews` },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="bg-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-lg font-bold text-white mt-0.5">{value}</p>
                      <p className="text-xs text-slate-500 capitalize">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Bookmark className="h-3.5 w-3.5" />
                Report saved · {formatDate(report.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: AI Analysis ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="Full AI Analysis"
          subtitle="Pro reports include a 5-paragraph deep-dive: opportunity summary, target market, competitive landscape, recommended strategy, and trend outlook."
        >
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="bg-amber-400/10 rounded-lg p-1.5">
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
                <h2 className="font-semibold text-white">AI Analysis</h2>
                {!showLocked ? (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    GPT-4o · Pro
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    GPT-4o mini · Free
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose prose-sm max-w-none">
                {report.aiAnalysis.split('\n').filter(Boolean).map((paragraph, i) => (
                  <p key={i} className="mb-3 leading-relaxed text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </div>
              {showLocked && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs italic">
                    This is a 1-paragraph summary. Pro reports include 5 full paragraphs with deeper market insights.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </LockedSection>

        {/* ── Section 3: Trend Charts ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="Trend Charts"
          subtitle="See 6 months of search volume and sales trend data — so you know if this product is rising, falling, or seasonal."
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Trend Data</h2>
            <ReportCharts trendData={product.trendData} productName={product.name} />
          </div>
        </LockedSection>

        {/* ── Section 4: Margin Calculator ── (always visible) */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Margin Calculator</h2>
          <MarginCalculator margin={report.marginAnalysis} />
        </div>

        {/* ── Section 5: Platform Comparison ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="All 4 Platform Comparisons"
          subtitle="Free reports show only the single best platform. Pro compares Amazon, eBay, Etsy, and Shopify side-by-side so you can choose the right one for your strategy."
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Platform Comparison</h2>
            <PlatformTable platforms={report.platformComparison} />
          </div>
        </LockedSection>

        {/* ── Section 6: Where to Buy ── (always visible) */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Where to Buy</h2>
          <SourceCards product={product} />
        </div>

        {/* ── Section 7: Where to Sell ── */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="border-slate-700/50">
            <h2 className="font-semibold text-white">
              Where to Sell
              {showLocked && (
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  (best platform shown — Pro shows all 4)
                </span>
              )}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.platformComparison.map((p) => (
                <div
                  key={p.platform}
                  className={`rounded-xl border p-4 ${
                    p.recommended
                      ? 'border-amber-400/40 bg-amber-400/5'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize text-white">{p.platform}</span>
                    {p.recommended && (
                      <Badge variant="blue" size="sm">Best pick</Badge>
                    )}
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(p.estimatedSellPrice)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {p.netMargin.toFixed(1)}% margin · {p.feePercent}% fee
                  </p>
                  <a
                    href={`https://www.${p.platform}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center text-xs text-amber-400 font-medium hover:underline"
                  >
                    Start selling →
                  </a>
                </div>
              ))}

              {/* Locked platform cards (for free tier visual effect) */}
              {showLocked && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`locked-${i}`}
                      className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 flex flex-col items-center justify-center opacity-40"
                    >
                      <Lock className="h-5 w-5 text-slate-500 mb-2" />
                      <p className="text-xs text-slate-500">Pro only</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Bottom upgrade banner for free reports */}
        {showLocked && (
          <UpgradeBanner
            variant="full"
            title="You're seeing the free version of this report"
            description="Upgrade to Pro and re-run this search to get the full 5-paragraph analysis, all 4 platform comparisons, 6-month trend charts, and 20 fresh ideas every week."
            ctaLabel="Upgrade to Pro — £10/mo"
          />
        )}

        {/* ── Section 8: Product Details ── */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="border-slate-700/50">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" />
              <h2 className="font-semibold text-white">Product Details</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Full Description</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Specifications</h3>
                {[
                  { label: 'Source Platform', value: product.sourcePlatform.toUpperCase() },
                  { label: 'Category', value: product.category },
                  { label: 'Min. Order Qty', value: `${product.sourceMinOrderQty} units` },
                  ...(product.amazonAsin ? [{ label: 'Amazon ASIN', value: product.amazonAsin }] : []),
                  ...(product.ebayItemId ? [{ label: 'eBay Item ID', value: product.ebayItemId }] : []),
                  { label: 'Last Updated', value: formatDate(product.lastRefreshed) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm border-b border-slate-800 pb-2 last:border-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {product.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-slate-500" />
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="gray" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
