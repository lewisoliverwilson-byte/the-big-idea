import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check, X, Brain, LayoutGrid, RefreshCw } from 'lucide-react'
import { createCheckoutSession } from '../services/api'
import { useAuthStore } from '../store/authStore'

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
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE',
            borderRadius: 99, padding: '4px 12px', marginBottom: 16,
          }}>
            Pricing
          </span>

          <h1 style={{
            fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: '#0F172A', marginBottom: 14,
          }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: '#64748B', fontSize: 16, maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Start free and upgrade when you're ready to scale your research.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0',
                borderRadius: 99, padding: '3px 10px', marginBottom: 12,
              }}>
                Starter
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Free</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Try before you commit</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>£0</span>
                <span style={{ color: '#94A3B8', fontSize: 13, marginLeft: 4 }}>/forever</span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 10 }}>Includes</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569' }}>
                    <Check size={14} style={{ color: '#4F46E5', flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#CBD5E1', marginBottom: 10 }}>Not included</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FREE_LIMITS.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#94A3B8' }}>
                    <X size={13} style={{ color: '#CBD5E1', flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
              style={{
                width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: 8, padding: '12px 20px',
                color: '#374151', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF' }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start for free'}
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: '#FFFFFF', border: '2px solid #4F46E5',
            borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 24px 0 rgba(79,70,229,0.12)',
          }}>
            {/* Badge */}
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#4F46E5', color: '#fff',
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
                color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE',
                borderRadius: 99, padding: '3px 10px', marginBottom: 12,
              }}>
                Pro
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Pro</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Everything you need to scale</p>

              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>£10</span>
                <span style={{ color: '#64748B', fontSize: 13, marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: '#4F46E5', marginBottom: 24 }}>Less than £0.35 per report</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569' }}>
                    <Check size={14} style={{ color: '#4F46E5', flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {isPro ? (
              <button
                onClick={() => navigate('/account')}
                style={{
                  width: '100%', background: '#4F46E5', border: 'none', borderRadius: 8,
                  padding: '13px 20px', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
              >
                Manage subscription
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={checkoutMutation.isPending}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#4F46E5', border: 'none', borderRadius: 8,
                  padding: '13px 20px', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: checkoutMutation.isPending ? 'wait' : 'pointer',
                  opacity: checkoutMutation.isPending ? 0.6 : 1, transition: 'background 0.15s',
                }}
                onMouseEnter={e => !checkoutMutation.isPending && ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
                onMouseLeave={e => !checkoutMutation.isPending && ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
              >
                {checkoutMutation.isPending ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  'Upgrade to Pro — £10/mo'
                )}
              </button>
            )}
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 10 }}>
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        </div>

        {/* Value props */}
        <div style={{ marginTop: 72, maxWidth: 720, margin: '72px auto 0' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(18px,2.5vw,24px)',
            fontWeight: 700, color: '#0F172A', marginBottom: 32, letterSpacing: '-0.02em',
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
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: 22,
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  display: 'inline-flex', padding: 9, borderRadius: 8, marginBottom: 14,
                  background: '#EEF2FF', border: '1px solid #C7D2FE',
                }}>
                  <Icon size={16} style={{ color: '#4F46E5' }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64, maxWidth: 640, margin: '64px auto 0' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(18px,2vw,22px)',
            fontWeight: 700, color: '#0F172A', marginBottom: 24, letterSpacing: '-0.02em',
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
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 10, padding: '14px 18px',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                }}
              >
                <summary style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', listStyle: 'none',
                  fontWeight: 600, fontSize: 14, color: '#0F172A',
                }}>
                  {q}
                  <span style={{ color: '#94A3B8', marginLeft: 12 }}>▾</span>
                </summary>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginTop: 10 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
