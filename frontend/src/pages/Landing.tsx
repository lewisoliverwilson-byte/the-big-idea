import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChevronLeft, Check, Star,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe, Sparkles,
  Leaf, Briefcase, Package, Layers, Package2, Building2, Home, Gamepad2,
  Shuffle, ShoppingBag, Palette, HelpCircle, Flame,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'
import { Logo, Wordmark } from '../components/layout/Navbar'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#FFFFFF',
  bgSubtle:    '#F9FAFB',
  bgDark:      '#111827',
  border:      '#E5E7EB',
  borderLight: '#F3F4F6',
  primary:     '#4F46E5',
  primaryH:    '#4338CA',
  primaryL:    '#EEF2FF',
  primaryBdr:  '#C7D2FE',
  text:        '#111827',
  textSec:     '#6B7280',
  textMut:     '#9CA3AF',
  success:     '#059669',
  warning:     '#D97706',
  error:       '#DC2626',
  amber:       '#F59E0B',
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
      { id: 'small',  icon: Package,   label: 'Small',    sublabel: 'Bag or jiffy envelope' },
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

// ─── Reusable atoms ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      color: C.primary, background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
      borderRadius: 99, padding: '4px 14px', marginBottom: 16,
      fontFamily: 'Inter, system-ui, sans-serif',
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
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: C.border, maxWidth: 1120, margin: '0 auto' }} />
}

// ─── Quiz sub-components ──────────────────────────────────────────────────────

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 8, fontSize: 11, color: C.textMut, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <span>Step {step} of {total}</span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: C.primary }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
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
        padding: '11px 13px', borderRadius: 9,
        background: selected ? C.primaryL : '#FFFFFF',
        border: `1.5px solid ${selected ? C.primary : C.border}`,
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 140ms',
        boxShadow: selected ? `0 0 0 3px rgba(79,70,229,0.1)` : '0 1px 2px rgba(0,0,0,0.04)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: selected ? C.primary : '#F9FAFB',
        border: `1px solid ${selected ? C.primary : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 140ms',
      }}>
        <option.icon style={{ width: 15, height: 15, color: selected ? '#fff' : C.textSec }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: selected ? C.primary : C.text, margin: 0 }}>
          {option.label}
        </p>
        <p style={{ fontSize: 11, color: C.textMut, margin: '2px 0 0' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: C.primary,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check style={{ width: 10, height: 10, color: '#fff' }} />
        </div>
      )}
    </button>
  )
}

// ─── Report preview atoms ─────────────────────────────────────────────────────

function Sparkline() {
  const vals = [28, 33, 31, 38, 42, 47, 52, 58, 65, 74, 86, 100]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
      {vals.map((h, i) => (
        <div key={i} style={{
          height: `${h}%`, flex: 1, borderRadius: '3px 3px 0 0',
          background: i < 8
            ? `rgba(79,70,229,${0.2 + i * 0.04})`
            : `rgba(79,70,229,${0.6 + (i - 8) * 0.13})`,
        }} />
      ))}
    </div>
  )
}

function MetricTile({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean
}) {
  return (
    <div style={{ flex: 1, borderRadius: 8, padding: '10px 12px', background: accent ? C.primaryL : '#F9FAFB', border: `1px solid ${accent ? C.primaryBdr : C.border}` }}>
      <p style={{ fontSize: 9, color: accent ? C.primary : C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px', fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 800, color: accent ? C.primary : C.text, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ fontSize: 10, color: accent ? C.primary : C.textMut, margin: '4px 0 0' }}>
        {sub}
      </p>
    </div>
  )
}

function ScoreChip({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      borderRadius: 7, padding: '5px 10px',
      background: warn ? '#FFFBEB' : C.primaryL,
      border: `1px solid ${warn ? '#FDE68A' : C.primaryBdr}`,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: warn ? C.warning : C.primary, letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 800, color: warn ? C.warning : C.primary, letterSpacing: '-0.01em' }}>
        {value}
      </span>
    </div>
  )
}

function PlatformBar({ name, pct, isTop = false }: { name: string; pct: number; isTop?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: isTop ? C.text : C.textSec, width: 48, flexShrink: 0, fontWeight: isTop ? 600 : 400, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {name}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: isTop ? C.primary : '#A5B4FC' }}
        />
      </div>
      <span style={{ fontSize: 11, color: isTop ? C.primary : C.textMut, width: 30, textAlign: 'right', flexShrink: 0, fontWeight: isTop ? 700 : 400, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {pct}%
      </span>
    </div>
  )
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, role, location, avatarColor }: {
  quote: string; name: string; role: string; location: string; avatarColor: string
}) {
  const initials = name.split(' ').map(n => n[0]).join('')
  return (
    <div style={{
      background: '#FFFFFF', border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '24px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
        ))}
      </div>
      {/* Quote */}
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.72, margin: 0, flex: 1 }}>
        "{quote}"
      </p>
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: avatarColor, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 11, color: C.textMut, margin: '2px 0 0' }}>{role} · {location}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Static data ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    n: '01', icon: Sparkles,
    title: 'Tell us what you want',
    desc: 'Budget, storage space, category, platform, and goal. Five quick questions — under 60 seconds. Every answer makes your result sharper.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We find your profitable products',
    desc: 'Our AI cross-references buy prices from Temu, AliExpress, and Alibaba against live sell-side data from Amazon, eBay, Etsy, and Shopify — filtering for the highest margins.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Start selling in minutes',
    desc: 'You get AI analysis, 6-month trend data, your exact profit after every fee, and direct buy links — all ready in under 30 seconds. Then you buy and sell.',
  },
]

const FEATURES = [
  {
    icon: Zap, title: 'Full AI profit analysis',
    desc: 'GPT-4o writes a complete opportunity report: market size, competitor landscape, recommended entry strategy, and exactly how much money you can make.',
  },
  {
    icon: TrendingUp, title: '6-month trend charts',
    desc: "See whether demand is rising before you commit a penny. Never buy into a dying trend again — only invest in products that are going up.",
  },
  {
    icon: DollarSign, title: 'Exact margin breakdown',
    desc: 'Source price, UK shipping, and platform fees all calculated. See your profit at 50, 100, and 200 units — use the editable calculator to find your sweet spot.',
  },
  {
    icon: BarChart2, title: 'All 4 platform comparisons',
    desc: 'Amazon, eBay, Etsy, and Shopify — margins, fees, and monthly sales estimates side by side. Pick the platform where you make the most money.',
  },
  {
    icon: Globe, title: 'Direct source links',
    desc: 'One-click through to the exact listing on Temu, AliExpress, or Alibaba. No hunting. Just buy at the price the report shows and start selling.',
  },
  {
    icon: ShieldCheck, title: 'Risk scoring',
    desc: 'Saturated niches, declining trends, and high MOQ are flagged instantly. Only pursue products with genuine profit potential — skip the rest.',
  },
]

const TESTIMONIALS = [
  {
    quote: "I was spending three hours every Sunday doing product research. Now it takes 30 seconds and the data is better than anything I was finding manually. The trend charts alone saved me from a product that peaked in March and died by June.",
    name: "James T.", role: "Amazon FBA seller", location: "Manchester, UK",
    avatarColor: "#4F46E5",
  },
  {
    quote: "Found a product earning me £800/month net profit within the first week of signing up. The margin calculator is what really sold me — it shows exactly what you make after every fee. I was guessing before.",
    name: "Sarah M.", role: "eBay & Etsy seller", location: "Bristol, UK",
    avatarColor: "#0891B2",
  },
  {
    quote: "The comparison feature is genuinely brilliant. I had four products I was considering, ran them all, compared side-by-side and The Big Idea picked the winner automatically. It was right. Paid for itself in week one.",
    name: "Priya K.", role: "Multi-platform seller", location: "London, UK",
    avatarColor: "#059669",
  },
]

const PLATFORM_BUY  = ['Temu', 'AliExpress', 'Alibaba']
const PLATFORM_SELL = ['Amazon', 'eBay', 'Etsy', 'Shopify']

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
    const key         = answerKeys[(quizStep as number) - 1]
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

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position:             'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background:           'rgba(255,255,255,0.96)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:         `1px solid ${C.border}`,
        height:               58,
        display:              'flex', alignItems: 'center', justifyContent: 'space-between',
        padding:              '0 28px',
      }}>
        <Wordmark />

        <div style={{ display: 'none', gap: 2, alignItems: 'center' }} className="hidden sm:flex">
          <a href="#how-it-works" style={{ fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            How it works
          </a>
          <a href="#pricing" style={{ fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            Pricing
          </a>
        </div>

        {/* Right desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href="#how-it-works" className="hidden sm:block" style={{ fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            How it works
          </a>
          <a href="#pricing" className="hidden sm:block" style={{ fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.text; (e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
          >
            Pricing
          </a>
          <Link to="/auth/signin" style={{ fontSize: 13, color: C.textSec, textDecoration: 'none', padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textSec)}
          >
            Sign in
          </Link>
          <Link to="/auth/signup" style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: C.primary, padding: '7px 16px',
            borderRadius: 8, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
            transition: 'background 0.12s',
            boxShadow: '0 1px 3px rgba(79,70,229,0.25)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = C.primaryH)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop:    58,
        minHeight:     '100vh',
        display:       'flex',
        alignItems:    'center',
        position:      'relative',
        overflow:      'hidden',
        background:    'linear-gradient(155deg, #F5F3FF 0%, #FAFAFA 45%, #FFF7ED 100%)',
      }}>
        {/* Large purple orb top-right */}
        <div style={{
          position:      'absolute',
          top:           '-15%',
          right:         '-8%',
          width:          780,
          height:         780,
          borderRadius:   '50%',
          background:     'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)',
          pointerEvents:  'none',
          zIndex:         0,
        }} />
        {/* Pink orb bottom-left */}
        <div style={{
          position:      'absolute',
          bottom:        '-10%',
          left:          '-8%',
          width:          560,
          height:         560,
          borderRadius:   '50%',
          background:     'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.05) 50%, transparent 70%)',
          pointerEvents:  'none',
          zIndex:         0,
        }} />
        {/* Faint grid overlay */}
        <div style={{
          position:     'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          zIndex:         0,
        }} />

        <div style={{ maxWidth: 1160, width: '100%', margin: '0 auto', padding: '64px 24px', position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row items-center" style={{ gap: 64 }}>

            {/* ── Left: text ── */}
            <motion.div
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
              style={{ flex: '1 1 420px', minWidth: 0 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Headline */}
              <h1 style={{
                fontWeight:    800,
                fontSize:      'clamp(34px, 5vw, 58px)',
                lineHeight:    1.08,
                letterSpacing: '-0.035em',
                color:         C.text,
                marginBottom:  22,
              }}>
                Find products that<br />
                <span style={{
                  background:           'linear-gradient(135deg, #6366F1 0%, #8B5CF6 45%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  backgroundClip:       'text',
                }}>
                  make you money.
                </span>
              </h1>

              <p style={{
                fontSize: 17, color: C.textSec,
                lineHeight: 1.68, maxWidth: 460, marginBottom: 40,
              }}>
                The professional market research tool for people who want to make money quickly from reselling. Answer 5 questions — our AI finds high-margin products, calculates your exact profit, and tells you exactly where to sell. In under 30 seconds.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center lg:justify-start" style={{ gap: 10, marginBottom: 36 }}>
                {[
                  { v: '30s',   l: 'Results',      grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)' },
                  { v: '80%',   l: 'Max margin',   grad: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
                  { v: '4',     l: 'Platforms',    grad: 'linear-gradient(135deg,#EC4899,#F97316)' },
                  { v: '£0',    l: 'To start',     grad: 'linear-gradient(135deg,#059669,#10B981)' },
                ].map(({ v, l, grad }) => (
                  <div key={l} style={{
                    background: grad, borderRadius: 10, padding: '10px 18px', textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  }}>
                    <p style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{v}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</p>
                  </div>
                ))}
              </div>

            </motion.div>

            {/* ── Right: Quiz card ── */}
            <motion.div
              style={{ flex: '0 0 auto', width: '100%', maxWidth: 490 }}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{
                background:   '#FFFFFF',
                border:       `1px solid rgba(99,102,241,0.2)`,
                borderRadius: 18,
                boxShadow:    '0 0 0 4px rgba(99,102,241,0.06), 0 24px 60px 0 rgba(99,102,241,0.18), 0 4px 12px 0 rgba(15,23,42,0.06)',
              }}>
                {/* Card chrome */}
                <div style={{
                  display:      'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding:      '12px 20px',
                  borderBottom: `1px solid rgba(99,102,241,0.12)`,
                  background:   'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
                  borderRadius: '18px 18px 0 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart2 style={{ width: 14, height: 14, color: C.primary }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: C.textSec, textTransform: 'uppercase' }}>
                      Find Products
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['#FCA5A5', '#FCD34D', '#6EE7B7'].map((c, i) => (
                      <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                </div>

                <div style={{ padding: '22px 20px' }}>
                  {/* Pro user: go to dashboard */}
                  {isPro ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <TrendingUp size={22} style={{ color: C.primary }} />
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>Welcome back</p>
                      <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22, lineHeight: 1.65 }}>
                        Your dashboard is ready. Run a new search or browse your report history.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontWeight: 600, fontSize: 14, color: '#fff',
                          background: C.primary, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: 'pointer', transition: 'background 0.12s',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.primaryH)}
                        onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
                      >
                        Go to Dashboard
                        <ArrowRight style={{ width: 16, height: 16 }} />
                      </button>
                    </div>

                  ) : freeAtLimit ? (
                    /* Free limit */
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
                      <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>You've used your free reports</p>
                      <p style={{ fontSize: 13, color: C.textSec, marginBottom: 22, lineHeight: 1.65 }}>
                        Upgrade to Pro for 20 fresh reports every week. At £10/month, it pays for itself with a single winning product.
                      </p>
                      <button
                        onClick={() => navigate('/pricing')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontWeight: 700, fontSize: 14, color: '#fff',
                          background: C.primary, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: 'pointer', marginBottom: 10,
                          fontFamily: 'Inter, system-ui, sans-serif', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.primaryH)}
                        onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
                      >
                        Upgrade to Pro — £10/mo
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                          width: '100%', fontSize: 12, color: C.textSec,
                          background: 'none', border: `1px solid ${C.border}`, borderRadius: 10,
                          padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        View past reports
                      </button>
                    </div>

                  ) : quizStep !== 'email' ? (
                    /* Quiz steps */
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`step-${quizStep}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                      >
                        <QuizProgress step={step} total={STEPS} />
                        <p style={{ fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 14px' }}>
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
                              fontSize: 12, color: C.textMut,
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                              fontFamily: 'Inter, system-ui, sans-serif',
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
                      <p style={{ fontWeight: 700, fontSize: 15, color: C.text, margin: '0 0 5px' }}>
                        Your results are ready
                      </p>
                      <p style={{ fontSize: 13, color: C.textSec, margin: '0 0 18px', lineHeight: 1.6 }}>
                        Enter your email to unlock your free product report — your £1,000/month product could be one click away.
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          fontSize: 14, color: C.text,
                          background: '#FFFFFF',
                          border: `1.5px solid ${emailTouched && !emailValid ? C.error : C.border}`,
                          borderRadius: 9, padding: '11px 14px', outline: 'none',
                          transition: 'border-color 0.12s, box-shadow 0.12s',
                          marginBottom: emailTouched && !emailValid ? 5 : 0,
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onFocus={e  => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                        onBlur={e   => { e.target.style.borderColor = emailTouched && !emailValid ? C.error : C.border; e.target.style.boxShadow = 'none' }}
                      />
                      {emailTouched && !emailValid && (
                        <p style={{ fontSize: 11, color: C.error, margin: '0 0 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                          Please enter a valid email address.
                        </p>
                      )}
                      <div style={{ height: 14 }} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontWeight: 700, fontSize: 14, color: '#fff',
                          background: C.primary, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                          opacity: isSubmitting ? 0.65 : 1, transition: 'all 150ms',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = C.primaryH)}
                        onMouseLeave={e => !isSubmitting && (e.currentTarget.style.background = C.primary)}
                      >
                        {isSubmitting
                          ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          : <><span>Get my free report</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                      </button>
                      <p style={{ fontSize: 11, color: C.textMut, textAlign: 'center', marginTop: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Free to start · No credit card · Start earning today
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuizStep(STEPS)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          margin: '8px auto 0',
                          fontSize: 11, color: C.textMut,
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        <ChevronLeft style={{ width: 11, height: 11 }} />
                        Back
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Social proof under card */}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { icon: '💰', text: 'Margins up to 80%' },
                  { icon: '⚡', text: 'Results in 30 seconds' },
                  { icon: '✅', text: 'Free to start' },
                ].map(({ icon, text }) => (
                  <span key={text} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: C.textMut,
                    background: '#F9FAFB', border: `1px solid ${C.border}`,
                    borderRadius: 99, padding: '4px 12px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    <span>{icon}</span>{text}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F9FAFB 100%)', borderTop: `1px solid rgba(99,102,241,0.12)`, borderBottom: `1px solid ${C.border}` }}>
        <section id="how-it-works" style={{ padding: '88px 24px', maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel>How it works</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text,
              margin: '0 auto 16px', maxWidth: 500,
            }}>
              From zero to your<br />first winning product
            </h2>
            <p style={{ fontSize: 16, color: C.textSec, maxWidth: 440, margin: '0 auto', lineHeight: 1.68 }}>
              No guesswork. No hours of research. Three steps from zero to a product that sells — designed for people who want to make money quickly.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {HOW_STEPS.map(({ n, icon: Icon, title, desc }, idx) => {
              const stepGrad = idx === 0
                ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
                : idx === 1
                  ? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
                  : 'linear-gradient(135deg,#EC4899,#F97316)'
              return (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '28px 26px', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderTop: 'none',
                }}
              >
                {/* Coloured top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: stepGrad, borderRadius: '14px 14px 0 0' }} />
                {/* Watermark number */}
                <div style={{
                  position: 'absolute', top: -8, right: 14,
                  fontWeight: 900, fontSize: 88, lineHeight: 1,
                  color: C.primaryL, userSelect: 'none', letterSpacing: '-0.04em',
                }}>{n}</div>

                <div style={{
                  display: 'inline-flex', padding: 11, borderRadius: 10, marginBottom: 18,
                  background: C.primaryL, border: `1px solid ${C.primaryBdr}`,
                }}>
                  <Icon style={{ width: 18, height: 18, color: C.primary }} />
                </div>

                <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 10 }}>{title}</p>
                <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.72 }}>{desc}</p>
              </motion.div>
            )})}
          </div>
        </section>
      </div>

      {/* ── Sample report ─────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: C.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionLabel>Live example</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto 16px',
            }}>
              See exactly what you'd earn
            </h2>
            <p style={{ fontSize: 16, color: C.textSec, maxWidth: 420, margin: '0 auto', lineHeight: 1.68 }}>
              Buy price. Sell price. Exact profit after every fee. Live from real marketplace listings — not guesswork.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div style={{
              background: '#FFFFFF', border: `1px solid ${C.border}`,
              borderRadius: 16, maxWidth: 660, margin: '0 auto',
              boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
              overflow: 'hidden',
            }}>
              {/* Report header */}
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, background: '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 10, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Home & Gadgets
                    </span>
                    <p style={{ fontWeight: 700, fontSize: 17, color: C.text, marginTop: 3 }}>
                      Portable LED Ring Light
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ScoreChip label="OPP"  value="8.4" />
                    <ScoreChip label="RISK" value="3.1" warn />
                  </div>
                </div>
              </div>

              <div style={{ padding: '22px' }}>
                {/* Metrics */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                  <MetricTile label="Buy price"  value="$2.40"  sub="Temu · MOQ 50" />
                  <MetricTile label="Avg. sell"  value="$24.99" sub="Amazon FBA" />
                  <MetricTile label="Net margin" value="58%"    sub="After all fees" accent />
                </div>

                {/* Trend */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                      12-week search trend
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.success }}>↑ +31%</span>
                  </div>
                  <Sparkline />
                </div>

                {/* Platform comparison */}
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 11, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 12 }}>
                    Platform opportunity
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <PlatformBar name="Amazon" pct={82} isTop />
                    <PlatformBar name="eBay"   pct={71} />
                    <PlatformBar name="Etsy"   pct={58} />
                    <PlatformBar name="Shopify" pct={49} />
                  </div>
                </div>

                {/* AI analysis preview */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 7, borderRadius: 7, background: C.primaryL, border: `1px solid ${C.primaryBdr}` }}>
                      <Sparkles style={{ width: 12, height: 12, color: C.primary }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>AI Analysis</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: C.primaryL, padding: '2px 9px', borderRadius: 99, border: `1px solid ${C.primaryBdr}` }}>
                      GPT-4o · Pro
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, marginBottom: 12 }}>
                    The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the continued rise of short-form video on TikTok and Instagram Reels…
                  </p>
                  {/* Blurred rest */}
                  <div style={{ filter: 'blur(5px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>
                    <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75 }}>
                      Market saturation sits at moderate risk — approximately 4,200 competing listings on Amazon UK. Differentiation through bundle offers, premium packaging, and content-creator bundles can command a 15–20% price premium and significantly reduce listing competition. Recommended entry strategy is to start with a small MOQ of 50 units via Temu at $2.40/unit, test with Sponsored Products at £15/day for two weeks, and scale only if ACoS stays below 25%.
                    </p>
                  </div>
                  {/* Fade-to-white overlay */}
                  <div style={{
                    position:   'absolute', bottom: 0, left: 0, right: 0, top: '45%',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.98) 70%)',
                    display:    'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 18,
                  }}>
                    <Link to="/pricing" style={{
                      fontWeight: 600, fontSize: 13, color: C.primary,
                      background: '#FFFFFF', border: `1px solid ${C.primaryBdr}`,
                      padding: '8px 20px', borderRadius: 99, textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      Unlock full analysis with Pro →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Divider />

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F3FF 100%)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionLabel>Features</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto',
            }}>
              Every number you need to start making money
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => {
              const iconGrads = [
                'linear-gradient(135deg,#6366F1,#8B5CF6)',
                'linear-gradient(135deg,#8B5CF6,#A855F7)',
                'linear-gradient(135deg,#EC4899,#F97316)',
                'linear-gradient(135deg,#059669,#10B981)',
                'linear-gradient(135deg,#0EA5E9,#6366F1)',
                'linear-gradient(135deg,#F59E0B,#EF4444)',
              ]
              return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(99,102,241,0.12)' }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div style={{
                  display: 'inline-flex', padding: 10, borderRadius: 9, marginBottom: 16,
                  background: iconGrads[i],
                  boxShadow: `0 4px 12px rgba(99,102,241,0.25)`,
                }}>
                  <Icon style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.72 }}>{desc}</p>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: C.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionLabel>Testimonials</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto 16px',
            }}>
              They started. Now they profit.
            </h2>
            <p style={{ fontSize: 16, color: C.textSec, maxWidth: 380, margin: '0 auto', lineHeight: 1.68 }}>
              Real sellers. Real earnings. Real products found with The Big Idea.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <TestimonialCard {...t} />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <Divider />

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '88px 24px', background: C.bgSubtle }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: '0 auto 14px',
            }}>
              Start free. Make money first.
            </h2>
            <p style={{ fontSize: 16, color: C.textSec, maxWidth: 340, margin: '0 auto', lineHeight: 1.68 }}>
              Try it for free. Upgrade once the profit is rolling in.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>

            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#FFFFFF', border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '30px 28px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.textMut, marginBottom: 10 }}>
                Starter
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontWeight: 800, fontSize: 44, color: C.text, letterSpacing: '-0.04em' }}>£0</span>
                <span style={{ fontSize: 14, color: C.textMut, marginLeft: 4 }}>/forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '2 reports — lifetime',
                  '1-paragraph AI summary',
                  'Margin calculator',
                  'Best platform only',
                  'Source links to buy',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: C.textSec }}>
                    <Check style={{ width: 14, height: 14, color: C.primary, flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontWeight: 600, fontSize: 14, color: C.textSec,
                border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 18px',
                transition: 'border-color 0.12s, color 0.12s',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLAnchorElement).style.color = C.text }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; (e.currentTarget as HTMLAnchorElement).style.color = C.textSec }}
              >
                Get started free
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#FFFFFF', border: `2px solid ${C.primary}`,
                borderRadius: 14, padding: '30px 28px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(79,70,229,0.12)',
              }}
            >
              {/* Popular badge */}
              <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <span style={{
                  fontWeight: 700, fontSize: 10, letterSpacing: '0.05em',
                  color: '#fff', background: C.primary, padding: '3px 10px', borderRadius: 99,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Most popular
                </span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.primary, marginBottom: 10 }}>
                Pro
              </p>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 44, color: C.text, letterSpacing: '-0.04em' }}>£10</span>
                <span style={{ fontSize: 14, color: C.textSec, marginLeft: 4 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: C.primary, marginBottom: 24, fontWeight: 500 }}>
                Less than £0.50 per report
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '20 reports every week',
                  'Full 5-paragraph GPT-4o analysis',
                  'All 4 platform comparisons',
                  'Trend charts & 6-month data',
                  'Interactive margin calculator',
                  'Source links (Temu, AliExpress, Alibaba)',
                  'Side-by-side comparison mode',
                  'Full report history',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: C.text }}>
                    <Check style={{ width: 14, height: 14, color: C.primary, flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontWeight: 700, fontSize: 14, color: '#fff',
                background: C.primary, borderRadius: 9, padding: '12px 18px',
                transition: 'background 0.12s',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = C.primaryH)}
                onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
              >
                Upgrade to Pro — £10/mo
              </Link>
              <p style={{ fontSize: 11, color: C.textMut, textAlign: 'center', marginTop: 10 }}>Cancel anytime</p>
            </motion.div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link to="/pricing" style={{
              fontSize: 13, color: C.textMut, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 6px',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'color 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.textSec)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}
            >
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: C.bg }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 44 }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 style={{
              fontWeight: 800, fontSize: 'clamp(24px, 3vw, 38px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: C.text, margin: 0,
            }}>
              Common questions
            </h2>
          </FadeUp>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                q: 'How accurate is the data?',
                a: 'Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy — not guesses.',
              },
              {
                q: "What's the difference between free and Pro?",
                a: 'Free gives you 2 lifetime reports with a short AI summary and your best platform only. Pro gives you 20 reports every week with a full 5-paragraph GPT-4o analysis, all 4 platform comparisons, 6-month trend charts, and side-by-side comparison mode.',
              },
              {
                q: 'How is this different from just searching Google?',
                a: "We pull buy-side and sell-side data simultaneously, calculate your exact margin after all fees and shipping, show 6 months of trend data, and write a full analysis — in under 30 seconds. Google won't tell you your profit per unit on a specific product at a specific buy price.",
              },
              {
                q: 'Can I cancel Pro anytime?',
                a: 'Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked, no cancellation fee.',
              },
              {
                q: 'What platforms do you cover?',
                a: 'Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each platform so you can pick the best channel for your product.',
              },
              {
                q: 'Is this just for UK sellers?',
                a: 'Primarily, yes — prices are shown in both GBP and USD, and margin calculations account for typical UK import and platform fees. EU sellers find it useful too, though the sell-side data is weighted towards UK marketplace activity.',
              },
            ].map(({ q, a }, i) => (
              <motion.details
                key={q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.38, delay: i * 0.04 }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${C.border}`,
                  borderRadius: 11, boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <summary style={{
                  fontWeight: 600, fontSize: 14, color: C.text,
                  padding: '15px 18px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  userSelect: 'none',
                }}>
                  {q}
                  <span style={{ color: C.textMut, flexShrink: 0, marginLeft: 12, fontSize: 16 }}>▾</span>
                </summary>
                <p style={{
                  fontSize: 14, color: C.textSec, lineHeight: 1.72,
                  padding: '0 18px 15px',
                }}>
                  {a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section style={{
        padding:    '100px 24px',
        textAlign:  'center',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 30%, #4C1D95 60%, #6D28D9 100%)',
        position:   'relative',
        overflow:   'hidden',
      }}>
        {/* Bright radial highlight */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 700,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, rgba(236,72,153,0.2) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom pink accent */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: 12,
            }}>
              <Logo size={36} />
            </div>
          </div>

          <h2 style={{
            fontWeight: 800, fontSize: 'clamp(30px, 5vw, 52px)', lineHeight: 1.08,
            letterSpacing: '-0.04em', marginBottom: 20, color: '#FFFFFF',
          }}>
            Your next winning product<br />is waiting right now.
          </h2>

          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.65)',
            maxWidth: 440, margin: '0 auto 44px', lineHeight: 1.68,
          }}>
            Built for people who want to make money quickly. The fastest, most accurate reselling research tool available. Start free — no credit card needed.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                fontWeight: 700, fontSize: 15,
                color: C.primary, background: '#FFFFFF', textDecoration: 'none',
                padding: '14px 32px', borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)' }}
            >
              Start for free
              <ArrowRight style={{ width: 17, height: 17 }} />
            </a>
            <Link to="/pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
              padding: '14px 18px', transition: 'color 0.12s',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >
              See Pro features →
            </Link>
          </div>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.35)',
            marginTop: 24, letterSpacing: '0.06em', fontWeight: 500,
          }}>
            2 FREE REPORTS · NO CREDIT CARD · CANCEL ANYTIME
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop:  `1px solid ${C.border}`,
        padding:    '24px 28px',
        background: C.bg,
        display:    'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <Wordmark size="sm" />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'How it works', href: '#how-it-works', isAnchor: true  },
            { label: 'Pricing',      href: '/pricing',      isAnchor: false },
            { label: 'Sign in',      href: '/auth/signin',  isAnchor: false },
            { label: 'Sign up',      href: '/auth/signup',  isAnchor: false },
          ].map(({ label, href, isAnchor }) =>
            isAnchor
              ? <a key={label} href={href} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textMut, textDecoration: 'none', transition: 'color 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.textSec)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}
                >{label}</a>
              : <Link key={label} to={href} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: C.textMut, textDecoration: 'none', transition: 'color 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.textSec)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.textMut)}
                >{label}</Link>
          )}
        </div>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: C.textMut }}>
          © {new Date().getFullYear()} The Big Idea
        </p>
      </footer>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}
