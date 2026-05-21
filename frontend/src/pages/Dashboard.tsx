import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getMyReports, submitSearch, deleteAllReports } from '../services/api'
import { useReportStore } from '../store/reportStore'
import { SearchForm } from '../components/search/SearchForm'
import { PaywallModal } from '../components/ui/PaywallModal'
import { UpgradeBanner } from '../components/ui/UpgradeBanner'
import { ScoreBadge } from '../components/ui/Badge'
import { formatDate, USD_TO_GBP } from '../utils/formatters'
import { getQuizFromStorage, clearQuizFromStorage } from './Landing'
import { SearchParams, SellPlatform } from '../types'
import type { CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#070511',
  border:  'rgba(139,92,246,0.15)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  cyan:    '#22D3EE',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

const GLASS: CSSProperties = {
  background:           'rgba(14,10,28,0.80)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${C.border}`,
  borderRadius:         20,
  boxShadow:            '0 0 0 1px rgba(139,92,246,0.06), 0 16px 32px rgba(0,0,0,0.5)',
}

// ─── Deterministic starfield ───────────────────────────────────────────────────
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

// ─── Weekly quota bar ─────────────────────────────────────────────────────────
function WeeklyQuotaBar({ used, limit, resetAt }: { used: number; limit: number; resetAt?: string }) {
  const remaining = Math.max(0, limit - used)
  const pct       = Math.min(100, Math.round((used / limit) * 100))
  const resetDate = resetAt ? new Date(resetAt) : null
  const daysUntilReset = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() + 7 * 86400000 - Date.now()) / 86400000))
    : 7

  const barColor = remaining === 0 ? '#F87171' : remaining <= 3 ? '#FBBF24' : '#34D399'

  return (
    <div style={{ ...GLASS, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>✦</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Weekly spells</span>
        </div>
        <span style={{ fontSize: 11, color: C.textDim }}>
          Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{remaining}</span>
        <span style={{ fontSize: 12, color: C.textDim }}>/ {limit} remaining</span>
      </div>
      <div style={{ height: 4, background: 'rgba(139,92,246,0.12)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: barColor, width: `${pct}%`, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: 'free' | 'pro' }) {
  if (tier === 'pro') {
    return (
      <span style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:        4,
        background: GRAD,
        borderRadius: 99,
        padding:    '2px 10px',
        fontSize:   10,
        fontWeight: 700,
        color:      '#fff',
      }}>
        ✦ Pro
      </span>
    )
  }
  return (
    <span style={{
      display:    'inline-flex',
      alignItems: 'center',
      background: 'rgba(90,79,122,0.25)',
      border:     '1px solid rgba(139,92,246,0.2)',
      borderRadius: 99,
      padding:    '2px 10px',
      fontSize:   10,
      fontWeight: 600,
      color:      C.textDim,
    }}>
      Free
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user }      = useAuthStore()
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const [showPaywall, setShowPaywall] = useState(false)

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn:  getMyReports,
  })

  const [confirmClear, setConfirmClear] = useState(false)

  const clearHistoryMutation = useMutation({
    mutationFn: deleteAllReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      setConfirmClear(false)
    },
  })

  const isPro          = user?.subscriptionStatus === 'active'
  const freeReportsLeft = Math.max(0, 2 - (user?.reportsUsedFree || 0))
  const proUsed        = user?.proReportsUsedThisWeek || 0
  const proLeft        = Math.max(0, 20 - proUsed)
  const isAtLimit      = isPro ? proLeft === 0 : freeReportsLeft === 0

  // Auto-run search from quiz answers stored in localStorage
  const autoSearchMutation = useMutation({
    mutationFn: (params: SearchParams) => submitSearch(params),
    onSuccess: (data) => {
      setCurrentReportId(data.reportId)
      setIsGenerating(true)
      clearQuizFromStorage()
      queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      navigate(`/report/${data.reportId}`)
    },
    onError: (error: any) => {
      clearQuizFromStorage()
      if (error?.response?.status === 402 || error?.response?.status === 429) {
        setShowPaywall(true)
      }
    },
  })

  useEffect(() => {
    const quiz = getQuizFromStorage()
    if (!quiz || autoSearchMutation.isPending) return
    if (isAtLimit) {
      clearQuizFromStorage()
      setShowPaywall(true)
      return
    }

    const budgetUsd = quiz.budgetGbp / USD_TO_GBP
    const params: SearchParams = {
      budgetUsd,
      currency:        'GBP',
      unitSize:        quiz.unitSize,
      category:        quiz.category !== 'No preference' ? quiz.category : undefined,
      targetPlatforms: quiz.platform !== 'any' ? [quiz.platform as SellPlatform] : undefined,
      trendingOnly:    quiz.goal === 'trending',
      minMarginPercent: quiz.goal === 'margin' ? 35 : quiz.goal === 'safe' ? 20 : 15,
    }

    autoSearchMutation.mutate(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            background:        i % 3 === 0 ? C.purpleB : i % 3 === 1 ? C.cyan : '#fff',
            animationDelay:    s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      {/* Ambient orb */}
      <div className="animate-float-orb" style={{
        position:      'fixed',
        top:           0,
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         600,
        height:        400,
        background:    'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
        borderRadius:  '50%',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              {user?.fullName
                ? `Welcome back, ${user.fullName.split(' ')[0]} ✦`
                : 'Your Grimoire'}
            </h1>
            <p style={{ fontSize: 13, color: C.textDim }}>
              {isPro
                ? `Sorcerer plan · ${proLeft} spell${proLeft !== 1 ? 's' : ''} remaining this week`
                : `Apprentice plan · ${freeReportsLeft} free spell${freeReportsLeft !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
          {isPro && (
            <span style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        8,
              background: GRAD,
              borderRadius: 99,
              padding:    '8px 20px',
              fontSize:   13,
              fontWeight: 700,
              color:      '#fff',
              boxShadow:  '0 0 16px rgba(124,58,237,0.3)',
            }}>
              ✦ Sorcerer Member
            </span>
          )}
        </div>

        {/* Auto-search loading banner */}
        {autoSearchMutation.isPending && (
          <div style={{ ...GLASS, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="h-7 w-7 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
                 style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Summoning your best opportunity…</p>
              <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Scanning 1,000+ products to match your criteria. This takes ~20 seconds.</p>
            </div>
          </div>
        )}

        {/* Free limit banner */}
        {!isPro && freeReportsLeft === 0 && !autoSearchMutation.isPending && (
          <div style={{ marginBottom: 24 }}>
            <UpgradeBanner
              variant="full"
              title="Your free spells are spent"
              description="Sorcerer gives you 20 fresh ideas every week — plus full AI analysis, all 4 platform comparisons, and trend charts."
              ctaLabel="✦ Ascend to Sorcerer — £10/mo"
            />
          </div>
        )}

        {/* Last free spell nudge */}
        {!isPro && freeReportsLeft > 0 && freeReportsLeft <= 1 && (
          <div style={{ ...GLASS, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <p style={{ fontSize: 13, color: C.text }}>
              <span style={{ fontWeight: 700, color: C.purpleB }}>Last free spell.</span>{' '}
              <span style={{ color: C.textDim }}>Upgrade to Sorcerer to keep discovering.</span>
            </p>
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
              }}
            >
              Go Pro
            </Link>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

          {/* Left: Search + quota */}
          <div style={{ maxWidth: 420 }}>

            {/* Weekly quota (Pro only) */}
            {isPro && (
              <div style={{ marginBottom: 16 }}>
                <WeeklyQuotaBar
                  used={proUsed}
                  limit={20}
                  resetAt={user?.proWeekResetAt}
                />
              </div>
            )}

            {/* Search form */}
            <div style={{ ...GLASS, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16 }}>🔮</span>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Configure your spell</h2>
              </div>
              <SearchForm onPaywallHit={() => setShowPaywall(true)} />
            </div>

            {/* Inline upgrade nudge (free only, still has spells) */}
            {!isPro && freeReportsLeft > 0 && (
              <div style={{ marginTop: 16 }}>
                <UpgradeBanner
                  variant="inline"
                  title="Want 20 ideas a week?"
                  description="Sorcerer upgrades your analysis from 1 paragraph to 5 — plus all 4 platform comparisons."
                />
              </div>
            )}
          </div>

          {/* Right: Past reports */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...GLASS, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📜</span>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>My Reports</h2>
                  {reports && reports.length > 0 && (
                    <span style={{ fontSize: 11, color: C.textMut }}>
                      {reports.length} report{reports.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Clear history — Sorcerer only */}
                {isPro && reports && reports.length > 0 && (
                  confirmClear ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.textDim }}>Clear all?</span>
                      <button
                        onClick={() => clearHistoryMutation.mutate()}
                        disabled={clearHistoryMutation.isPending}
                        style={{
                          fontSize: 11, fontWeight: 700, color: '#EF4444',
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
                        }}
                      >
                        {clearHistoryMutation.isPending ? '…' : 'Yes, clear'}
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        style={{
                          fontSize: 11, color: C.textMut,
                          background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      style={{
                        fontSize: 11, color: C.textMut,
                        background: 'none', border: `1px solid ${C.border}`,
                        borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#EF4444'
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = C.textMut
                        e.currentTarget.style.borderColor = C.border
                      }}
                    >
                      Clear history
                    </button>
                  )
                )}
              </div>

              {reportsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                  <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin"
                       style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
                </div>
              ) : !reports || reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <div style={{
                    width:          48,
                    height:         48,
                    borderRadius:   '50%',
                    background:     'rgba(139,92,246,0.1)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    margin:         '0 auto 16px',
                    fontSize:       20,
                  }}>
                    📜
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No reports yet</p>
                  <p style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                    Cast your first spell using the form on the left
                  </p>
                </div>
              ) : (
                <div>
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        padding:        '14px 24px',
                        borderBottom:   `1px solid ${C.border}`,
                        transition:     'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Clickable text area */}
                      <Link
                        to={`/report/${report.id}`}
                        style={{ textDecoration: 'none', flex: 1, minWidth: 0, display: 'block' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {report.productName}
                          </p>
                          <TierBadge tier={report.tier} />
                        </div>
                        <p style={{ fontSize: 11, color: C.textDim }}>
                          {report.category} · {formatDate(report.createdAt)}
                        </p>
                      </Link>

                      {/* Scores + open */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
                        <ScoreBadge score={report.opportunityScore} label="Opp." />
                        <ScoreBadge score={report.riskScore}        label="Risk" />
                        <Link
                          to={`/report/${report.id}`}
                          style={{ color: C.textMut, fontSize: 18, textDecoration: 'none', lineHeight: 1 }}
                          title="Open report"
                        >
                          ›
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom upgrade nudge */}
            {!isPro && reports && reports.length >= 1 && (
              <div style={{ marginTop: 16, ...GLASS, padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: C.textDim, marginBottom: 12 }}>
                  Free reports show <span style={{ color: C.text, fontWeight: 600 }}>1 platform</span> and a{' '}
                  <span style={{ color: C.text, fontWeight: 600 }}>brief summary</span>.{' '}
                  Sorcerer unlocks the full oracle.
                </p>
                <Link
                  to="/pricing"
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
                    boxShadow:      '0 0 16px rgba(124,58,237,0.25)',
                  }}
                >
                  ✦ Upgrade to Sorcerer — £10/mo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}
