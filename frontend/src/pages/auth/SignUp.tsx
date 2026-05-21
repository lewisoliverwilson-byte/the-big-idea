import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  signInWithRedirect,
} from 'aws-amplify/auth'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  email:    z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
})

const confirmSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

type FormData    = z.infer<typeof schema>
type ConfirmData = z.infer<typeof confirmSchema>

// ─── Shared style constants ───────────────────────────────────────────────────

const inputCls =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 ' +
  'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-sm'

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

const submitBtnCls =
  'w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 ' +
  'text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-colors'

function SIcon() {
  return (
    <div style={{
      width: 36, height: 36, background: '#4F46E5',
      borderRadius: 9, display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
      fontWeight: 700, fontSize: 21, color: '#fff',
      letterSpacing: '-0.02em', lineHeight: 1,
    }}>
      S
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SignUp() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const [stage,  setStage]  = useState<'signup' | 'confirm'>('signup')
  const [email,  setEmail]  = useState('')
  const [password, setPassword] = useState('')
  const [error,  setError]  = useState('')

  // Pre-fill from quiz URL params
  const prefillEmail = searchParams.get('email') || ''
  const prefillName  = searchParams.get('name')  || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver:      zodResolver(schema),
    defaultValues: { email: prefillEmail, fullName: prefillName },
  })

  // Apply prefills once on mount
  useEffect(() => {
    if (prefillEmail) setValue('email',    prefillEmail)
    if (prefillName)  setValue('fullName', prefillName)
  }, [prefillEmail, prefillName, setValue])

  const {
    register: registerConfirm,
    handleSubmit: handleConfirm,
    formState: { errors: confirmErrors, isSubmitting: isConfirming },
  } = useForm<ConfirmData>({ resolver: zodResolver(confirmSchema) })

  const onSignUp = async (data: FormData) => {
    setError('')
    try {
      await signUp({
        username: data.email,
        password: data.password,
        options:  { userAttributes: { email: data.email, name: data.fullName } },
      })
      setEmail(data.email)
      setPassword(data.password)
      setStage('confirm')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    }
  }

  const onConfirm = async (data: ConfirmData) => {
    setError('')
    try {
      await confirmSignUp({ username: email, confirmationCode: data.code })
      // confirmSignUp does NOT create a session — sign in explicitly.
      try { await signOut({ global: false }) } catch { /* ignore */ }
      await signIn({ username: email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-6 no-underline">
            <SIcon />
            <span style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700, fontSize: 20, color: '#0F172A', letterSpacing: '-0.01em',
            }}>
              Sourcery
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {stage === 'signup' ? 'Create your account' : 'Check your email'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {stage === 'signup'
              ? '2 free ideas to get you started'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {stage === 'signup' ? (
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input type="text" placeholder="Alex Johnson" className={inputCls} {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="you@example.com" className={inputCls} {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className={inputCls}
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting} className={submitBtnCls}>
              {isSubmitting
                ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Create account'}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => signInWithRedirect({ provider: 'Google' })}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-indigo-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirm(onConfirm)} className="space-y-4">
            <div>
              <label className={labelCls}>Verification code</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                className={`${inputCls} text-center tracking-widest text-lg`}
                {...registerConfirm('code')}
              />
              {confirmErrors.code && <p className="text-red-500 text-xs mt-1">{confirmErrors.code.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            )}

            <button type="submit" disabled={isConfirming} className={submitBtnCls}>
              {isConfirming
                ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Verify account'}
            </button>

            <button
              type="button"
              onClick={() => setStage('signup')}
              className="w-full text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
            >
              Back to sign up
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
