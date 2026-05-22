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
import type { CSSProperties } from 'react'

// ─── Schemas ──────────────────────────────────────────────────────────────────

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

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      '#070511',
  border:  'rgba(139,92,246,0.15)',
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
  width:     '100%',
  background: 'rgba(7,5,17,0.8)',
  border:    `1px solid ${C.border}`,
  borderRadius: 12,
  padding:   '12px 16px',
  color:     C.text,
  fontSize:  14,
  outline:   'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
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

export function SignUp() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const [stage,  setStage]  = useState<'signup' | 'confirm'>('signup')
  const [email,  setEmail]  = useState('')
  const [password, setPassword] = useState('')
  const [error,  setError]  = useState('')

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

  useEffect(() => {
    if (prefillEmail) setValue('email',    prefillEmail)
    if (prefillName)  setValue('fullName', prefillName)
  }, [prefillEmail, prefillName, setValue])

  const {
    register:   registerConfirm,
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
      try { await signOut({ global: false }) } catch { /* ignore */ }
      await signIn({ username: email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    }
  }

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
            position:          'absolute',
            left:              s.left,
            top:               s.top,
            width:             s.size,
            height:            s.size,
            borderRadius:      '50%',
            background:        i % 3 === 0 ? C.purpleB : i % 3 === 1 ? C.cyan : '#fff',
            animationDelay:    s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      {/* Ambient orb */}
      <div className="animate-float-orb" style={{
        position:      'fixed',
        top:           '15%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         500,
        height:        350,
        background:    'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)',
        borderRadius:  '50%',
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
            {stage === 'signup' ? 'Begin your journey' : 'Check your inbox'}
          </h1>
          <p style={{ fontSize: 13, color: C.textDim }}>
            {stage === 'signup'
              ? '2 free spells to get you started'
              : `We sent a 6-digit incantation to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div style={{ ...GLASS, padding: 32 }}>

          {stage === 'signup' ? (
            <form onSubmit={handleSubmit(onSignUp)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...register('fullName')}
                />
                {errors.fullName && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{errors.fullName.message}</p>}
              </div>

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
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
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
                  : '✦ Cast your first spell'}
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
                Already have an account?{' '}
                <Link to="/auth/signin" style={{ color: C.purpleB, fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleConfirm(onConfirm)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Verification code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.3em', fontSize: 22 }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                  {...registerConfirm('code')}
                />
                {confirmErrors.code && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>{confirmErrors.code.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isConfirming}
                style={{ ...submitBtnStyle, opacity: isConfirming ? 0.6 : 1 }}
                onMouseEnter={e => !isConfirming && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                onMouseLeave={e => !isConfirming && ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                {isConfirming
                  ? <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : '✦ Confirm your identity'}
              </button>

              <button
                type="button"
                onClick={() => setStage('signup')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textDim, textDecoration: 'underline', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.text)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = C.textDim)}
              >
                Back to sign up
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
