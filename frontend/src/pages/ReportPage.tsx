import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useReportStore } from '../store/reportStore'
import { getReport } from '../services/api'
import { ReportLoading } from '../components/report/ReportLoading'
import { ReportCharts } from '../components/report/ReportCharts'
import { MarginCalculator } from '../components/report/MarginCalculator'
import { PlatformTable } from '../components/report/PlatformTable'
import { SourceCards } from '../components/report/SourceCards'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge, ScoreBadge } from '../components/ui/Badge'
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters'
import { Bookmark, Star, Package, Tag } from 'lucide-react'

export function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { isGenerating } = useReportStore()

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReport(reportId!),
    enabled: !!reportId && !isGenerating,
    staleTime: 1000 * 60 * 60, // reports are immutable once generated
  })

  if (isGenerating && reportId) {
    return <ReportLoading reportId={reportId} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium">Report not found</p>
          <p className="text-gray-400 text-sm mt-1">
            This report may not exist or you don't have access.
          </p>
        </div>
      </div>
    )
  }

  const { product } = report

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Section 1: Product Hero ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Product image */}
            <div className="flex-shrink-0">
              <img
                src={product.sourceImageUrl || 'https://placehold.co/200x200?text=Product'}
                alt={product.name}
                className="w-40 h-40 object-cover rounded-xl border border-gray-200"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://placehold.co/200x200?text=Product'
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
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="gray" size="sm">{tag}</Badge>
                    ))}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-gray-500 text-sm mt-1 max-w-2xl">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Buy price', value: formatCurrency(product.sourcePriceUsd), sub: product.sourcePlatform },
                  { label: 'Avg. sell price', value: formatCurrency(product.avgSellPriceUsd), sub: product.bestSellPlatform },
                  { label: 'Est. monthly sales', value: formatNumber(product.estimatedMonthlySales), sub: 'units/month' },
                  { label: 'Avg. rating', value: `${product.avgReviewScore}/5`, sub: `${formatNumber(product.reviewCount)} reviews` },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                    <p className="text-xs text-gray-400 capitalize">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Bookmark className="h-3.5 w-3.5" />
              Report saved · {formatDate(report.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: AI Analysis ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 rounded-lg p-1.5">
              <Star className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="font-semibold text-gray-900">AI Analysis</h2>
            <Badge variant="blue" size="sm">GPT-4o</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="prose prose-sm max-w-none text-gray-700">
            {report.aiAnalysis.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── Section 3: Trend Charts ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trend Data</h2>
        <ReportCharts trendData={product.trendData} productName={product.name} />
      </div>

      {/* ── Section 4: Margin Calculator ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Margin Calculator</h2>
        <MarginCalculator margin={report.marginAnalysis} />
      </div>

      {/* ── Section 5: Platform Comparison ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Comparison</h2>
        <PlatformTable platforms={report.platformComparison} />
      </div>

      {/* ── Section 6: Where to Buy ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Where to Buy</h2>
        <SourceCards product={product} />
      </div>

      {/* ── Section 7: Where to Sell ── */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Where to Sell</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.platformComparison.map((p) => (
              <div
                key={p.platform}
                className={`rounded-xl border p-4 ${
                  p.recommended
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize text-gray-900">
                    {p.platform}
                  </span>
                  {p.recommended && (
                    <Badge variant="blue" size="sm">Best pick</Badge>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(p.estimatedSellPrice)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {p.netMargin.toFixed(1)}% margin · {p.feePercent}% fee
                </p>
                <a
                  href={`https://www.${p.platform}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-xs text-indigo-600 font-medium hover:underline"
                >
                  Start selling →
                </a>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── Section 8: Product Details ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Product Details</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h3>
              {[
                { label: 'Source Platform', value: product.sourcePlatform.toUpperCase() },
                { label: 'Category', value: product.category },
                { label: 'Min. Order Qty', value: `${product.sourceMinOrderQty} units` },
                ...(product.amazonAsin ? [{ label: 'Amazon ASIN', value: product.amazonAsin }] : []),
                ...(product.ebayItemId ? [{ label: 'eBay Item ID', value: product.ebayItemId }] : []),
                { label: 'Last Updated', value: formatDate(product.lastRefreshed) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {product.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="gray" size="sm">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
