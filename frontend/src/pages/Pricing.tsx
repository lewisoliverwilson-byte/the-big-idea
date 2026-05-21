import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, X } from 'lucide-react'
import { createCheckoutSession } from '../services/api'
import { useAuthStore } from '../store/authStore'
import type { CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      '#070511',
  surface: '#0E0A1C',
  border:  'rgba(139,92,246,0.15)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  cyan:    '#22D3EE',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}

const GRAD  = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN  = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

const GTEXT: CSSProperties = {
  background:            GRAD,
  WebkitBackgroundClip:  'text',
  WebkitTextFillColor:   'transparent',
  backgroundClip:        'text',
}

const GLASS: CSSProperties = {
  background:           'rgba(14,10,28,0.70)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${C.border}`,
  borderRadius:         20,
  boxShadow:            '0 0 0 1px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
}

// ─── Plan data ────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  '2 spell casts — lifetime',
  '1-paragraph oracle analysis',
  'Margin divination',
  'Best platform revealed',
  'Source links to procure product',
]

const FREE_LIMITS = [
  'Full 5-paragraph analysis',
  'All 4 platform visions',
  'Trend charts & data scrolls',
  '20 spells per week',
]

const PRO_FEATURES = [
  '20 spells every week',
  'Full 5-paragraph oracle (GPT-4o)',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  'Interactive margin calculator',
  'Source links (Temu, AliExpress, Alibaba)',
  'Full grimoire history',
  'Priority conjuring',
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
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '80px 0' }}>

      {/* Ambient orb */}
      <div style={{
        position:     'fixed',
        top:          '30%',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        600,
        height:       400,
        background:   'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 64 }}>
          <div style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        6,
            fontSize:   11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:      C.purpleB,
            background: 'rgba(139,92,246,0.08)',
            border:     `1px solid ${C.border}`,
            borderRadius: 99,
            padding:    '5px 14px',
            marginBottom: 20,
          }}>
            ✦ Choose Your Power
          </div>

          <h1 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
            fontWeight:    700,
            fontSize:      'clamp(36px,5vw,56px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.05,
            marginBottom:  16,
            ...GTEXT,
          }}>
            Wield the Right Magic
          </h1>
          <p style={{ color: C.textDim, fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Begin as an apprentice. Ascend to sorcerer when you're ready to conjure at scale.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Apprentice (Free) */}
          <div style={{ ...GLASS, padding: 32, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        6,
                fontSize:   10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:      C.textMut,
                border:     '1px solid rgba(139,92,246,0.1)',
                borderRadius: 99,
                padding:    '3px 10px',
                marginBottom: 12,
              }}>
                Apprentice
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>Free</h2>
              <p style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>Cast your first spells</p>

              <div style={{ marginBottom: 28 }}>
                <span style={{
                  fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
                  fontSize:      42,
                  fontWeight:    700,
                  color:         C.text,
                }}>
                  £0
                </span>
                <span style={{ color: C.textMut, fontSize: 13, marginLeft: 6 }}>/forever</span>
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 10 }}>Includes</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textDim }}>
                    <CheckCircle size={14} style={{ color: C.purpleB, flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMut, marginBottom: 10, opacity: 0.5 }}>Locked</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FREE_LIMITS.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textMut }}>
                    <X size={13} style={{ color: C.textMut, flexShrink: 0, marginTop: 1, opacity: 0.5 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
              style={{
                width:        '100%',
                background:   'transparent',
                border:       `1px solid ${C.border}`,
                borderRadius: 12,
                padding:      '13px 24px',
                color:        C.textDim,
                fontSize:     14,
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = C.text }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.textDim }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start for free'}
            </button>
          </div>

          {/* Sorcerer (Pro) */}
          <div style={{
            ...GLASS,
            padding:     32,
            display:     'flex',
            flexDirection: 'column',
            border:      '1px solid rgba(139,92,246,0.45)',
            position:    'relative',
            overflow:    'hidden',
            boxShadow:   '0 0 0 1px rgba(139,92,246,0.12), 0 32px 64px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

            {/* Top glow */}
            <div style={{
              position:     'absolute',
              top:          -60,
              right:        -60,
              width:        200,
              height:       200,
              background:   'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
              <span style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           4,
                background:    GBTN,
                color:         '#fff',
                fontSize:      10,
                fontWeight:    700,
                padding:       '4px 10px',
                borderRadius:  99,
                letterSpacing: '0.05em',
                boxShadow:     '0 0 12px rgba(124,58,237,0.4)',
              }}>
                ✦ Most powerful
              </span>
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        6,
                fontSize:   10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: GRAD,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
                border:     '1px solid rgba(139,92,246,0.25)',
                borderRadius: 99,
                padding:    '3px 10px',
                marginBottom: 12,
              }}>
                Sorcerer
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>Pro</h2>
              <p style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>Unlimited dark power</p>

              <div style={{ marginBottom: 6 }}>
                <span style={{
                  fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                  fontSize:   42,
                  fontWeight: 700,
                  color:      C.text,
                }}>
                  £10
                </span>
                <span style={{ color: C.textDim, fontSize: 13, marginLeft: 6 }}>/month</span>
              </div>
              <p style={{ fontSize: 11, color: C.purpleB, marginBottom: 28 }}>That's less than £0.35 per conjuring</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textDim }}>
                    <CheckCircle size={14} style={{ color: C.purple, flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {isPro ? (
                <button
                  onClick={() => navigate('/account')}
                  style={{
                    width:        '100%',
                    background:   GBTN,
                    border:       '1px solid rgba(139,92,246,0.4)',
                    borderRadius: 12,
                    padding:      '14px 24px',
                    color:        '#fff',
                    fontSize:     15,
                    fontWeight:   700,
                    cursor:       'pointer',
                    boxShadow:    '0 0 24px rgba(124,58,237,0.35)',
                  }}
                >
                  Manage subscription
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={checkoutMutation.isPending}
                  style={{
                    width:        '100%',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    gap:          8,
                    background:   GBTN,
                    border:       '1px solid rgba(139,92,246,0.4)',
                    borderRadius: 12,
                    padding:      '14px 24px',
                    color:        '#fff',
                    fontSize:     15,
                    fontWeight:   700,
                    cursor:       checkoutMutation.isPending ? 'wait' : 'pointer',
                    opacity:      checkoutMutation.isPending ? 0.6 : 1,
                    boxShadow:    '0 0 24px rgba(124,58,237,0.35)',
                    transition:   'opacity 0.15s',
                  }}
                >
                  {checkoutMutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    '✦ Ascend to Sorcerer — £10/mo'
                  )}
                </button>
              )}
              <p style={{ textAlign: 'center', color: C.textMut, fontSize: 11, marginTop: 10 }}>
                Cancel anytime. No long-term binding.
              </p>
            </div>
          </div>
        </div>

        {/* Value props */}
        <div style={{ marginTop: 80, maxWidth: 720, margin: '80px auto 0' }}>
          <h2 style={{
            textAlign:  'center',
            fontSize:   'clamp(20px,2.5vw,26px)',
            fontWeight: 700,
            color:      C.text,
            marginBottom: 32,
          }}>
            What the Sorcerer tier unlocks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🧠',
                title: '5× deeper oracle',
                desc: 'Pro uses GPT-4o and writes 5 full paragraphs — target market, competitor landscape, strategy, and trend outlook.',
              },
              {
                icon: '📊',
                title: 'All 4 visions',
                desc: 'Free shows only the best platform. Pro reveals every margin, fee, and sales estimate across Amazon, eBay, Etsy, and Shopify.',
              },
              {
                icon: '📅',
                title: '20 spells per week',
                desc: 'Free gives 2 spells, ever. Pro resets every 7 days so you always have fresh ammunition.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ ...GLASS, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 72, maxWidth: 640, margin: '72px auto 0' }}>
          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(18px,2vw,22px)',
            fontWeight:   700,
            color:        C.text,
            marginBottom: 28,
          }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your account settings and you keep Sorcerer access until the end of that billing month.',
              },
              {
                q: 'What happens when my weekly limit resets?',
                a: 'Every 7 days from your first Pro search, your counter resets to 20. Track the reset date in your dashboard.',
              },
              {
                q: 'Is the data accurate?',
                a: 'Our product database is refreshed regularly. Prices and sales estimates are based on real marketplace data, not guesses.',
              },
              {
                q: "What's the difference in AI analysis?",
                a: 'Free gets a single paragraph summary. Pro gets a 5-paragraph research report covering opportunity, target market, competition, strategy, and a 6-month outlook.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                style={{
                  ...GLASS,
                  padding:    '16px 20px',
                  borderRadius: 14,
                }}
              >
                <summary style={{
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent: 'space-between',
                  cursor:        'pointer',
                  listStyle:     'none',
                  fontWeight:    600,
                  fontSize:      14,
                  color:         C.text,
                }}>
                  {q}
                  <span style={{ color: C.textDim, marginLeft: 12, transition: 'transform 0.2s' }}>▾</span>
                </summary>
                <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.65, marginTop: 12 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
