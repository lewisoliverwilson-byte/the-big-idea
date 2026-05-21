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
import { TrendingUp } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
})

const confirmSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

type FormData = z.infer<typeof schema>
type ConfirmData = z.infer<typeof confirmSchema>

export function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<'signup' | 'confirm'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Pre-fill from quiz URL params
  const prefillEmail = searchParams.get('email') || ''
  const prefillName = searchParams.get('name') || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: prefillEmail,
      fullName: prefillName,
    },
  })

  // Apply prefills once on mount
  useEffect(() => {
    if (prefillEmail) setValue('email', prefillEmail)
    if (prefillName) setValue('fullName', prefillName)
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
        options: {
          userAttributes: {
            email: data.email,
            name: data.fullName,
          },
        },
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
      try {
        await signOut({ global: false })
      } catch {
        // ignore — no active session to clear
      }
      await signIn({ username: email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-amber-400 rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-slate-900" />
            </div>
            <span className="font-bold text-white text-lg">The Big Idea</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {stage === 'signup' ? 'Create your account' : 'Check your email'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {stage === 'signup'
              ? '2 free ideas to get you started'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {stage === 'signup' ? (
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors text-sm"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors text-sm"
                {...register('email')}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors text-sm"
                {...register('password')}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create account'
              )}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={() => signInWithRedirect({ provider: 'Google' })}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-amber-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirm(onConfirm)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Verification code</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors text-sm text-center tracking-widest text-lg"
                {...registerConfirm('code')}
              />
              {confirmErrors.code && <p className="text-red-400 text-xs mt-1">{confirmErrors.code.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={isConfirming}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors"
            >
              {isConfirming ? (
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify account'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStage('signup')}
              className="w-full text-sm text-slate-500 hover:text-slate-300 underline transition-colors"
            >
              Back to sign up
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
