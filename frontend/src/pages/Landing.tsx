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

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#070511',
  surface:     '#0E0A1C',
  surface2:    '#150F28',
  border:      'rgba(139,92,246,0.15)',
  borderGlow:  'rgba(139,92,246,0.45)',
  purple:      '#8B5CF6',
  purpleBright:'#A78BFA',
  cyan:        '#22D3EE',
  gold:        '#F59E0B',
  text:        '#F0EEFF',
  textDim:     '#9B8ECF',
  textMuted:   '#5A4F7A',
} as const

// ─── Gradient helpers ─────────────────────────────────────────────────────────
const GRAD  = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN  = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GTEXT: CSSProperties = {
  background:           GRAD,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor:  'transparent',
  backgroundClip:       'text',
}

// ─── Stars (deterministic — golden-angle distribution) ────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => {
  const g = 137.508
  return {
    left:    `${((i * g)        % 100).toFixed(1)}%`,
    top:     `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:    [1, 1, 1, 1.5, 2][i % 5],
    delay:   `${((i * 0.37)     % 4.5).toFixed(2)}s`,
    dur:     `${(2.8 + (i % 6)  * 0.45).toFixed(1)}s`,
  }
})

// ─── Brand ────────────────────────────────────────────────────────────────────
export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      aria-label="Sorcery"
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-hidden="true">
        <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 33,79 A 34,34 0 1,1 67,79" fill="none" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" opacity="0.28"/>
        <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
        <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
        <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
      </svg>
    </div>
  )
}

function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 40 : 28
  const fontSize = size === 'sm' ? 15 : size === 'lg' ? 24 : 18
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={iconSize} />
      <span style={{
        fontFamily:    '"Cinzel Decorative", "Cinzel", serif',
        fontWeight:    700,
        fontSize,
        letterSpacing: '0.06em',
        lineHeight:    1,
        color:         '#DDD6FE',
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
      { id: 'Home & Garden',   icon: Home,      label: 'Home & Gadgets',  sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health', icon: Sparkles,  label: 'Beauty & Health', sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',    icon: Gamepad2,  label: 'Toys & Hobbies',  sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',   icon: Shuffle,   label: 'Surprise me',     sublabel: 'Best opportunity wins' },
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function MagicDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', margin: '0 auto', maxWidth: 900 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.border}, transparent)` }} />
      <span style={{ color: C.purple, fontSize: 10, opacity: 0.7 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.border}, transparent)` }} />
    </div>
  )
}

// ─── Motion helpers ───────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className, style }: {
  children: ReactNode; delay?: number; className?: string; style?: CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-56px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function QuizProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted }}>
        <span>INCANTATION {step} OF {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 2, borderRadius: 9999, background: 'rgba(139,92,246,0.12)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: GRAD,
          transition: 'width 0.4s ease-out',
          boxShadow: '0 0 8px rgba(139,92,246,0.6)',
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
        background: selected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1.5px solid ${selected ? C.borderGlow : C.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'all 140ms',
        boxShadow: selected ? '0 0 12px rgba(139,92,246,0.15)' : 'none',
      }}
    >
      <option.icon style={{ width: 15, height: 15, flexShrink: 0, color: selected ? C.purpleBright : C.textMuted }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
          color: selected ? C.purpleBright : C.text, margin: 0,
        }}>
          {option.label}
        </p>
        <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, margin: '2px 0 0' }}>
          {option.sublabel}
        </p>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: GBTN,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(124,58,237,0.5)',
        }}>
          <Check style={{ width: 10, height: 10, color: '#fff' }} />
        </div>
      )}
    </button>
  )
}

// ─── Report preview components ────────────────────────────────────────────────
function Sparkline() {
  const vals = [32, 37, 35, 42, 41, 49, 54, 57, 63, 72, 84, 100]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {vals.map((h, i) => {
        const t = i / 11
        const r = Math.round(196 - t * (196 - 34))
        const g = Math.round(132 - t * (132 - 211))
        const b = Math.round(252 - t * (252 - 238))
        return (
          <div key={i} style={{
            height: `${h}%`, width: 7, borderRadius: 2, flexShrink: 0,
            background: `rgb(${r},${g},${b})`,
            opacity: 0.6 + t * 0.4,
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
    <div style={{ flex: 1, borderRadius: 8, padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}` }}>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 17, color: accent ? C.purpleBright : C.text, lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: accent ? C.purpleBright : C.textMuted, margin: '3px 0 0' }}>
        {sub}
      </p>
    </div>
  )
}

function Badge({ label, value, risk = false }: { label: string; value: string; risk?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, padding: '4px 8px',
      background: risk ? 'rgba(245,158,11,0.08)' : 'rgba(139,92,246,0.10)',
      border:     risk ? '1px solid rgba(245,158,11,0.22)' : `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, letterSpacing: '0.06em', fontWeight: 700, color: risk ? C.gold : C.purpleBright }}>
        {label}
      </span>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 13, color: risk ? C.gold : C.purpleBright }}>
        {value}
      </span>
    </div>
  )
}

function PlatBar({ name, pct }: { name: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textDim, width: 44, flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 9999, background: 'rgba(139,92,246,0.08)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: `linear-gradient(to right, rgba(124,58,237,0.7), rgba(99,102,241,${(0.4 + pct / 100 * 0.6).toFixed(2)}))`,
          boxShadow: `0 0 6px rgba(124,58,237,${(0.2 + pct / 100 * 0.3).toFixed(2)})`,
        }} />
      </div>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted, width: 28, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n: '01', icon: Sparkles,
    title: 'Speak Your Intent',
    desc:  'Budget, storage, category, platform, and goal. Five questions, under 60 seconds. Your criteria become the spell.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We Scry the Markets',
    desc:  'Buy prices from Temu, AliExpress and Alibaba cross-referenced against Amazon, eBay, Etsy and Shopify. 1,000+ products, instantly.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Your Fortune Appears',
    desc:  'AI analysis, 6-month trend charts, exact margin breakdown, and direct buy links — conjured in under 30 seconds.',
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

// ─── Shared card style ────────────────────────────────────────────────────────
const GLASS: CSSProperties = {
  background:     `rgba(14,10,28,0.70)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:         `1px solid ${C.border}`,
  borderRadius:   16,
  boxShadow:      '0 0 0 1px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
}

// ─── Castle photo background ─────────────────────────────────────────────────

function CastleBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <img
        src="/assets/castle-hero.png"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 45%',
          filter: 'brightness(0.42) saturate(0.85)',
        }}
      />
      {/* Gradient overlay — more opaque top/bottom for nav + scroll readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(7,3,15,0.52) 0%, rgba(7,3,15,0.12) 30%, rgba(7,3,15,0.18) 65%, rgba(7,3,15,0.82) 100%)',
      }}/>
      {/* Left vignette — wizard breathing room */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 55% 100% at 0% 100%, rgba(7,3,15,0.65) 0%, transparent 70%)',
      }}/>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Landing() {
  const navigate                   = useNavigate()
  const { isAuthenticated, user }  = useAuthStore()

  const isPro        = user?.subscriptionStatus === 'active'
  const freeUsed     = user?.reportsUsedFree ?? 0
  const freeAtLimit  = isAuthenticated && !isPro && freeUsed >= 2

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
    const nextAnswers = { ...answers, [key]: val }
    setAnswers(nextAnswers)
    setTimeout(() => {
      if ((quizStep as number) < STEPS) {
        setQuizStep(q => (q as number) + 1)
      } else if (isAuthenticated) {
        // Authenticated users skip the email step — go straight to dashboard
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
    }, 180)
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
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Outfit,sans-serif', color: C.text, position: 'relative', overflow: 'hidden' }}>

      {/* ── Castle background photo ───────────────────────────────────── */}
      <CastleBackground />

      {/* ── Global star field ──────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            className="animate-twinkle"
            style={{
              position:  'absolute',
              left:       s.left,
              top:        s.top,
              width:      s.size,
              height:     s.size,
              borderRadius: '50%',
              background: i % 4 === 0 ? C.cyan : i % 3 === 0 ? C.purpleBright : '#fff',
              animationDelay:    s.delay,
              animationDuration: s.dur,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* ── Ambient orbs (fixed, behind everything) ────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Large purple orb — top left */}
        <div className="animate-float-orb" style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animationDelay: '0s',
        }} />
        {/* Cyan orb — right */}
        <div className="animate-float-orb" style={{
          position: 'absolute', top: '30%', right: '-8%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)',
          animationDelay: '-4s',
        }} />
        {/* Violet orb — bottom center */}
        <div className="animate-float-orb" style={{
          position: 'absolute', bottom: '5%', left: '35%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animationDelay: '-8s',
        }} />
      </div>

      {/* ── All page content sits above z=1 ──────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ─────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(7,5,17,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Wordmark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#how-it-works"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none', padding: '12px 4px', display: 'inline-flex', alignItems: 'center' }}
              className="hidden sm:block hover:text-white transition-colors"
            >
              How it works
            </a>
            <a href="#pricing"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none', padding: '12px 4px', display: 'inline-flex', alignItems: 'center' }}
              className="hidden sm:block hover:text-white transition-colors"
            >
              Pricing
            </a>
            <Link to="/auth/signin"
              style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, textDecoration: 'none', padding: '12px 4px', display: 'inline-flex', alignItems: 'center' }}
              className="hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link to="/auth/signup" style={{
              fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
              color: '#fff', background: GBTN,
              padding: '10px 18px', borderRadius: 7, textDecoration: 'none',
              boxShadow: '0 0 14px rgba(124,58,237,0.35)',
              display: 'inline-flex', alignItems: 'center',
            }}>
              Start free
            </Link>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section style={{
          paddingTop:    76,
          paddingBottom: 72,
          paddingLeft:   24,
          paddingRight:  24,
          minHeight:     '100vh',
          display:       'flex',
          alignItems:    'center',
          position:      'relative',
        }}>
          <div
            className="flex flex-col lg:flex-row items-center"
            style={{ maxWidth: 1160, width: '100%', margin: '0 auto', gap: 48, position: 'relative', zIndex: 3 }}
          >

            {/* ── Left: text column ── */}
            <div
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
              style={{ flex: '1 1 420px', minWidth: 0 }}
            >
              {/* Headline */}
              <h1 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
                fontWeight:    700,
                textTransform: 'uppercase',
                fontSize:      'clamp(44px,6vw,84px)',
                lineHeight:    0.93,
                letterSpacing: '-0.01em',
                color:         C.text,
                marginBottom:  24,
              }}>
                Find Winning<br />
                Products<br />
                <span style={GTEXT}>Using ✦ Sorcery</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontFamily: 'Outfit,sans-serif', fontSize: 16, color: C.textDim,
                lineHeight: 1.7, maxWidth: 480, marginBottom: 36,
              }}>
                Answer five questions. Our AI scries 1,000+ products across Temu, AliExpress and Alibaba — then calculates your exact margin on Amazon, eBay, Etsy and Shopify. Under 30 seconds.
              </p>

              {/* Stats */}
              <div
                className="flex flex-wrap justify-center lg:justify-start"
                style={{ gap: '8px 36px' }}
              >
                {([
                  { v: '1,200+', l: 'Entrepreneurs' },
                  { v: '30s',    l: 'Avg. report time' },
                  { v: '4',      l: 'Platforms covered' },
                  { v: '£10',    l: 'Pro per month' },
                ] as const).map(({ v, l }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ ...GTEXT, fontFamily: '"DM Mono",monospace', fontSize: 24, lineHeight: 1, margin: 0 }}>{v}</p>
                    <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, margin: '4px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Quiz card (THE BIG THING) ── */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 500 }}>
              <div style={{
                ...GLASS,
                borderRadius: 20,
                boxShadow: '0 0 0 1px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.75), 0 0 80px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.05)',
                border: `1px solid ${C.borderGlow}`,
              }}>
                {/* Card header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles style={{ width: 14, height: 14, color: C.purpleBright }} />
                    <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.10em', color: C.textMuted, textTransform: 'uppercase' }}>
                      Configure Your Spell
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[C.textMuted, C.textMuted, C.textMuted].map((c, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? C.purple : c, opacity: i === 0 ? 1 : 0.25 }} />
                    ))}
                  </div>
                </div>

                <div style={{ padding: 22 }}>
                  {/* ── Pro member — send them to dashboard ── */}
                  {isPro ? (
                    <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>
                        Welcome back, Sorcerer
                      </p>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, marginBottom: 20, lineHeight: 1.6 }}>
                        Your grimoire is waiting. Cast spells and browse your history from the dashboard.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
                          background: GBTN, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: 'pointer',
                          boxShadow: '0 0 24px rgba(124,58,237,0.45)',
                        }}
                      >
                        <span>Go to Dashboard</span>
                        <ArrowRight style={{ width: 16, height: 16 }} />
                      </button>
                    </div>

                  ) : freeAtLimit ? (
                    /* ── Free user, limit reached — push to upgrade ── */
                    <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🔮</div>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>
                        Your free spells are spent
                      </p>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, marginBottom: 20, lineHeight: 1.6 }}>
                        You've used both free reports. Upgrade to Sorcerer for 20 fresh ideas every week, full AI analysis, and all 4 platforms.
                      </p>
                      <button
                        onClick={() => navigate('/pricing')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
                          background: GBTN, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: 'pointer',
                          boxShadow: '0 0 24px rgba(124,58,237,0.45)',
                          marginBottom: 10,
                        }}
                      >
                        ✦ Ascend to Sorcerer — £10/mo
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                          width: '100%', fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textDim,
                          background: 'none', border: `1px solid ${C.border}`, borderRadius: 10,
                          padding: '9px 16px', cursor: 'pointer',
                        }}
                      >
                        View my past reports
                      </button>
                    </div>

                  ) : quizStep !== 'email' ? (
                    /* ── Normal quiz questions ── */
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`step-${quizStep}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <QuizProgress step={step} total={STEPS} />
                        <p style={{
                          fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15,
                          color: C.text, margin: '0 0 14px',
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
                              fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted,
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            }}
                          >
                            <ChevronLeft style={{ width: 13, height: 13 }} />
                            Back
                          </button>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <form key="email" onSubmit={handleEmailSubmit} className="animate-fadeIn">
                      <QuizProgress step={step} total={STEPS} />
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: C.text, margin: '0 0 4px' }}>
                        Almost done ✦
                      </p>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, margin: '0 0 18px' }}>
                        Where shall we send your oracle?
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.text,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${emailTouched && !emailValid ? '#EF4444' : C.border}`,
                          borderRadius: 10, padding: '11px 14px',
                          outline: 'none', transition: 'border-color 150ms',
                          marginBottom: emailTouched && !emailValid ? 4 : 0,
                        }}
                        onFocus={e  => { e.target.style.borderColor = C.borderGlow; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)' }}
                        onBlur={e   => { e.target.style.borderColor = emailTouched && !emailValid ? '#EF4444' : C.border; e.target.style.boxShadow = 'none' }}
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
                          fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
                          background: GBTN, border: 'none', borderRadius: 10,
                          padding: '12px 16px', cursor: isSubmitting ? 'default' : 'pointer',
                          opacity: isSubmitting ? 0.65 : 1, transition: 'all 200ms',
                          boxShadow: isSubmitting ? 'none' : '0 0 24px rgba(124,58,237,0.45), 0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        {isSubmitting
                          ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                          : <><span>✦ Reveal My Fortune</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
                      </button>
                      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 10 }}>
                        2 free reports · No credit card required
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuizStep(STEPS)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          margin: '8px auto 0',
                          fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted,
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

        {/* ── Trust strip ────────────────────────────────────────────── */}
        <div style={{
          borderTop:    `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: '14px 24px',
          background: 'rgba(14,10,28,0.5)',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 28px' }}>
            {[
              'Temu · AliExpress · Alibaba',
              'Amazon · eBay · Etsy · Shopify',
              'AI analysis in under 30 seconds',
              'No credit card to start',
            ].map(t => (
              <span key={t} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted }}>
                <span style={{ color: C.purpleBright, marginRight: 6 }}>✦</span>{t}
              </span>
            ))}
          </div>
        </div>

        {/* ── How it works ───────────────────────────────────────────── */}
        <section id="how-it-works" style={{ padding: '96px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE PROCESS
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97,
                margin: '0 auto 16px', maxWidth: 500,
              }}>
                <span style={{ color: C.text }}>The Art</span>{' '}
                <span style={GTEXT}>of Sourcing</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
                No spreadsheets. No hours of research. Three steps from intent to fortune.
              </p>
            </FadeUp>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
              {HOW_STEPS.map(({ n, icon: Icon, title, desc }, idx) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.10, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  style={{ ...GLASS, padding: 28, position: 'relative', overflow: 'hidden' }}
                >
                  {/* Decorative number */}
                  <div style={{
                    position: 'absolute', top: -16, right: 20,
                    fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                    fontWeight: 700, fontSize: 80, lineHeight: 1,
                    ...GTEXT, opacity: 0.07,
                  }}>{n}</div>

                  <div style={{
                    display: 'inline-flex', padding: 10, borderRadius: 10, marginBottom: 18,
                    background: 'rgba(139,92,246,0.08)', border: `1px solid ${C.border}`,
                    boxShadow: '0 0 12px rgba(139,92,246,0.10)',
                  }}>
                    <Icon style={{ width: 18, height: 18, color: C.purpleBright }} />
                  </div>

                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 10 }}>{title}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>{desc}</p>

                  {idx < 2 && (
                    <div className="hidden lg:flex" style={{
                      position: 'absolute', top: '50%', right: -22,
                      transform: 'translateY(-50%)',
                      color: C.textMuted, fontSize: 16,
                      alignItems: 'center', zIndex: 2,
                    }}>
                      →
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Sample report ──────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE ORACLE
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto 16px',
              }}>
                <span style={{ color: C.text }}>What the Oracle</span>{' '}
                <span style={GTEXT}>Reveals</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                Real data, not generic advice. Every report is conjured fresh from live marketplace listings.
              </p>
            </FadeUp>

            <div style={{ ...GLASS, maxWidth: 680, margin: '0 auto', padding: 28,
              boxShadow: '0 0 0 1px rgba(139,92,246,0.10), 0 30px 60px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.06)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5 }}>
                    Home &amp; Gadgets
                  </p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 17, color: C.text }}>
                    Portable LED Ring Light
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Badge label="OPP"  value="8.4" />
                  <Badge label="RISK" value="3.1" risk />
                </div>
              </div>

              {/* Metric tiles */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <Tile label="Buy price"  value="$2.40"  sub="Temu · MOQ 50" />
                <Tile label="Avg. sell"  value="$24.99" sub="Amazon" />
                <Tile label="Net margin" value="58%"    sub="After all fees" accent />
              </div>

              {/* Sparkline */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    12-week search trend
                  </p>
                  <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.cyan }}>+31%</p>
                </div>
                <Sparkline />
              </div>

              {/* Platform bars */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Platform opportunity
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PlatBar name="Amazon" pct={82} />
                  <PlatBar name="eBay"   pct={71} />
                  <PlatBar name="Etsy"   pct={58} />
                </div>
              </div>

              {/* AI analysis — partial reveal */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: 6, borderRadius: 6, background: 'rgba(139,92,246,0.10)', border: `1px solid ${C.border}` }}>
                    <Sparkles style={{ width: 12, height: 12, color: C.purpleBright }} />
                  </div>
                  <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    AI Analysis
                  </span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 9, fontWeight: 600, color: C.purpleBright, background: 'rgba(139,92,246,0.09)', padding: '2px 8px', borderRadius: 9999, border: `1px solid ${C.border}` }}>
                    Pro · GPT-4o
                  </span>
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72, marginBottom: 12 }}>
                  The portable LED ring light is a compelling opportunity in the creator economy segment. Demand has grown 31% over six months, driven by the rise of short-form video content on TikTok and Instagram Reels…
                </p>
                <div style={{ filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>
                    The primary risk is moderate market saturation — approximately 4,200 competing listings on Amazon. Differentiation through bundle offers and premium packaging can command a 15–20% price premium over generic competitors.
                  </p>
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: `linear-gradient(to bottom, transparent 10%, rgba(14,10,28,0.97) 65%)`,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
                  top: '52%',
                }}>
                  <Link to="/pricing" style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, color: C.purpleBright,
                    background: 'rgba(14,10,28,0.9)', border: `1px solid ${C.border}`,
                    padding: '7px 18px', borderRadius: 9999, textDecoration: 'none',
                    boxShadow: '0 0 12px rgba(139,92,246,0.15)',
                  }}>
                    ✦ Unlock full analysis with Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Features ───────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE ARSENAL
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto',
              }}>
                <span style={GTEXT}>Everything</span>{' '}
                <span style={{ color: C.text }}>in One Report</span>
              </h2>
            </FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-36px' }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.16 } }}
                  style={{ ...GLASS, padding: 24 }}
                >
                  <div style={{
                    display: 'inline-flex', padding: 10, borderRadius: 10, marginBottom: 16,
                    background: 'rgba(139,92,246,0.07)', border: `1px solid ${C.border}`,
                  }}>
                    <Icon style={{ width: 16, height: 16, color: C.purpleBright }} />
                  </div>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 8 }}>{title}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                PRICING
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: '0 auto 16px',
              }}>
                <span style={{ color: C.text }}>Choose Your</span>{' '}
                <span style={GTEXT}>Power</span>
              </h2>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, color: C.textDim, maxWidth: 340, margin: '0 auto', lineHeight: 1.7 }}>
                Two free ideas to prove the value. Then £10 a month for everything.
              </p>
            </FadeUp>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>

              {/* Free */}
              <div style={{ ...GLASS, padding: 32 }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.12em', color: C.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Apprentice
                </p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, color: C.text, lineHeight: 1 }}>£0</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textMuted, marginLeft: 4 }}>/forever</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['2 ideas — lifetime', '1-paragraph AI summary', 'Margin calculator', 'Best platform only', 'Source links to buy'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim }}>
                      <Check style={{ width: 14, height: 14, color: C.purple, flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/signup" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: C.textDim,
                  border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 20px',
                  transition: 'border-color 200ms, color 200ms',
                }}>
                  Get started free
                </Link>
              </div>

              {/* Pro */}
              <div style={{
                ...GLASS,
                padding: 32, position: 'relative', overflow: 'hidden',
                border: `1px solid ${C.borderGlow}`,
                boxShadow: `0 0 0 1px rgba(139,92,246,0.10), 0 24px 60px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}>
                {/* Inner purple gradient glow at top */}
                <div style={{
                  position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                  width: 300, height: 120,
                  background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                  <span style={{
                    fontFamily: '"DM Mono",monospace', fontWeight: 700, fontSize: 9, letterSpacing: '0.08em',
                    color: '#fff', background: GBTN,
                    padding: '4px 10px', borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 0 10px rgba(124,58,237,0.4)',
                  }}>
                    <Sparkles style={{ width: 9, height: 9 }} />MOST POPULAR
                  </span>
                </div>

                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.12em', color: C.purpleBright, textTransform: 'uppercase', marginBottom: 8 }}>
                  Sorcerer
                </p>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ ...GTEXT, fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700, fontSize: 44, lineHeight: 1 }}>£10</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textDim, marginLeft: 4 }}>/month</span>
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Less than £0.35 per idea</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    '20 fresh ideas per week',
                    'Full 5-paragraph GPT-4o analysis',
                    'All 4 platform comparisons',
                    'Trend charts & 6-month data',
                    'Interactive margin calculator',
                    'Source links (Temu, AliExpress, Alibaba)',
                    'Full report history',
                    'Priority support',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.text }}>
                      <Check style={{ width: 14, height: 14, color: C.purpleBright, flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                  color: '#fff', background: GBTN, borderRadius: 9, padding: '12px 20px',
                  boxShadow: '0 0 20px rgba(124,58,237,0.40), 0 4px 14px rgba(0,0,0,0.4)',
                }}>
                  ✦ Subscribe — £10/mo
                </Link>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 10 }}>Cancel anytime</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/pricing"
                style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textMuted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '12px 8px' }}
                className="hover:text-white transition-colors"
              >
                See full feature comparison →
              </Link>
            </div>
          </div>
        </section>

        <MagicDivider />

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <FadeUp style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.14em', color: C.textMuted, marginBottom: 14 }}>
                THE GRIMOIRE
              </p>
              <h2 style={{
                fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(30px,4vw,52px)',
                letterSpacing: '-0.01em', lineHeight: 0.97, margin: 0,
              }}>
                <span style={{ color: C.text }}>Common</span>{' '}
                <span style={GTEXT}>Questions</span>
              </h2>
            </FadeUp>
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
              ].map(({ q, a }, i) => (
                <motion.details
                  key={q}
                  className="group"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-24px' }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  style={{ ...GLASS, borderRadius: 10 }}
                >
                  <summary style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, color: C.text,
                    padding: '14px 18px', cursor: 'pointer', listStyle: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    {q}
                    <span style={{ color: C.textMuted, flexShrink: 0, marginLeft: 12 }} className="group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: C.textDim, lineHeight: 1.72, padding: '0 18px 14px' }}>{a}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section style={{ padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Big glow backdrop */}
          <div className="animate-pulse-glow" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 400,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.20) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* Large logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <Logo size={64} />
            </div>
            <h2 style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif', fontWeight: 700,
              textTransform: 'uppercase', fontSize: 'clamp(40px,6vw,68px)', lineHeight: 0.95,
              letterSpacing: '-0.01em', marginBottom: 20,
            }}>
              <span style={{ color: C.text }}>Ready to Work</span><br />
              <span style={GTEXT}>Your Magic?</span>
            </h2>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, color: C.textDim, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Join 1,200+ entrepreneurs finding profitable products with Sorcery. Start free — no credit card, no ritual sacrifice required.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              <a
                href="#"
                onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15,
                  color: '#fff', background: GBTN, textDecoration: 'none',
                  padding: '14px 36px', borderRadius: 10,
                  boxShadow: '0 0 32px rgba(124,58,237,0.50), 0 4px 20px rgba(0,0,0,0.5)',
                  border: `1px solid ${C.borderGlow}`,
                }}
              >
                ✦ Start for free
                <ArrowRight style={{ width: 17, height: 17 }} />
              </a>
              <Link to="/pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                fontFamily: 'Outfit,sans-serif', fontSize: 14, color: C.textDim, textDecoration: 'none',
              }} className="hover:text-white transition-colors">
                See Pro features →
              </Link>
            </div>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: C.textMuted, marginTop: 22, letterSpacing: '0.06em' }}>
              2 FREE IDEAS · NO CREDIT CARD · 60 SECONDS
            </p>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer style={{
          borderTop:   `1px solid ${C.border}`,
          padding:     '20px 28px',
          background:  'rgba(7,5,17,0.95)',
          display:     'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <Wordmark size="sm" />
          <div style={{ display: 'flex', gap: 20 }}>
            {([
              { label: 'How it works', href: '#how-it-works', isAnchor: true  },
              { label: 'Pricing',      href: '/pricing',      isAnchor: false },
              { label: 'Sign in',      href: '/auth/signin',  isAnchor: false },
              { label: 'Sign up',      href: '/auth/signup',  isAnchor: false },
            ] as const).map(({ label, href, isAnchor }) =>
              isAnchor
                ? <a   key={label} href={href}  style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</a>
                : <Link key={label} to={href}   style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: C.textMuted, textDecoration: 'none' }} className="hover:text-white transition-colors">{label}</Link>
            )}
          </div>
          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: C.textMuted, letterSpacing: '0.06em' }}>
            © {new Date().getFullYear()} SORCERY
          </p>
        </footer>

      </div>{/* /z-1 wrapper */}
    </div>
  )
}
