/**
 * ComparePage — side-by-side comparison of 2-5 reports.
 *
 * Route: /compare?ids=id1,id2,id3
 * Auth:  Protected (ProtectedRoute in App.tsx)
 * Gate:  Pro subscribers only — free users see inline paywall
 *
 * Layout: column per product, row per dimension. Winner column highlighted.
 * Mobile: "Best on desktop" note, stacked columns still work.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { compareReports } from '../services/api'
import { CompareResponse, CompareItem, ScoreSource } from '../types'
import { Check, TrendingUp } from 'lucide-react'
import type { CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#F8FAFC',
  white:   '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  primary: '#4F46E5',
  green:   '#059669',
  amber:   '#D97706',
  red:     '#DC2626',
}

const CARD: CSSProperties = {
  background:   C.white,
  border:       `1px solid ${C.border}`,
  borderRadius: 12,
  boxShadow:    '0 1px 3px rgba(0,0,0,0.06)',
}

const WINNER_HIGHLIGHT: CSSProperties = {
  border:    `2px solid ${C.primary}`,
  boxShadow: '0 0 0 4px rgba(99,102,241,0.08), 0 4px 12px rgba(0,0,0,0.08)',
}

function oppColor(score: number) {
  if (score >= 7) return C.green
  if (score >= 5) return C.amber
  return C.red
}
function riskColor(score: number) {
  if (score <= 3) return C.green
  if (score <= 6) return C.amber
  return C.red
}

// ─── Score pill with sources tooltip ─────────────────────────────────────────
function ScorePill({
  score,
  sources,
  color,
  label,
}: {
  score: number
  sources: ScoreSource[]
  color: string
  label: string
}) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1,
          color,
          cursor: sources.length > 0 ? 'pointer' : 'default',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
        onClick={() => sources.length > 0 && setShowTip(v => !v)}
        onMouseEnter={() => sources.length > 0 && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        {score}
        <span style={{ fontSize: 13, fontWeight: 400, color: C.textMut, marginLeft: 2 }}>/10</span>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMut, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {label}
      </div>

      {/* Sources tooltip */}
      {showTip && sources.length > 0 && (
        <div style={{
          position:  'absolute',
          top:       '100%',
          left:      '50%',
          transform: 'translateX(-50%)',
          marginTop: 8,
          zIndex:    50,
          background: C.white,
          border:    `1px solid ${C.border}`,
          borderRadius: 10,
          padding:   '10px 14px',
          minWidth:  200,
          maxWidth:  260,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', color: C.textMut, textTransform: 'uppercase', marginBottom: 8 }}>
            Why this score
          </div>
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: C.textSec }}>{s.label}</span>
              <span style={{ fontSize: 11, color: C.text, fontWeight: 600, textAlign: 'right' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Product column ───────────────────────────────────────────────────────────
function ProductColumn({
  item,
  isWinner,
  winnerReason,
}: {
  item: CompareItem
  isWinner: boolean
  winnerReason: string
}) {
  return (
    <div style={{
      ...CARD,
      ...(isWinner ? WINNER_HIGHLIGHT : {}),
      flex: 1,
      minWidth: 200,
      overflow: 'visible',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Winner badge */}
      {isWinner && (
        <div style={{
          position:  'absolute',
          top:       -13,
          left:      '50%',
          transform: 'translateX(-50%)',
          background: C.primary,
          borderRadius: 99,
          padding:   '3px 14px',
          fontSize:  11,
          fontWeight: 700,
          color:     '#fff',
          whiteSpace: 'nowrap',
          zIndex:    10,
        }}>
          Best pick — {winnerReason.toLowerCase()}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding:    '20px 18px 14px',
        borderBottom: `1px solid ${C.border}`,
        background: isWinner ? '#EEF2FF' : '#FAFAFA',
        borderRadius: '12px 12px 0 0',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: C.textMut }}>
            {item.category}
          </span>
          {item.tier === 'pro' && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: C.primary,
              background: '#EEF2FF', border: '1px solid #C7D2FE',
              borderRadius: 99, padding: '1px 7px',
            }}>PRO</span>
          )}
        </div>
      </div>

      {/* Scores */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', gap: 20, justifyContent: 'center',
      }}>
        <ScorePill
          score={item.opportunity_score}
          sources={item.opportunity_sources}
          color={oppColor(item.opportunity_score)}
          label="Opportunity"
        />
        <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
        <ScorePill
          score={item.risk_score}
          sources={item.risk_sources}
          color={riskColor(item.risk_score)}
          label="Risk"
        />
      </div>

      {/* Score signals */}
      {(item.opportunity_sources.length > 0 || item.risk_sources.length > 0) && (
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 8 }}>
            Score signals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {item.opportunity_sources.map((s, i) => (
              <div key={`opp-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: C.textSec, flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: oppColor(item.opportunity_score), fontWeight: 600, textAlign: 'right' }}>
                  {s.value}
                </span>
              </div>
            ))}
            {item.risk_sources.map((s, i) => (
              <div key={`risk-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: C.textSec, flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: riskColor(item.risk_score), fontWeight: 600, textAlign: 'right' }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict */}
      {item.summary && (
        <div style={{ padding: '12px 18px', flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 8 }}>
            Verdict
          </div>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.65, margin: 0 }}>
            {item.summary}
          </p>
        </div>
      )}

      {/* Link to full report */}
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}` }}>
        <Link
          to={`/report/${item.id}`}
          style={{
            display:      'block',
            textAlign:    'center',
            fontSize:     12,
            color:        C.textSec,
            textDecoration: 'none',
            padding:      '7px',
            borderRadius: 7,
            border:       `1px solid ${C.border}`,
            transition:   'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#CBD5E1' }}
          onMouseLeave={e => { e.currentTarget.style.color = C.textSec; e.currentTarget.style.borderColor = C.border }}
        >
          View full report ›
        </Link>
      </div>
    </div>
  )
}

// ─── Free paywall ─────────────────────────────────────────────────────────────
function ComparePaywall() {
  return (
    <div style={{ ...CARD, maxWidth: 520, margin: '0 auto', padding: '48px 40px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{
        width:          56,
        height:         56,
        borderRadius:   '50%',
        background:     '#EEF2FF',
        border:         '1px solid #C7D2FE',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        margin:         '0 auto 20px',
      }}>
        <TrendingUp size={24} style={{ color: '#4F46E5' }} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: '-0.02em' }}>
        Comparison is a Pro feature
      </h2>

      <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
        See your reports side-by-side with scores sourced and a winner automatically picked. Upgrade to compare up to 5 products at once.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>
        {[
          'Side-by-side score comparison',
          'Score signals — see why each number is what it is',
          'Auto-selected winner with reasoning',
          'Up to 5 products per comparison',
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Check size={14} style={{ color: C.green, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: C.textSec }}>{f}</span>
          </div>
        ))}
      </div>

      <Link
        to="/pricing"
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            8,
          background:     C.primary,
          borderRadius:   8,
          padding:        '12px 28px',
          color:          '#fff',
          fontSize:       14,
          fontWeight:     700,
          textDecoration: 'none',
          transition:     'background 0.12s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4338CA')}
        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primary)}
      >
        Upgrade to Pro — £10/mo
      </Link>

      <p style={{ fontSize: 12, color: C.textMut, marginTop: 14 }}>
        Cancel anytime · Free reports are always unlimited
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ComparePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isPro = user?.subscriptionStatus === 'active'

  const idsParam  = searchParams.get('ids') || ''
  const reportIds = idsParam.split(',').filter(Boolean)

  const [result, setResult]   = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!isPro) return
    if (reportIds.length < 2) {
      setError('Select at least 2 reports to compare. Go back to your dashboard.')
      return
    }
    setLoading(true)
    setError(null)
    compareReports(reportIds)
      .then(setResult)
      .catch((err) => {
        const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, idsParam])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px 56px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                fontSize:   12,
                color:      C.textMut,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    '0 0 8px',
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.textSec)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}
            >
              ← Back to Dashboard
            </button>
            <h1 style={{
              fontSize:      'clamp(20px,3vw,26px)',
              fontWeight:    700,
              color:         C.text,
              lineHeight:    1,
              margin:        0,
              letterSpacing: '-0.02em',
            }}>
              Compare Reports
            </h1>
          </div>

          {result && (
            <div style={{
              fontSize:     12,
              color:        C.textSec,
              background:   C.white,
              border:       `1px solid ${C.border}`,
              borderRadius: 99,
              padding:      '6px 14px',
            }}>
              {result.products.length} products · Winner selected by opportunity + risk
            </div>
          )}
        </div>

        {/* Non-pro: paywall */}
        {!isPro && <ComparePaywall />}

        {/* Loading */}
        {isPro && loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 14 }}>
            <div style={{
              width:          28,
              height:         28,
              border:         `2px solid ${C.border}`,
              borderTopColor: C.primary,
              borderRadius:   '50%',
              animation:      'spin 0.9s linear infinite',
            }} />
            <span style={{ fontSize: 14, color: C.textSec }}>Loading comparison…</span>
          </div>
        )}

        {/* Error */}
        {isPro && !loading && error && (
          <div style={{ ...CARD, padding: '32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: C.red, marginBottom: 20 }}>{error}</p>
            <Link
              to="/dashboard"
              style={{
                display:        'inline-block',
                background:     C.primary,
                borderRadius:   8,
                padding:        '10px 24px',
                color:          '#fff',
                fontSize:       13,
                fontWeight:     600,
                textDecoration: 'none',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Results */}
        {isPro && !loading && result && (
          <>
            {/* Winner banner */}
            <div style={{
              ...CARD,
              padding:     '14px 20px',
              marginBottom: 20,
              display:     'flex',
              alignItems:  'center',
              gap:          14,
              flexWrap:    'wrap',
              background:  '#EEF2FF',
              borderColor: '#C7D2FE',
            }}>
              <span style={{ fontSize: 11, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Best pick
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                {result.products.find(p => p.id === result.winner_id)?.name}
              </span>
              <span style={{ fontSize: 12, color: C.textSec }}>
                {result.winner_reason}
              </span>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{
                  background:   C.primary,
                  borderRadius: 99,
                  padding:      '4px 14px',
                  fontSize:     11,
                  fontWeight:   700,
                  color:        '#fff',
                }}>
                  Winner
                </span>
              </div>
            </div>

            {/* Formula explainer */}
            <div style={{ marginBottom: 20, fontSize: 11, color: C.textMut, textAlign: 'right' }}>
              <span title="Winner = highest opportunity score, adjusted for risk. Hover scores to see sources.">
                Winner formula: Opportunity − Risk score &nbsp;
                <span style={{ fontSize: 12, color: C.textSec, cursor: 'help' }}>ⓘ</span>
              </span>
            </div>

            {/* Columns */}
            <div style={{
              display:    'flex',
              gap:        14,
              alignItems: 'stretch',
              overflowX:  'auto',
              paddingTop: 18,
              paddingBottom: 4,
            }}>
              {result.products.map((item) => (
                <ProductColumn
                  key={item.id}
                  item={item}
                  isWinner={item.id === result.winner_id}
                  winnerReason={result.winner_reason}
                />
              ))}
            </div>

            {/* Footer nudge */}
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Link
                to="/dashboard"
                style={{
                  fontSize:   13,
                  color:      C.textSec,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${C.border}`,
                  paddingBottom: 1,
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textSec)}
              >
                Run more reports on your dashboard ›
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
