import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signOut, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

const resetSchema = z.object({
  email: z.string().email('Invalid email'),
})

const confirmResetSchema = z.object({
  code:        z.string().min(6, 'Enter the code'),
  newPassword: z.string().min(8, 'Min 8 characters'),
})

type FormData        = z.infer<typeof schema>
type ResetData       = z.infer<typeof resetSchema>
type ConfirmResetData = z.infer<typeof confirmResetSchema>

type Stage = 'signin' | 'forgot' | 'reset-confirm'

// ─── Shared style constants ───────────────────────────────────────────────────

const inputCls =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 ' +
  'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-sm'

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

const submitBtnCls =
  'w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 ' +
  'text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-colors'

const errCls =
  'text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3'

// ─── Component ────────────────────────────────────────────────────────────────

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

export function SignIn() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()
  const [stage,      setStage]      = useState<Stage>('signin')
  const [resetEmail, setResetEmail] = useState('')
  const [error,      setError]      = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const { register: registerReset, handleSubmit: handleReset, formState: { errors: resetErrors, isSubmitting: isResetting } } =
    useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  const { register: registerConfirmReset, handleSubmit: handleConfirmReset, formState: { errors: confirmResetErrors, isSubmitting: isConfirmResetting } } =
    useForm<ConfirmResetData>({ resolver: zodResolver(confirmResetSchema) })

  const onSignIn = async (data: FormData) => {
    setError('')
    try {
      await signIn({ username: data.email, password: data.password })
      navigate('/dashboard')
    } catch (err: any) {
      if (
        err.name === 'UserAlreadyAuthenticatedException' ||
        err.message?.includes('already a signed in user')
      ) {
        try {
          await signOut({ global: false })
          await signIn({ username: data.email, password: data.password })
          navigate('/dashboard')
        } catch (retryErr: any) {
          setError(retryErr.message || 'Sign in failed. Please try again.')
        }
      } else {
        setError(err.message || 'Sign in failed. Check your credentials.')
      }
    }
  }

  const onForgotPassword = async (data: ResetData) => {
    setError('')
    try {
      await resetPassword({ username: data.email })
      setResetEmail(data.email)
      setStage('reset-confirm')
      setSuccessMsg('Check your email for the reset code.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.')
    }
  }

  const onConfirmReset = async (data: ConfirmResetData) => {
    setError('')
    try {
      await confirmResetPassword({
        username:         resetEmail,
        confirmationCode: data.code,
        newPassword:      data.newPassword,
      })
      setStage('signin')
      setSuccessMsg('Password reset! You can now sign in.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
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
            {stage === 'signin' ? 'Welcome back' : stage === 'forgot' ? 'Reset password' : 'Set new password'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {stage === 'reset-confirm'
              ? `Code sent to ${resetEmail}`
              : 'Sign in to your Sourcery account'}
          </p>
        </div>

        {successMsg && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
            {successMsg}
          </p>
        )}

        {/* ── Sign in form ── */}
        {stage === 'signin' && (
          <form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="you@example.com" className={inputCls} {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setStage('forgot')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input type="password" placeholder="Your password" className={inputCls} {...register('password')} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && <p className={errCls}>{error}</p>}

            <button type="submit" disabled={isSubmitting} className={submitBtnCls}>
              {isSubmitting
                ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Sign in'}
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
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-indigo-600 font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </form>
        )}

        {/* ── Forgot password form ── */}
        {stage === 'forgot' && (
          <form onSubmit={handleReset(onForgotPassword)} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="you@example.com" className={inputCls} {...registerReset('email')} />
              {resetErrors.email && <p className="text-red-500 text-xs mt-1">{resetErrors.email.message}</p>}
            </div>
            {error && <p className={errCls}>{error}</p>}
            <button type="submit" disabled={isResetting} className={submitBtnCls}>
              {isResetting
                ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Send reset code'}
            </button>
            <button
              type="button"
              onClick={() => setStage('signin')}
              className="w-full text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
            >
              Back to sign in
            </button>
          </form>
        )}

        {/* ── Confirm reset form ── */}
        {stage === 'reset-confirm' && (
          <form onSubmit={handleConfirmReset(onConfirmReset)} className="space-y-4">
            <div>
              <label className={labelCls}>Reset code</label>
              <input
                type="text"
                placeholder="123456"
                className={`${inputCls} text-center tracking-widest`}
                {...registerConfirmReset('code')}
              />
              {confirmResetErrors.code && <p className="text-red-500 text-xs mt-1">{confirmResetErrors.code.message}</p>}
            </div>
            <div>
              <label className={labelCls}>New password</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                className={inputCls}
                {...registerConfirmReset('newPassword')}
              />
              {confirmResetErrors.newPassword && <p className="text-red-500 text-xs mt-1">{confirmResetErrors.newPassword.message}</p>}
            </div>
            {error && <p className={errCls}>{error}</p>}
            <button type="submit" disabled={isConfirmResetting} className={submitBtnCls}>
              {isConfirmResetting
                ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
