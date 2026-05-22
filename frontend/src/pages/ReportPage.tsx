import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useReportStore } from '../store/reportStore'
import { getReport } from '../services/api'
import { ReportLoading } from '../components/report/ReportLoading'
import { ReportCharts } from '../components/report/ReportCharts'
import { MarginCalculator } from '../components/report/MarginCalculator'
import { PlatformTable } from '../components/report/PlatformTable'
import { SourceCards } from '../components/report/SourceCards'
import { LockedSection } from '../components/report/LockedSection'
import { UpgradeBanner } from '../components/ui/UpgradeBanner'
import { Badge, ScoreBadge } from '../components/ui/Badge'
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters'
import type { Report } from '../types'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#F8FAFC',
  white:   '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  primary: '#4F46E5',
}

const CARD = {
  background:   C.white,
  border:       `1px solid ${C.border}`,
  borderRadius: 12,
  overflow:     'hidden' as const,
  boxShadow:    '0 1px 3px 0 rgba(0,0,0,0.07)',
}

// ─── CSV download ─────────────────────────────────────────────────────────────
function downloadReportCsv(report: Report) {
  const { product: p, marginAnalysis: m } = report

  const escape = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
  }

  const rows: string[][] = [
    ['THE BIG IDEA REPORT', '', ''],
    ['Generated', formatDate(report.createdAt), ''],
    ['Tier', report.tier === 'pro' ? 'Pro' : 'Free', ''],
    ['', '', ''],
    ['PRODUCT', '', ''],
    ['Name',              p.name,                                ''],
    ['Category',          p.category,                            ''],
    ['Description',       p.description,                         ''],
    ['Tags',              p.tags.join(', '),                     ''],
    ['Trending',          p.isTrending ? 'Yes' : 'No',           ''],
    ['', '', ''],
    ['SCORES', '', ''],
    ['Opportunity Score', String(report.opportunityScore),        '/ 10'],
    ['Risk Score',        String(report.riskScore),               '/ 10'],
    ['', '', ''],
    ['SOURCING', '', ''],
    ['Platform',          p.sourcePlatform,                       ''],
    ['Source URL',        p.sourceUrl,                            ''],
    ['Buy Price (USD)',   p.sourcePriceUsd.toFixed(2),            ''],
    ['Min. Order Qty',    String(p.sourceMinOrderQty),            'units'],
    ['Est. Shipping (USD)', p.sourceShippingEstimateUsd.toFixed(2), ''],
    ['', '', ''],
    ['MARKET', '', ''],
    ['Best Sell Platform', p.bestSellPlatform,                    ''],
    ['Avg. Sell Price (USD)', p.avgSellPriceUsd.toFixed(2),       ''],
    ['Est. Monthly Sales',   String(p.estimatedMonthlySales),     'units'],
    ['Avg. Review Score',    p.avgReviewScore.toFixed(1),         '/ 5'],
    ['Review Count',         String(p.reviewCount),               ''],
    ...(p.amazonAsin  ? [['Amazon ASIN',  p.amazonAsin,  '']] as string[][] : []),
    ...(p.ebayItemId  ? [['eBay Item ID', p.ebayItemId,  '']] as string[][] : []),
    ['', '', ''],
    ['MARGIN ANALYSIS', '', ''],
    ['Source Price (USD)',      m.sourcePriceUsd.toFixed(2),             ''],
    ['Shipping to UK (USD)',    m.shippingToUkUsd.toFixed(2),            ''],
    ['Platform Fee',            `${m.platformFeePercent}%`,              ''],
    ['Est. Sell Price (USD)',   m.estimatedSellPriceUsd.toFixed(2),      ''],
    ['Profit per Unit (USD)',   m.profitPerUnit.toFixed(2),              ''],
    ['Margin %',                `${m.marginPercent.toFixed(1)}%`,        ''],
    ['Min. Viable Sell Price',  m.minimumViableSellPrice.toFixed(2),     'USD'],
    ['Profit @ 50 units (USD)', m.profitAt50Units.toFixed(2),            ''],
    ['Profit @ 100 units (USD)', m.profitAt100Units.toFixed(2),          ''],
    ['Profit @ 200 units (USD)', m.profitAt200Units.toFixed(2),          ''],
    ['', '', ''],
    ['PLATFORM COMPARISON', '', ''],
    ['Platform', 'Est. Sell Price (USD)', 'Fee %', 'Net Margin %', 'Monthly Sales', 'Difficulty', 'Recommended'],
    ...report.platformComparison.map(pl => [
      pl.platform,
      pl.estimatedSellPrice.toFixed(2),
      String(pl.feePercent),
      pl.netMargin.toFixed(1),
      String(pl.estimatedMonthlySales),
      pl.difficulty,
      pl.recommended ? 'Yes' : 'No',
    ]),
    ['', '', ''],
    ['AI ANALYSIS', '', ''],
    [report.aiAnalysis, '', ''],
  ]

  const csv      = rows.map(row => row.map(escape).join(',')).join('\n')
  const slug     = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const filename = `report-${slug}-${report.id.slice(0, 8)}.csv`
  const blob     = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  a.href         = url
  a.download     = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon, children, headerRight }: {
  title:        string
  icon?:        string
  children:     React.ReactNode
  headerRight?: React.ReactNode
}) {
  return (
    <div style={{ ...CARD, marginBottom: 16 }}>
      <div style={{
        padding:        '14px 20px',
        borderBottom:   `1px solid ${C.border}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        background:     '#FAFAFA',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
          <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {title}
          </h2>
        </div>
        {headerRight}
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ReportPage() {
  const { reportId }  = useParams<{ reportId: string }>()
  const { isGenerating } = useReportStore()

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', reportId],
    queryFn:  () => getReport(reportId!),
    enabled:  !!reportId && !isGenerating,
    staleTime: 1000 * 60 * 60,
  })

  if (isGenerating && reportId) {
    return <ReportLoading reportId={reportId} />
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${C.border}` }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: C.primary, animation: 'spin 0.9s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (isError || !report || !('product' in report) || !report.product) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ ...CARD, padding: '48px 40px', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>📄</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Report not found
          </p>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
            This report may not exist or is still being generated.
          </p>
          <Link
            to="/dashboard"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     C.primary,
              borderRadius:   8,
              padding:        '10px 22px',
              color:          '#fff',
              fontSize:       13,
              fontWeight:     600,
              textDecoration: 'none',
              fontFamily:     'Inter, system-ui, sans-serif',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const { product } = report
  const showLocked = report.tier === 'free'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Top nav bar ── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   20,
          gap:            12,
          flexWrap:       'wrap',
        }}>
          <Link
            to="/dashboard"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              background:     C.white,
              border:         `1px solid ${C.border}`,
              borderRadius:   8,
              padding:        '8px 16px',
              color:          C.textSec,
              fontSize:       13,
              fontWeight:     500,
              textDecoration: 'none',
              transition:     'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#CBD5E1' }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textSec; e.currentTarget.style.borderColor = C.border }}
          >
            ← Dashboard
          </Link>

          <button
            onClick={() => downloadReportCsv(report)}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          6,
              background:   C.white,
              border:       `1px solid ${C.border}`,
              borderRadius: 8,
              padding:      '8px 16px',
              color:        C.textSec,
              fontSize:     13,
              fontWeight:   500,
              cursor:       'pointer',
              transition:   'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec }}
          >
            ⬇ Download CSV
          </button>
        </div>

        {/* Free tier notice */}
        {showLocked && (
          <div style={{
            ...CARD,
            padding:        '12px 18px',
            marginBottom:   16,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            16,
            background:     '#FFFBEB',
            borderColor:    '#FDE68A',
          }}>
            <p style={{ fontSize: 13, color: '#92400E' }}>
              <span style={{ fontWeight: 600 }}>Free report</span>
              {' '}— AI analysis, trend charts, and additional platforms are locked.{' '}
              Upgrade to Pro for the full report.
            </p>
            <Link
              to="/pricing"
              style={{
                flexShrink:     0,
                background:     C.primary,
                borderRadius:   7,
                padding:        '7px 16px',
                color:          '#fff',
                fontSize:       12,
                fontWeight:     600,
                textDecoration: 'none',
                whiteSpace:     'nowrap',
              }}
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* ── Section 1: Product Hero ── */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

              {/* Product image */}
              <img
                src={product.sourceImageUrl || 'https://placehold.co/160x160/EEF2FF/4F46E5?text=Product'}
                alt={product.name}
                style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x160/EEF2FF/4F46E5?text=Product' }}
              />

              {/* Product info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      <Badge variant="blue" size="sm">{product.category}</Badge>
                      {product.isTrending && <Badge variant="green" size="sm">🔥 Trending</Badge>}
                      {showLocked
                        ? <Badge variant="gray" size="sm">Free report</Badge>
                        : <Badge variant="blue" size="sm">Pro report</Badge>
                      }
                    </div>
                    <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
                      {product.name}
                    </h1>
                    <p style={{ fontSize: 13, color: C.textSec, maxWidth: 600, lineHeight: 1.65 }}>
                      {product.description.slice(0, 200)}{product.description.length > 200 ? '…' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexShrink: 0, alignItems: 'flex-start' }}>
                    <ScoreBadge
                      score={report.opportunityScore}
                      label="Opportunity"
                      sources={report.opportunitySources || []}
                    />
                    <ScoreBadge
                      score={report.riskScore}
                      label="Risk"
                      sources={report.riskSources || []}
                    />
                  </div>
                </div>

                {/* Key stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
                  {[
                    { label: 'Buy price',          value: formatCurrency(product.sourcePriceUsd),       sub: product.sourcePlatform },
                    { label: 'Avg. sell price',    value: formatCurrency(product.avgSellPriceUsd),      sub: product.bestSellPlatform },
                    { label: 'Est. monthly sales', value: formatNumber(product.estimatedMonthlySales),  sub: 'units/month' },
                    { label: 'Avg. rating',        value: `${product.avgReviewScore}/5`,                sub: `${formatNumber(product.reviewCount)} reviews` },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{ background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{value}</p>
                      <p style={{ fontSize: 11, color: C.textSec, textTransform: 'capitalize', marginTop: 2 }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.textMut }}>
                Report saved · {formatDate(report.createdAt)}
              </span>
              <button
                onClick={() => downloadReportCsv(report)}
                style={{
                  display:    'inline-flex',
                  alignItems: 'center',
                  gap:        5,
                  background: 'none',
                  border:     `1px solid ${C.border}`,
                  borderRadius: 7,
                  padding:    '5px 12px',
                  color:      C.textSec,
                  fontSize:   11,
                  fontWeight: 500,
                  cursor:     'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#CBD5E1' }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textSec; e.currentTarget.style.borderColor = C.border }}
              >
                ⬇ Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* ── Section 2: AI Analysis ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="Full AI Analysis"
          subtitle="Pro reports include a 5-paragraph deep-dive: opportunity summary, target market, competitive landscape, recommended strategy, and trend outlook."
        >
          <Section
            title="AI Analysis"
            icon="✨"
            headerRight={
              <span style={{
                fontSize:     11,
                color:        showLocked ? C.textMut : C.primary,
                background:   showLocked ? '#F1F5F9' : '#EEF2FF',
                border:       `1px solid ${showLocked ? C.border : '#C7D2FE'}`,
                borderRadius: 99,
                padding:      '3px 10px',
                fontWeight:   600,
              }}>
                {showLocked ? 'GPT-4o mini · Free' : 'GPT-4o · Pro'}
              </span>
            }
          >
            <div>
              {report.aiAnalysis.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i} style={{ fontSize: 14, color: C.textSec, lineHeight: 1.75, marginBottom: 12 }}>
                  {paragraph}
                </p>
              ))}
              {showLocked && (
                <p style={{ fontSize: 12, color: C.textMut, fontStyle: 'italic', marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  This is a 1-paragraph summary. Pro reports include 5 full paragraphs.
                </p>
              )}
            </div>
          </Section>
        </LockedSection>

        {/* ── Section 3: Trend Charts ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="Trend Charts"
          subtitle="See 6 months of search volume and sales trend data — so you know if this product is rising, falling, or seasonal."
        >
          <Section title="Trend Data" icon="📈">
            <ReportCharts trendData={product.trendData} productName={product.name} />
          </Section>
        </LockedSection>

        {/* ── Section 4: Margin Calculator ── (always visible) */}
        <Section title="Margin Calculator" icon="⚖️">
          <MarginCalculator margin={report.marginAnalysis} />
        </Section>

        {/* ── Section 5: Platform Comparison ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="All 4 Platform Comparisons"
          subtitle="Free reports show only the best platform. Pro compares Amazon, eBay, Etsy, and Shopify side-by-side."
        >
          <Section title="Platform Comparison" icon="🏪">
            <PlatformTable platforms={report.platformComparison} />
          </Section>
        </LockedSection>

        {/* ── Section 6: Where to Source ── (always visible) */}
        <Section title="Where to Source" icon="📦">
          <SourceCards product={product} />
        </Section>

        {/* ── Section 7: Where to Sell ── */}
        <Section
          title="Where to Sell"
          icon="💰"
          headerRight={showLocked ? (
            <span style={{ fontSize: 12, color: C.textMut }}>(best platform shown — Pro shows all 4)</span>
          ) : undefined}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {report.platformComparison.map((p) => (
              <div
                key={p.platform}
                style={{
                  borderRadius: 10,
                  border:       p.recommended ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                  background:   p.recommended ? '#EEF2FF' : C.white,
                  padding:      '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: 'capitalize' }}>
                    {p.platform}
                  </span>
                  {p.recommended && <Badge variant="blue" size="sm">Best pick</Badge>}
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                  {formatCurrency(p.estimatedSellPrice)}
                </p>
                <p style={{ fontSize: 12, color: C.textSec }}>
                  {p.netMargin.toFixed(1)}% margin · {p.feePercent}% fee
                </p>
                <a
                  href={`https://www.${p.platform}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', marginTop: 10, fontSize: 12, color: C.primary, fontWeight: 600, textDecoration: 'none' }}
                >
                  Start selling →
                </a>
              </div>
            ))}

            {/* Locked platform placeholders (free tier) */}
            {showLocked && [1, 2, 3].map((i) => (
              <div key={`locked-${i}`} style={{
                borderRadius: 10,
                border:       `1px dashed ${C.border}`,
                background:   '#F8FAFC',
                padding:      '14px',
                display:      'flex',
                flexDirection: 'column',
                alignItems:   'center',
                justifyContent: 'center',
                opacity:      0.5,
                minHeight:    100,
              }}>
                <span style={{ fontSize: 18, marginBottom: 4 }}>🔒</span>
                <p style={{ fontSize: 11, color: C.textMut }}>Pro only</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Bottom upgrade CTA for free tier */}
        {showLocked && (
          <div style={{ marginBottom: 16 }}>
            <UpgradeBanner
              variant="full"
              title="You're on the free plan"
              description="Upgrade to Pro and get the full 5-paragraph AI analysis, all 4 platform comparisons, 6-month trend charts, and 20 reports every week."
              ctaLabel="Upgrade to Pro — £10/month"
            />
          </div>
        )}

        {/* ── Section 8: Product Details ── */}
        <Section title="Product Details" icon="📋">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Full Description
              </h3>
              <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{product.description}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Specifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Source Platform', value: product.sourcePlatform.toUpperCase() },
                  { label: 'Category',        value: product.category },
                  { label: 'Min. Order Qty',  value: `${product.sourceMinOrderQty} units` },
                  ...(product.amazonAsin  ? [{ label: 'Amazon ASIN',  value: product.amazonAsin  }] : []),
                  ...(product.ebayItemId  ? [{ label: 'eBay Item ID', value: product.ebayItemId  }] : []),
                  { label: 'Last Updated',    value: formatDate(product.lastRefreshed) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textSec }}>{label}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {product.tags.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {product.tags.map((tag) => (
                <Badge key={tag} variant="gray" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </Section>

        {/* ── Bottom nav ── */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 16 }}>
          <Link
            to="/dashboard"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     C.white,
              border:         `1px solid ${C.border}`,
              borderRadius:   8,
              padding:        '10px 24px',
              color:          C.textSec,
              fontSize:       13,
              fontWeight:     500,
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
