import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Crown, Zap, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { createCheckoutSession } from '../services/api'
import { useAuthStore } from '../store/authStore'

const FREE_FEATURES = [
  '2 free ideas — lifetime',
  '1-paragraph AI analysis (GPT-4o mini)',
  'Margin calculator',
  'Best platform recommendation only',
  'Buy links to source product',
]

const FREE_LIMITS = [
  'Full AI analysis (5 paragraphs)',
  'All 4 platform comparisons',
  'Trend charts & data',
  '20 ideas per week',
]

const PRO_FEATURES = [
  '20 fresh ideas every week',
  'Full 5-paragraph AI analysis (GPT-4o)',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  'Interactive margin calculator',
  'Direct source links (Temu, AliExpress, Alibaba)',
  'Full report history',
  'Priority generation',
]

export function Pricing() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/auth/signup')
      return
    }
    checkoutMutation.mutate()
  }

  const isPro = user?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you want more ideas, deeper analysis, and all four platforms.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Free</h2>
              <p className="text-slate-400 text-sm mb-6">Get a feel for the product</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">£0</span>
                <span className="text-slate-400 text-sm ml-1">/forever</span>
              </div>

              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Includes</p>
              <ul className="space-y-2.5 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-3">Not included</p>
              <ul className="space-y-2 mb-8">
                {FREE_LIMITS.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <X className="h-4 w-4 text-slate-700 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start for free'}
              </Button>
            </div>
          </div>

          {/* Pro — the hero card */}
          <div className="relative bg-slate-900 border border-amber-400/40 rounded-2xl p-8 flex flex-col overflow-hidden shadow-2xl shadow-amber-400/10">
            {/* Glow effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />

            {/* Popular badge */}
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                Most popular
              </span>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <h2 className="text-xl font-bold text-white">Pro</h2>
                </div>
                <p className="text-slate-400 text-sm mb-6">For serious dropshippers</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-white">£10</span>
                  <span className="text-slate-400 text-sm ml-1">/month</span>
                  <p className="text-amber-400/70 text-xs mt-1">That's less than £0.35 per idea</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <CheckCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                {isPro ? (
                  <button
                    onClick={() => navigate('/account')}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors"
                  >
                    Manage subscription
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={checkoutMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-amber-400/20"
                  >
                    {checkoutMutation.isPending ? (
                      <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Subscribe — £10/mo'
                    )}
                  </button>
                )}
                <p className="text-center text-slate-500 text-xs mt-3">
                  Cancel anytime. No long-term commitment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Value prop comparison */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-8">
            What you get with Pro that Free doesn't have
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🧠',
                title: '5× deeper analysis',
                desc: 'Pro uses GPT-4o and writes 5 full paragraphs — target market, competitor landscape, recommended strategy, and a trend outlook.',
              },
              {
                icon: '📊',
                title: 'All 4 platforms',
                desc: 'Free shows only the best platform. Pro shows every margin, fee, and sales estimate across Amazon, eBay, Etsy, and Shopify.',
              },
              {
                icon: '📅',
                title: '20 ideas per week',
                desc: 'Free gives you 2 ideas, ever. Pro resets every 7 days so you always have fresh ammunition.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-8">Common questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month.',
              },
              {
                q: 'What happens when my weekly Pro limit resets?',
                a: 'Every 7 days from your first Pro search, your counter resets to 20. You can track the reset date in your dashboard.',
              },
              {
                q: 'Is the data accurate?',
                a: 'Our product database is refreshed regularly. Prices and sales estimates are based on real marketplace data, not guesses.',
              },
              {
                q: "What's the difference between free and Pro AI analysis?",
                a: 'Free gets a single paragraph summary — useful, but brief. Pro gets a 5-paragraph research report covering opportunity, target market, competition, recommended strategy, and a 6-month trend outlook.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-white text-sm">
                  {q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform ml-3">▾</span>
                </summary>
                <p className="text-slate-400 text-sm leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
