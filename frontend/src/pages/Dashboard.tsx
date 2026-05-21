import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getMyReports, submitSearch } from '../services/api'
import { useReportStore } from '../store/reportStore'
import { SearchForm } from '../components/search/SearchForm'
import { PaywallModal } from '../components/ui/PaywallModal'
import { UpgradeBanner } from '../components/ui/UpgradeBanner'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ScoreBadge } from '../components/ui/Badge'
import { formatDate, USD_TO_GBP } from '../utils/formatters'
import { Search, FileText, ArrowRight, Crown } from 'lucide-react'
import { getQuizFromStorage, clearQuizFromStorage } from './Landing'
import { SearchParams, SellPlatform } from '../types'

// ─── Weekly quota bar ─────────────────────────────────────────────────────────

function WeeklyQuotaBar({ used, limit, resetAt }: { used: number; limit: number; resetAt?: string }) {
  const remaining = Math.max(0, limit - used)
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const resetDate = resetAt ? new Date(resetAt) : null
  const daysUntilReset = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() + 7 * 86400000 - Date.now()) / 86400000))
    : 7

  const barColor = remaining === 0 ? 'bg-red-500' : remaining <= 3 ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Weekly ideas</span>
        </div>
        <span className="text-xs text-slate-400">
          Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-white">{remaining}</span>
        <span className="text-slate-500 text-sm">/ {limit} remaining</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: 'free' | 'pro' }) {
  if (tier === 'pro') {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-semibold px-2 py-0.5 rounded-full">
        <Crown className="h-2.5 w-2.5" />
        Pro
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
      Free
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setCurrentReportId, setIsGenerating } = useReportStore()
  const [showPaywall, setShowPaywall] = useState(false)

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn: getMyReports,
  })

  const isPro = user?.subscriptionStatus === 'active'
  const freeReportsLeft = Math.max(0, 2 - (user?.reportsUsedFree || 0))
  const proUsed = user?.proReportsUsedThisWeek || 0
  const proLeft = Math.max(0, 20 - proUsed)
  const isAtLimit = isPro ? proLeft === 0 : freeReportsLeft === 0

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

    // Map quiz answers to search params
    const budgetUsd = (quiz.budgetGbp / USD_TO_GBP)
    const params: SearchParams = {
      budgetUsd,
      currency: 'GBP',
      unitSize: quiz.unitSize,
      category: quiz.category !== 'No preference' ? quiz.category : undefined,
      targetPlatforms: quiz.platform !== 'any' ? [quiz.platform as SellPlatform] : undefined,
      trendingOnly: quiz.goal === 'trending',
      minMarginPercent: quiz.goal === 'margin' ? 35 : quiz.goal === 'safe' ? 20 : 15,
    }

    autoSearchMutation.mutate(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.fullName
                ? `Welcome back, ${user.fullName.split(' ')[0]} 👋`
                : 'Your Dashboard'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {isPro
                ? `Pro plan · ${proLeft} idea${proLeft !== 1 ? 's' : ''} left this week`
                : `Free plan · ${freeReportsLeft} idea${freeReportsLeft !== 1 ? 's' : ''} remaining (lifetime)`}
            </p>
          </div>
          {isPro && (
            <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-sm font-semibold px-4 py-1.5 rounded-full">
              <Crown className="h-3.5 w-3.5" />
              Pro Member
            </span>
          )}
        </div>

        {/* Auto-search loading overlay */}
        {autoSearchMutation.isPending && (
          <div className="mb-6 bg-slate-900 border border-amber-400/30 rounded-xl p-5 flex items-center gap-4">
            <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Finding your best opportunity…</p>
              <p className="text-slate-400 text-sm mt-0.5">Scanning 1,000+ products to match your criteria</p>
            </div>
          </div>
        )}

        {/* Free limit banner */}
        {!isPro && freeReportsLeft === 0 && !autoSearchMutation.isPending && (
          <div className="mb-6">
            <UpgradeBanner
              variant="full"
              title="You've used your 2 free ideas"
              description="Pro gives you 20 fresh ideas every week — plus full AI analysis, all 4 platform comparisons, and trend charts. Everything you need to find your next profitable product."
              ctaLabel="Unlock Pro — £10/month"
            />
          </div>
        )}

        {/* Free tier low notice */}
        {!isPro && freeReportsLeft > 0 && freeReportsLeft <= 1 && (
          <div className="mb-6 bg-slate-900 border border-amber-400/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-slate-300 text-sm">
              <span className="font-semibold text-amber-400">Last free idea.</span>{' '}
              Upgrade to Pro to keep the momentum going.
            </p>
            <Link
              to="/pricing"
              className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-xs transition-colors"
            >
              Go Pro
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left column: Search + Pro quota */}
          <div className="lg:col-span-2 space-y-4">

            {/* Weekly quota (Pro only) */}
            {isPro && (
              <WeeklyQuotaBar
                used={proUsed}
                limit={20}
                resetAt={user?.proWeekResetAt}
              />
            )}

            {/* Search form */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-amber-400" />
                  <h2 className="font-semibold text-white">Find a product</h2>
                </div>
              </CardHeader>
              <CardBody>
                <SearchForm onPaywallHit={() => setShowPaywall(true)} />
              </CardBody>
            </Card>

            {/* Upgrade CTA (free only, inline) */}
            {!isPro && freeReportsLeft > 0 && (
              <UpgradeBanner
                variant="inline"
                title="Want 20 ideas a week?"
                description="Pro upgrades your analysis from 1 paragraph to 5 — and unlocks all 4 platform comparisons."
              />
            )}
          </div>

          {/* Right column: Reports */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-400" />
                    <h2 className="font-semibold text-white">My Reports</h2>
                  </div>
                  {reports && reports.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {reports.length} report{reports.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
                  </div>
                ) : reports?.length === 0 || !reports ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <p className="text-slate-300 font-medium">No reports yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Use the search form to generate your first idea
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {reports.map((report) => (
                      <Link
                        key={report.id}
                        to={`/report/${report.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-white truncate">
                              {report.productName}
                            </p>
                            <TierBadge tier={report.tier} />
                          </div>
                          <p className="text-xs text-slate-500">
                            {report.category} · {formatDate(report.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <ScoreBadge score={report.opportunityScore} label="Opportunity" />
                          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Bottom upgrade nudge for Pro inside reports list */}
            {!isPro && reports && reports.length >= 1 && (
              <div className="mt-4">
                <div className="bg-slate-900 border border-amber-400/20 rounded-xl p-4 text-center">
                  <p className="text-slate-300 text-sm mb-3">
                    Free reports show <span className="text-white font-semibold">1 platform</span> and a{' '}
                    <span className="text-white font-semibold">brief summary</span>.{' '}
                    Pro unlocks the full picture.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade to Pro — £10/mo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}
