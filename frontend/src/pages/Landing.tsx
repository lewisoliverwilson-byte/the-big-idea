import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import {
  ArrowRight, ChevronLeft, Check,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'

// ─── Brand ────────────────────────────────────────────────────────────────────
// Div-based logo — ensures Barlow Condensed renders after Google Fonts load.
// SVG <text> is unreliable when the font hasn't painted yet.

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      aria-label="Sourcery"
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{
        width:         size,
        height:        size,
        background:    '#4F46E5',
        borderRadius:  Math.round(size * 0.22),
        fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:    700,
        fontSize:      Math.round(size * 0.58),
        color:         '#fff',
        letterSpacing: '-0.02em',
        lineHeight:    1,
      }}
    >
      S
    </div>
  )
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2 select-none">
      <Logo size={28} />
      <span style={{
        fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:    700,
        fontSize:      20,
        color:         '#0F172A',
        letterSpacing: '-0.01em',
        lineHeight:    1,
      }}>
        Sourcery
      </span>
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

// ─── Quiz sub-components (light mode) ────────────────────────────────────────

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 8,
        fontFamily: '"DM Mono",monospace', fontSize: 11, color: '#94A3B8',
      }}>
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 9999, background: '#E2E8F0' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: '#4F46E5', transition: 'width 0.4s ease-out',
        }} />
      </div>
    </div>
  )
}

function QuizOpt({ option, selected, onClick }: {
  option: QuizOption; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 14px', borderRadius: 10,
        background: selected ? '#EEF2FF' : '#FAFAFA',
        border: `1.5px solid ${selected ? '#4F46E5' : '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 140ms',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{option.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
          color: selected ? '#4F46E5' : '#0F172A', margin: 0,
        }}>
          {option.label}
        </p>
        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#4F46E5',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check style={{ width: 10, height: 10, color: '#fff' }} />
        </div>
      )}
    </button>
  )
}

// ─── Sample report card components (dark preview) ─────────────────────────────

function Sparkline() {
  const vals = [32, 37, 35, 42, 41, 49, 54, 57, 63, 72, 84, 100]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {vals.map((h, i) => {
        const op = (0.18 + (i / 11) * 0.82).toFixed(2)
        return (
          <div
            key={i}
            style={{
              height: `${h}%`, width: 7, borderRadius: 2, flexShrink: 0,
              backgroundColor: `rgba(99,102,241,${op})`,
            }}
          />
        )
      })}
    </div>
  )
}

function Tile({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean
}) {
  return (
    <div style={{ flex: 1, borderRadius: 8, padding: 10, background: '#060A17', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 17, color: accent ? '#818CF8' : '#fff', lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: accent ? '#818CF8' : '#6B7280', margin: '3px 0 0' }}>
        {sub}
      </p>
    </div>
  )
}

function Badge({ label, value, risk = false }: { label: string; value: string; risk?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, padding: '4px 8px',
      background: risk ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.10)',
      border:     risk ? '1px solid rgba(245,158,11,0.20)' : '1px solid rgba(99,102,241,0.22)',
    }}>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, letterSpacing: '0.06em', fontWeight: 700, color: risk ? '#F59E0B' : '#818CF8' }}>
        {label}
      </span>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 13, color: risk ? '#F59E0B' : '#818CF8' }}>
        {value}
      </span>
    </div>
  )
}

function PlatBar({ name, pct }: { name: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#9CA3AF', width: 44, flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: `rgba(99,102,241,${(0.28 + pct / 100 * 0.72).toFixed(2)})` }} />
      </div>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: '#6B7280', width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ─── Section content ──────────────────────────────────────────────────────────

const HOW_STEPS = [
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
  { icon: Zap,         title: 'AI market analysis',  desc: 'GPT-4o writes a full opportunity analysis, competitive overview, and recommended strategy tailored to your inputs.' },
  { icon: TrendingUp,  title: '6-month trend data',  desc: 'See whether a product is rising, falling, or seasonal before you commit a single penny.' },
  { icon: DollarSign,  title: 'Margin calculator',   desc: 'Source price, shipping, and platform fees all factored in. Profit per unit at 50, 100, and 200 units.' },
  { icon: BarChart2,   title: 'Platform comparison', desc: 'Amazon vs eBay vs Etsy vs Shopify — margins, fees, monthly sales estimates, and difficulty side by side.' },
  { icon: Globe,       title: 'Direct source links', desc: 'One-click through to the exact listing on Temu, AliExpress, or Alibaba. No searching required.' },
  { icon: ShieldCheck, title: 'Risk scoring',        desc: 'Saturated niches, downward trends, and high MOQ risk flagged before you spend anything.' },
]

// Dark card for report preview
const DARK_CARD: CSSProperties = {
  background:   '#111827',
  border:       '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Landing() {
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [quizStep,     setQuizStep]     = useState<number | 'email'>(1)
  const [answers,      setAnswers]      = useState<{
    budget: string | null; unitSize: string | null; category: string | null
    platform: string | null; goal: string | null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [email,        setEmail]        = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answerKeys   = ['budget', 'unitSize', 'category', 'platform', 'goal'] as const
  const currentValue = quizStep === 'email' ? null : answers[answerKeys[(quizStep as number) - 1]]

  const handleSelect = useCallback((val: string) => {
    const key = answerKeys[(quizStep as number) - 1]
    setAnswers(prev => ({ ...prev, [key]: val }))
    setTimeout(() => {
      if ((quizStep as number) < STEPS) setQuizStep(q => (q as number) + 1)
      else setQuizStep('email')
    }, 180)
  }, [quizStep]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Outfit,sans-serif' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F1F5F9',
        padding: '0 28px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Wordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a
            href="#how-it-works"
            style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', textDecoration: 'none' }}
            className="hidden sm:block hover:text-slate-900 transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', textDecoration: 'none' }}
            className="hidden sm:block hover:text-slate-900 transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/auth/signin"
            style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', textDecoration: 'none' }}
            className="hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth/signup"
            style={{
              fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
              color: '#fff', background: '#4F46E5',
              padding: '7px 16px', borderRadius: 7, textDecoration: 'none',
            }}
            className="hover:brightness-110 transition-all"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        paddingLeft: 24, paddingRight: 24,
        background: 'radial-gradient(ellipse 800px 500px at 50% 70%, rgba(79,70,229,0.05) 0%, transparent 70%), #fff',
        textAlign: 'center',
      }}>

        {/* Social proof badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'Outfit,sans-serif', fontSize: 12, fontWeight: 500, color: '#4F46E5',
            background: '#EEF2FF', border: '1px solid #C7D2FE',
            padding: '5px 14px', borderRadius: 9999,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5', display: 'inline-block', flexShrink: 0 }} />
            Trusted by 1,200+ entrepreneurs
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
          fontWeight:    700,
          textTransform: 'uppercase',
          fontSize:      'clamp(52px,7vw,88px)',
          lineHeight:    0.95,
          letterSpacing: '-0.01em',
          color:         '#0F172A',
          marginBottom:  24,
        }}>
          Source smarter.<br />
          <span style={{ color: '#4F46E5' }}>Sell more.</span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontFamily: 'Outfit,sans-serif', fontSize: 17, color: '#64748B',
          lineHeight: 1.68, maxWidth: 520, margin: '0 auto 40px',
        }}>
          Find profitable products to dropship in under 30 seconds.
          AI-powered market research across Amazon, eBay, Etsy and Shopify.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '8px 40px', marginBottom: 52,
        }}>
          {([
            { v: '1,200+', l: 'Entrepreneurs' },
            { v: '30s',    l: 'Avg. report time' },
            { v: '4',      l: 'Platforms covered' },
            { v: '£10',    l: 'Pro per month' },
          ] as const).map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 24, color: '#0F172A', lineHeight: 1, margin: 0 }}>{v}</p>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* ── Quiz card ── */}
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 8px 24px rgba(79,70,229,0.06)',
            padding: 28,
            textAlign: 'left',
          }}>
            {quizStep !== 'email' ? (
              <div key={`step-${quizStep}`} className="animate-fadeIn">
                <QuizProgress step={step} total={STEPS} />
                <p style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15,
                  color: '#0F172A', margin: '0 0 14px',
                }}>
                  {QUIZ_QUESTIONS[(quizStep as number) - 1].title}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QUIZ_QUESTIONS[(quizStep as number) - 1].options.map(opt => (
                    <QuizOpt
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
                      marginTop: 14, display: 'flex', alignItems: 'center', gap: 4,
                      fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#94A3B8',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <ChevronLeft style={{ width: 13, height: 13 }} />
                    Back
                  </button>
                )}
              </div>
            ) : (
              <form key="email" onSubmit={handleEmailSubmit} className="animate-fadeIn">
                <QuizProgress step={step} total={STEPS} />
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: '#0F172A', margin: '0 0 4px' }}>
                  Almost there
                </p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', margin: '0 0 18px' }}>
                  Enter your email to see your personalised free report.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#0F172A',
                    background: '#F8FAFC',
                    border: `1.5px solid ${emailTouched && !emailValid ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: 10, padding: '11px 14px',
                    outline: 'none', transition: 'border-color 150ms',
                    marginBottom: emailTouched && !emailValid ? 4 : 0,
                  }}
                  onFocus={e  => { e.target.style.borderColor = '#4F46E5' }}
                  onBlur={e   => { e.target.style.borderColor = emailTouched && !emailValid ? '#EF4444' : '#E2E8F0' }}
                />
                {emailTouched && !emailValid && (
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#EF4444', margin: '0 0 4px' }}>
                    Please enter a valid email address.
                  </p>
                )}
                <div style={{ height: 14 }} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#fff',
                    background: '#4F46E5', border: 'none', borderRadius: 10,
                    padding: '12px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                    opacity: isSubmitting ? 0.65 : 1, transition: 'opacity 150ms',
                  }}
                >
                  {isSubmitting
                    ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                    : <><span>Get My Free Report</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                </button>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 10 }}>
                  2 free reports · No credit card required
                </p>
                <button
                  type="button"
                  onClick={() => setQuizStep(STEPS)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    margin: '8px auto 0',
                    fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#94A3B8',
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
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <div style={{
        background: '#F8FAFC',
        borderTop: '1px solid #F1F5F9',
        borderBottom: '1px solid #F1F5F9',
        padding: '14px 24px',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 28px',
        }}>
          {[
            'Temu · AliExpress · Alibaba',
            'Amazon · eBay · Etsy · Shopify',
            'AI analysis in under 30 seconds',
            'No credit card to start',
          ].map(t => (
            <span key={t} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#64748B' }}>
              <span style={{ color: '#4F46E5', marginRight: 6 }}>✓</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,50px)',
            color: '#0F172A', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            From question to report<br />in three steps
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: '#64748B', textAlign: 'center', maxWidth: 460, margin: '0 auto 64px', lineHeight: 1.7 }}>
            No spreadsheets. No hours of research. Answer five questions and let us do the work.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 48 }}>
            {HOW_STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n}>
                <p style={{
                  fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                  fontWeight: 700, fontSize: 80, lineHeight: 1,
                  color: 'rgba(79,70,229,0.08)', marginBottom: 12, userSelect: 'none',
                }}>{n}</p>
                <div style={{
                  display: 'inline-flex', padding: 9, borderRadius: 9, marginBottom: 14,
                  background: '#EEF2FF', border: '1px solid #C7D2FE',
                }}>
                  <Icon style={{ width: 18, height: 18, color: '#4F46E5' }} />
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: '#0F172A', marginBottom: 8 }}>{title}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample report ────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,50px)',
            color: '#0F172A', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            What every report looks like
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: '#64748B', textAlign: 'center', maxWidth: 440, margin: '0 auto 56px', lineHeight: 1.7 }}>
            Real data, not generic advice. Every report is generated fresh from live marketplace listings.
          </p>

          {/* Dark card preview */}
          <div style={{ ...DARK_CARD, maxWidth: 660, margin: '0 auto', padding: 24 }}>
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
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: '#818CF8' }}>+31%</p>
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
                <div style={{ padding: 6, borderRadius: 6, background: 'rgba(99,102,241,0.09)' }}>
                  <Zap style={{ width: 12, height: 12, color: '#818CF8' }} />
                </div>
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Analysis
                </span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 9, fontWeight: 600, color: '#818CF8', background: 'rgba(99,102,241,0.09)', padding: '2px 8px', borderRadius: 9999 }}>
                  Pro · GPT-4o
                </span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.72, marginBottom: 10 }}>
                The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the rise of short-form video content on TikTok and Instagram Reels…
              </p>
              <div style={{ filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.72 }}>
                  The primary risk is moderate market saturation — approximately 4,200 competing listings on Amazon. Differentiation through bundle offers and premium packaging can command a 15–20% price premium over generic competitors.
                </p>
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to bottom, transparent 20%, rgba(17,24,39,0.97) 65%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
                top: '55%',
              }}>
                <Link
                  to="/pricing"
                  style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, color: '#818CF8',
                    background: '#111827', border: '1px solid rgba(99,102,241,0.25)',
                    padding: '7px 18px', borderRadius: 9999, textDecoration: 'none',
                  }}
                >
                  Unlock full analysis with Pro →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,50px)',
            color: '#0F172A', textAlign: 'center', marginBottom: 56, letterSpacing: '-0.01em',
          }}>
            Everything in one report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24 }}>
                <div style={{
                  display: 'inline-flex', padding: 9, borderRadius: 8, marginBottom: 16,
                  background: '#EEF2FF', border: '1px solid #C7D2FE',
                }}>
                  <Icon style={{ width: 16, height: 16, color: '#4F46E5' }} />
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 8 }}>{title}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,50px)',
            color: '#0F172A', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            Simple pricing
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: '#64748B', textAlign: 'center', maxWidth: 380, margin: '0 auto 56px', lineHeight: 1.7 }}>
            Two free ideas to prove the value. Then £10 a month for everything.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 680, margin: '0 auto' }}>

            {/* Free card */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 32 }}>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Free
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: '#0F172A', lineHeight: 1 }}>£0</span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#94A3B8', marginLeft: 4 }}>/forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['2 free ideas (lifetime)', '1-paragraph AI summary', 'Margin calculator', 'Best platform only'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#374151' }}>
                    <Check style={{ width: 15, height: 15, color: '#4F46E5', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: '#374151',
                border: '1px solid #E2E8F0', borderRadius: 8, padding: '11px 20px',
              }}>
                Get started free
              </Link>
            </div>

            {/* Pro card */}
            <div style={{ background: '#EEF2FF', border: '2px solid #4F46E5', borderRadius: 14, padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <span style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 10,
                  color: '#fff', background: '#4F46E5',
                  padding: '4px 10px', borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Zap style={{ width: 10, height: 10 }} />Most popular
                </span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 11, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Pro
              </p>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: '#0F172A', lineHeight: 1 }}>£10</span>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#64748B', marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#4F46E5', marginBottom: 24, opacity: 0.8 }}>Less than £0.35 per idea</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '20 fresh ideas per week',
                  'Full 5-paragraph GPT-4o analysis',
                  'All 4 platform comparisons',
                  'Trend charts & 6-month data',
                  'Interactive margin calculator',
                  'Full report history',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#1E293B' }}>
                    <Check style={{ width: 15, height: 15, color: '#4F46E5', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                color: '#fff', background: '#4F46E5', borderRadius: 8, padding: '12px 20px',
              }}>
                Subscribe — £10/mo
              </Link>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 10 }}>Cancel anytime</p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24 }}>
            <Link
              to="/pricing"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
              className="hover:text-slate-600 transition-colors"
            >
              See full feature comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,48px)',
            color: '#0F172A', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.01em',
          }}>
            Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                q: 'How accurate is the data?',
                a: 'Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy.',
              },
              {
                q: "What's the difference between free and Pro?",
                a: 'Free gives you 2 lifetime ideas with a short 1-paragraph summary and your best platform only. Pro gives you 20 ideas every week with a full 5-paragraph GPT-4o report, all 4 platform comparisons, and 6-month trend charts.',
              },
              {
                q: 'How is this different from just searching Google?',
                a: "We pull buy-side and sell-side data simultaneously, calculate your actual margin after all fees and shipping, show you 6 months of trend data, and generate a written analysis — all in under 30 seconds. Google can't tell you your margin on a specific product.",
              },
              {
                q: 'Can I cancel Pro anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked.',
              },
              {
                q: 'What platforms do you cover?',
                a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                <summary style={{
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: '#0F172A',
                  padding: '14px 18px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {q}
                  <span style={{ color: '#94A3B8', flexShrink: 0, marginLeft: 12 }} className="group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.72, padding: '0 18px 14px' }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA (indigo) ────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: '#4F46E5', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {/* Logo on indigo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: Math.round(52 * 0.22),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight: 700, fontSize: 30, color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              S
            </div>
          </div>
          <h2 style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
            textTransform: 'uppercase', fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.97,
            color: '#fff', marginBottom: 18, letterSpacing: '-0.01em',
          }}>
            Ready to source<br />smarter?
          </h2>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join 1,200+ entrepreneurs finding profitable products with Sourcery. Start free — no credit card needed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                color: '#4F46E5', background: '#fff', textDecoration: 'none',
                padding: '13px 32px', borderRadius: 8,
              }}
            >
              Start for free
              <ArrowRight style={{ width: 16, height: 16 }} />
            </a>
            <Link
              to="/pricing"
              style={{
                display: 'inline-flex', alignItems: 'center',
                fontFamily: 'Outfit,sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              }}
              className="hover:text-white transition-colors"
            >
              See Pro features →
            </Link>
          </div>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
            2 free ideas · No credit card · Takes 60 seconds
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#0F172A',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 28px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Wordmark — white version for dark footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
          <div style={{
            width: 26, height: 26, background: '#4F46E5', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
            fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '-0.02em',
          }}>S</div>
          <span style={{
            fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
            fontWeight:    700, fontSize: 17, color: '#fff', letterSpacing: '-0.01em',
          }}>Sourcery</span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {([
            { label: 'How it works', href: '#how-it-works', isAnchor: true  },
            { label: 'Pricing',      href: '/pricing',      isAnchor: false },
            { label: 'Sign in',      href: '/auth/signin',  isAnchor: false },
            { label: 'Sign up',      href: '/auth/signup',  isAnchor: false },
          ] as const).map(({ label, href, isAnchor }) =>
            isAnchor
              ? <a   key={label} href={href}  style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#64748B', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
              : <Link key={label} to={href}   style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#64748B', textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</Link>
          )}
        </div>

        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: '#374151' }}>
          © {new Date().getFullYear()} Sourcery
        </p>
      </footer>
    </div>
  )
}
