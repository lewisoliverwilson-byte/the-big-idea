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
  bg:      '#070511',
  border:  'rgba(139,92,246,0.15)',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
}

const GLASS = {
  background:           'rgba(14,10,28,0.80)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${C.border}`,
  borderRadius:         20,
  overflow:             'hidden' as const,
}

const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

// ─── Deterministic starfield ──────────────────────────────────────────────────
const STARS = Array.from({ length: 30 }, (_, i) => {
  const g = 137.508
  return {
    left:  `${((i * g)        % 100).toFixed(1)}%`,
    top:   `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:  [1, 1, 1.5][i % 3],
    delay: `${((i * 0.37) % 4.5).toFixed(2)}s`,
    dur:   `${(2.8 + (i % 6) * 0.45).toFixed(1)}s`,
  }
})

// ─── CSV download ─────────────────────────────────────────────────────────────
function downloadReportCsv(report: Report) {
  const { product: p, marginAnalysis: m } = report

  const escape = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
  }

  const rows: string[][] = [
    // ── Overview
    ['SOURCERY REPORT', '', ''],
    ['Generated', formatDate(report.createdAt), ''],
    ['Tier', report.tier === 'pro' ? 'Sorcerer (Pro)' : 'Free', ''],
    ['', '', ''],

    // ── Product
    ['PRODUCT', '', ''],
    ['Name',              p.name,                                ''],
    ['Category',          p.category,                            ''],
    ['Description',       p.description,                         ''],
    ['Tags',              p.tags.join(', '),                     ''],
    ['Trending',          p.isTrending ? 'Yes' : 'No',           ''],
    ['', '', ''],

    // ── Scores
    ['SCORES', '', ''],
    ['Opportunity Score', String(report.opportunityScore),        '/ 100'],
    ['Risk Score',        String(report.riskScore),               '/ 100'],
    ['', '', ''],

    // ── Sourcing
    ['SOURCING', '', ''],
    ['Platform',          p.sourcePlatform,                       ''],
    ['Source URL',        p.sourceUrl,                            ''],
    ['Buy Price (USD)',   p.sourcePriceUsd.toFixed(2),            ''],
    ['Min. Order Qty',    String(p.sourceMinOrderQty),            'units'],
    ['Est. Shipping (USD)', p.sourceShippingEstimateUsd.toFixed(2), ''],
    ['', '', ''],

    // ── Market
    ['MARKET', '', ''],
    ['Best Sell Platform', p.bestSellPlatform,                    ''],
    ['Avg. Sell Price (USD)', p.avgSellPriceUsd.toFixed(2),       ''],
    ['Est. Monthly Sales',   String(p.estimatedMonthlySales),     'units'],
    ['Avg. Review Score',    p.avgReviewScore.toFixed(1),         '/ 5'],
    ['Review Count',         String(p.reviewCount),               ''],
    ...(p.amazonAsin  ? [['Amazon ASIN',  p.amazonAsin,  '']] as string[][] : []),
    ...(p.ebayItemId  ? [['eBay Item ID', p.ebayItemId,  '']] as string[][] : []),
    ['', '', ''],

    // ── Margins
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

    // ── Platform comparison
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

    // ── AI analysis
    ['AI ANALYSIS', '', ''],
    [report.aiAnalysis, '', ''],
  ]

  const csv = rows
    .map(row => row.map(escape).join(','))
    .join('\n')

  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const filename = `sourcery-${slug}-${report.id.slice(0, 8)}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
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
    <div style={{ ...GLASS, marginBottom: 20 }}>
      <div style={{
        padding:       '16px 24px',
        borderBottom:  `1px solid ${C.border}`,
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{title}</h2>
        </div>
        {headerRight}
      </div>
      <div style={{ padding: '20px 24px' }}>
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

  // ── Loading states ──────────────────────────────────────────────────────────
  if (isGenerating && reportId) {
    return <ReportLoading reportId={reportId} />
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.15)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#8B5CF6', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (isError || !report || !('product' in report) || !report.product) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', ...GLASS, padding: '48px 40px', maxWidth: 400 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔮</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>Report not found</p>
          <p style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>
            This oracle may not exist or is still being summoned.
          </p>
          <Link
            to="/dashboard"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     GBTN,
              border:         '1px solid rgba(139,92,246,0.4)',
              borderRadius:   99,
              padding:        '10px 24px',
              color:          '#fff',
              fontSize:       13,
              fontWeight:     700,
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { product } = report
  const showLocked = report.tier === 'free'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative', overflow: 'hidden' }}>

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="animate-twinkle" style={{
            position:          'absolute',
            left:              s.left,
            top:               s.top,
            width:             s.size,
            height:            s.size,
            borderRadius:      '50%',
            background:        i % 3 === 0 ? C.purpleB : i % 3 === 1 ? '#22D3EE' : '#fff',
            animationDelay:    s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px', position: 'relative', zIndex: 1 }}>

        {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
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
              background:     'rgba(14,10,28,0.80)',
              backdropFilter: 'blur(20px)',
              border:         `1px solid ${C.border}`,
              borderRadius:   99,
              padding:        '8px 16px',
              color:          C.textDim,
              fontSize:       13,
              fontWeight:     600,
              textDecoration: 'none',
              transition:     'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.color = C.text
              el.style.borderColor = 'rgba(139,92,246,0.4)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.color = C.textDim
              el.style.borderColor = C.border
            }}
          >
            ← Dashboard
          </Link>

          <button
            onClick={() => downloadReportCsv(report)}
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        6,
              background: 'rgba(139,92,246,0.1)',
              border:     '1px solid rgba(139,92,246,0.3)',
              borderRadius: 99,
              padding:    '8px 18px',
              color:      C.purpleB,
              fontSize:   13,
              fontWeight: 600,
              cursor:     'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(139,92,246,0.18)'
              el.style.borderColor = 'rgba(139,92,246,0.55)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(139,92,246,0.1)'
              el.style.borderColor = 'rgba(139,92,246,0.3)'
            }}
          >
            ⬇ Download CSV
          </button>
        </div>

        {/* Free tier notice */}
        {showLocked && (
          <div style={{
            ...GLASS,
            padding:      '14px 20px',
            marginBottom: 20,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            gap:          16,
            borderColor:  'rgba(139,92,246,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>🔮</span>
              <p style={{ fontSize: 13, color: C.textDim }}>
                <span style={{ fontWeight: 700, color: C.text }}>Free report</span>
                {' '}— AI analysis, trend charts, and 3 more platforms are sealed.{' '}
                Re-run this as a Sorcerer report for the full oracle.
              </p>
            </div>
            <Link
              to="/pricing"
              style={{
                flexShrink:     0,
                background:     GBTN,
                border:         '1px solid rgba(139,92,246,0.4)',
                borderRadius:   99,
                padding:        '8px 18px',
                color:          '#fff',
                fontSize:       12,
                fontWeight:     700,
                textDecoration: 'none',
                whiteSpace:     'nowrap',
              }}
            >
              ✦ Unlock Pro
            </Link>
          </div>
        )}

        {/* ── Section 1: Product Hero ── */}
        <div style={{ ...GLASS, marginBottom: 20 }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

              {/* Product image */}
              <img
                src={product.sourceImageUrl || 'https://placehold.co/160x160/0D0B1E/8B5CF6?text=✦'}
                alt={product.name}
                style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 14, border: `1px solid ${C.border}`, flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x160/0D0B1E/8B5CF6?text=✦' }}
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
                        : <Badge variant="blue" size="sm">✦ Sorcerer report</Badge>
                      }
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
                      {product.name}
                    </h1>
                    <p style={{ fontSize: 13, color: C.textDim, maxWidth: 600, lineHeight: 1.6 }}>
                      {product.description.slice(0, 200)}{product.description.length > 200 ? '…' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                    <ScoreBadge score={report.opportunityScore} label="Opportunity" />
                    <ScoreBadge score={report.riskScore} label="Risk" />
                  </div>
                </div>

                {/* Key stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginTop: 14 }}>
                  {[
                    { label: 'Buy price',         value: formatCurrency(product.sourcePriceUsd),    sub: product.sourcePlatform },
                    { label: 'Avg. sell price',    value: formatCurrency(product.avgSellPriceUsd),   sub: product.bestSellPlatform },
                    { label: 'Est. monthly sales', value: formatNumber(product.estimatedMonthlySales), sub: 'units/month' },
                    { label: 'Avg. rating',        value: `${product.avgReviewScore}/5`,              sub: `${formatNumber(product.reviewCount)} reviews` },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{ background: 'rgba(139,92,246,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
                      <p style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{value}</p>
                      <p style={{ fontSize: 11, color: C.textDim, textTransform: 'capitalize', marginTop: 2 }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.textMut }}>
                📜 Report saved · {formatDate(report.createdAt)}
              </span>
              <button
                onClick={() => downloadReportCsv(report)}
                style={{
                  display:    'inline-flex',
                  alignItems: 'center',
                  gap:        5,
                  background: 'none',
                  border:     `1px solid ${C.border}`,
                  borderRadius: 99,
                  padding:    '5px 14px',
                  color:      C.textDim,
                  fontSize:   11,
                  fontWeight: 600,
                  cursor:     'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = C.purpleB
                  el.style.borderColor = 'rgba(139,92,246,0.4)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = C.textDim
                  el.style.borderColor = C.border
                }}
              >
                ⬇ Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* ── Section 2: AI Analysis ── */}
        <LockedSection
          isLocked={showLocked}
          featureName="Full Oracle Analysis"
          subtitle="Sorcerer reports include a 5-paragraph deep-dive: opportunity summary, target market, competitive landscape, recommended strategy, and trend outlook."
        >
          <Section
            title="Oracle Analysis"
            icon="✨"
            headerRight={
              <span style={{
                fontSize:   11,
                color:      showLocked ? C.textDim : '#A78BFA',
                background: showLocked ? 'rgba(90,79,122,0.2)' : 'rgba(139,92,246,0.12)',
                border:     `1px solid ${showLocked ? 'rgba(90,79,122,0.3)' : 'rgba(139,92,246,0.3)'}`,
                borderRadius: 99,
                padding:    '3px 10px',
                fontWeight: 600,
              }}>
                {showLocked ? 'GPT-4o mini · Free' : 'GPT-4o · Sorcerer'}
              </span>
            }
          >
            <div>
              {report.aiAnalysis.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i} style={{ fontSize: 14, color: C.textDim, lineHeight: 1.75, marginBottom: 12 }}>
                  {paragraph}
                </p>
              ))}
              {showLocked && (
                <p style={{ fontSize: 12, color: C.textMut, fontStyle: 'italic', marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  This is a 1-paragraph summary. Sorcerer reports include 5 full paragraphs.
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
          subtitle="Free reports show only the best platform. Sorcerer compares Amazon, eBay, Etsy, and Shopify side-by-side."
        >
          <Section title="Platform Comparison" icon="🏪">
            <PlatformTable platforms={report.platformComparison} />
          </Section>
        </LockedSection>

        {/* ── Section 6: Where to Buy ── (always visible) */}
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
                  borderRadius: 14,
                  border:       p.recommended ? '1px solid rgba(139,92,246,0.4)' : `1px solid ${C.border}`,
                  background:   p.recommended ? 'rgba(139,92,246,0.08)' : 'rgba(7,5,17,0.5)',
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
                <p style={{ fontSize: 12, color: C.textDim }}>
                  {p.netMargin.toFixed(1)}% margin · {p.feePercent}% fee
                </p>
                <a
                  href={`https://www.${p.platform}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}
                >
                  Start selling →
                </a>
              </div>
            ))}

            {/* Locked platform placeholders (free tier) */}
            {showLocked && [1, 2, 3].map((i) => (
              <div key={`locked-${i}`} style={{
                borderRadius: 14,
                border:       `1px solid ${C.border}`,
                background:   'rgba(7,5,17,0.3)',
                padding:      '14px',
                display:      'flex',
                flexDirection: 'column',
                alignItems:   'center',
                justifyContent: 'center',
                opacity:      0.35,
                minHeight:    100,
              }}>
                <span style={{ fontSize: 18, marginBottom: 4 }}>🔒</span>
                <p style={{ fontSize: 11, color: C.textDim }}>Pro only</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Bottom upgrade CTA for free tier */}
        {showLocked && (
          <div style={{ marginBottom: 20 }}>
            <UpgradeBanner
              variant="full"
              title="You're seeing the free version of this report"
              description="Upgrade to Sorcerer and re-run this search to get the full 5-paragraph oracle, all 4 platform comparisons, 6-month trend charts, and 20 fresh ideas every week."
              ctaLabel="✦ Ascend to Sorcerer — £10/mo"
            />
          </div>
        )}

        {/* ── Section 8: Product Details ── */}
        <Section title="Product Details" icon="📋">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Full Description
              </h3>
              <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7 }}>{product.description}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
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
                    <span style={{ color: C.textDim }}>{label}</span>
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
              background:     'rgba(14,10,28,0.80)',
              backdropFilter: 'blur(20px)',
              border:         `1px solid ${C.border}`,
              borderRadius:   99,
              padding:        '10px 24px',
              color:          C.textDim,
              fontSize:       13,
              fontWeight:     600,
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
