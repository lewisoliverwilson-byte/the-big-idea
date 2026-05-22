import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp, signIn, signOut, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth'
import type { CSSProperties } from 'react'
import { Logo } from '../../components/layout/Navbar'

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

export function SignUp() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const [stage,    setStage]    = useState<'signup' | 'confirm'>('signup')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const prefillEmail = searchParams.get('email') || ''
  const prefillName  = searchParams.get('name')  || ''

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } =
    useForm<FormData>({
      resolver:      zodResolver(schema),
      defaultValues: { email: prefillEmail, fullName: prefillName },
    })

  useEffect(() => {
    if (prefillEmail) setValue('email',    prefillEmail)
    if (prefillName)  setValue('fullName', prefillName)
  }, [prefillEmail, prefillName, setValue])

  const { register: registerConfirm, handleSubmit: handleConfirm, formState: { errors: confirmErrors, isSubmitting: isConfirming } } =
    useForm<ConfirmData>({ resolver: zodResolver(confirmSchema) })

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
    <div style={{
      minHeight:      '100vh',
      background:     '#F8FAFC',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo size={36} />
            <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: '#0F172A' }}>
              The Big Idea
            </span>
          </Link>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginTop: 20, marginBottom: 6, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
            {stage === 'signup' ? 'Create your account' : 'Check your inbox'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {stage === 'signup'
              ? '2 free reports — no credit card required'
              : `We sent a 6-digit code to ${email}`}
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

          {stage === 'signup' ? (
            <form onSubmit={handleSubmit(onSignUp)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...register('fullName')}
                />
                {errors.fullName && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.fullName.message}</p>}
              </div>

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
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
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
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#4F46E5', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: isSubmitting ? 'default' : 'pointer',
                  opacity: isSubmitting ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
                onMouseLeave={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
              >
                {isSubmitting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Create account →'}
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
                Already have an account?{' '}
                <Link to="/auth/signin" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleConfirm(onConfirm)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Verification code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.3em', fontSize: 22 }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = 'none' }}
                  {...registerConfirm('code')}
                />
                {confirmErrors.code && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{confirmErrors.code.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isConfirming}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#4F46E5', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: isConfirming ? 'default' : 'pointer',
                  opacity: isConfirming ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {isConfirming
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Verify email →'}
              </button>

              <button
                type="button"
                onClick={() => setStage('signup')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                ← Back to sign up
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
