import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signOut, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { useAuthStore } from '../../store/authStore'
import { Logo } from '../../components/layout/Navbar'
import type { CSSProperties } from 'react'

// ─── Schemas ──────────────────────────────────────────────────────────────────

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

type FormData         = z.infer<typeof schema>
type ResetData        = z.infer<typeof resetSchema>
type ConfirmResetData = z.infer<typeof confirmResetSchema>

type Stage = 'signin' | 'forgot' | 'reset-confirm'

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  width:        '100%',
  background:   '#FFFFFF',
  border:       '1px solid #CBD5E1',
  borderRadius: 8,
  padding:      '10px 14px',
  color:        '#0F172A',
  fontSize:     14,
  outline:      'none',
  transition:   'border-color 0.15s, box-shadow 0.15s',
  boxSizing:    'border-box',
  fontFamily:   'Inter, system-ui, sans-serif',
}

const labelStyle: CSSProperties = {
  display:      'block',
  fontSize:     13,
  fontWeight:   500,
  color:        '#374151',
  marginBottom: 6,
  fontFamily:   'Inter, system-ui, sans-serif',
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      setSuccessMsg('Password updated. You can now sign in.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    }
  }

  const stageTitle = stage === 'signin'
    ? 'Welcome back'
    : stage === 'forgot'
    ? 'Reset your password'
    : 'Set new password'

  const stageSubtitle = stage === 'reset-confirm'
    ? `Code sent to ${resetEmail}`
    : 'Sign in to your Sorcery account'

  return (
    <div style={{
      minHeight:       '100vh',
      background:      '#F8FAFC',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo size={36} />
            <span style={{
              fontFamily:    'Inter, system-ui, sans-serif',
              fontWeight:    700,
              fontSize:      20,
              letterSpacing: '-0.02em',
              color:         '#0F172A',
            }}>
              Sorcery
            </span>
          </Link>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginTop: 20, marginBottom: 6, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
            {stageTitle}
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {stageSubtitle}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   '#FFFFFF',
          border:       '1px solid #E2E8F0',
          borderRadius: 12,
          padding:      '28px',
          boxShadow:    '0 1px 3px 0 rgba(0,0,0,0.07)',
        }}>

          {successMsg && (
            <div style={{
              fontSize:     13,
              color:        '#065F46',
              background:   '#ECFDF5',
              border:       '1px solid #A7F3D0',
              borderRadius: 8,
              padding:      '10px 14px',
              marginBottom: 16,
              fontFamily:   'Inter, system-ui, sans-serif',
            }}>
              {successMsg}
            </div>
          )}

          {/* ── Sign in form ── */}
          {stage === 'signin' && (
            <form onSubmit={handleSubmit(onSignIn)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...register('email')}
                />
                {errors.email && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.email.message}</p>}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setStage('forgot')}
                    style={{ fontSize: 12, color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Your password"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...register('password')}
                />
                {errors.password && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.password.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isSubmitting ? '#818CF8' : '#4F46E5',
                  border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: isSubmitting ? 'default' : 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
                onMouseLeave={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
              >
                {isSubmitting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Sign in'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, system-ui, sans-serif' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              <button
                type="button"
                onClick={() => signInWithRedirect({ provider: 'Google' })}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8,
                  padding: '10px 20px', color: '#374151', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF' }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 14, height: 14 }} />
                Continue with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}>
                No account?{' '}
                <Link to="/auth/signup" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up free
                </Link>
              </p>
            </form>
          )}

          {/* ── Forgot password form ── */}
          {stage === 'forgot' && (
            <form onSubmit={handleReset(onForgotPassword)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...registerReset('email')}
                />
                {resetErrors.email && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{resetErrors.email.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isResetting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#4F46E5', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: isResetting ? 'default' : 'pointer',
                  opacity: isResetting ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {isResetting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Send reset email'}
              </button>

              <button
                type="button"
                onClick={() => setStage('signin')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* ── Confirm reset form ── */}
          {stage === 'reset-confirm' && (
            <form onSubmit={handleConfirmReset(onConfirmReset)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Reset code</label>
                <input
                  type="text"
                  placeholder="123456"
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: 18 }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...registerConfirmReset('code')}
                />
                {confirmResetErrors.code && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{confirmResetErrors.code.message}</p>}
              </div>

              <div>
                <label style={labelStyle}>New password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...registerConfirmReset('newPassword')}
                />
                {confirmResetErrors.newPassword && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{confirmResetErrors.newPassword.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isConfirmResetting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#4F46E5', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: isConfirmResetting ? 'default' : 'pointer',
                  opacity: isConfirmResetting ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {isConfirmResetting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Update password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
