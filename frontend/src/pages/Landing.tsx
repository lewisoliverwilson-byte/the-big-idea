import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, TrendingUp, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { QuizAnswers } from '../types'

// ─── Quiz data ────────────────────────────────────────────────────────────────

const STEPS = 5

interface Option {
  id: string
  emoji: string
  label: string
  sublabel: string
}

const BUDGET_OPTIONS: Option[] = [
  { id: '175',  emoji: '🌱', label: '£100 – £250',   sublabel: 'Just getting started' },
  { id: '375',  emoji: '📈', label: '£250 – £500',   sublabel: 'Ready to invest' },
  { id: '1000', emoji: '💼', label: '£500 – £1,500', sublabel: 'Serious about this' },
  { id: '2000', emoji: '🚀', label: '£1,500+',       sublabel: 'All in' },
]

const SIZE_OPTIONS: Option[] = [
  { id: 'small',  emoji: '📦', label: 'Small', sublabel: 'Fits in a bag or jiffy bag' },
  { id: 'medium', emoji: '🗂️', label: 'Medium', sublabel: 'Shoebox size' },
  { id: 'large',  emoji: '📫', label: 'Large', sublabel: 'Takes up a shelf' },
  { id: 'xlarge', emoji: '🏭', label: 'Any size', sublabel: "I'll use a fulfilment centre" },
]

const CATEGORY_OPTIONS: Option[] = [
  { id: 'Home & Garden',        emoji: '🏠', label: 'Home & Gadgets',       sublabel: 'Practical everyday items' },
  { id: 'Beauty & Health',      emoji: '✨', label: 'Beauty & Health',      sublabel: 'Skincare, wellness, grooming' },
  { id: 'Toys & Games',         emoji: '🎮', label: 'Toys & Hobbies',       sublabel: 'Games, collectibles, fun' },
  { id: 'Fashion Accessories',  emoji: '👜', label: 'Fashion & Accessories', sublabel: 'Jewellery, bags, clothing' },
  { id: 'No preference',        emoji: '🎲', label: 'Surprise me',          sublabel: 'Show me the best opportunity' },
]

const PLATFORM_OPTIONS: Option[] = [
  { id: 'amazon',   emoji: '📦', label: 'Amazon',   sublabel: 'Biggest marketplace, high competition' },
  { id: 'ebay',     emoji: '🛒', label: 'eBay',     sublabel: 'Great for unique & second-hand' },
  { id: 'etsy',     emoji: '🎨', label: 'Etsy',     sublabel: 'Perfect for niche & creative products' },
  { id: 'shopify',  emoji: '🛍️', label: 'Shopify',  sublabel: 'Your own brand, full control' },
  { id: 'any',      emoji: '🤷', label: "I'm not sure", sublabel: "Show me the best platform" },
]

const GOAL_OPTIONS: Option[] = [
  { id: 'volume',   emoji: '⚡', label: 'Quick wins',        sublabel: 'Fast-selling, high volume' },
  { id: 'margin',   emoji: '💰', label: 'Big margins',       sublabel: 'Fewer sales, higher profit per unit' },
  { id: 'trending', emoji: '🔥', label: 'Trending right now', sublabel: 'Only products with upward momentum' },
  { id: 'safe',     emoji: '🛡️', label: 'Low risk',          sublabel: 'Proven products with stable demand' },
]

const QUESTIONS = [
  { step: 1, title: "What's your starting budget?", subtitle: "This helps us filter products you can actually buy.", options: BUDGET_OPTIONS },
  { step: 2, title: "How much storage space do you have?", subtitle: "We'll match products to your logistics reality.", options: SIZE_OPTIONS },
  { step: 3, title: "What kind of products interest you?", subtitle: "We'll prioritise your preferred category.", options: CATEGORY_OPTIONS },
  { step: 4, title: "Where do you want to sell?", subtitle: "Each marketplace has different margins and audiences.", options: PLATFORM_OPTIONS },
  { step: 5, title: "What matters most to you?", subtitle: "We'll tune your results to match your goals.", options: GOAL_OPTIONS },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function saveQuizToStorage(answers: Partial<QuizAnswers>) {
  localStorage.setItem('bigidea_quiz', JSON.stringify(answers))
}

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

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total + 1)) * 100)
  return (
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Option tile ──────────────────────────────────────────────────────────────

function OptionTile({
  option,
  selected,
  onClick,
  index,
}: {
  option: Option
  selected: boolean
  onClick: () => void
  index: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 w-full rounded-xl border-2 px-5 py-4 text-left
        transition-all duration-150 cursor-pointer
        ${selected
          ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800'
        }
      `}
    >
      {/* Keyboard hint */}
      <div className={`
        absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border text-xs
        flex items-center justify-center font-mono font-bold shrink-0
        transition-colors
        ${selected ? 'border-amber-400 text-amber-400' : 'border-slate-600 text-slate-500'}
      `}>
        {index + 1}
      </div>

      <span className="text-2xl leading-none">{option.emoji}</span>
      <div className="flex-1 min-w-0 pr-8">
        <p className={`font-semibold text-base ${selected ? 'text-amber-400' : 'text-white'}`}>
          {option.label}
        </p>
        <p className="text-sm text-slate-400 mt-0.5">{option.sublabel}</p>
      </div>

      {selected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-slate-900" />
        </div>
      )}
    </button>
  )
}

// ─── Step screen ──────────────────────────────────────────────────────────────

function QuizStep({
  question,
  value,
  onSelect,
  onBack,
  step,
}: {
  question: typeof QUESTIONS[0]
  value: string | null
  onSelect: (val: string) => void
  onBack: () => void
  step: number
}) {
  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key)
      if (num >= 1 && num <= question.options.length) {
        onSelect(question.options[num - 1].id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [question.options, onSelect])

  return (
    <div className="animate-fadeIn">
      {/* Question number */}
      <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
        Question {step} of {STEPS}
      </p>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
        {question.title}
      </h2>
      <p className="text-slate-400 mb-8">{question.subtitle}</p>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <OptionTile
            key={opt.id}
            option={opt}
            selected={value === opt.id}
            onClick={() => onSelect(opt.id)}
            index={i}
          />
        ))}
      </div>

      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}
    </div>
  )
}

// ─── Email capture ────────────────────────────────────────────────────────────

function EmailCapture({
  onSubmit,
  onBack,
  isLoading,
}: {
  onSubmit: (email: string, name: string) => void
  onBack: () => void
  isLoading: boolean
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const valid = email.includes('@') && email.includes('.') && email.length > 5

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (valid) onSubmit(email, name)
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn">
      <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
        Almost there
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
        Where should we send your results?
      </h2>
      <p className="text-slate-400 mb-8">
        We'll create your free account and start finding products that match your criteria.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Your first name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Alex"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email address <span className="text-amber-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
          {touched && !valid && (
            <p className="text-red-400 text-xs mt-1.5">Please enter a valid email address.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-4 rounded-xl text-base transition-colors shadow-lg shadow-amber-400/20"
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Get My Free Ideas
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <p className="text-center text-slate-500 text-xs mt-4">
        2 free reports, no credit card required.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mx-auto"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<number | 'email'>(1)
  const [answers, setAnswers] = useState<{
    budget: string | null
    unitSize: string | null
    category: string | null
    platform: string | null
    goal: string | null
  }>({ budget: null, unitSize: null, category: null, platform: null, goal: null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If already signed in, show shorter version with a direct CTA
  useEffect(() => {
    if (isAuthenticated) {
      // Still show the quiz — it will pass params to dashboard
    }
  }, [isAuthenticated])

  const answerKeys = ['budget', 'unitSize', 'category', 'platform', 'goal'] as const

  const getValueForStep = (s: number) => answers[answerKeys[s - 1]]

  const handleSelect = useCallback((val: string) => {
    const key = answerKeys[(step as number) - 1]
    setAnswers(prev => ({ ...prev, [key]: val }))
    // Auto-advance after short delay for satisfying feedback
    setTimeout(() => {
      if ((step as number) < STEPS) {
        setStep((step as number) + 1)
      } else {
        setStep('email')
      }
    }, 220)
  }, [step])

  const handleBack = () => {
    if (step === 'email') {
      setStep(STEPS)
    } else if ((step as number) > 1) {
      setStep((step as number) - 1)
    }
  }

  const handleEmailSubmit = async (email: string, name: string) => {
    setIsSubmitting(true)

    // Map quiz answers to SearchParams-compatible format
    const quizAnswers: QuizAnswers = {
      budgetGbp: parseInt(answers.budget || '375'),
      unitSize: (answers.unitSize || 'medium') as QuizAnswers['unitSize'],
      category: answers.category || 'No preference',
      platform: answers.platform || 'any',
      goal: (answers.goal || 'safe') as QuizAnswers['goal'],
    }

    saveQuizToStorage(quizAnswers)

    // Navigate to signup with email pre-filled
    const params = new URLSearchParams({
      email,
      name: name || '',
    })

    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate(`/auth/signup?${params.toString()}`)
    }
  }

  const currentStep = step === 'email' ? STEPS + 1 : (step as number)

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-400 rounded-lg p-1.5">
            <TrendingUp className="h-5 w-5 text-slate-900" />
          </div>
          <span className="font-bold text-white text-lg">The Big Idea</span>
        </div>

        {/* Sign in link */}
        <button
          type="button"
          onClick={() => navigate('/auth/signin')}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Sign in
        </button>
      </div>

      {/* Progress */}
      <div className="px-6">
        <ProgressBar step={currentStep} total={STEPS} />
      </div>

      {/* Quiz card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {step === 'email' ? (
            <EmailCapture
              onSubmit={handleEmailSubmit}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          ) : (
            <QuizStep
              question={QUESTIONS[(step as number) - 1]}
              value={getValueForStep(step as number)}
              onSelect={handleSelect}
              onBack={handleBack}
              step={step as number}
            />
          )}
        </div>
      </div>

      {/* Social proof footer */}
      <div className="text-center pb-8 px-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="flex -space-x-1">
              {['bg-amber-400', 'bg-emerald-400', 'bg-sky-400'].map((c, i) => (
                <span key={i} className={`w-5 h-5 rounded-full ${c} border border-slate-800`} />
              ))}
            </span>
            <span>1,200+ entrepreneurs using The Big Idea</span>
          </div>
          <span className="text-slate-600 hidden sm:block">·</span>
          <span className="text-slate-500 text-xs">Free to start · No credit card needed</span>
        </div>
      </div>
    </div>
  )
}
