import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  signUp,
  confirmSignUp,
  signIn,
  signInWithRedirect,
} from 'aws-amplify/auth'
import { TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

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
  const [stage, setStage] = useState<'signup' | 'confirm'>('signup')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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
      setStage('confirm')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    }
  }

  const onConfirm = async (data: ConfirmData) => {
    setError('')
    try {
      await confirmSignUp({ username: email, confirmationCode: data.code })
      // Auto sign in after confirm - handled by Hub listener in useAuth
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">The Big Idea</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {stage === 'signup' ? 'Create your account' : 'Check your email'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {stage === 'signup'
              ? '2 free reports to get you started'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {stage === 'signup' ? (
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Lewis Wilson"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
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
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              {...register('password')}
              error={errors.password?.message}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Create account
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
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4"
              />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/auth/signin"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirm(onConfirm)} className="space-y-4">
            <Input
              label="Verification code"
              placeholder="123456"
              maxLength={6}
              {...registerConfirm('code')}
              error={confirmErrors.code?.message}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isConfirming}
            >
              Verify account
            </Button>

            <button
              type="button"
              onClick={() => setStage('signup')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to sign up
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
