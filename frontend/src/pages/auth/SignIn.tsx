import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signOut, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

const resetSchema = z.object({
  email: z.string().email('Invalid email'),
})

const confirmResetSchema = z.object({
  code: z.string().min(6, 'Enter the code'),
  newPassword: z.string().min(8, 'Min 8 characters'),
})

type FormData = z.infer<typeof schema>
type ResetData = z.infer<typeof resetSchema>
type ConfirmResetData = z.infer<typeof confirmResetSchema>

type Stage = 'signin' | 'forgot' | 'reset-confirm'

export function SignIn() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()
  const [stage, setStage] = useState<Stage>('signin')
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const {
    register: registerReset,
    handleSubmit: handleReset,
    formState: { errors: resetErrors, isSubmitting: isResetting },
  } = useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  const {
    register: registerConfirmReset,
    handleSubmit: handleConfirmReset,
    formState: { errors: confirmResetErrors, isSubmitting: isConfirmResetting },
  } = useForm<ConfirmResetData>({ resolver: zodResolver(confirmResetSchema) })

  const onSignIn = async (data: FormData) => {
    setError('')
    try {
      await signIn({ username: data.email, password: data.password })
      navigate('/dashboard')
    } catch (err: any) {
      // Amplify throws this when a session is already active (e.g. from a
      // previous sign-up that was auto-confirmed). Sign out the stale
      // session first, then retry once.
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
        username: resetEmail,
        confirmationCode: data.code,
        newPassword: data.newPassword,
      })
      setStage('signin')
      setSuccessMsg('Password reset! You can now sign in.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">The Big Idea</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {stage === 'signin' ? 'Sign in' : stage === 'forgot' ? 'Reset password' : 'Set new password'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {stage === 'reset-confirm' ? `Code sent to ${resetEmail}` : 'Welcome back'}
          </p>
        </div>

        {successMsg && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            {successMsg}
          </p>
        )}

        {stage === 'signin' && (
          <form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              {...register('password')}
              error={errors.password?.message}
            />

            <button
              type="button"
              onClick={() => setStage('forgot')}
              className="text-xs text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => signInWithRedirect({ provider: 'Google' })}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-indigo-600 font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </form>
        )}

        {stage === 'forgot' && (
          <form onSubmit={handleReset(onForgotPassword)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...registerReset('email')}
              error={resetErrors.email?.message}
            />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isResetting}>
              Send reset code
            </Button>
            <button
              type="button"
              onClick={() => setStage('signin')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to sign in
            </button>
          </form>
        )}

        {stage === 'reset-confirm' && (
          <form onSubmit={handleConfirmReset(onConfirmReset)} className="space-y-4">
            <Input
              label="Reset code"
              placeholder="123456"
              {...registerConfirmReset('code')}
              error={confirmResetErrors.code?.message}
            />
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              {...registerConfirmReset('newPassword')}
              error={confirmResetErrors.newPassword?.message}
            />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isConfirmResetting}>
              Set new password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
