import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signOut, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { useAuthStore } from '../../store/authStore'
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

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      '#070511',
  surface: '#0E0A1C',
  border:  'rgba(139,92,246,0.15)',
  borderG: 'rgba(139,92,246,0.45)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  cyan:    '#22D3EE',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}

const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'


const GLASS: CSSProperties = {
  background:           'rgba(14,10,28,0.80)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${C.border}`,
  borderRadius:         20,
  boxShadow:            '0 0 0 1px rgba(139,92,246,0.06), 0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  width:           '100%',
  background:      'rgba(7,5,17,0.8)',
  border:          `1px solid ${C.border}`,
  borderRadius:    12,
  padding:         '12px 16px',
  color:           C.text,
  fontSize:        14,
  outline:         'none',
  transition:      'border-color 0.15s, box-shadow 0.15s',
  boxSizing:       'border-box',
}

const labelStyle: CSSProperties = {
  display:      'block',
  fontSize:     13,
  fontWeight:   500,
  color:        C.textDim,
  marginBottom: 6,
}

const submitBtnStyle: CSSProperties = {
  width:          '100%',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            8,
  background:     GBTN,
  border:         '1px solid rgba(139,92,246,0.4)',
  borderRadius:   12,
  padding:        '13px 24px',
  color:          '#fff',
  fontSize:       14,
  fontWeight:     700,
  cursor:         'pointer',
  boxShadow:      '0 0 20px rgba(124,58,237,0.3)',
  transition:     'opacity 0.15s',
}

// ─── Stars (deterministic) ────────────────────────────────────────────────────

const STARS = Array.from({ length: 30 }, (_, i) => {
  const g = 137.508
  return {
    left:  `${((i * g) % 100).toFixed(1)}%`,
    top:   `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:  [1, 1, 1.5][i % 3],
    delay: `${((i * 0.37) % 4.5).toFixed(2)}s`,
    dur:   `${(2.8 + (i % 6) * 0.45).toFixed(1)}s`,
  }
})

// ─── Logo mark ────────────────────────────────────────────────────────────────

function SIcon() {
  return (
    <svg viewBox="0 0 100 100" width={44} height={44} role="img" aria-label="Sorcery">
      <path d="M 29,86 A 42,42 0 1,1 71,86" fill="none" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 33,79 A 34,34 0 1,1 67,79" fill="none" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" opacity="0.28"/>
      <path d="M 16,50 C 20,28 80,28 84,50 C 80,72 20,72 16,50 Z" fill="none" stroke="#DDD6FE" strokeWidth="2"/>
      <polygon points="50,39 58,50 50,61 42,50" fill="#7C3AED"/>
      <circle cx="50" cy="50" r="3.5" fill="#DDD6FE"/>
    </svg>
  )
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
      setSuccessMsg('Password reset! You can now sign in.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    }
  }

  const stageTitle = stage === 'signin'        ? 'Welcome back'     :
                     stage === 'forgot'         ? 'Recover your key' :
                                                  'Set new password'

  const stageSubtitle = stage === 'reset-confirm'
    ? `Incantation sent to ${resetEmail}`
    : 'Enter the portal to your Sorcery account'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
      {/* Castle background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <img src="/assets/castle-forest.png" alt="" style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%',
          filter: 'brightness(0.18) saturate(0.6)',
        }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,5,17,0.6) 0%, rgba(7,5,17,0.4) 50%, rgba(7,5,17,0.7) 100%)' }}/>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)', borderRadius: '50%' }}/>
      </div>

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="animate-twinkle" style={{
            position:         'absolute',
            left:             s.left,
            top:              s.top,
            width:            s.size,
            height:           s.size,
            borderRadius:     '50%',
            background:       i % 3 === 0 ? C.purpleB : i % 3 === 1 ? C.cyan : '#fff',
            animationDelay:   s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      {/* Ambient orb */}
      <div className="animate-float-orb" style={{
        position:     'fixed',
        top:          '20%',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        500,
        height:       350,
        background:   'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <SIcon />
            <span style={{
              fontFamily:    '"Cinzel Decorative", "Cinzel", serif',
              fontWeight:    700,
              fontSize:      20,
              letterSpacing: '0.06em',
              color:         '#DDD6FE',
            }}>
              Sorcery
            </span>
          </Link>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginTop: 16, marginBottom: 4 }}>
            {stageTitle}
          </h1>
          <p style={{ fontSize: 13, color: C.textDim }}>
            {stageSubtitle}
          </p>
        </div>

        {/* Card */}
        <div style={{ ...GLASS, padding: 32 }}>

          {successMsg && (
            <div style={{
              fontSize:     13,
              color:        '#34D399',
              background:   'rgba(16,185,129,0.08)',
              border:       '1px solid rgba(16,185,129,0.2)',
              borderRadius: 10,
              padding:      '10px 14px',
              marginBottom: 16,
            }}>
              {successMsg}
            </div>
          )}

          {/* ── Sign in form ── */}
          {stage === 'signin' && (
            <form onSubmit={handleSubmit(onSignIn)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...register('email')}
                />
                {errors.email && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{errors.email.message}</p>}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setStage('forgot')}
                    style={{ fontSize: 11, color: C.purpleB, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Your password"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...register('password')}
                />
                {errors.password && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{errors.password.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...submitBtnStyle, opacity: isSubmitting ? 0.6 : 1 }}
                onMouseEnter={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                onMouseLeave={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                {isSubmitting
                  ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : '✦ Enter the portal'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.textMut }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <button
                type="button"
                onClick={() => signInWithRedirect({ provider: 'Google' })}
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            8,
                  background:     'rgba(255,255,255,0.04)',
                  border:         `1px solid ${C.border}`,
                  borderRadius:   12,
                  padding:        '11px 24px',
                  color:          C.textDim,
                  fontSize:       13,
                  fontWeight:     500,
                  cursor:         'pointer',
                  transition:     'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.35)'; (e.currentTarget as HTMLButtonElement).style.color = C.text }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.textDim }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 14, height: 14 }} />
                Continue with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: C.textDim }}>
                No account?{' '}
                <Link to="/auth/signup" style={{ color: C.purpleB, fontWeight: 600, textDecoration: 'none' }}>
                  Sign up free
                </Link>
              </p>
            </form>
          )}

          {/* ── Forgot password form ── */}
          {stage === 'forgot' && (
            <form onSubmit={handleReset(onForgotPassword)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...registerReset('email')}
                />
                {resetErrors.email && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{resetErrors.email.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isResetting}
                style={{ ...submitBtnStyle, opacity: isResetting ? 0.6 : 1 }}
                onMouseEnter={e => !isResetting && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                onMouseLeave={e => !isResetting && ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                {isResetting
                  ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Send reset incantation'}
              </button>

              <button
                type="button"
                onClick={() => setStage('signin')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textDim, textDecoration: 'underline', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.text)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = C.textDim)}
              >
                Back to sign in
              </button>
            </form>
          )}

          {/* ── Confirm reset form ── */}
          {stage === 'reset-confirm' && (
            <form onSubmit={handleConfirmReset(onConfirmReset)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Reset code</label>
                <input
                  type="text"
                  placeholder="123456"
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: 18 }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}

                  {...registerConfirmReset('code')}
                />
                {confirmResetErrors.code && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{confirmResetErrors.code.message}</p>}
              </div>

              <div>
                <label style={labelStyle}>New password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...registerConfirmReset('newPassword')}
                />
                {confirmResetErrors.newPassword && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{confirmResetErrors.newPassword.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isConfirmResetting}
                style={{ ...submitBtnStyle, opacity: isConfirmResetting ? 0.6 : 1 }}
                onMouseEnter={e => !isConfirmResetting && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                onMouseLeave={e => !isConfirmResetting && ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                {isConfirmResetting
                  ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Set new password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
