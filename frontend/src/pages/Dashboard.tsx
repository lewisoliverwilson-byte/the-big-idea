import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signOut } from 'aws-amplify/auth'
import { useAuthStore } from '../store/authStore'
import { getMyReports, submitSearch, deleteAllReports } from '../services/api'
import { useReportStore } from '../store/reportStore'
import { SearchForm } from '../components/search/SearchForm'
import { PaywallModal } from '../components/ui/PaywallModal'
import { UpgradeBanner } from '../components/ui/UpgradeBanner'
import { formatDate, USD_TO_GBP } from '../utils/formatters'
import { getQuizFromStorage, clearQuizFromStorage } from './Landing'
import { SearchParams, SellPlatform } from '../types'
import type { CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#04080A',
  border:  'rgba(139,92,246,0.15)',
  borderG: 'rgba(139,92,246,0.40)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  cyan:    '#22D3EE',
  gold:    '#F59E0B',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
  green:   '#34D399',
  amber:   '#FBBF24',
  red:     '#F87171',
}
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GTEXT: CSSProperties = {
  background: GRAD, WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}
const GLASS: CSSProperties = {
  background: 'rgba(10,6,22,0.82)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: '0 0 0 1px rgba(139,92,246,0.06), 0 16px 40px rgba(0,0,0,0.55)',
}

// ─── Deterministic starfield ───────────────────────────────────────────────────
const STARS = Array.from({ length: 28 }, (_, i) => {
  const g = 137.508
  return {
    left:  `${((i * g) % 100).toFixed(1)}%`,
    top:   `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:  [1, 1, 1.5][i % 3],
    delay: `${((i * 0.37) % 4.5).toFixed(2)}s`,
    dur:   `${(2.8 + (i % 6) * 0.45).toFixed(1)}s`,
  }
})

// ─── Logo mark (SVG brand mark) ───────────────────────────────────────────────
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 33,79 A 34,34 0 1,1 67,79" fill="none" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" opacity="0.28"/>
      <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
      <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
      <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
    </svg>
  )
}

// ─── Photo background ─────────────────────────────────────────────────────────
function DashboardBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <img
        src="/assets/castle-forest.png"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          filter: 'brightness(0.22) saturate(0.7)',
        }}
      />
      {/* Deep overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(4,8,10,0.72) 0%, rgba(4,8,10,0.45) 50%, rgba(4,8,10,0.80) 100%)',
      }}/>
      {/* Radial purple glow — top center */}
      <div style={{
        position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 450,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }}/>
    </div>
  )
}

// ─── Top navigation bar ────────────────────────────────────────────────────────
function TopNav({
  user, isPro, onSignOut,
}: {
  user: any; isPro: boolean; onSignOut: () => void
}) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 58,
      background: 'rgba(4,8,10,0.88)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      {/* Left — logo + wordmark */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <LogoMark size={26} />
        <span style={{
          fontFamily: '"Cinzel Decorative", "Cinzel", serif',
          fontWeight: 700, fontSize: 16, letterSpacing: '0.06em', color: '#DDD6FE',
        }}>
          Sorcery
        </span>
      </Link>

      {/* Right — tier + user + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isPro && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: GBTN,
            borderRadius: 99, padding: '4px 12px',
            fontSize: 11, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 12px rgba(124,58,237,0.3)',
          }}>
            ✦ Sorcerer
          </span>
        )}
        {user?.fullName && (
          <span style={{ fontSize: 13, color: C.textDim, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.fullName}
          </span>
        )}
        <button
          onClick={onSignOut}
          style={{
            fontSize: 12, color: C.textMut,
            background: 'none', border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = C.text
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.borderG
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = C.textMut
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

// ─── Quota bar ────────────────────────────────────────────────────────────────
function QuotaBar({ used, limit, resetAt }: { used: number; limit: number; resetAt?: string }) {
  const remaining    = Math.max(0, limit - used)
  const pct          = Math.min(100, Math.round((used / limit) * 100))
  const resetDate    = resetAt ? new Date(resetAt) : null
  const daysLeft     = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() + 7 * 86400000 - Date.now()) / 86400000))
    : 7

  const barColor = remaining === 0 ? C.red : remaining <= 4 ? C.amber : C.green

  return (
    <div style={{ ...GLASS, padding: '14px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Weekly Spells
        </span>
        <span style={{ fontSize: 11, color: C.textMut }}>
          Resets in {daysLeft}d
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: C.text }}>{remaining}</span>
        <span style={{ fontSize: 12, color: C.textMut, paddingBottom: 4 }}>/ {limit} remaining</span>
      </div>
      <div style={{ height: 3, background: 'rgba(139,92,246,0.10)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.6s' }} />
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      ...GLASS, padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 4,
      borderRadius: 12,
    }}>
      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMut }}>
        {label}
      </span>
      <span style={accent ? { ...GTEXT, fontSize: 22, fontWeight: 700, lineHeight: 1 } : { fontSize: 22, fontWeight: 700, lineHeight: 1, color: C.text }}>
        {value}
      </span>
    </div>
  )
}

// ─── Report row ────────────────────────────────────────────────────────────────
function oppColor(score: number) {
  if (score >= 7.5) return C.green
  if (score >= 5)   return C.amber
  return C.red
}
function riskColor(score: number) {
  if (score <= 3)   return C.green
  if (score <= 6)   return C.amber
  return C.red
}

function ReportRow({
  report,
  compareMode = false,
  selected = false,
  onToggle,
}: {
  report: any
  compareMode?: boolean
  selected?: boolean
  onToggle?: (id: string) => void
}) {
  const oColor = oppColor(report.opportunityScore)
  const rColor = riskColor(report.riskScore)

  const rowContent = (
    <>
      {/* Compare checkbox */}
      {compareMode && (
        <div
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle?.(report.id) }}
          style={{
            width: 18, height: 18, flexShrink: 0, borderRadius: 4,
            border: selected ? '2px solid #8B5CF6' : `2px solid ${C.border}`,
            background: selected ? '#8B5CF6' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {selected && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
        </div>
      )}

      {/* Opportunity score indicator */}
      <div style={{
        width: 4, height: 36, borderRadius: 99, flexShrink: 0,
        background: oColor, boxShadow: `0 0 6px ${oColor}60`,
      }} />

      {/* Product info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.productName}
          </span>
          {report.tier === 'pro' && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#C4B5FD',
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 99, padding: '1px 7px', flexShrink: 0,
            }}>PRO</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: C.textMut }}>
          {report.category} · {formatDate(report.createdAt)}
        </span>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'center', minWidth: 34 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: oColor, lineHeight: 1 }}>
            {report.opportunityScore.toFixed(1)}
          </div>
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 2 }}>OPP</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 34 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: rColor, lineHeight: 1 }}>
            {report.riskScore.toFixed(1)}
          </div>
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 2 }}>RISK</div>
        </div>
        {!compareMode && (
          <div style={{ color: C.textMut, fontSize: 18, lineHeight: 1, alignSelf: 'center', marginLeft: 4 }}>›</div>
        )}
      </div>
    </>
  )

  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        background: selected ? 'rgba(139,92,246,0.06)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {compareMode ? (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', cursor: 'pointer' }}
          onClick={() => onToggle?.(report.id)}
        >
          {rowContent}
        </div>
      ) : (
        <Link
          to={`/report/${report.id}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {rowContent}
        </Link>
      )}
    </div>
  )
}

// ─── Empty grimoire state ─────────────────────────────────────────────────────
function EmptyGrimoire() {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px' }}>
      {/* Arcane orb illustration */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, rgba(167,139,250,0.3) 0%, rgba(124,58,237,0.12) 50%, transparent 70%)',
        border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 0 20px rgba(124,58,237,0.12)',
      }}>
        <svg viewBox="0 0 100 100" width={32} height={32} style={{ opacity: 0.55 }}>
          <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
          <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
          <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
        Your grimoire is empty
      </p>
      <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
        Cast your first spell using the form on the left. Your discoveries will appear here.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user }       = useAuthStore()
  const navigate       = useNavigate()
  const queryClient    = useQueryClient()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const [showPaywall, setShowPaywall]     = useState(false)
  const [confirmClear, setConfirmClear]   = useState(false)
  const [compareMode, setCompareMode]     = useState(false)
  const [selectedIds, setSelectedIds]     = useState<string[]>([])

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn:  getMyReports,
  })

  const clearHistoryMutation = useMutation({
    mutationFn: deleteAllReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      setConfirmClear(false)
    },
  })

  const isPro           = user?.subscriptionStatus === 'active'
  // Free users now get unlimited single reports (backend limit: 50).
  // isAtLimit is only relevant for Pro users (weekly cap). Free users hit a
  // paywall only when they try to use comparison mode — not single reports.
  const proUsed         = user?.proReportsUsedThisWeek || 0
  const proLeft         = Math.max(0, 20 - proUsed)
  const isAtLimit       = isPro ? proLeft === 0 : false

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : null

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
      currency:         'GBP',
      unitSize:         quiz.unitSize,
      category:         quiz.category !== 'No preference' ? quiz.category : undefined,
      targetPlatforms:  quiz.platform !== 'any' ? [quiz.platform as SellPlatform] : undefined,
      trendingOnly:     quiz.goal === 'trending',
      minMarginPercent: quiz.goal === 'margin' ? 35 : quiz.goal === 'safe' ? 20 : 15,
    }
    autoSearchMutation.mutate(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    try { await signOut({ global: false }) } catch { /* ignore */ }
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <DashboardBackground />

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="animate-twinkle" style={{
            position: 'absolute', left: s.left, top: s.top,
            width: s.size, height: s.size, borderRadius: '50%',
            background: i % 3 === 0 ? C.purpleB : i % 3 === 1 ? C.cyan : '#fff',
            animationDelay: s.delay, animationDuration: s.dur,
          }} />
        ))}
      </div>

      {/* Top nav */}
      <TopNav user={user} isPro={isPro} onSignOut={handleSignOut} />

      {/* Page content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '78px 24px 48px', position: 'relative', zIndex: 1 }}>

        {/* ── Welcome row ── */}
        <div style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
              fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '-0.01em', color: C.text, lineHeight: 1, marginBottom: 6,
            }}>
              {firstName ? `Welcome back, ${firstName}` : 'Your Grimoire'}
              <span style={{ color: C.purpleB }}> ✦</span>
            </h1>
            <p style={{ fontSize: 13, color: C.textDim }}>
              {isPro
                ? `Sorcerer plan · ${proLeft} spell${proLeft !== 1 ? 's' : ''} remaining this week`
                : 'Apprentice plan · Unlimited spells · Compare with Sorcerer'}
            </p>
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 10 }}>
            {isPro && (
              <StatCard
                label="Spells left"
                value={proLeft}
                accent
              />
            )}
            <StatCard
              label="Reports"
              value={reports?.length ?? '—'}
            />
          </div>
        </div>

        {/* ── Auto-search loading banner ── */}
        {autoSearchMutation.isPending && (
          <div style={{ ...GLASS, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, borderRadius: 12 }}>
            <div style={{
              width: 32, height: 32, border: '2px solid rgba(139,92,246,0.25)',
              borderTopColor: C.purple, borderRadius: '50%',
              flexShrink: 0, animation: 'spin 0.9s linear infinite',
            }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Summoning your best opportunity…</p>
              <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                Scanning 1,000+ products. This takes about 20 seconds.
              </p>
            </div>
          </div>
        )}

        {/* ── Pro weekly limit banner ── */}
        {isPro && proLeft === 0 && !autoSearchMutation.isPending && (
          <div style={{ marginBottom: 24 }}>
            <UpgradeBanner
              variant="full"
              title="Weekly spells used up"
              description="Your 20-spell weekly allowance resets every 7 days. Your existing reports and comparison mode are still active."
              ctaLabel="View account"
            />
          </div>
        )}

        {/* ── Main two-column grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Cast a Spell ── */}
          <div>
            {/* Quota (Pro only) */}
            {isPro && (
              <QuotaBar used={proUsed} limit={20} resetAt={user?.proWeekResetAt} />
            )}

            {/* Search card */}
            <div style={{ ...GLASS, overflow: 'hidden', borderRadius: 16 }}>
              {/* Card header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(124,58,237,0.04)',
              }}>
                <svg viewBox="0 0 100 100" width={18} height={18} aria-hidden="true" style={{ opacity: 0.75 }}>
                  <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
                  <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
                  <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
                </svg>
                <span style={{
                  fontFamily: '"DM Mono",monospace', fontSize: 10,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim,
                }}>
                  Configure Your Spell
                </span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <SearchForm onPaywallHit={() => setShowPaywall(true)} />
              </div>
            </div>

            {/* Upgrade nudge (free users — pitch comparison mode) */}
            {!isPro && (
              <div style={{ marginTop: 16 }}>
                <UpgradeBanner
                  variant="inline"
                  title="Compare your reports"
                  description="Sorcerer unlocks side-by-side comparison — auto-picks the winner with score signals."
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: The Grimoire ── */}
          <div style={{ ...GLASS, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              padding: '14px 24px 12px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              background: 'rgba(124,58,237,0.04)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: '"DM Mono",monospace', fontSize: 10,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim,
                }}>
                  The Grimoire
                </span>
                {reports && reports.length > 0 && (
                  <span style={{
                    fontSize: 10, color: C.textMut,
                    background: 'rgba(139,92,246,0.08)', border: `1px solid ${C.border}`,
                    borderRadius: 99, padding: '2px 8px',
                  }}>
                    {reports.length}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Compare button — appears when 2+ reports exist */}
                {reports && reports.length >= 2 && !confirmClear && (
                  compareMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedIds.length >= 2 && (
                        <button
                          onClick={() => {
                            const ids = selectedIds.join(',')
                            navigate(`/compare?ids=${ids}`)
                          }}
                          style={{
                            fontSize: 11, fontWeight: 700, color: '#fff',
                            background: GBTN,
                            border: '1px solid rgba(139,92,246,0.4)',
                            borderRadius: 99, padding: '4px 12px', cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(124,58,237,0.2)',
                          }}
                        >
                          ✦ Compare {selectedIds.length}
                        </button>
                      )}
                      <button
                        onClick={() => { setCompareMode(false); setSelectedIds([]) }}
                        style={{
                          fontSize: 11, color: C.textMut,
                          background: 'none', border: `1px solid ${C.border}`,
                          borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCompareMode(true); setSelectedIds([]) }}
                      style={{
                        fontSize: 11, color: C.textDim,
                        background: 'none', border: `1px solid ${C.border}`,
                        borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.color = C.purpleB
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.borderG
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.color = C.textDim
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
                      }}
                    >
                      Compare ✦
                    </button>
                  )
                )}

                {/* Clear history (Sorcerer only) */}
                {isPro && reports && reports.length > 0 && !compareMode && (
                  confirmClear ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.textDim }}>Clear all?</span>
                      <button
                        onClick={() => clearHistoryMutation.mutate()}
                        disabled={clearHistoryMutation.isPending}
                        style={{
                          fontSize: 11, fontWeight: 700, color: C.red,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 99, padding: '3px 10px', cursor: 'pointer',
                        }}
                      >
                        {clearHistoryMutation.isPending ? '…' : 'Yes, clear'}
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        style={{ fontSize: 11, color: C.textMut, background: 'none', border: 'none', cursor: 'pointer' }}
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
                        ;(e.currentTarget as HTMLButtonElement).style.color = C.red
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.color = C.textMut
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
                      }}
                    >
                      Clear history
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Compare mode hint */}
            {compareMode && (
              <div style={{
                padding: '10px 24px',
                borderBottom: `1px solid ${C.border}`,
                background: 'rgba(124,58,237,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <span style={{ fontSize: 11, color: C.textDim }}>
                  Select 2-5 reports to compare side-by-side
                </span>
                <span style={{ fontSize: 11, color: selectedIds.length >= 2 ? C.purpleB : C.textMut }}>
                  {selectedIds.length} selected
                </span>
              </div>
            )}

            {/* Body */}
            {reportsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin"
                     style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: C.purple }} />
              </div>
            ) : !reports || reports.length === 0 ? (
              <EmptyGrimoire />
            ) : (
              <div>
                {reports.map((report) => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    compareMode={compareMode}
                    selected={selectedIds.includes(report.id)}
                    onToggle={(id) => {
                      setSelectedIds(prev =>
                        prev.includes(id)
                          ? prev.filter(x => x !== id)
                          : prev.length >= 5 ? prev : [...prev, id]
                      )
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom upgrade nudge — compare mode upsell ── */}
        {!isPro && reports && reports.length >= 2 && (
          <div style={{ marginTop: 24, ...GLASS, padding: '20px 28px', borderRadius: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 6, lineHeight: 1.6 }}>
              You've got{' '}
              <span style={{ color: C.text, fontWeight: 600 }}>{reports.length} reports</span>{' '}
              in your grimoire.
            </p>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 18, lineHeight: 1.6 }}>
              <span style={{ color: C.purpleB, fontWeight: 600 }}>Sorcerer</span> lets you compare them side-by-side,
              auto-picks the winner, and shows you exactly why each score is what it is.
            </p>
            <Link to="/pricing" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: GBTN, border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: 99, padding: '10px 28px', color: '#fff',
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 0 18px rgba(124,58,237,0.25)',
            }}>
              ✦ Unlock Comparison Mode — £10/mo
            </Link>
          </div>
        )}

      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}
