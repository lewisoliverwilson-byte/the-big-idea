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
import { Wordmark } from '../components/layout/Navbar'
import { TrendingUp, BarChart2, LogOut, ChevronRight } from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#F4EFE5',
  white:   '#FBF8F0',
  border:  '#DDD3BC',
  primary: '#C8F50C',
  primaryL:'#EBF7B8',
  text:    '#1A1817',
  textSec: '#6B6359',
  textMut: '#9A8B82',
  green:   '#5A7A47',
  amber:   '#B57828',
  red:     '#9C3A3A',
  greenL:  '#EBF7B8',
  amberL:  '#FEF3CD',
  redL:    '#FAEDED',
}

const CARD: React.CSSProperties = {
  background:   C.white,
  border:       `1px solid ${C.border}`,
  borderRadius: 12,
  boxShadow:    '0 1px 3px 0 rgba(0,0,0,0.06)',
}

import type React from 'react'

// ─── Top navigation bar ────────────────────────────────────────────────────────
function TopNav({ user, isPro, onSignOut }: { user: any; isPro: boolean; onSignOut: () => void }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, background: C.white, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Wordmark height={20} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isPro && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, color: '#1A1817',
            background: '#C8F50C', border: '1px solid #A8D104',
            borderRadius: 4, padding: '3px 10px', letterSpacing: '0.04em',
          }}>
            <TrendingUp size={10} />
            Pro
          </span>
        )}
        {user?.fullName && (
          <span style={{ fontSize: 13, color: C.textSec, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.fullName}
          </span>
        )}
        <button
          onClick={onSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: C.textMut,
            background: 'none', border: `1px solid ${C.border}`,
            borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.text; (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.textMut; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border }}
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </nav>
  )
}

// ─── Quota bar ────────────────────────────────────────────────────────────────
function QuotaBar({ used, limit, resetAt }: { used: number; limit: number; resetAt?: string }) {
  const remaining = Math.max(0, limit - used)
  const pct       = Math.min(100, Math.round((used / limit) * 100))
  const resetDate = resetAt ? new Date(resetAt) : null
  const daysLeft  = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() + 7 * 86400000 - Date.now()) / 86400000))
    : 7

  const barColor = remaining === 0 ? C.red : remaining <= 4 ? C.amber : C.primary

  return (
    <div style={{ ...CARD, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.textSec, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Weekly quota
        </span>
        <span style={{ fontSize: 11, color: C.textMut }}>Resets in {daysLeft}d</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: C.text }}>{remaining}</span>
        <span style={{ fontSize: 12, color: C.textMut, paddingBottom: 3 }}>/ {limit} remaining</span>
      </div>
      <div style={{ height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ ...CARD, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMut }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: accent ? C.primary : C.text }}>{value}</span>
    </div>
  )
}

// ─── Score helpers ────────────────────────────────────────────────────────────
function oppColor(score: number) {
  if (score >= 7.5) return C.green
  if (score >= 5)   return C.amber
  return C.red
}
function riskColor(score: number) {
  if (score <= 3) return C.green
  if (score <= 6) return C.amber
  return C.red
}

// ─── Report row ────────────────────────────────────────────────────────────────
function ReportRow({ report, compareMode = false, selected = false, onToggle }: {
  report: any; compareMode?: boolean; selected?: boolean; onToggle?: (id: string) => void
}) {
  const oColor = oppColor(report.opportunityScore)
  const rColor = riskColor(report.riskScore)

  const rowContent = (
    <>
      {compareMode && (
        <div
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle?.(report.id) }}
          style={{
            width: 16, height: 16, flexShrink: 0, borderRadius: 4,
            border: selected ? `2px solid ${C.primary}` : `2px solid ${C.border}`,
            background: selected ? C.primary : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.12s',
          }}
        >
          {selected && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
        </div>
      )}

      {/* Left accent bar */}
      <div style={{ width: 3, height: 32, borderRadius: 99, flexShrink: 0, background: oColor }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.productName}
          </span>
          {report.tier === 'pro' && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: C.primary,
              background: C.primaryL, border: '1px solid #C7D2FE',
              borderRadius: 99, padding: '1px 6px', flexShrink: 0,
            }}>PRO</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: C.textMut }}>{report.category} · {formatDate(report.createdAt)}</span>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', minWidth: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: oColor, lineHeight: 1 }}>{report.opportunityScore.toFixed(1)}</div>
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 2 }}>OPP</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: rColor, lineHeight: 1 }}>{report.riskScore.toFixed(1)}</div>
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 2 }}>RISK</div>
        </div>
        {!compareMode && <ChevronRight size={14} style={{ color: C.textMut }} />}
      </div>
    </>
  )

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      background: selected ? '#F5F3FF' : 'transparent',
      transition: 'background 0.12s',
    }}>
      {compareMode ? (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', cursor: 'pointer' }}
          onClick={() => onToggle?.(report.id)}
        >
          {rowContent}
        </div>
      ) : (
        <Link
          to={`/report/${report.id}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', transition: 'background 0.12s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {rowContent}
        </Link>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyReports() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: C.primaryL, border: '1px solid #C7D2FE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <BarChart2 size={22} style={{ color: C.primary }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>No reports yet</p>
      <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>
        Run a search on the left and your reports will appear here.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user }    = useAuthStore()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const [showPaywall,  setShowPaywall]  = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [compareMode,  setCompareMode]  = useState(false)
  const [selectedIds,  setSelectedIds]  = useState<string[]>([])

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

  const isPro       = user?.subscriptionStatus === 'active'
  const proUsed     = user?.proReportsUsedThisWeek || 0
  const proLeft     = Math.max(0, 20 - proUsed)
  const isAtLimit   = isPro ? proLeft === 0 : false
  const firstName   = user?.fullName ? user.fullName.split(' ')[0] : null

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
      if (error?.response?.status === 402 || error?.response?.status === 429) setShowPaywall(true)
    },
  })

  useEffect(() => {
    const quiz = getQuizFromStorage()
    if (!quiz || autoSearchMutation.isPending) return
    if (isAtLimit) { clearQuizFromStorage(); setShowPaywall(true); return }
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
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <TopNav user={user} isPro={isPro} onSignOut={handleSignOut} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 20px 48px', position: 'relative' }}>

        {/* ── Welcome row ── */}
        <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, letterSpacing: '-0.02em', color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
              {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
            </h1>
            <p style={{ fontSize: 13, color: C.textSec }}>
              {isPro
                ? `Pro · ${proLeft} report${proLeft !== 1 ? 's' : ''} remaining this week`
                : 'Starter plan · Unlimited reports'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isPro && <StatCard label="Reports left" value={proLeft} accent />}
            <StatCard label="Total reports" value={reports?.length ?? '—'} />
          </div>
        </div>

        {/* ── Auto-search loading banner ── */}
        {autoSearchMutation.isPending && (
          <div style={{ ...CARD, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 28, height: 28, border: `2px solid ${C.primaryL}`,
              borderTopColor: C.primary, borderRadius: '50%', flexShrink: 0,
              animation: 'spin 0.8s linear infinite',
            }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Analysing products…</p>
              <p style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Scanning 1,000+ products. This takes about 20 seconds.</p>
            </div>
          </div>
        )}

        {/* ── Pro limit banner ── */}
        {isPro && proLeft === 0 && !autoSearchMutation.isPending && (
          <div style={{ marginBottom: 20 }}>
            <UpgradeBanner
              variant="full"
              title="Weekly quota reached"
              description="Your 20 weekly reports reset in a few days. Your existing reports and comparison mode are still active."
              ctaLabel="View account"
            />
          </div>
        )}

        {/* ── Two-column grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Find Products ── */}
          <div>
            {isPro && <QuotaBar used={proUsed} limit={20} resetAt={user?.proWeekResetAt} />}

            <div style={{ ...CARD, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 18px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FAFAFA',
              }}>
                <BarChart2 size={14} style={{ color: C.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textSec }}>
                  Find Products
                </span>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <SearchForm onPaywallHit={() => setShowPaywall(true)} />
              </div>
            </div>

            {!isPro && (
              <div style={{ marginTop: 14 }}>
                <UpgradeBanner
                  variant="inline"
                  title="Compare your reports"
                  description="Pro unlocks side-by-side comparison — auto-picks the winner with score signals."
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: Reports ── */}
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 20px 10px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              background: '#FAFAFA', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textSec }}>
                  Your Reports
                </span>
                {reports && reports.length > 0 && (
                  <span style={{
                    fontSize: 10, color: C.textMut,
                    background: '#F1F5F9', border: `1px solid ${C.border}`,
                    borderRadius: 99, padding: '2px 7px',
                  }}>
                    {reports.length}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {reports && reports.length >= 2 && !confirmClear && (
                  compareMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {selectedIds.length >= 2 && (
                        <button
                          onClick={() => navigate(`/compare?ids=${selectedIds.join(',')}`)}
                          style={{
                            fontSize: 11, fontWeight: 600, color: '#fff',
                            background: C.primary, border: 'none',
                            borderRadius: 99, padding: '4px 12px', cursor: 'pointer',
                          }}
                        >
                          Compare {selectedIds.length}
                        </button>
                      )}
                      <button
                        onClick={() => { setCompareMode(false); setSelectedIds([]) }}
                        style={{
                          fontSize: 11, color: C.textMut, background: 'none',
                          border: `1px solid ${C.border}`, borderRadius: 99, padding: '3px 9px', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCompareMode(true); setSelectedIds([]) }}
                      style={{
                        fontSize: 11, color: C.textSec, background: 'none',
                        border: `1px solid ${C.border}`, borderRadius: 99, padding: '3px 9px', cursor: 'pointer',
                        transition: 'border-color 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.primary; (e.currentTarget as HTMLButtonElement).style.borderColor = '#C7D2FE' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.textSec; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border }}
                    >
                      Compare
                    </button>
                  )
                )}

                {isPro && reports && reports.length > 0 && !compareMode && (
                  confirmClear ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Clear all?</span>
                      <button
                        onClick={() => clearHistoryMutation.mutate()}
                        disabled={clearHistoryMutation.isPending}
                        style={{
                          fontSize: 11, fontWeight: 600, color: C.red,
                          background: '#FEF2F2', border: '1px solid #FECACA',
                          borderRadius: 99, padding: '3px 9px', cursor: 'pointer',
                        }}
                      >
                        {clearHistoryMutation.isPending ? '…' : 'Yes, clear'}
                      </button>
                      <button onClick={() => setConfirmClear(false)} style={{ fontSize: 11, color: C.textMut, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      style={{
                        fontSize: 11, color: C.textMut, background: 'none',
                        border: `1px solid ${C.border}`, borderRadius: 99, padding: '3px 9px', cursor: 'pointer',
                        transition: 'color 0.12s, border-color 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.red; (e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.textMut; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border }}
                    >
                      Clear history
                    </button>
                  )
                )}
              </div>
            </div>

            {compareMode && (
              <div style={{
                padding: '9px 20px', borderBottom: `1px solid ${C.border}`,
                background: C.primaryL,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: '#4338CA' }}>Select 2–5 reports to compare</span>
                <span style={{ fontSize: 11, color: selectedIds.length >= 2 ? C.primary : C.textMut }}>
                  {selectedIds.length} selected
                </span>
              </div>
            )}

            {reportsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
                <div style={{ width: 22, height: 22, border: `2px solid ${C.primaryL}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : !reports || reports.length === 0 ? (
              <EmptyReports />
            ) : (
              <div>
                {reports.map((report) => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    compareMode={compareMode}
                    selected={selectedIds.includes(report.id)}
                    onToggle={(id) => setSelectedIds(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 5 ? prev : [...prev, id]
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Upgrade nudge ── */}
        {!isPro && reports && reports.length >= 2 && (
          <div style={{ marginTop: 20, ...CARD, padding: '18px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: C.textSec, marginBottom: 4 }}>
              You have{' '}
              <span style={{ color: C.text, fontWeight: 600 }}>{reports.length} reports</span>{' '}
              in your history.
            </p>
            <p style={{ fontSize: 13, color: C.textSec, marginBottom: 16 }}>
              <span style={{ color: C.primary, fontWeight: 600 }}>Pro</span> lets you compare them side-by-side and auto-picks the winner.
            </p>
            <Link to="/pricing" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: C.primary, border: 'none',
              borderRadius: 8, padding: '9px 22px', color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              Upgrade to Pro — £10/mo
            </Link>
          </div>
        )}

      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}
