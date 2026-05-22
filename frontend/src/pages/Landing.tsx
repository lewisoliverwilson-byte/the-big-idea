import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChevronLeft, Check,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe, Sparkles,
  Leaf, Briefcase, Package, Layers, Package2, Building2, Home, Gamepad2,
  Shuffle, ShoppingBag, Palette, HelpCircle, Flame,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'
import { Logo } from '../components/layout/Navbar'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#FFFFFF',
  bgSubtle: '#F8FAFC',
  border:   '#E2E8F0',
  borderFocus: '#6366F1',
  primary:  '#4F46E5',
  primaryH: '#4338CA',
  primaryL: '#EEF2FF',
  text:     '#0F172A',
  textSec:  '#475569',
  textMut:  '#94A3B8',
  success:  '#059669',
  warning:  '#D97706',
  error:    '#DC2626',
} as const

// ─── Storage helpers ──────────────────────────────────────────────────────────
export function getQuizFromStorage(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem('bigidea_quiz')
    return raw ? (JSON.parse(raw) as QuizAnswers) : null
  } catch { return null }
}
export function clearQuizFromStorage() { localStorage.removeItem('bigidea_quiz') }
function saveQuizToStorage(answers: Partial<QuizAnswers>) {
  localStorage.setItem('bigidea_quiz', JSON.stringify(answers))
}

// ─── Brand ────────────────────────────────────────────────────────────────────
function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize  = size === 'sm' ? 18 : size === 'lg' ? 32 : 24
  const fontSize  = size === 'sm' ? 14 : size === 'lg' ? 22 : 17
  return (
    <div className="flex items-center gap-2 select-none">
      <Logo size={iconSize} />
      <span style={{
        fontFamily:    'Inter, system-ui, sans-serif',
        fontWeight:    700,
        fontSize,
        letterSpacing: '-0.02em',
        lineHeight:    1,
        color:         C.text,
      }}>
        Sorcery
      </span>
    </div>
  )
}

// ─── Quiz data ────────────────────────────────────────────────────────────────
const STEPS = 5

interface QuizOption { id: string; icon: LucideIcon; label: string; sublabel: string }

const QUIZ_QUESTIONS: { step: number; title: string; options: QuizOption[] }[] = [
  {
    step: 1, title: "What's your starting budget?",
    options: [
      { id: '175',  icon: Leaf,       label: '£100 – £250',   sublabel: 'Just getting started' },
      { id: '375',  icon: TrendingUp, label: '£250 – £500',   sublabel: 'Ready to invest' },
      { id: '1000', icon: Briefcase,  label: '£500 – £1,500', sublabel: 'Serious about this' },
      { id: '2000', icon: Zap,        label: '£1,500+',       sublabel: 'All in' },
    ],
  },
  {
    step: 2, title: 'How much storage do you have?',
    options: [
      { id: 'small',  icon: Package,   label: 'Small',    sublabel: 'Bag or jiffy bag' },
      { id: 'medium', icon: Layers,    label: 'Medium',   sublabel: 'Shoebox size' },
      { id: 'large',  icon: Package2,  label: 'Large',    sublabel: 'Takes up a shelf' },
      { id: 'xlarge', icon: Building2, label: 'Any size', sublabel: "I'll use a fulfilment centre" },
    ],
  },
  {
    step: 3, title: 'What products interest you?',
    options: [
      { id: 'Home & Garden',   icon: Home,     label: 'Home & Gadgets',  sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health', icon: Sparkles, label: 'Beauty & Health', sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',    icon: Gamepad2, label: 'Toys & Hobbies',  sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',   icon: Shuffle,  label: 'Surprise me',     sublabel: 'Best opportunity wins' },
    ],
  },
  {
    step: 4, title: 'Where do you want to sell?',
    options: [
      { id: 'amazon', icon: Package,     label: 'Amazon',       sublabel: 'Biggest marketplace' },
      { id: 'ebay',   icon: ShoppingBag, label: 'eBay',         sublabel: 'Great for unique items' },
      { id: 'etsy',   icon: Palette,     label: 'Etsy',         sublabel: 'Niche & creative products' },
      { id: 'any',    icon: HelpCircle,  label: "I'm not sure", sublabel: 'Show me the best option' },
    ],
  },
  {
    step: 5, title: "What's your main goal?",
    options: [
      { id: 'volume',   icon: Zap,         label: 'Quick wins',        sublabel: 'Fast-selling, high volume' },
      { id: 'margin',   icon: DollarSign,  label: 'Big margins',       sublabel: 'Fewer sales, higher profit' },
      { id: 'trending', icon: Flame,       label: 'Trending products', sublabel: 'Only upward-momentum items' },
      { id: 'safe',     icon: ShieldCheck, label: 'Low risk',          sublabel: 'Safe, proven products' },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: C.primary, background: C.primaryL, border: '1px solid #C7D2FE',
      borderRadius: 99, padding: '4px 12px', marginBottom: 14,
    }}>
      {children}
    </span>
  )
}

function FadeUp({ children, delay = 0, className, style }: {
  children: ReactNode; delay?: number; className?: string; style?: CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 11, color: C.textMut }}>
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: C.primary, transition: 'width 0.35s ease-out',
        }} />
      </div>
    </div>
  )
}

function QuizOpt({ option, selected, onClick }: { option: QuizOption; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: 8,
        background: selected ? C.primaryL : '#FFFFFF',
        border: `1.5px solid ${selected ? C.primary : C.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 130ms',
        boxShadow: selected ? `0 0 0 3px rgba(79,70,229,0.08)` : 'none',
      }}
    >
      <option.icon style={{ width: 14, height: 14, flexShrink: 0, color: selected ? C.primary : C.textMut }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 13, color: selected ? C.primary : C.text, margin: 0 }}>
          {option.label}
        </p>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textMut, margin: '2px 0 0' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div style={{
          width: 17, height: 17, borderRadius: '50%', background: C.primary,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check style={{ width: 9, height: 9, color: '#fff' }} />
        </div>
      )}
    </button>
  )
}

// ─── Report preview sub-components ───────────────────────────────────────────
function Sparkline() {
  const vals = [32, 37, 35, 42, 41, 49, 54, 57, 63, 72, 84, 100]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {vals.map((h, i) => (
        <div key={i} style={{
          height: `${h}%`, width: 7, borderRadius: 2, flexShrink: 0,
          background: `rgb(${Math.round(79 + i * 8)},${Math.round(70 + i * 5)},${Math.round(229 - i * 10)})`,
          opacity: 0.5 + (i / 11) * 0.5,
        }} />
      ))}
    </div>
  )
}

function MetricTile({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, borderRadius: 8, padding: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 17, fontWeight: 700, color: accent ? C.primary : C.text, lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, color: accent ? C.primary : C.textMut, margin: '3px 0 0' }}>
        {sub}
      </p>
    </div>
  )
}

function ScoreBadge({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, padding: '4px 8px',
      background: warn ? '#FFFBEB' : C.primaryL,
      border:     warn ? '1px solid #FDE68A' : '1px solid #C7D2FE',
    }}>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 9, fontWeight: 700, color: warn ? C.warning : C.primary }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 700, color: warn ? C.warning : C.primary }}>
        {value}
      </span>
    </div>
  )
}

function PlatformBar({ name, pct }: { name: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textSec, width: 44, flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: C.primary, opacity: 0.7 + pct / 100 * 0.3 }} />
      </div>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textMut, width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n: '01', icon: Sparkles,
    title: 'Tell us your criteria',
    desc: 'Budget, storage, category, platform, and goal. Five questions, under 60 seconds. Your inputs shape every recommendation.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We scan the markets',
    desc: 'Buy prices from Temu, AliExpress and Alibaba cross-referenced against Amazon, eBay, Etsy and Shopify. 1,000+ products, instantly.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Your report is ready',
    desc: 'AI analysis, 6-month trend charts, exact margin breakdown, and direct buy links — delivered in under 30 seconds.',
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

// ─── Section divider ─────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: C.border, maxWidth: 1100, margin: '0 auto' }} />
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Landing() {
  const navigate                  = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const isPro       = user?.subscriptionStatus === 'active'
  const freeUsed    = user?.reportsUsedFree ?? 0
  const freeAtLimit = isAuthenticated && !isPro && freeUsed >= 2

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
    const key        = answerKeys[(quizStep as number) - 1]
    const nextAnswers = { ...answers, [key]: val }
    setAnswers(nextAnswers)
    setTimeout(() => {
      if ((quizStep as number) < STEPS) {
        setQuizStep(q => (q as number) + 1)
      } else if (isAuthenticated) {
        const qa: QuizAnswers = {
          budgetGbp: parseInt(nextAnswers.budget  || '375'),
          unitSize:  (nextAnswers.unitSize || 'medium') as QuizAnswers['unitSize'],
          category:  nextAnswers.category || 'No preference',
          platform:  nextAnswers.platform || 'any',
          goal:      (nextAnswers.goal || 'safe') as QuizAnswers['goal'],
        }
        saveQuizToStorage(qa)
        navigate('/dashboard')
      } else {
        setQuizStep('email')
      }
    }, 160)
  }, [quizStep, answers, isAuthenticated, navigate]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: C.text }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Wordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href="#how-it-works"
            className="hidden sm:flex"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '8px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F1F5F9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            How it works
          </a>
          <a href="#pricing"
            className="hidden sm:flex"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '8px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F1F5F9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            Pricing
          </a>
          <Link to="/auth/signin"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '8px 12px', borderRadius: 7 }}
            className="hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link to="/auth/signup" style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 13,
            color: '#fff', background: C.primary,
            padding: '8px 16px', borderRadius: 7, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', transition: 'background 0.12s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primaryH)}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primary)}
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop:    56,
        paddingBottom: 64,
        paddingLeft:   24,
        paddingRight:  24,
        minHeight:     '100vh',
        display:       'flex',
        alignItems:    'center',
        background:    C.bg,
      }}>
        <div
          className="flex flex-col lg:flex-row items-center"
          style={{ maxWidth: 1120, width: '100%', margin: '0 auto', gap: 56 }}
        >
          {/* ── Left: text ── */}
          <div
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            style={{ flex: '1 1 420px', minWidth: 0 }}
          >
            <div style={{ marginBottom: 20 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                color: C.primary, background: C.primaryL, border: '1px solid #C7D2FE',
                borderRadius: 99, padding: '5px 14px',
              }}>
                AI-Powered Product Research
              </span>
            </div>

            <h1 style={{
              fontWeight:    800,
              fontSize:      'clamp(34px,5vw,60px)',
              lineHeight:    1.1,
              letterSpacing: '-0.03em',
              color:         C.text,
              marginBottom:  20,
            }}>
              Find winning<br />
              products to sell<br />
              <span style={{ color: C.primary }}>in 30 seconds</span>
            </h1>

            <p style={{
              fontSize: 16, color: C.textSec,
              lineHeight: 1.65, maxWidth: 460, marginBottom: 36,
            }}>
              Answer five questions. Our AI scans 1,000+ products across Temu, AliExpress and Alibaba — then calculates your exact margin on Amazon, eBay, Etsy and Shopify.
            </p>

            {/* Stats */}
            <div
              className="flex flex-wrap justify-center lg:justify-start"
              style={{ gap: '10px 32px' }}
            >
              {([
                { v: '1,200+', l: 'Entrepreneurs' },
                { v: '30s',    l: 'Avg. report time' },
                { v: '4',      l: 'Platforms' },
                { v: '£10',    l: 'Pro/month' },
              ] as const).map(({ v, l }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: C.primary, margin: 0, letterSpacing: '-0.02em' }}>{v}</p>
                  <p style={{ fontSize: 11, color: C.textMut, margin: '3px 0 0' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Quiz card ── */}
          <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 480 }}>
            <div style={{
              background:   '#FFFFFF',
              border:       `1px solid ${C.border}`,
              borderRadius: 16,
              boxShadow:    '0 4px 24px 0 rgba(15,23,42,0.08), 0 1px 3px 0 rgba(15,23,42,0.06)',
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
                background: '#FAFAFA', borderRadius: '16px 16px 0 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <BarChart2 style={{ width: 13, height: 13, color: C.primary }} />
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: C.textSec, textTransform: 'uppercase' }}>
                    Find Products
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#FCA5A5', '#FCD34D', '#6EE7B7'].map((c, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  ))}
                </div>
              </div>

              <div style={{ padding: 20 }}>
                {/* Pro user */}
                {isPro ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>Welcome back</p>
                    <p style={{ fontSize: 13, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
                      Your dashboard is ready. Run a new search or browse your report history.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff',
                        background: C.primary, border: 'none', borderRadius: 9,
                        padding: '11px 16px', cursor: 'pointer', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primaryH)}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primary)}
                    >
                      Go to Dashboard
                      <ArrowRight style={{ width: 15, height: 15 }} />
                    </button>
                  </div>

                ) : freeAtLimit ? (
                  /* Free limit reached */
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>Free reports used</p>
                    <p style={{ fontSize: 13, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
                      You've used both free reports. Upgrade to Pro for 20 fresh reports every week, full AI analysis, and all 4 platforms.
                    </p>
                    <button
                      onClick={() => navigate('/pricing')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff',
                        background: C.primary, border: 'none', borderRadius: 9,
                        padding: '11px 16px', cursor: 'pointer', marginBottom: 10,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primaryH)}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = C.primary)}
                    >
                      Upgrade to Pro — £10/mo
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      style={{
                        width: '100%', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textSec,
                        background: 'none', border: `1px solid ${C.border}`, borderRadius: 9,
                        padding: '9px 16px', cursor: 'pointer',
                      }}
                    >
                      View past reports
                    </button>
                  </div>

                ) : quizStep !== 'email' ? (
                  /* Quiz */
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`step-${quizStep}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                    >
                      <QuizProgress step={step} total={STEPS} />
                      <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: C.text, margin: '0 0 12px' }}>
                        {QUIZ_QUESTIONS[(quizStep as number) - 1].title}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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
                            marginTop: 12, display: 'flex', alignItems: 'center', gap: 4,
                            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textMut,
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          }}
                        >
                          <ChevronLeft style={{ width: 12, height: 12 }} />
                          Back
                        </button>
                      )}
                    </motion.div>
                  </AnimatePresence>

                ) : (
                  /* Email step */
                  <form key="email" onSubmit={handleEmailSubmit}>
                    <QuizProgress step={step} total={STEPS} />
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: C.text, margin: '0 0 4px' }}>
                      Almost done
                    </p>
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textSec, margin: '0 0 16px' }}>
                      Where should we send your report?
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: C.text,
                        background: '#FFFFFF', border: `1.5px solid ${emailTouched && !emailValid ? C.error : C.border}`,
                        borderRadius: 8, padding: '10px 12px', outline: 'none', transition: 'border-color 0.12s',
                        marginBottom: emailTouched && !emailValid ? 4 : 0,
                      }}
                      onFocus={e  => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                      onBlur={e   => { e.target.style.borderColor = emailTouched && !emailValid ? C.error : C.border; e.target.style.boxShadow = 'none' }}
                    />
                    {emailTouched && !emailValid && (
                      <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.error, margin: '0 0 6px' }}>
                        Please enter a valid email address.
                      </p>
                    )}
                    <div style={{ height: 12 }} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff',
                        background: C.primary, border: 'none', borderRadius: 9,
                        padding: '11px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                        opacity: isSubmitting ? 0.65 : 1, transition: 'all 150ms',
                      }}
                      onMouseEnter={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = C.primaryH)}
                      onMouseLeave={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = C.primary)}
                    >
                      {isSubmitting
                        ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        : <><span>Get my report</span><ArrowRight style={{ width: 15, height: 15 }} /></>}
                    </button>
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textMut, textAlign: 'center', marginTop: 10 }}>
                      2 free reports · No credit card required
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuizStep(STEPS)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        margin: '6px auto 0',
                        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textMut,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      }}
                    >
                      <ChevronLeft style={{ width: 11, height: 11 }} />
                      Back
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: '12px 24px', background: C.bgSubtle,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px 28px' }}>
          {[
            'Temu · AliExpress · Alibaba',
            'Amazon · eBay · Etsy · Shopify',
            'AI analysis in under 30 seconds',
            'No credit card to start',
          ].map(t => (
            <span key={t} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textMut }}>
              <span style={{ color: C.primary, marginRight: 5 }}>✓</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '88px 24px', background: C.bg }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionLabel>How it works</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(24px,3.5vw,40px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text,
              margin: '0 auto 14px', maxWidth: 460,
            }}>
              From criteria to report in 30 seconds
            </h2>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: C.textSec, maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>
              No spreadsheets. No hours of research. Three steps from intent to insight.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {HOW_STEPS.map(({ n, icon: Icon, title, desc }, idx) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: 26, position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
                }}
              >
                <div style={{
                  position: 'absolute', top: -10, right: 16,
                  fontWeight: 800, fontSize: 72, lineHeight: 1,
                  color: C.primaryL, userSelect: 'none',
                }}>{n}</div>

                <div style={{
                  display: 'inline-flex', padding: 10, borderRadius: 9, marginBottom: 16,
                  background: C.primaryL, border: '1px solid #C7D2FE',
                }}>
                  <Icon style={{ width: 17, height: 17, color: C.primary }} />
                </div>

                <p style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 9 }}>{title}</p>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Sample report ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.bgSubtle }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>Sample report</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(24px,3.5vw,40px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto 14px',
            }}>
              See exactly what you get
            </h2>
            <p style={{ fontSize: 15, color: C.textSec, maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
              Real data, not generic advice. Every report is generated fresh from live marketplace listings.
            </p>
          </FadeUp>

          <div style={{
            background: '#FFFFFF', border: `1px solid ${C.border}`,
            borderRadius: 14, maxWidth: 640, margin: '0 auto', padding: 26,
            boxShadow: '0 4px 16px 0 rgba(15,23,42,0.07)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Home &amp; Gadgets
                </p>
                <p style={{ fontWeight: 600, fontSize: 16, color: C.text }}>Portable LED Ring Light</p>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <ScoreBadge label="OPP"  value="8.4" />
                <ScoreBadge label="RISK" value="3.1" warn />
              </div>
            </div>

            {/* Metric tiles */}
            <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
              <MetricTile label="Buy price"  value="$2.40"  sub="Temu · MOQ 50" />
              <MetricTile label="Avg. sell"  value="$24.99" sub="Amazon" />
              <MetricTile label="Net margin" value="58%"    sub="After all fees" accent />
            </div>

            {/* Sparkline */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <p style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em' }}>12-week search trend</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.success }}>+31%</p>
              </div>
              <Sparkline />
            </div>

            {/* Platform bars */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Platform opportunity
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <PlatformBar name="Amazon" pct={82} />
                <PlatformBar name="eBay"   pct={71} />
                <PlatformBar name="Etsy"   pct={58} />
              </div>
            </div>

            {/* AI analysis — partial reveal */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{ padding: 6, borderRadius: 6, background: C.primaryL, border: '1px solid #C7D2FE' }}>
                  <Sparkles style={{ width: 11, height: 11, color: C.primary }} />
                </div>
                <span style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Analysis</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.primary, background: C.primaryL, padding: '2px 8px', borderRadius: 99, border: '1px solid #C7D2FE' }}>
                  Pro · GPT-4o
                </span>
              </div>
              <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>
                The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the rise of short-form video content on TikTok and Instagram Reels…
              </p>
              <div style={{ filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>
                  The primary risk is moderate market saturation — approximately 4,200 competing listings on Amazon. Differentiation through bundle offers and premium packaging can command a 15–20% price premium.
                </p>
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.97) 65%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14,
                top: '52%',
              }}>
                <Link to="/pricing" style={{
                  fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 12, color: C.primary,
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  padding: '7px 18px', borderRadius: 99, textDecoration: 'none',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08)',
                }}>
                  Unlock full analysis with Pro →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>Features</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(24px,3.5vw,40px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto',
            }}>
              Everything in one report
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: 22,
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)' }}
              >
                <div style={{ display: 'inline-flex', padding: 9, borderRadius: 8, marginBottom: 14, background: C.primaryL, border: '1px solid #C7D2FE' }}>
                  <Icon style={{ width: 15, height: 15, color: C.primary }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 7 }}>{title}</p>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px', background: C.bgSubtle }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(24px,3.5vw,40px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto 12px',
            }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 15, color: C.textSec, maxWidth: 320, margin: '0 auto', lineHeight: 1.65 }}>
              Try free. Upgrade when you're ready to scale.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 18, maxWidth: 660, margin: '0 auto' }}>

            {/* Free */}
            <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMut, marginBottom: 8 }}>Starter</p>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontWeight: 800, fontSize: 38, color: C.text, letterSpacing: '-0.03em' }}>£0</span>
                <span style={{ fontSize: 13, color: C.textMut, marginLeft: 4 }}>/forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['2 reports — lifetime', '1-paragraph AI summary', 'Margin calculator', 'Best platform only', 'Source links to buy'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textSec }}>
                    <Check style={{ width: 13, height: 13, color: C.primary, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 13, color: C.textSec,
                border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 18px',
                transition: 'border-color 0.12s, color 0.12s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLAnchorElement).style.color = C.text }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; (e.currentTarget as HTMLAnchorElement).style.color = C.textSec }}
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div style={{
              background: '#FFFFFF', border: `2px solid ${C.primary}`,
              borderRadius: 12, padding: 28, position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 20px 0 rgba(79,70,229,0.10)',
            }}>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', color: '#fff', background: C.primary, padding: '3px 10px', borderRadius: 99 }}>
                  Most popular
                </span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.primary, marginBottom: 8 }}>Pro</p>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 38, color: C.text, letterSpacing: '-0.03em' }}>£10</span>
                <span style={{ fontSize: 13, color: C.textSec, marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: C.primary, marginBottom: 20 }}>Less than £0.35 per report</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  '20 fresh reports per week',
                  'Full 5-paragraph GPT-4o analysis',
                  'All 4 platform comparisons',
                  'Trend charts & 6-month data',
                  'Interactive margin calculator',
                  'Source links (Temu, AliExpress, Alibaba)',
                  'Full report history',
                  'Priority support',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text }}>
                    <Check style={{ width: 13, height: 13, color: C.primary, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 14,
                color: '#fff', background: C.primary, borderRadius: 8, padding: '11px 18px',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primaryH)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primary)}
              >
                Upgrade to Pro — £10/mo
              </Link>
              <p style={{ fontSize: 11, color: C.textMut, textAlign: 'center', marginTop: 8 }}>Cancel anytime</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/pricing"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textMut, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '10px 6px' }}
              className="hover:text-slate-700 transition-colors"
            >
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 40 }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(22px,3vw,36px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: 0,
            }}>
              Common questions
            </h2>
          </FadeUp>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { q: 'How accurate is the data?',
                a: 'Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy.' },
              { q: "What's the difference between free and Pro?",
                a: 'Free gives you 2 lifetime reports with a short summary and your best platform only. Pro gives you 20 reports every week with a full 5-paragraph GPT-4o report, all 4 platform comparisons, and 6-month trend charts.' },
              { q: 'How is this different from just searching Google?',
                a: "We pull buy-side and sell-side data simultaneously, calculate your actual margin after all fees and shipping, show you 6 months of trend data, and generate a written analysis — all in under 30 seconds. Google can't give you your margin on a specific product." },
              { q: 'Can I cancel Pro anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked.' },
              { q: 'What platforms do you cover?',
                a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each.' },
            ].map(({ q, a }, i) => (
              <motion.details
                key={q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.38, delay: i * 0.05 }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 10, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                }}
              >
                <summary style={{
                  fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 13, color: C.text,
                  padding: '13px 16px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {q}
                  <span style={{ color: C.textMut, flexShrink: 0, marginLeft: 10 }}>▾</span>
                </summary>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textSec, lineHeight: 1.7, padding: '0 16px 13px' }}>{a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', textAlign: 'center', background: C.primary }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
              <Logo size={32} />
            </div>
          </div>
          <h2 style={{
            fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: 16, color: '#FFFFFF',
          }}>
            Ready to find your next product?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Join 1,200+ entrepreneurs finding profitable products with Sorcery. Start free — no credit card required.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 15,
                color: C.primary, background: '#FFFFFF', textDecoration: 'none',
                padding: '13px 32px', borderRadius: 9,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.15)',
              }}
            >
              Start for free
              <ArrowRight style={{ width: 16, height: 16 }} />
            </a>
            <Link to="/pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
              color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
              padding: '13px 16px',
            }}
              className="hover:text-white transition-colors"
            >
              See Pro features →
            </Link>
          </div>
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 20, letterSpacing: '0.04em' }}>
            2 FREE REPORTS · NO CREDIT CARD · 60 SECONDS
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop:   `1px solid ${C.border}`,
        padding:     '18px 28px',
        background:  C.bg,
        display:     'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      }}>
        <Wordmark size="sm" />
        <div style={{ display: 'flex', gap: 18 }}>
          {([
            { label: 'How it works', href: '#how-it-works', isAnchor: true  },
            { label: 'Pricing',      href: '/pricing',      isAnchor: false },
            { label: 'Sign in',      href: '/auth/signin',  isAnchor: false },
            { label: 'Sign up',      href: '/auth/signup',  isAnchor: false },
          ] as const).map(({ label, href, isAnchor }) =>
            isAnchor
              ? <a   key={label} href={href}  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textMut, textDecoration: 'none' }} className="hover:text-slate-700 transition-colors">{label}</a>
              : <Link key={label} to={href}   style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textMut, textDecoration: 'none' }} className="hover:text-slate-700 transition-colors">{label}</Link>
          )}
        </div>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: C.textMut }}>
          © {new Date().getFullYear()} Sorcery
        </p>
      </footer>

    </div>
  )
}
