import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, Check, TrendingUp, BarChart2, DollarSign, ShieldCheck, Zap, Globe, Star } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { QuizAnswers } from '../types'

// ─── Brand logo component ─────────────────────────────────────────────────────

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#F5B700" />
      <polyline
        points="5,23 11,15 17,18 27,8"
        stroke="#0A0E1A"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

const QUIZ_QUESTIONS: {
  step: number
  title: string
  options: QuizOption[]
}[] = [
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
      { id: 'small',  emoji: '📦', label: 'Small',   sublabel: 'Fits in a bag or jiffy bag' },
      { id: 'medium', emoji: '🗂️', label: 'Medium',  sublabel: 'Shoebox size' },
      { id: 'large',  emoji: '📫', label: 'Large',   sublabel: 'Takes up a shelf' },
      { id: 'xlarge', emoji: '🏭', label: 'Any size', sublabel: "I'll use a fulfilment centre" },
    ],
  },
  {
    step: 3,
    title: 'What products interest you most?',
    options: [
      { id: 'Home & Garden',       emoji: '🏠', label: 'Home & Gadgets',        sublabel: 'Practical everyday items' },
      { id: 'Beauty & Health',     emoji: '✨', label: 'Beauty & Health',       sublabel: 'Skincare, wellness, grooming' },
      { id: 'Toys & Games',        emoji: '🎮', label: 'Toys & Hobbies',        sublabel: 'Games, collectibles, fun' },
      { id: 'No preference',       emoji: '🎲', label: 'Surprise me',           sublabel: 'Show me the best opportunity' },
    ],
  },
  {
    step: 4,
    title: 'Where do you want to sell?',
    options: [
      { id: 'amazon',  emoji: '📦', label: 'Amazon',        sublabel: 'Biggest marketplace' },
      { id: 'ebay',    emoji: '🛒', label: 'eBay',          sublabel: 'Great for unique items' },
      { id: 'etsy',    emoji: '🎨', label: 'Etsy',          sublabel: 'Niche & creative products' },
      { id: 'any',     emoji: '🤷', label: "I'm not sure",  sublabel: 'Show me the best platform' },
    ],
  },
  {
    step: 5,
    title: "What's your main goal?",
    options: [
      { id: 'volume',   emoji: '⚡', label: 'Quick wins',         sublabel: 'Fast-selling, high volume' },
      { id: 'margin',   emoji: '💰', label: 'Big margins',        sublabel: 'Fewer sales, higher profit' },
      { id: 'trending', emoji: '🔥', label: 'Trending products',  sublabel: 'Only upward-momentum items' },
      { id: 'safe',     emoji: '🛡️', label: 'Low risk',           sublabel: 'Safe, proven products' },
    ],
  },
]

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getQuizFromStorage(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem('bigidea_quiz')
    return raw ? JSON.parse(raw) : null
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
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span>{step} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function QuizOptionBtn({
  option,
  selected,
  onClick,
}: {
  option: QuizOption
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group flex items-center gap-3 w-full rounded-xl border-2 px-4 py-3 text-left
        transition-all duration-150 cursor-pointer
        ${selected
          ? 'border-amber-400 bg-amber-50 shadow-[0_0_0_2px_rgba(245,183,0,0.2)]'
          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'
        }
      `}
    >
      <span className="text-xl leading-none flex-shrink-0">{option.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${selected ? 'text-amber-700' : 'text-slate-800'}`}>
          {option.label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{option.sublabel}</p>
      </div>
      {selected && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  )
}

// ─── Landing page sections ────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Globe,
    title: 'Answer 5 quick questions',
    desc: 'Tell us your budget, storage space, preferred category, target platform, and main goal. Takes under 60 seconds.',
  },
  {
    step: '02',
    icon: BarChart2,
    title: 'We scan 1,000+ products',
    desc: 'Our system cross-references buy prices on Temu, AliExpress and Alibaba against sell-side data on Amazon, eBay, Etsy and Shopify.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Get a full market research report',
    desc: 'AI-written analysis, 6-month trend charts, exact margin breakdown, and direct buy links — delivered in under 30 seconds.',
  },
]

const FEATURES = [
  { icon: Star,         title: 'AI analysis',           desc: 'GPT-4o writes a full opportunity analysis, competitive overview, and recommended strategy tailored to your inputs.' },
  { icon: TrendingUp,   title: '6-month trend data',    desc: 'See whether a product is rising, falling, or seasonal before you commit a penny.' },
  { icon: DollarSign,   title: 'Exact margin calculator', desc: 'Source price, shipping, platform fees — all factored in. See your profit per unit at 50, 100 and 200 units.' },
  { icon: BarChart2,    title: 'Platform comparison',   desc: 'Amazon vs eBay vs Etsy vs Shopify — margins, fees, estimated sales and difficulty rating side by side.' },
  { icon: Globe,        title: 'Direct source links',   desc: 'One-click through to the exact product listing on Temu, AliExpress, or Alibaba. No digging around required.' },
  { icon: ShieldCheck,  title: 'Risk scoring',          desc: 'We flag over-saturated niches, downward trends, and high MOQ risk so you know the downside before you buy.' },
]

const SAMPLE_STATS = [
  { label: 'Buy price',          value: '$2.40',   sub: 'Temu · MOQ 50 units',       color: 'text-slate-900' },
  { label: 'Avg. sell price',    value: '$24.99',  sub: 'Amazon (recommended)',       color: 'text-slate-900' },
  { label: 'Estimated margin',   value: '58%',     sub: 'After fees & shipping',      color: 'text-emerald-600' },
  { label: 'Opportunity score',  value: '8 / 10',  sub: 'Trending ↑ 31% (6 months)',  color: 'text-amber-600' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // Quiz state
  const [quizStep, setQuizStep] = useState<number | 'email'>(1)
  const [answers, setAnswers] = useState<{
    budget: string | null
    unitSize: string | null
    category: string | null
    platform: string | null
    goal: string | null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const answerKeys = ['budget', 'unitSize', 'category', 'platform', 'goal'] as const

  const currentValue = quizStep === 'email' ? null : answers[answerKeys[(quizStep as number) - 1]]

  const handleSelect = useCallback(
    (val: string) => {
      const key = answerKeys[(quizStep as number) - 1]
      setAnswers((prev) => ({ ...prev, [key]: val }))
      setTimeout(() => {
        if ((quizStep as number) < STEPS) {
          setQuizStep((quizStep as number) + 1)
        } else {
          setQuizStep('email')
        }
      }, 200)
    },
    [quizStep],
  )

  // Keyboard support
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
      unitSize: (answers.unitSize || 'medium') as QuizAnswers['unitSize'],
      category: answers.category || 'No preference',
      platform: answers.platform || 'any',
      goal: (answers.goal || 'safe') as QuizAnswers['goal'],
    }
    saveQuizToStorage(quizAnswers)

    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      const params = new URLSearchParams({ email })
      navigate(`/auth/signup?${params.toString()}`)
    }
  }

  const currentStep = quizStep === 'email' ? STEPS + 1 : (quizStep as number)
  const emailValid = email.includes('@') && email.includes('.') && email.length > 5

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070B14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-bold text-white text-lg tracking-tight">The Big Idea</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block">How it works</a>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block">Pricing</a>
            <Link to="/auth/signin" className="text-slate-400 hover:text-white text-sm transition-colors">Sign in</Link>
            <Link
              to="/auth/signup"
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-[#070B14] pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-3 py-1.5 text-xs font-semibold mb-6">
                <Zap className="h-3 w-3" />
                AI-powered · Results in under 30 seconds
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] mb-5">
                Find dropshipping products{' '}
                <span className="text-amber-400">before your competition does</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                Tell us your budget and goals. We scan thousands of products across Temu, AliExpress and Alibaba — then calculate exactly what you'd make selling on Amazon, eBay, Etsy or Shopify.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  { val: '1,200+', label: 'Entrepreneurs' },
                  { val: '30s',    label: 'Avg. report time' },
                  { val: '4',      label: 'Platforms covered' },
                  { val: '£10',    label: 'Pro/month' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-white">{val}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quiz card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Card header */}
                <div className="bg-[#070B14] px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Logo size={22} />
                    <span className="text-white font-semibold text-sm">Find my product</span>
                  </div>
                </div>

                <div className="p-6">
                  {quizStep !== 'email' ? (
                    <div className="animate-fadeIn">
                      <QuizProgress step={currentStep} total={STEPS} />

                      <h3 className="text-lg font-bold text-slate-900 mb-4">
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
                          className="mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Back
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="animate-fadeIn">
                      <QuizProgress step={currentStep} total={STEPS} />

                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        Almost done!
                      </h3>
                      <p className="text-sm text-slate-500 mb-5">
                        Enter your email to see your free results.
                      </p>

                      <div className="mb-4">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full border-2 border-slate-200 focus:border-amber-400 outline-none rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors"
                        />
                        {emailTouched && !emailValid && (
                          <p className="text-red-500 text-xs mt-1.5">Please enter a valid email.</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-4 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-400/30"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Get My Free Ideas
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-slate-400 mt-3">
                        2 free reports · No credit card required
                      </p>

                      <button
                        type="button"
                        onClick={() => setQuizStep(STEPS)}
                        className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mx-auto"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
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

      {/* ── Social proof bar ── */}
      <div className="bg-[#0A0F1E] border-y border-white/5 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-400">
          <span className="flex items-center gap-2"><span className="text-amber-400">✓</span> Buy from Temu, AliExpress & Alibaba</span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span className="flex items-center gap-2"><span className="text-amber-400">✓</span> Sell on Amazon, eBay, Etsy & Shopify</span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span className="flex items-center gap-2"><span className="text-amber-400">✓</span> AI analysis in under 30 seconds</span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span className="flex items-center gap-2"><span className="text-amber-400">✓</span> No credit card to start</span>
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              From question to research report in 3 steps
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No spreadsheets. No hours of research. Just answer a few questions and let us do the work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-amber-400/10 mb-4 leading-none select-none">{step}</div>
                <div className="bg-amber-400 rounded-xl p-3 w-fit mb-4">
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample report preview ── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">Sample report</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              This is what you get in every report
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Real data, not generic advice. Every report is generated fresh from live marketplace data.
            </p>
          </div>

          {/* Mock report card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Window chrome */}
            <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-slate-400 text-xs font-mono">Sample Report — Portable LED Ring Light</span>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
              {SAMPLE_STATS.map(({ label, value, sub, color }) => (
                <div key={label} className="p-5">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>
            {/* AI analysis preview */}
            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-400/10 rounded-md flex items-center justify-center">
                  <Star className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AI Analysis preview</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro · GPT-4o</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                The portable LED ring light represents a compelling dropshipping opportunity in the creator economy segment. Demand has grown 31% over the past six months, driven by the continued rise of content creation across TikTok and Instagram Reels. The entry price point of $2.40 from Temu with a realistic sell price of $24.99 on Amazon yields a margin of approximately 58% after fees — well above the threshold needed to justify inventory commitment…
              </p>
              <div className="mt-3 relative">
                <div className="blur-sm opacity-50 pointer-events-none">
                  <p className="text-sm text-slate-600">The primary risk is moderate market saturation, with approximately 4,200 competing listings on Amazon in the LED ring light category. However, differentiation through bundle offers (phone holder + ring light) and premium packaging can command a 15–20% price premium…</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-white/80">
                  <Link to="/pricing" className="bg-slate-900 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-800 transition-colors">
                    Unlock full analysis with Pro →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">What's included</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Everything you need to make the right call
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Every report packs data that would take hours to compile manually — delivered in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-amber-50">
                <div className="w-10 h-10 bg-amber-400/10 group-hover:bg-amber-400/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 bg-[#070B14]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Two free ideas to prove the value, then £10 a month for everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-1">Free</h3>
              <p className="text-slate-400 text-sm mb-6">Try it out, no commitment</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">£0</span>
                <span className="text-slate-400 text-sm ml-1">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '2 free ideas (lifetime)',
                  '1-paragraph AI summary',
                  'Margin calculator',
                  'Best platform only',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/signup"
                className="block w-full text-center border border-white/20 hover:border-white/40 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-slate-900 border border-amber-400/30 rounded-2xl p-8 overflow-hidden shadow-xl shadow-amber-400/10">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-4 right-4">
                <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Most popular
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-slate-400 text-sm mb-6">For serious dropshippers</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white">£10</span>
                  <span className="text-slate-400 text-sm ml-1">/month</span>
                </div>
                <p className="text-amber-400/70 text-xs mb-8">Less than £0.35 per idea</p>
                <ul className="space-y-3 mb-8">
                  {[
                    '20 fresh ideas per week',
                    'Full 5-paragraph GPT-4o analysis',
                    'All 4 platform comparisons',
                    'Trend charts & 6-month data',
                    'Interactive margin calculator',
                    'Full report history',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                      <Check className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className="block w-full text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-400/20"
                >
                  Subscribe — £10/mo
                </Link>
                <p className="text-center text-slate-500 text-xs mt-3">Cancel anytime</p>
              </div>
            </div>
          </div>

          <Link to="/pricing" className="block text-center mt-8 text-slate-400 hover:text-white text-sm transition-colors underline">
            See full feature comparison →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Common questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "How accurate is the data?",
                a: "Our product database is refreshed from real marketplace listings regularly. Buy prices come directly from Temu, AliExpress and Alibaba. Sell-side estimates are based on completed listings and sales rank data from Amazon, eBay, and Etsy."
              },
              {
                q: "What's the difference between free and Pro?",
                a: "Free gives you 2 lifetime ideas with a short 1-paragraph summary and your best platform only. Pro gives you 20 ideas every week with a full 5-paragraph GPT-4o research report, all 4 platform comparisons, and 6-month trend charts."
              },
              {
                q: "How is this different from just searching Google?",
                a: "We pull buy-side and sell-side data simultaneously, calculate your actual margin after all fees and shipping, show you 6 months of trend data, and generate a written analysis — all in under 30 seconds. Google can't tell you your margin on a specific product."
              },
              {
                q: "Can I cancel Pro anytime?",
                a: "Yes. Cancel from your account settings and you keep Pro access until the end of that billing month. No questions asked."
              },
              {
                q: "What platforms do you cover?",
                a: "Buy-side: Temu, AliExpress, Alibaba. Sell-side: Amazon, eBay, Etsy, Shopify. We show margins, fees, and estimated monthly sales on each platform."
              },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 rounded-xl px-6 py-4 transition-colors">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-slate-900 text-sm">
                  {q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▾</span>
                </summary>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 bg-[#070B14]">
        <div className="max-w-3xl mx-auto text-center">
          <Logo size={48} className="mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to find your next big idea?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join 1,200+ entrepreneurs using The Big Idea to find profitable products. Start free — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-amber-400/20"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/pricing"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              See Pro features →
            </Link>
          </div>
          <p className="text-slate-600 text-xs mt-5">2 free ideas · No credit card · Takes 60 seconds</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#050810] border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-semibold text-white text-sm">The Big Idea</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="text-slate-500 hover:text-white transition-colors">How it works</a>
            <Link to="/pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</Link>
            <Link to="/auth/signin" className="text-slate-500 hover:text-white transition-colors">Sign in</Link>
            <Link to="/auth/signup" className="text-slate-500 hover:text-white transition-colors">Sign up</Link>
          </div>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} The Big Idea</p>
        </div>
      </footer>
    </div>
  )
}
