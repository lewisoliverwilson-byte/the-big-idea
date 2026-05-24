import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check, X, Brain, LayoutGrid, RefreshCw } from 'lucide-react'
import { createCheckoutSession } from '../services/api'
import { useAuthStore } from '../store/authStore'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#F4EFE5',
  bgSubtle:  '#EDE6D2',
  paper:     '#FBF8F0',
  border:    '#DDD3BC',
  text:      '#1A1817',
  textSec:   '#6B6359',
  textMut:   '#9A8B82',
  primary:   '#C8F50C',
  primaryH:  '#A8D104',
  primaryL:  '#EBF7B8',
  primaryBdr:'rgba(168,209,4,0.35)',
} as const

// ─── Plan data ────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  '2 reports — lifetime',
  '1-paragraph AI summary',
  'Margin calculator',
  'Best platform only',
  'Direct source links',
]

const FREE_LIMITS = [
  'Full 5-paragraph GPT-4o analysis',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  '20 reports per week',
]

const PRO_FEATURES = [
  '20 fresh reports per week',
  'Full 5-paragraph GPT-4o analysis',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  'Interactive margin calculator',
  'Source links (Temu, AliExpress, Alibaba)',
  'Full report history',
  'Priority support',
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Pricing() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess:  (data) => { window.location.href = data.url },
  })

  const handleSubscribe = () => {
    if (!isAuthenticated) { navigate('/auth/signup'); return }
    checkoutMutation.mutate()
  }

  const isPro = user?.subscriptionStatus === 'active'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.primary, background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
            borderRadius: 99, padding: '4px 12px', marginBottom: 16,
          }}>
            Pricing
          </span>

          <h1 style={{
            fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: C.text, marginBottom: 14,
          }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: C.textSec, fontSize: 16, maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Start free and upgrade when you're ready to scale your research.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div style={{
            background: C.paper, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(26,24,23,0.07)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.textMut, background: C.bgSubtle, border: `1px solid ${C.border}`,
                borderRadius: 99, padding: '3px 10px', marginBottom: 12,
              }}>
                Starter
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Free</h2>
              <p style={{ fontSize: 13, color: C.textSec, marginBottom: 20 }}>Try before you commit</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>£0</span>
                <span style={{ color: C.textMut, fontSize: 13, marginLeft: 4 }}>/forever</span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMut, marginBottom: 10 }}>Includes</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textSec }}>
                    <Check size={14} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.border, marginBottom: 10 }}>Not included</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FREE_LIMITS.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textMut }}>
                    <X size={13} style={{ color: C.border, flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
              style={{
                width: '100%', background: C.paper, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '12px 20px',
                color: C.textSec, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.textMut; (e.currentTarget as HTMLButtonElement).style.background = C.bgSubtle }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.background = C.paper }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start for free'}
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: C.paper, border: `2px solid ${C.primary}`,
            borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 4px 24px rgba(200,245,12,0.18)`,
          }}>
            {/* Badge */}
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: C.primary, color: C.text,
                fontSize: 10, fontWeight: 700, padding: '4px 10px',
                borderRadius: 99, letterSpacing: '0.05em',
              }}>
                Most popular
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.primary, background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
                borderRadius: 99, padding: '3px 10px', marginBottom: 12,
              }}>
                Pro
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Pro</h2>
              <p style={{ fontSize: 13, color: C.textSec, marginBottom: 20 }}>Everything you need to scale</p>

              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>£10</span>
                <span style={{ color: C.textSec, fontSize: 13, marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: C.primary, marginBottom: 24, fontWeight: 500 }}>Less than £0.35 per report</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textSec }}>
                    <Check size={14} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {isPro ? (
              <button
                onClick={() => navigate('/account')}
                style={{
                  width: '100%', background: C.primary, border: 'none', borderRadius: 8,
                  padding: '13px 20px', color: C.text, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primaryH)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primary)}
              >
                Manage subscription
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={checkoutMutation.isPending}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: C.primary, border: 'none', borderRadius: 8,
                  padding: '13px 20px', color: C.text, fontSize: 14, fontWeight: 700,
                  cursor: checkoutMutation.isPending ? 'wait' : 'pointer',
                  opacity: checkoutMutation.isPending ? 0.6 : 1, transition: 'background 0.15s',
                }}
                onMouseEnter={e => !checkoutMutation.isPending && ((e.currentTarget as HTMLButtonElement).style.background = C.primaryH)}
                onMouseLeave={e => !checkoutMutation.isPending && ((e.currentTarget as HTMLButtonElement).style.background = C.primary)}
              >
                {checkoutMutation.isPending ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(26,24,23,0.2)', borderTopColor: C.text, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  'Upgrade to Pro — £10/mo'
                )}
              </button>
            )}
            <p style={{ textAlign: 'center', color: C.textMut, fontSize: 12, marginTop: 10 }}>
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        </div>

        {/* Value props */}
        <div style={{ marginTop: 72, maxWidth: 720, margin: '72px auto 0' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(18px,2.5vw,24px)',
            fontWeight: 700, color: C.text, marginBottom: 32, letterSpacing: '-0.02em',
          }}>
            What Pro unlocks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                Icon:  Brain,
                title: '5× deeper analysis',
                desc:  'Pro uses GPT-4o and writes 5 full paragraphs — target market, competition, strategy, and trend outlook.',
              },
              {
                Icon:  LayoutGrid,
                title: 'All 4 platforms',
                desc:  'Free shows only the best platform. Pro shows every margin, fee, and sales estimate across Amazon, eBay, Etsy, and Shopify.',
              },
              {
                Icon:  RefreshCw,
                title: '20 reports per week',
                desc:  'Free gives 2 reports, ever. Pro resets every 7 days so you always have fresh research.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{
                background: C.paper, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: 22,
                boxShadow: '0 1px 3px rgba(26,24,23,0.05)',
              }}>
                <div style={{
                  display: 'inline-flex', padding: 9, borderRadius: 8, marginBottom: 14,
                  background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
                }}>
                  <Icon size={16} style={{ color: C.primary }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64, maxWidth: 640, margin: '64px auto 0' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(18px,2vw,22px)',
            fontWeight: 700, color: C.text, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month.' },
              { q: 'What happens when my weekly limit resets?',
                a: 'Every 7 days from your first Pro search, your counter resets to 20. Track the reset date in your dashboard.' },
              { q: 'Is the data accurate?',
                a: 'Our product database is refreshed regularly. Prices and sales estimates are based on real marketplace data, not guesses.' },
              { q: "What's the difference in AI analysis?",
                a: 'Free gets a single paragraph summary. Pro gets a 5-paragraph research report covering opportunity, target market, competition, strategy, and a 6-month outlook.' },
            ].map(({ q, a }) => (
              <details
                key={q}
                style={{
                  background: C.paper, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '14px 18px',
                  boxShadow: '0 1px 2px rgba(26,24,23,0.05)',
                }}
              >
                <summary style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', listStyle: 'none',
                  fontWeight: 600, fontSize: 14, color: C.text,
                }}>
                  {q}
                  <span style={{ color: C.textMut, marginLeft: 12 }}>▾</span>
                </summary>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginTop: 10 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
