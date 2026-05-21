import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowRight, ChevronLeft, Check,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'

// ─── Brand ────────────────────────────────────────────────────────────────────
// Div-based logo — guarantees Barlow Condensed renders after Google Fonts load.
// SVG <text> is unreliable when the page font hasn't painted yet.

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      aria-label="The Big Idea"
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{
        width:        size,
        height:       size,
        background:   '#13131B',
        borderRadius: Math.round(size * 0.22),
        border:       '1px solid rgba(255,255,255,0.08)',
        fontFamily:   '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:   700,
        fontSize:     Math.round(size * 0.50),
        letterSpacing: '-0.02em',
        lineHeight:   1,
      }}
    >
      <span style={{ color: '#fff'     }}>T</span>
      <span style={{ color: '#22C55E' }}>B</span>
      <span style={{ color: '#fff'     }}>I</span>
    </div>
  )
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={30} />
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily:    'Outfit,sans-serif',
          fontSize:      '8px',
          letterSpacing: '0.22em',
          color:         '#6B7280',
          textTransform: 'uppercase',
          marginBottom:  '2px',
        }}>THE</div>
        <div style={{
          fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
          fontWeight:    700,
          fontSize:      '15px',
          color:         '#fff',
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
        }}>
          BIG <span style={{ color: '#22C55E' }}>I</span>DEA
        </div>
      </div>
    </div>
  )
}

// ─── Quiz data ────────────────────────────────────────────────────────────────

const STEPS = 5

interface QuizOption {
  id:       string
  emoji:    string
  label:    string
  sublabel: string
}

const QUIZ_QUESTIONS: { step: number; title: string; options: QuizOption[] }[] = [
  {
    step: 1,
    title: "What's your starting budget?",
    options: [
      { id: '175',  emoji: '🌱', label: '£100 – £250',   sublabel: 'Just getting started' },
      { id: '375',  emoji: '📈', label: '£250 – £500',   sublabel: 'Ready to invest' },
      { id: '1000', emoji: '💼', label: '£500 – £1,500', sublabel: 'Serious about this' },
      { id: '2000', emoji: '🚀', label: '£1,500+',       sublabel: 'All in' },
    ],
  },
  {
    step: 2,
    title: 'How much storage do you have?',
    options: [
      { id: 'small',  emoji: '📦', label: 'Small',    sublabel: 'Bag or jiffy bag' },
      { id: 'medium', emoji: '🗂️', label: 'Medium',   sublabel: 'Shoebox size' },
      { id: 'large',  emoji: '📫', label: 'Large',    sublabel: 'Takes up a shelf' },
      { id: 'xlarge', emoji: '🏭', label: 'Any size', sublabel: "I'll use a fulfilment centre" },
    ],
  },
  {
    step: 3,
    title: 'What products interest you?',
    options: [
      { id: 'Home & Garden',   emoji: '🏠', label: 'Home & Gadgets',  sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health', emoji: '✨', label: 'Beauty & Health', sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',    emoji: '🎮', label: 'Toys & Hobbies',  sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',   emoji: '🎲', label: 'Surprise me',     sublabel: 'Best opportunity wins' },
    ],
  },
  {
    step: 4,
    title: 'Where do you want to sell?',
    options: [
      { id: 'amazon', emoji: '📦', label: 'Amazon',       sublabel: 'Biggest marketplace' },
      { id: 'ebay',   emoji: '🛒', label: 'eBay',         sublabel: 'Great for unique items' },
      { id: 'etsy',   emoji: '🎨', label: 'Etsy',         sublabel: 'Niche & creative products' },
      { id: 'any',    emoji: '🤷', label: "I'm not sure", sublabel: 'Show me the best option' },
    ],
  },
  {
    step: 5,
    title: "What's your main goal?",
    options: [
      { id: 'volume',   emoji: '⚡', label: 'Quick wins',        sublabel: 'Fast-selling, high volume' },
      { id: 'margin',   emoji: '💰', label: 'Big margins',       sublabel: 'Fewer sales, higher profit' },
      { id: 'trending', emoji: '🔥', label: 'Trending products', sublabel: 'Only upward-momentum items' },
      { id: 'safe',     emoji: '🛡️', label: 'Low risk',          sublabel: 'Safe, proven products' },
    ],
  },
]

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getQuizFromStorage(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem('bigidea_quiz')
    return raw ? (JSON.parse(raw) as QuizAnswers) : null
  } catch {
    return null
  }
}

export function clearQuizFromStorage() {
  localStorage.removeItem('bigidea_quiz')
}

function saveQuizToStorage(answers: Partial<QuizAnswers>) {
  localStorage.setItem('bigidea_quiz', JSON.stringify(answers))
}

// ─── Quiz sub-components ──────────────────────────────────────────────────────

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between mb-2.5"
        style={{ fontFamily: '"DM Mono",monospace', fontSize: '11px', color: '#6B7280' }}
      >
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-px rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: '#22C55E' }}
        />
      </div>
    </div>
  )
}

function QuizOption({ option, selected, onClick }: {
  option:   QuizOption
  selected: boolean
  onClick:  () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full text-left transition-all duration-150"
      style={{
        padding:      '10px 14px',
        borderRadius: '10px',
        background:   selected ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)',
        border:       selected ? '1px solid rgba(34,197,94,0.30)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span className="text-base leading-none flex-shrink-0">{option.emoji}</span>
      <div className="flex-1 min-w-0">
        <p style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: '13px',
          color: selected ? '#22C55E' : '#D1D5DB',
        }}>
          {option.label}
        </p>
        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 18, height: 18, borderRadius: '50%', background: '#22C55E' }}
        >
          <Check style={{ width: 10, height: 10, color: '#0A0A10' }} />
        </div>
      )}
    </button>
  )
}

// ─── Sample report card sub-components ───────────────────────────────────────

function Sparkline() {
  const vals = [32, 37, 35, 42, 41, 49, 54, 57, 63, 72, 84, 100]
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 28 }}>
      {vals.map((h, i) => {
        const op = (0.18 + (i / 11) * 0.82).toFixed(2)
        return (
          <div key={i} style={{
            height: `${h}%`, width: 7, borderRadius: 2, flexShrink: 0,
            backgroundColor: `rgba(34,197,94,${op})`,
          }} />
        )
      })}
    </div>
  )
}

function Tile({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean
}) {
  return (
    <div className="flex-1 rounded-lg p-3" style={{ background: '#0A0A10', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '17px', color: accent ? '#22C55E' : '#fff', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '10px', color: accent ? '#22C55E' : '#6B7280', marginTop: 3 }}>
        {sub}
      </p>
    </div>
  )
}

function Badge({ label, value, risk = false }: { label: string; value: string; risk?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{
        background: risk ? 'rgba(252,211,77,0.07)' : 'rgba(34,197,94,0.08)',
        border:     risk ? '1px solid rgba(252,211,77,0.18)' : '1px solid rgba(34,197,94,0.18)',
      }}
    >
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '9px', letterSpacing: '0.06em', fontWeight: 700, color: risk ? '#FCD34D' : '#22C55E' }}>
        {label}
      </span>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '13px', color: risk ? '#FCD34D' : '#22C55E' }}>
        {value}
      </span>
    </div>
  )
}

function PlatBar({ name, pct }: { name: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: '11px', color: '#9CA3AF', width: 44, flexShrink: 0 }}>{name}</span>
      <div className="flex-1 rounded-full" style={{ height: 5, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: `rgba(34,197,94,${(0.28 + pct / 100 * 0.72).toFixed(2)})` }} />
      </div>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '10px', color: '#6B7280', width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ─── Section content ──────────────────────────────────────────────────────────

const STEPS_DATA = [
  {
    n: '01', icon: Globe,
    title: 'Answer five questions',
    desc:  'Budget, storage space, category, sell platform, and goal. Takes under 60 seconds.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We scan 1,000+ products',
    desc:  'Buy prices from Temu, AliExpress and Alibaba cross-referenced against Amazon, eBay, Etsy and Shopify.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Report in under 30 seconds',
    desc:  'AI analysis, 6-month trend charts, exact margin breakdown, and direct buy links — delivered instantly.',
  },
]

const FEATURES = [
  { icon: Zap,         title: 'AI market analysis',     desc: 'GPT-4o writes a full opportunity analysis, competitive overview, and recommended strategy tailored to your inputs.' },
  { icon: TrendingUp,  title: '6-month trend data',     desc: 'See whether a product is rising, falling, or seasonal before you commit a single penny.' },
  { icon: DollarSign,  title: 'Margin calculator',      desc: 'Source price, shipping, and platform fees all factored in. Profit per unit at 50, 100, and 200 units.' },
  { icon: BarChart2,   title: 'Platform comparison',    desc: 'Amazon vs eBay vs Etsy vs Shopify — margins, fees, monthly sales estimates, and difficulty side by side.' },
  { icon: Globe,       title: 'Direct source links',    desc: 'One-click through to the exact listing on Temu, AliExpress, or Alibaba. No searching required.' },
  { icon: ShieldCheck, title: 'Risk scoring',           desc: 'Saturated niches, downward trends, and high MOQ risk flagged before you spend anything.' },
]

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background:   '#13131B',
  border:       '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Landing() {
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [quizStep,     setQuizStep]     = useState<number | 'email'>(1)
  const [answers,      setAnswers]      = useState<{
    budget: string|null; unitSize: string|null; category: string|null
    platform: string|null; goal: string|null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [email,        setEmail]        = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answerKeys   = ['budget','unitSize','category','platform','goal'] as const
  const currentValue = quizStep === 'email' ? null : answers[answerKeys[(quizStep as number) - 1]]

  const handleSelect = useCallback((val: string) => {
    const key = answerKeys[(quizStep as number) - 1]
    setAnswers(prev => ({ ...prev, [key]: val }))
    setTimeout(() => {
      if ((quizStep as number) < STEPS) setQuizStep((quizStep as number) + 1)
      else setQuizStep('email')
    }, 180)
  }, [quizStep])

  useEffect(() => {
    if (quizStep === 'email') return
    const q = QUIZ_QUESTIONS[(quizStep as number) - 1]
    const handler = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (n >= 1 && n <= q.options.length) handleSelect(q.options[n - 1].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [quizStep, handleSelect])

  const handleEmailSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setEmailTouched(true)
    const valid = email.includes('@') && email.includes('.') && email.length > 5
    if (!valid) return
    setIsSubmitting(true)
    const qa: QuizAnswers = {
      budgetGbp: parseInt(answers.budget  || '375'),
      unitSize:  (answers.unitSize || 'medium') as QuizAnswers['unitSize'],
      category:  answers.category || 'No preference',
      platform:  answers.platform || 'any',
      goal:      (answers.goal || 'safe') as QuizAnswers['goal'],
    }
    saveQuizToStorage(qa)
    if (isAuthenticated) navigate('/dashboard')
    else navigate(`/auth/signup?${new URLSearchParams({ email }).toString()}`)
  }

  const step       = quizStep === 'email' ? STEPS + 1 : (quizStep as number)
  const emailValid = email.includes('@') && email.includes('.') && email.length > 5

  return (
    <div style={{ background: '#0A0A10', minHeight: '100vh', fontFamily: 'Outfit,sans-serif' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position:       'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background:     'rgba(10,10,16,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
        padding:        '0 28px',
        height:         56,
        display:        'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Wordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#how-it-works" style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', textDecoration: 'none' }}
            className="hidden sm:block hover:text-white transition-colors">How it works</a>
          <a href="#pricing" style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', textDecoration: 'none' }}
            className="hidden sm:block hover:text-white transition-colors">Pricing</a>
          <Link to="/auth/signin" style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', textDecoration: 'none' }}
            className="hover:text-white transition-colors">Sign in</Link>
          <Link to="/auth/signup" style={{
            fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
            color: '#0A0A10', background: '#22C55E',
            padding: '7px 16px', borderRadius: 6, textDecoration: 'none',
          }}
            className="hover:brightness-110 transition-all">Start free</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '104px 28px 80px', background: '#0A0A10', position: 'relative', overflow: 'hidden' }}>
        {/* ambient glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '58%', transform: 'translate(-50%,0)',
          width: 640, height: 360, background: 'rgba(34,197,94,0.035)',
          borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}
          className="lg:grid-cols-2">

          {/* Left */}
          <div>
            <h1 style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700, textTransform: 'uppercase',
              fontSize:      'clamp(52px,6vw,82px)', lineHeight: 0.95,
              color:         '#fff', letterSpacing: '-0.01em',
              marginBottom:  20,
            }}>
              Find winning<br />
              products<br />
              <span style={{ color: '#22C55E' }}>before</span> the<br />
              market does
            </h1>

            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: '#9CA3AF', lineHeight: 1.72, maxWidth: 420, marginBottom: 36 }}>
              Tell us your budget and goals. We scan thousands of products across Temu, AliExpress and Alibaba, then calculate exactly what you'd make selling on Amazon, eBay, Etsy or Shopify.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 40px' }}>
              {([
                { v: '1,200+', l: 'Entrepreneurs' },
                { v: '30s',    l: 'Avg. report time' },
                { v: '4',      l: 'Platforms covered' },
                { v: '£10',    l: 'Pro per month' },
              ] as const).map(({ v, l }) => (
                <div key={l}>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 22, color: '#fff', lineHeight: 1 }}>{v}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#6B7280', marginTop: 4 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: quiz card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ ...CARD, width: '100%', maxWidth: 400 }}>

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <Logo size={22} />
                <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: '#D1D5DB' }}>
                  Find your product
                </span>
              </div>

              <div style={{ padding: 20 }}>
                {quizStep !== 'email' ? (
                  <div className="animate-fadeIn">
                    <QuizProgress step={step} total={STEPS} />
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 12 }}>
                      {QUIZ_QUESTIONS[(quizStep as number) - 1].title}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {QUIZ_QUESTIONS[(quizStep as number) - 1].options.map(opt => (
                        <QuizOption
                          key={opt.id} option={opt}
                          selected={currentValue === opt.id}
                          onClick={() => handleSelect(opt.id)}
                        />
                      ))}
                    </div>
                    {(quizStep as number) > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuizStep((quizStep as number) - 1)}
                        style={{
                          marginTop: 12, display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#6B7280',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                      >
                        <ChevronLeft style={{ width: 12, height: 12 }} />
                        Back
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="animate-fadeIn">
                    <QuizProgress step={step} total={STEPS} />
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 4 }}>
                      Almost there
                    </p>
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
                      Enter your email to see your free report.
                    </p>
                    <input
                      type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#fff',
                        background: 'rgba(255,255,255,0.04)',
                        border: emailTouched && !emailValid ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 8, padding: '10px 14px',
                        outline: 'none', marginBottom: 4,
                      }}
                    />
                    {emailTouched && !emailValid && (
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#EF4444', marginBottom: 8 }}>
                        Please enter a valid email.
                      </p>
                    )}
                    <div style={{ marginBottom: 14 }} />
                    <button
                      type="submit" disabled={isSubmitting}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#0A0A10',
                        background: '#22C55E', border: 'none', borderRadius: 8,
                        padding: '11px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      {isSubmitting
                        ? <div style={{ width: 16, height: 16, border: '2px solid #0A0A10', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                        : <><span>Get My Free Report</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 10 }}>
                      2 free reports · No credit card required
                    </p>
                    <button
                      type="button" onClick={() => setQuizStep(STEPS)}
                      style={{
                        marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', marginRight: 'auto',
                        fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#6B7280',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      }}
                    >
                      <ChevronLeft style={{ width: 12, height: 12 }} />
                      Back
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <div style={{
        background:   '#13131B',
        borderTop:    '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding:      '16px 28px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 32px' }}>
          {[
            'Temu · AliExpress · Alibaba',
            'Amazon · eBay · Etsy · Shopify',
            'AI analysis in under 30 seconds',
            'No credit card to start',
          ].map(t => (
            <span key={t} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#6B7280' }}>
              <span style={{ color: '#22C55E', marginRight: 6 }}>✓</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 28px', background: '#0A0A10' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(32px,4vw,52px)',
            color: '#fff', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            From question to report<br />in three steps
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#9CA3AF', textAlign: 'center', maxWidth: 460, margin: '0 auto 64px', lineHeight: 1.7 }}>
            No spreadsheets. No hours of research. Answer a few questions and let us do the work.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 40 }}>
            {STEPS_DATA.map(({ n, icon: Icon, title, desc }) => (
              <div key={n}>
                <p style={{
                  fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                  fontWeight: 700, fontSize: 72, lineHeight: 1,
                  color: 'rgba(34,197,94,0.07)', marginBottom: 16, userSelect: 'none',
                }}>{n}</p>
                <div style={{
                  display: 'inline-flex', padding: '9px', borderRadius: 9, marginBottom: 14,
                  background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.13)',
                }}>
                  <Icon style={{ width: 18, height: 18, color: '#22C55E' }} />
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 8 }}>{title}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample report ────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', background: '#13131B', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(32px,4vw,52px)',
            color: '#fff', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            What every report looks like
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#9CA3AF', textAlign: 'center', maxWidth: 440, margin: '0 auto 56px', lineHeight: 1.7 }}>
            Real data, not generic advice. Every report is generated fresh from live marketplace listings.
          </p>

          <div style={{ ...CARD, maxWidth: 660, margin: '0 auto', padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Home &amp; Gadgets
                </p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 16, color: '#fff' }}>
                  Portable LED Ring Light
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge label="OPP"  value="8.4" />
                <Badge label="RISK" value="3.1" risk />
              </div>
            </div>

            {/* Metric tiles */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <Tile label="Buy price"  value="$2.40"  sub="Temu · MOQ 50" />
              <Tile label="Avg. sell"  value="$24.99" sub="Amazon" />
              <Tile label="Net margin" value="58%"    sub="After all fees" accent />
            </div>

            {/* Sparkline */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  12-week search trend
                </p>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: '#22C55E' }}>+31%</p>
              </div>
              <Sparkline />
            </div>

            {/* Platform bars */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Platform opportunity
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PlatBar name="Amazon" pct={82} />
                <PlatBar name="eBay"   pct={71} />
                <PlatBar name="Etsy"   pct={58} />
              </div>
            </div>

            {/* AI analysis — partial reveal */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ padding: 6, borderRadius: 6, background: 'rgba(34,197,94,0.07)' }}>
                  <Zap style={{ width: 12, height: 12, color: '#22C55E' }} />
                </div>
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Analysis
                </span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 9, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                  Pro · GPT-4o
                </span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.72, marginBottom: 10 }}>
                The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the rise of short-form video content on TikTok and Instagram Reels…
              </p>
              <div style={{ filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.72 }}>
                  The primary risk is moderate market saturation — approximately 4,200 competing listings on Amazon. Differentiation through bundle offers and premium packaging can command a 15–20% price premium over generic competitors in this category.
                </p>
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to bottom,transparent 20%,rgba(19,19,27,0.97) 65%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
                top: '60%',
              }}>
                <Link to="/pricing" style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, color: '#22C55E',
                  background: '#13131B', border: '1px solid rgba(34,197,94,0.22)',
                  padding: '7px 18px', borderRadius: 9999, textDecoration: 'none',
                }}>
                  Unlock full analysis with Pro →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', background: '#0A0A10', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(32px,4vw,52px)',
            color: '#fff', textAlign: 'center', marginBottom: 56, letterSpacing: '-0.01em',
          }}>
            Everything in one report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ ...CARD, padding: 24 }}>
                <div style={{
                  display: 'inline-flex', padding: 9, borderRadius: 8, marginBottom: 16,
                  background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.12)',
                }}>
                  <Icon style={{ width: 16, height: 16, color: '#22C55E' }} />
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 8 }}>{title}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 28px', background: '#13131B', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(32px,4vw,52px)',
            color: '#fff', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            Simple pricing
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#9CA3AF', textAlign: 'center', maxWidth: 380, margin: '0 auto 56px', lineHeight: 1.7 }}>
            Two free ideas to prove the value. Then £10 a month for everything.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 680, margin: '0 auto' }}>

            {/* Free */}
            <div style={{ ...CARD, padding: 32 }}>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Free
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: '#fff', lineHeight: 1 }}>£0</span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#6B7280', marginLeft: 4 }}>/forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['2 free ideas (lifetime)','1-paragraph AI summary','Margin calculator','Best platform only'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#D1D5DB' }}>
                    <Check style={{ width: 15, height: 15, color: '#22C55E', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '11px 20px',
              }}>Get started free</Link>
            </div>

            {/* Pro */}
            <div style={{ background: '#0F1C14', border: '1px solid rgba(34,197,94,0.28)', borderRadius: 14, padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 10,
                  color: '#0A0A10', background: '#22C55E',
                  padding: '4px 10px', borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Zap style={{ width: 10, height: 10 }} />Most popular
                </span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 11, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Pro
              </p>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: '#fff', lineHeight: 1 }}>£10</span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#6B7280', marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: 'rgba(34,197,94,0.65)', marginBottom: 24 }}>Less than £0.35 per idea</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '20 fresh ideas per week',
                  'Full 5-paragraph GPT-4o analysis',
                  'All 4 platform comparisons',
                  'Trend charts & 6-month data',
                  'Interactive margin calculator',
                  'Full report history',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#D1D5DB' }}>
                    <Check style={{ width: 15, height: 15, color: '#22C55E', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                color: '#0A0A10', background: '#22C55E', borderRadius: 8, padding: '12px 20px',
              }}>Subscribe — £10/mo</Link>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 10 }}>Cancel anytime</p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/pricing" style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#6B7280', textDecoration: 'none' }}
              className="hover:text-white transition-colors">
              See full feature comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', background: '#0A0A10', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(32px,4vw,48px)',
            color: '#fff', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.01em',
          }}>
            Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { q: 'How accurate is the data?',
                a: 'Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy.' },
              { q: "What's the difference between free and Pro?",
                a: 'Free gives you 2 lifetime ideas with a short 1-paragraph summary and your best platform only. Pro gives you 20 ideas every week with a full 5-paragraph GPT-4o report, all 4 platform comparisons, and 6-month trend charts.' },
              { q: 'How is this different from just searching Google?',
                a: "We pull buy-side and sell-side data simultaneously, calculate your actual margin after all fees and shipping, show you 6 months of trend data, and generate a written analysis — all in under 30 seconds. Google can't tell you your margin on a specific product." },
              { q: 'Can I cancel Pro anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked.' },
              { q: 'What platforms do you cover?',
                a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each.' },
            ].map(({ q, a }) => (
              <details key={q} className="group" style={{ background: '#13131B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                <summary style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: '#D1D5DB',
                  padding: '14px 18px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {q}
                  <span style={{ color: '#6B7280', flexShrink: 0, marginLeft: 12 }} className="group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.72, padding: '0 18px 14px' }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', background: '#13131B', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Logo size={52} />
          </div>
          <h2 style={{
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.97,
            color: '#fff', marginBottom: 18, letterSpacing: '-0.01em',
          }}>
            Ready to find your<br />next big idea?
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#9CA3AF', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join 1,200+ entrepreneurs using The Big Idea to find profitable products. Start free — no credit card needed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                color: '#0A0A10', background: '#22C55E', textDecoration: 'none',
                padding: '13px 32px', borderRadius: 8,
              }}
            >
              Start for free
              <ArrowRight style={{ width: 16, height: 16 }} />
            </a>
            <Link to="/pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', textDecoration: 'none',
            }} className="hover:text-white transition-colors">
              See Pro features →
            </Link>
          </div>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#374151', marginTop: 20 }}>
            2 free ideas · No credit card · Takes 60 seconds
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        background:  '#050810',
        borderTop:   '1px solid rgba(255,255,255,0.05)',
        padding:     '20px 28px',
        display:     'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <Wordmark />
        <div style={{ display: 'flex', gap: 20 }}>
          {([
            { label: 'How it works', href: '#how-it-works', a: true  },
            { label: 'Pricing',      href: '/pricing',      a: false },
            { label: 'Sign in',      href: '/auth/signin',  a: false },
            { label: 'Sign up',      href: '/auth/signup',  a: false },
          ] as const).map(({ label, href, a }) =>
            a
              ? <a key={label} href={href}  style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#6B7280', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
              : <Link key={label} to={href} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#6B7280', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</Link>
          )}
        </div>
        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#374151' }}>
          © {new Date().getFullYear()} The Big Idea
        </p>
      </footer>
    </div>
  )
}
