import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowRight, ChevronLeft, Check,
  TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { QuizAnswers } from '../types'

// ─── Brand ────────────────────────────────────────────────────────────────────

/**
 * TBI app icon — dark rounded square, B in brand green.
 * Exported so Navbar/Dashboard can reuse it.
 */
export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-label="The Big Idea"
    >
      <rect width="32" height="32" rx="7" fill="#0A0A10" />
      <text
        x="3" y="21"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
        fontWeight="700" fontSize="16" fill="#ffffff"
      >T</text>
      <text
        x="10.5" y="21"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
        fontWeight="700" fontSize="16" fill="#22C55E"
      >B</text>
      <text
        x="20.5" y="21"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif"
        fontWeight="700" fontSize="16" fill="#ffffff"
      >I</text>
    </svg>
  )
}

/** Full wordmark: icon + "THE / BIG IDEA" with green I */
function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={28} />
      <div className="leading-none">
        <div className="font-outfit text-[8px] uppercase tracking-[0.22em] text-gray-500">THE</div>
        <div className="font-barlow font-bold text-[15px] text-white uppercase" style={{ letterSpacing: '-0.01em' }}>
          BIG <span className="text-green-500">I</span>DEA
        </div>
      </div>
    </div>
  )
}

// ─── Quiz data ────────────────────────────────────────────────────────────────

const STEPS = 5

interface QuizOption {
  id: string
  emoji: string
  label: string
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
    title: 'How much storage space do you have?',
    options: [
      { id: 'small',  emoji: '📦', label: 'Small',    sublabel: 'Fits in a bag or jiffy bag' },
      { id: 'medium', emoji: '🗂️', label: 'Medium',   sublabel: 'Shoebox size' },
      { id: 'large',  emoji: '📫', label: 'Large',    sublabel: 'Takes up a shelf' },
      { id: 'xlarge', emoji: '🏭', label: 'Any size', sublabel: "I'll use a fulfilment centre" },
    ],
  },
  {
    step: 3,
    title: 'What products interest you most?',
    options: [
      { id: 'Home & Garden',   emoji: '🏠', label: 'Home & Gadgets',  sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health', emoji: '✨', label: 'Beauty & Health', sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',    emoji: '🎮', label: 'Toys & Hobbies',  sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',   emoji: '🎲', label: 'Surprise me',     sublabel: 'Show me the best opportunity' },
    ],
  },
  {
    step: 4,
    title: 'Where do you want to sell?',
    options: [
      { id: 'amazon', emoji: '📦', label: 'Amazon',       sublabel: 'Biggest marketplace' },
      { id: 'ebay',   emoji: '🛒', label: 'eBay',         sublabel: 'Great for unique items' },
      { id: 'etsy',   emoji: '🎨', label: 'Etsy',         sublabel: 'Niche & creative products' },
      { id: 'any',    emoji: '🤷', label: "I'm not sure", sublabel: 'Show me the best platform' },
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
    <div className="mb-5">
      <div className="flex items-center justify-between font-dm text-[11px] text-gray-600 mb-2">
        <span>{step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-0.5 rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function QuizOptionBtn({ option, selected, onClick }: {
  option: QuizOption
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-left transition-all duration-150 cursor-pointer"
      style={{
        background:  selected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
        border:      selected ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="text-lg leading-none flex-shrink-0">{option.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-outfit font-semibold text-sm ${selected ? 'text-green-500' : 'text-gray-300'}`}>
          {option.label}
        </p>
        <p className="font-outfit text-xs text-gray-600 mt-0.5">{option.sublabel}</p>
      </div>
      {selected && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-[#0A0A10]" />
        </div>
      )}
    </button>
  )
}

// ─── Report card sub-components (sample preview) ─────────────────────────────

function Sparkline() {
  const vals = [35, 40, 38, 45, 43, 51, 55, 58, 63, 71, 82, 100]
  return (
    <div className="flex items-end gap-[3px]" style={{ height: '28px' }}>
      {vals.map((h, i) => {
        const opacity = (0.20 + (i / 11) * 0.80).toFixed(2)
        return (
          <div
            key={i}
            style={{
              height: `${h}%`, width: '7px', borderRadius: '2px', flexShrink: 0,
              backgroundColor: `rgba(34,197,94,${opacity})`,
            }}
          />
        )
      })}
    </div>
  )
}

function MetricTile({ label, value, sub, accent = false }: {
  label: string; value: string; sub: string; accent?: boolean
}) {
  return (
    <div
      className="rounded-lg p-2.5 flex-1"
      style={{ background: '#0A0A10', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="font-outfit uppercase tracking-wider mb-1 text-gray-600"
        style={{ fontSize: '10px', letterSpacing: '0.05em' }}>{label}</p>
      <p className={`font-dm leading-none ${accent ? 'text-green-500' : 'text-white'}`}
        style={{ fontSize: '17px' }}>{value}</p>
      <p className={`font-outfit mt-1 ${accent ? 'text-green-500' : 'text-gray-600'}`}
        style={{ fontSize: '10px' }}>{sub}</p>
    </div>
  )
}

function ScoreBadge({ label, value, variant }: {
  label: string; value: string; variant: 'opp' | 'risk'
}) {
  const isOpp = variant === 'opp'
  return (
    <div
      className="flex items-center gap-1 rounded-md px-2 py-1"
      style={{
        background: isOpp ? 'rgba(34,197,94,0.10)' : 'rgba(251,191,36,0.08)',
        border:     isOpp ? '1px solid rgba(34,197,94,0.20)' : '1px solid rgba(251,191,36,0.18)',
      }}
    >
      <span
        className="font-dm font-bold"
        style={{ fontSize: '9px', letterSpacing: '0.05em', color: isOpp ? '#22C55E' : '#FCD34D' }}
      >{label}</span>
      <span
        className="font-dm"
        style={{ fontSize: '13px', color: isOpp ? '#22C55E' : '#FCD34D' }}
      >{value}</span>
    </div>
  )
}

function PlatformBar({ name, pct }: { name: string; pct: number }) {
  const opacity = (0.30 + (pct / 100) * 0.70).toFixed(2)
  return (
    <div className="flex items-center gap-2">
      <span className="font-outfit text-gray-400 flex-shrink-0" style={{ fontSize: '11px', width: '48px' }}>{name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: `rgba(34,197,94,${opacity})` }}
        />
      </div>
      <span className="font-dm text-gray-400 flex-shrink-0 text-right" style={{ fontSize: '10px', width: '30px' }}>{pct}%</span>
    </div>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    n: '01', icon: Globe,
    title: 'Answer 5 quick questions',
    desc:  'Budget, storage space, category, platform, goal. Under 60 seconds.',
  },
  {
    n: '02', icon: BarChart2,
    title: 'We scan 1,000+ products',
    desc:  'Buy prices from Temu, AliExpress and Alibaba cross-referenced against Amazon, eBay, Etsy and Shopify sell-side data.',
  },
  {
    n: '03', icon: TrendingUp,
    title: 'Full research report in 30s',
    desc:  'AI-written analysis, 6-month trend charts, exact margin breakdown, direct buy links — ready in under 30 seconds.',
  },
]

const FEATURES = [
  { icon: Zap,        title: 'AI analysis',             desc: 'GPT-4o writes a full opportunity analysis, competitive overview, and recommended strategy tailored to your inputs.' },
  { icon: TrendingUp, title: '6-month trend data',      desc: 'See whether a product is rising, falling, or seasonal before you commit a penny.' },
  { icon: DollarSign, title: 'Exact margin calculator', desc: 'Source price, shipping, platform fees all factored in. Profit per unit at 50, 100 and 200 units.' },
  { icon: BarChart2,  title: 'Platform comparison',     desc: 'Amazon vs eBay vs Etsy vs Shopify — margins, fees, estimated monthly sales and difficulty side by side.' },
  { icon: Globe,      title: 'Direct source links',     desc: 'One-click through to the exact listing on Temu, AliExpress or Alibaba. No digging required.' },
  { icon: ShieldCheck,title: 'Risk scoring',            desc: 'Over-saturated niches, downward trends, high MOQ risk — all flagged before you spend a penny.' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function Landing() {
  const navigate   = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [quizStep,      setQuizStep]      = useState<number | 'email'>(1)
  const [answers,       setAnswers]       = useState<{
    budget:   string | null
    unitSize: string | null
    category: string | null
    platform: string | null
    goal:     string | null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [email,         setEmail]         = useState('')
  const [emailTouched,  setEmailTouched]  = useState(false)
  const [isSubmitting,  setIsSubmitting]  = useState(false)

  const answerKeys = ['budget', 'unitSize', 'category', 'platform', 'goal'] as const
  const currentValue = quizStep === 'email' ? null : answers[answerKeys[(quizStep as number) - 1]]

  const handleSelect = useCallback((val: string) => {
    const key = answerKeys[(quizStep as number) - 1]
    setAnswers((prev) => ({ ...prev, [key]: val }))
    setTimeout(() => {
      if ((quizStep as number) < STEPS) {
        setQuizStep((quizStep as number) + 1)
      } else {
        setQuizStep('email')
      }
    }, 200)
  }, [quizStep])

  useEffect(() => {
    if (quizStep === 'email') return
    const q = QUIZ_QUESTIONS[(quizStep as number) - 1]
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key)
      if (num >= 1 && num <= q.options.length) handleSelect(q.options[num - 1].id)
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
    const quizAnswers: QuizAnswers = {
      budgetGbp: parseInt(answers.budget || '375'),
      unitSize:  (answers.unitSize || 'medium') as QuizAnswers['unitSize'],
      category:  answers.category || 'No preference',
      platform:  answers.platform || 'any',
      goal:      (answers.goal || 'safe') as QuizAnswers['goal'],
    }
    saveQuizToStorage(quizAnswers)
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate(`/auth/signup?${new URLSearchParams({ email }).toString()}`)
    }
  }

  const currentStep = quizStep === 'email' ? STEPS + 1 : (quizStep as number)
  const emailValid  = email.includes('@') && email.includes('.') && email.length > 5

  return (
    <div className="min-h-screen bg-[#0A0A10] font-outfit">

      {/* ════════════════════════════════════════════════
          NAVIGATION
      ════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background:    'rgba(10,10,16,0.92)',
          backdropFilter:'blur(12px)',
          borderBottom:  '1px solid rgba(255,255,255,0.06)',
          padding:       '15px 28px',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hidden sm:block font-outfit text-[13px] text-gray-400 hover:text-white transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hidden sm:block font-outfit text-[13px] text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link to="/auth/signin" className="font-outfit text-[13px] text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              to="/auth/signup"
              className="font-outfit font-semibold text-[13px] text-[#0A0A10] bg-green-500 hover:bg-green-400 transition-colors"
              style={{ padding: '8px 16px', borderRadius: '6px' }}
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#0A0A10', paddingTop: '88px', paddingBottom: '52px', paddingLeft: '28px', paddingRight: '28px' }}
      >
        {/* Green ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '10%', left: '55%', transform: 'translate(-50%, 0)',
            width: '700px', height: '400px',
            background: 'rgba(34,197,94,0.04)',
            borderRadius: '50%', filter: 'blur(80px)',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* ── Left: copy ── */}
            <div>
              <div
                className="inline-flex items-center gap-2 font-outfit font-semibold text-green-500 rounded-full mb-6"
                style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)',
                  padding: '6px 14px', fontSize: '12px',
                }}
              >
                <Zap className="h-3 w-3" />
                AI-powered · Results in under 30 seconds
              </div>

              <h1
                className="font-barlow font-bold text-white uppercase mb-5"
                style={{ fontSize: 'clamp(44px, 5.5vw, 72px)', lineHeight: 1, letterSpacing: '-0.01em' }}
              >
                Find winning<br />
                products<br />
                <span className="text-green-500">before</span> the<br />
                market does
              </h1>

              <p className="font-outfit text-gray-400 mb-8 max-w-md" style={{ fontSize: '15px', lineHeight: 1.7 }}>
                Tell us your budget and goals. We scan thousands of products across Temu, AliExpress and Alibaba — then calculate exactly what you'd make selling on Amazon, eBay, Etsy or Shopify.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { val: '1,200+', label: 'Entrepreneurs' },
                  { val: '30s',    label: 'Avg. report time' },
                  { val: '4',      label: 'Platforms covered' },
                  { val: '£10',    label: 'Pro per month' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="font-dm text-white" style={{ fontSize: '22px', lineHeight: 1 }}>{val}</p>
                    <p className="font-outfit text-gray-600 mt-1" style={{ fontSize: '11px' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: quiz card ── */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="w-full overflow-hidden"
                style={{
                  maxWidth: '400px',
                  background: '#13131B',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center gap-2"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '14px 20px',
                  }}
                >
                  <Logo size={20} />
                  <span className="font-outfit font-semibold text-gray-300" style={{ fontSize: '13px' }}>
                    Find my product
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  {quizStep !== 'email' ? (
                    <div className="animate-fadeIn">
                      <QuizProgress step={currentStep} total={STEPS} />
                      <h3 className="font-outfit font-semibold text-white mb-3" style={{ fontSize: '15px' }}>
                        {QUIZ_QUESTIONS[(quizStep as number) - 1].title}
                      </h3>
                      <div className="space-y-2">
                        {QUIZ_QUESTIONS[(quizStep as number) - 1].options.map((opt) => (
                          <QuizOptionBtn
                            key={opt.id}
                            option={opt}
                            selected={currentValue === opt.id}
                            onClick={() => handleSelect(opt.id)}
                          />
                        ))}
                      </div>
                      {(quizStep as number) > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizStep((quizStep as number) - 1)}
                          className="mt-3 flex items-center gap-1 font-outfit text-gray-600 hover:text-gray-400 transition-colors"
                          style={{ fontSize: '11px' }}
                        >
                          <ChevronLeft className="h-3 w-3" />
                          Back
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="animate-fadeIn">
                      <QuizProgress step={currentStep} total={STEPS} />
                      <h3 className="font-outfit font-semibold text-white mb-1" style={{ fontSize: '15px' }}>
                        Almost done!
                      </h3>
                      <p className="font-outfit text-gray-400 mb-4" style={{ fontSize: '13px' }}>
                        Enter your email to see your free results.
                      </p>
                      <div className="mb-4">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full font-outfit text-white placeholder-gray-600 outline-none transition-all"
                          style={{
                            background:   'rgba(255,255,255,0.05)',
                            border:       emailTouched && !emailValid ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.10)',
                            borderRadius: '8px',
                            padding:      '10px 14px',
                            fontSize:     '13px',
                          }}
                        />
                        {emailTouched && !emailValid && (
                          <p className="font-outfit text-red-500 mt-1.5" style={{ fontSize: '11px' }}>
                            Please enter a valid email.
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 font-outfit font-semibold bg-green-500 hover:bg-green-400 text-[#0A0A10] transition-colors disabled:opacity-60"
                        style={{ padding: '11px 16px', borderRadius: '8px', fontSize: '14px' }}
                      >
                        {isSubmitting ? (
                          <div
                            className="h-4 w-4 border-2 rounded-full animate-spin"
                            style={{ borderColor: '#0A0A10', borderTopColor: 'transparent' }}
                          />
                        ) : (
                          <>
                            Get My Free Ideas
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <p className="font-outfit text-gray-600 text-center mt-2.5" style={{ fontSize: '11px' }}>
                        2 free reports · No credit card required
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuizStep(STEPS)}
                        className="mt-2.5 flex items-center gap-1 mx-auto font-outfit text-gray-600 hover:text-gray-400 transition-colors"
                        style={{ fontSize: '11px' }}
                      >
                        <ChevronLeft className="h-3 w-3" />
                        Back
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════ */}
      <div
        style={{
          background:   '#13131B',
          borderTop:    '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding:      '18px 28px',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-outfit text-gray-600"
          style={{ fontSize: '13px' }}
        >
          <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Buy from Temu, AliExpress &amp; Alibaba</span>
          <span className="hidden sm:block text-gray-800">·</span>
          <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Sell on Amazon, eBay, Etsy &amp; Shopify</span>
          <span className="hidden sm:block text-gray-800">·</span>
          <span className="flex items-center gap-2"><span className="text-green-500">✓</span> AI analysis in under 30 seconds</span>
          <span className="hidden sm:block text-gray-800">·</span>
          <span className="flex items-center gap-2"><span className="text-green-500">✓</span> No credit card to start</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{ background: '#0A0A10', paddingTop: '64px', paddingBottom: '64px', paddingLeft: '28px', paddingRight: '28px' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-outfit font-semibold text-green-500 uppercase tracking-widest mb-3" style={{ fontSize: '12px' }}>
              How it works
            </p>
            <h2
              className="font-barlow font-bold text-white uppercase mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              From question to report in 3 steps
            </h2>
            <p className="font-outfit text-gray-400 mx-auto" style={{ maxWidth: '480px', fontSize: '14px', lineHeight: 1.7 }}>
              No spreadsheets. No hours of research. Answer a few questions and let us do the work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n}>
                <p
                  className="font-barlow font-bold leading-none select-none mb-4"
                  style={{ fontSize: '72px', color: 'rgba(34,197,94,0.08)' }}
                >
                  {n}
                </p>
                <div
                  className="rounded-lg p-2.5 w-fit mb-3"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                >
                  <Icon className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-outfit font-semibold text-white mb-2" style={{ fontSize: '15px' }}>{title}</h3>
                <p className="font-outfit text-gray-400" style={{ fontSize: '13px', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SAMPLE REPORT CARD
      ════════════════════════════════════════════════ */}
      <section
        style={{
          background:   '#13131B',
          borderTop:    '1px solid rgba(255,255,255,0.04)',
          paddingTop:   '64px', paddingBottom: '64px',
          paddingLeft:  '28px', paddingRight: '28px',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-outfit font-semibold text-green-500 uppercase tracking-widest mb-3" style={{ fontSize: '12px' }}>
              Sample report
            </p>
            <h2
              className="font-barlow font-bold text-white uppercase mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              This is what you get in every report
            </h2>
            <p className="font-outfit text-gray-400 mx-auto" style={{ maxWidth: '480px', fontSize: '14px', lineHeight: 1.7 }}>
              Real data. Every report is generated fresh from live marketplace data.
            </p>
          </div>

          {/* PRD-spec report card */}
          <div
            className="mx-auto"
            style={{
              maxWidth: '680px',
              background: '#13131B',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '22px',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="font-outfit uppercase text-gray-600 mb-1"
                  style={{ fontSize: '10px', letterSpacing: '0.08em' }}
                >
                  Home &amp; Gadgets
                </p>
                <p className="font-outfit font-semibold text-white" style={{ fontSize: '15px' }}>
                  Portable LED Ring Light
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ScoreBadge label="OPP" value="8.4" variant="opp" />
                <ScoreBadge label="RISK" value="3.1" variant="risk" />
              </div>
            </div>

            {/* Metric tiles — 3-column */}
            <div className="flex gap-2 mb-4">
              <MetricTile label="Buy price" value="$2.40"  sub="Temu · MOQ 50" />
              <MetricTile label="Avg. sell" value="$24.99" sub="Amazon" />
              <MetricTile label="Net margin" value="58%"   sub="After all fees" accent />
            </div>

            {/* Sparkline */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-dm uppercase text-gray-600" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>
                  Search trend — 12 weeks
                </p>
                <p className="font-dm text-green-500" style={{ fontSize: '10px' }}>+31%</p>
              </div>
              <Sparkline />
            </div>

            {/* Platform comparison bars */}
            <div className="mb-4">
              <p className="font-dm uppercase text-gray-600 mb-2.5" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>
                Platform opportunity
              </p>
              <div className="space-y-2">
                <PlatformBar name="Amazon" pct={82} />
                <PlatformBar name="eBay"   pct={71} />
                <PlatformBar name="Etsy"   pct={58} />
              </div>
            </div>

            {/* AI analysis — partial blur/lock */}
            <div
              className="relative"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md p-1.5" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <Zap className="h-3 w-3 text-green-500" />
                </div>
                <span className="font-dm uppercase text-gray-600" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>
                  AI Analysis
                </span>
                <span
                  className="font-outfit font-semibold text-green-500 rounded-full px-2 py-0.5"
                  style={{ fontSize: '9px', background: 'rgba(34,197,94,0.10)' }}
                >
                  Pro · GPT-4o
                </span>
              </div>
              <p className="font-outfit text-gray-400 mb-2" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                The portable LED ring light represents a compelling opportunity in the creator economy segment.
                Demand has grown 31% over six months, driven by the rise of content creation on TikTok and Instagram Reels…
              </p>
              <div
                className="pointer-events-none select-none"
                style={{ filter: 'blur(4px)', opacity: 0.35 }}
              >
                <p className="font-outfit text-gray-400" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                  The primary risk is moderate market saturation — approximately 4,200 competing listings on
                  Amazon. Differentiation through bundle offers and premium packaging can command a 15–20%
                  price premium over generic competitors.
                </p>
              </div>
              {/* Gradient overlay + CTA */}
              <div
                className="absolute inset-0 flex items-end justify-center pb-4"
                style={{ background: 'linear-gradient(to bottom, transparent 25%, rgba(19,19,27,0.97) 65%)' }}
              >
                <Link
                  to="/pricing"
                  className="font-outfit font-semibold text-green-500 transition-colors"
                  style={{
                    background: '#13131B',
                    border: '1px solid rgba(34,197,94,0.25)',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                  }}
                >
                  Unlock full analysis with Pro →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════ */}
      <section
        style={{
          background:   '#0A0A10',
          borderTop:    '1px solid rgba(255,255,255,0.04)',
          paddingTop:   '64px', paddingBottom: '64px',
          paddingLeft:  '28px', paddingRight: '28px',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-outfit font-semibold text-green-500 uppercase tracking-widest mb-3" style={{ fontSize: '12px' }}>
              What's included
            </p>
            <h2
              className="font-barlow font-bold text-white uppercase mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Everything you need to make the right call
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-6"
                style={{ background: '#13131B', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="rounded-lg p-2.5 w-fit mb-4"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}
                >
                  <Icon className="h-4 w-4 text-green-500" />
                </div>
                <h3 className="font-outfit font-semibold text-white mb-2" style={{ fontSize: '14px' }}>{title}</h3>
                <p className="font-outfit text-gray-400" style={{ fontSize: '13px', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════ */}
      <section
        id="pricing"
        style={{
          background:   '#0A0A10',
          borderTop:    '1px solid rgba(255,255,255,0.04)',
          paddingTop:   '64px', paddingBottom: '72px',
          paddingLeft:  '28px', paddingRight: '28px',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-outfit font-semibold text-green-500 uppercase tracking-widest mb-3" style={{ fontSize: '12px' }}>
              Pricing
            </p>
            <h2
              className="font-barlow font-bold text-white uppercase mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Start free. Upgrade when you're ready.
            </h2>
            <p className="font-outfit text-gray-400 mx-auto" style={{ maxWidth: '400px', fontSize: '14px' }}>
              Two free ideas to prove the value. Then £10 a month for everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Free card */}
            <div className="rounded-xl p-8" style={{ background: '#13131B', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-outfit font-semibold uppercase tracking-wider text-gray-600 mb-1" style={{ fontSize: '12px', letterSpacing: '0.08em' }}>
                Free
              </p>
              <div className="font-barlow font-bold text-white mb-6" style={{ fontSize: '44px', lineHeight: 1 }}>
                £0<span className="font-outfit font-normal text-gray-600" style={{ fontSize: '21px' }}>/forever</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[
                  '2 free ideas (lifetime)',
                  '1-paragraph AI summary',
                  'Margin calculator',
                  'Best platform only',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-outfit text-gray-300" style={{ fontSize: '13px' }}>
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/signup"
                className="block w-full text-center font-outfit font-semibold text-white transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '12px 22px', borderRadius: '8px', fontSize: '13px',
                }}
              >
                Get started free
              </Link>
            </div>

            {/* Pro card */}
            <div
              className="rounded-xl p-8 relative overflow-hidden"
              style={{ background: '#0F1C14', border: '1px solid rgba(34,197,94,0.30)' }}
            >
              <div className="absolute top-4 right-4">
                <span
                  className="font-outfit font-bold text-[#0A0A10] bg-green-500 rounded-full flex items-center gap-1"
                  style={{ fontSize: '10px', padding: '4px 10px' }}
                >
                  <Zap className="h-2.5 w-2.5" /> Most popular
                </span>
              </div>
              <p className="font-outfit font-semibold text-green-500 uppercase tracking-wider mb-1" style={{ fontSize: '12px', letterSpacing: '0.08em' }}>
                Pro
              </p>
              <div className="font-barlow font-bold text-white mb-1" style={{ fontSize: '44px', lineHeight: 1 }}>
                £10<span className="font-outfit font-normal text-gray-600" style={{ fontSize: '21px' }}>/month</span>
              </div>
              <p className="font-outfit mb-6" style={{ fontSize: '12px', color: 'rgba(34,197,94,0.70)' }}>
                Less than £0.35 per idea
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  '20 fresh ideas per week',
                  'Full 5-paragraph GPT-4o analysis',
                  'All 4 platform comparisons',
                  'Trend charts & 6-month data',
                  'Interactive margin calculator',
                  'Full report history',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-outfit text-gray-300" style={{ fontSize: '13px' }}>
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="block w-full text-center font-outfit font-bold text-[#0A0A10] bg-green-500 hover:bg-green-400 transition-colors"
                style={{ padding: '12px 22px', borderRadius: '8px', fontSize: '14px' }}
              >
                Subscribe — £10/mo
              </Link>
              <p className="font-outfit text-gray-600 text-center mt-2.5" style={{ fontSize: '11px' }}>
                Cancel anytime
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/pricing" className="font-outfit text-gray-400 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
              See full feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════ */}
      <section
        style={{
          background:   '#13131B',
          borderTop:    '1px solid rgba(255,255,255,0.04)',
          paddingTop:   '64px', paddingBottom: '64px',
          paddingLeft:  '28px', paddingRight: '28px',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-barlow font-bold text-white uppercase text-center mb-10"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            Common questions
          </h2>
          <div className="space-y-2.5">
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
              <details
                key={q}
                className="group rounded-xl"
                style={{ background: '#0A0A10', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer list-none font-outfit font-semibold text-gray-300 px-5 py-4"
                  style={{ fontSize: '13px' }}
                >
                  {q}
                  <span className="text-gray-600 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▾</span>
                </summary>
                <p className="font-outfit text-gray-400 px-5 pb-4" style={{ fontSize: '13px', lineHeight: 1.7 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════ */}
      <section
        className="text-center"
        style={{
          background:   '#0A0A10',
          borderTop:    '1px solid rgba(255,255,255,0.04)',
          paddingTop:   '64px', paddingBottom: '72px',
          paddingLeft:  '28px', paddingRight: '28px',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <Logo size={48} />
          </div>
          <h2
            className="font-barlow font-bold text-white uppercase mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 54px)', lineHeight: 1 }}
          >
            Ready to find your<br />next big idea?
          </h2>
          <p className="font-outfit text-gray-400 mb-8 mx-auto" style={{ maxWidth: '440px', fontSize: '14px', lineHeight: 1.7 }}>
            Join 1,200+ entrepreneurs using The Big Idea to find profitable products. Start free — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="flex items-center gap-2 font-outfit font-bold text-[#0A0A10] bg-green-500 hover:bg-green-400 transition-colors"
              style={{ padding: '14px 32px', borderRadius: '8px', fontSize: '14px' }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/pricing" className="font-outfit text-gray-400 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
              See Pro features →
            </Link>
          </div>
          <p className="font-outfit text-gray-800 mt-5" style={{ fontSize: '11px' }}>
            2 free ideas · No credit card · Takes 60 seconds
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer
        style={{
          background:  '#050810',
          borderTop:   '1px solid rgba(255,255,255,0.05)',
          padding:     '22px 28px',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-6">
            {(
              [
                { label: 'How it works', href: '#how-it-works', anchor: true  },
                { label: 'Pricing',      href: '/pricing',      anchor: false },
                { label: 'Sign in',      href: '/auth/signin',  anchor: false },
                { label: 'Sign up',      href: '/auth/signup',  anchor: false },
              ] as const
            ).map(({ label, href, anchor }) =>
              anchor ? (
                <a key={label} href={href} className="font-outfit text-gray-600 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
                  {label}
                </a>
              ) : (
                <Link key={label} to={href} className="font-outfit text-gray-600 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
                  {label}
                </Link>
              )
            )}
          </div>
          <p className="font-outfit text-gray-800" style={{ fontSize: '11px' }}>
            © {new Date().getFullYear()} The Big Idea
          </p>
        </div>
      </footer>
    </div>
  )
}
