/**
 * ComparePage — side-by-side comparison of 2-5 reports.
 *
 * Route: /compare?ids=id1,id2,id3
 * Auth:  Protected (ProtectedRoute in App.tsx)
 * Gate:  Pro (Sorcerer) subscribers only — free users see inline paywall
 *
 * Layout: column per product, row per dimension. Winner column highlighted.
 * Mobile: "Best on desktop" note, stacked columns still work.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { compareReports } from '../services/api'
import { CompareResponse, CompareItem, ScoreSource } from '../types'
import type { CSSProperties } from 'react'

// ─── Design tokens (match Dashboard) ─────────────────────────────────────────
const C = {
  bg:      '#04080A',
  border:  'rgba(139,92,246,0.15)',
  borderG: 'rgba(139,92,246,0.40)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  cyan:    '#22D3EE',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
  green:   '#34D399',
  amber:   '#FBBF24',
  red:     '#F87171',
  gold:    '#F59E0B',
}
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GLASS: CSSProperties = {
  background: 'rgba(10,6,22,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: '0 0 0 1px rgba(139,92,246,0.06), 0 16px 40px rgba(0,0,0,0.55)',
}
const WINNER_GLOW: CSSProperties = {
  border: '1px solid rgba(139,92,246,0.5)',
  boxShadow: '0 0 24px rgba(124,58,237,0.2), 0 0 0 1px rgba(139,92,246,0.2)',
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

// ─── Background ───────────────────────────────────────────────────────────────
function CompareBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <img
        src="/assets/castle-forest.png"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          filter: 'brightness(0.18) saturate(0.6)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(4,8,10,0.75) 0%, rgba(4,8,10,0.50) 50%, rgba(4,8,10,0.85) 100%)',
      }}/>
      <div style={{
        position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 500,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)',
        borderRadius: '50%',
      }}/>
    </div>
  )
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
      {/* Big score */}
      <div
        style={{
          fontSize: 48, fontWeight: 800, lineHeight: 1, color,
          textShadow: `0 0 20px ${color}55`,
          cursor: sources.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => sources.length > 0 && setShowTip(v => !v)}
        onMouseEnter={() => sources.length > 0 && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        {score}
        <span style={{ fontSize: 14, fontWeight: 400, color: C.textMut, marginLeft: 3 }}>/10</span>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginTop: 4 }}>
        {label}
      </div>

      {/* Sources tooltip */}
      {showTip && sources.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 8, zIndex: 50,
          background: 'rgba(7,5,17,0.96)',
          border: `1px solid ${C.borderG}`,
          borderRadius: 10, padding: '10px 14px',
          minWidth: 200, maxWidth: 260,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', color: C.textMut, textTransform: 'uppercase', marginBottom: 8 }}>
            Why this score
          </div>
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: C.textDim }}>{s.label}</span>
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
      ...GLASS,
      ...(isWinner ? WINNER_GLOW : {}),
      flex: 1,
      minWidth: 200,
      overflow: 'visible',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Winner badge */}
      {isWinner && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: GBTN,
          border: '1px solid rgba(139,92,246,0.5)',
          borderRadius: 99, padding: '4px 14px',
          fontSize: 11, fontWeight: 700, color: '#fff',
          whiteSpace: 'nowrap',
          boxShadow: '0 0 16px rgba(124,58,237,0.35)',
          zIndex: 10,
        }}>
          ✦ Best pick — {winnerReason.toLowerCase()}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '22px 20px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: isWinner ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.02)',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: C.textMut }}>
            {item.category}
          </span>
          {item.tier === 'pro' && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#C4B5FD',
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 99, padding: '1px 7px',
            }}>PRO</span>
          )}
        </div>
      </div>

      {/* Scores */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', gap: 24, justifyContent: 'center',
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

      {/* Score source rows */}
      {(item.opportunity_sources.length > 0 || item.risk_sources.length > 0) && (
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 10 }}>
            Score signals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.opportunity_sources.map((s, i) => (
              <div key={`opp-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: C.textDim, flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: oppColor(item.opportunity_score), fontWeight: 600, textAlign: 'right' }}>
                  {s.value}
                </span>
              </div>
            ))}
            {item.risk_sources.map((s, i) => (
              <div key={`risk-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: C.textDim, flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontSize: 11, color: riskColor(item.risk_score), fontWeight: 600, textAlign: 'right' }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {item.summary && (
        <div style={{ padding: '14px 20px', flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 8 }}>
            Verdict
          </div>
          <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.65, margin: 0 }}>
            {item.summary}
          </p>
        </div>
      )}

      {/* Link to full report */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
        <Link
          to={`/report/${item.id}`}
          style={{
            display: 'block', textAlign: 'center',
            fontSize: 12, color: C.textDim,
            textDecoration: 'none',
            padding: '8px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = C.text
            e.currentTarget.style.borderColor = C.borderG
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = C.textDim
            e.currentTarget.style.borderColor = C.border
          }}
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
    <div style={{ ...GLASS, maxWidth: 520, margin: '0 auto', padding: '48px 40px', textAlign: 'center' }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, rgba(167,139,250,0.3) 0%, rgba(124,58,237,0.12) 50%, transparent 70%)',
        border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 0 24px rgba(124,58,237,0.15)',
      }}>
        <svg viewBox="0 0 100 100" width={32} height={32}>
          <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
          <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
          <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
        </svg>
      </div>

      <h2 style={{
        fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
        fontSize: 26, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '-0.01em', color: C.text, marginBottom: 12,
      }}>
        Comparison Mode
        <br />
        <span style={{
          background: GRAD,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          is a Sorcerer feature
        </span>
      </h2>

      <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.65, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
        You've been running reports back-to-back. Now see them side-by-side, with scores
        sourced and a winner automatically picked. Upgrade to compare up to 5 products at once.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        {[
          'Side-by-side score comparison',
          'Score signals — see why each number is what it is',
          'Auto-selected winner with reasoning',
          'Up to 5 products per comparison',
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.green, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: C.textDim }}>{f}</span>
          </div>
        ))}
      </div>

      <Link
        to="/pricing"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: GBTN,
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: 99, padding: '12px 32px',
          color: '#fff', fontSize: 14, fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 0 20px rgba(124,58,237,0.3)',
        }}
      >
        ✦ Ascend to Sorcerer — £10/mo
      </Link>

      <p style={{ fontSize: 12, color: C.textMut, marginTop: 16 }}>
        Free reports are already unlimited. Sorcerer unlocks comparison.
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

  const idsParam = searchParams.get('ids') || ''
  const reportIds = idsParam.split(',').filter(Boolean)

  const [result, setResult] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative', overflow: 'hidden' }}>
      <CompareBackground />

      {/* Mobile note */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'none',
        '@media (max-width: 640px)': { display: 'block' },
      } as CSSProperties}>
        <div style={{
          padding: '12px 20px',
          background: 'rgba(139,92,246,0.08)',
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center',
          fontSize: 12, color: C.textDim,
        }}>
          Comparison is best on desktop — rotate your device for a better view.
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                fontSize: 12, color: C.textMut,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}
            >
              ← Back to Grimoire
            </button>
            <h1 style={{
              fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
              fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '-0.01em', color: C.text, lineHeight: 1, margin: 0,
            }}>
              Comparison
              <span style={{
                background: GRAD,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginLeft: 10,
              }}>
                Verdict ✦
              </span>
            </h1>
          </div>

          {result && (
            <div style={{
              fontSize: 12, color: C.textDim,
              background: 'rgba(139,92,246,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: 99, padding: '6px 16px',
            }}>
              {result.products.length} products · Winner selected by opportunity + risk
            </div>
          )}
        </div>

        {/* Non-pro: paywall */}
        {!isPro && <ComparePaywall />}

        {/* Loading */}
        {isPro && loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16 }}>
            <div style={{
              width: 32, height: 32,
              border: '2px solid rgba(139,92,246,0.25)',
              borderTopColor: C.purple,
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <span style={{ fontSize: 14, color: C.textDim }}>Assembling verdict…</span>
          </div>
        )}

        {/* Error */}
        {isPro && !loading && error && (
          <div style={{ ...GLASS, padding: '32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: C.red, marginBottom: 20 }}>{error}</p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                background: GBTN, borderRadius: 99, padding: '10px 28px',
                color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
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
              ...GLASS,
              padding: '16px 24px',
              marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              background: 'rgba(124,58,237,0.08)',
              borderColor: 'rgba(139,92,246,0.3)',
            }}>
              <span style={{
                fontFamily: '"DM Mono",monospace',
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textDim,
              }}>
                Best pick
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                {result.products.find(p => p.id === result.winner_id)?.name}
              </span>
              <span style={{ fontSize: 12, color: C.textDim }}>
                {result.winner_reason}
              </span>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{
                  background: GBTN,
                  borderRadius: 99, padding: '4px 14px',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  boxShadow: '0 0 12px rgba(124,58,237,0.3)',
                }}>
                  ✦ Winner
                </span>
              </div>
            </div>

            {/* Formula explainer */}
            <div style={{ marginBottom: 24, fontSize: 11, color: C.textMut, textAlign: 'right' }}>
              <span title="Winner = highest opportunity score, adjusted for risk. Hover scores to see sources.">
                Winner formula: Opportunity − Risk score &nbsp;
                <span style={{ fontSize: 12, color: C.textDim, cursor: 'help' }}>ⓘ</span>
              </span>
            </div>

            {/* Columns */}
            <div style={{
              display: 'flex',
              gap: 16,
              alignItems: 'stretch',
              overflowX: 'auto',
              paddingTop: 20,
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
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Link
                to="/dashboard"
                style={{
                  fontSize: 13, color: C.textDim,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${C.border}`,
                  paddingBottom: 1,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textDim)}
              >
                Run more reports in your Grimoire ›
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .compare-mobile-note { display: block !important; }
        }
      `}</style>
    </div>
  )
}
