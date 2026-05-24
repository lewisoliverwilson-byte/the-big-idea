import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp, signIn, signOut, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth'
import type { CSSProperties } from 'react'
import { Wordmark } from '../../components/layout/Navbar'

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
  background:   '#FBF8F0',
  border:       '1px solid #DDD3BC',
  borderRadius: 4,
  padding:      '10px 14px',
  color:        '#1A1817',
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
  color:        '#1A1817',
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
      background:     '#F4EFE5',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <Wordmark height={26} />
          </Link>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1817', marginTop: 24, marginBottom: 6, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
            {stage === 'signup' ? 'Create your account' : 'Check your inbox'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B6359', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {stage === 'signup'
              ? '2 free reports — no credit card required'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   '#FBF8F0',
          border:       '1px solid #DDD3BC',
          borderRadius: 8,
          padding:      '28px',
          boxShadow:    '0 1px 2px rgba(26,24,23,0.06), 0 4px 14px rgba(26,24,23,0.05)',
        }}>

          {stage === 'signup' ? (
            <form onSubmit={handleSubmit(onSignUp)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8F50C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,245,12,0.2)' }}
                  {...register('fullName')}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#DDD3BC'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {errors.fullName && <p style={{ color: '#9C3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.fullName.message}</p>}
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8F50C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,245,12,0.2)' }}
                  {...register('email')}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#DDD3BC'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {errors.email && <p style={{ color: '#9C3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.email.message}</p>}
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8F50C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,245,12,0.2)' }}
                  {...register('password')}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#DDD3BC'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {errors.password && <p style={{ color: '#9C3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{errors.password.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#9C3A3A', background: '#FAEDED', border: '1px solid rgba(156,58,58,0.25)', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#C8F50C', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#1A1817', fontSize: 14, fontWeight: 700,
                  cursor: isSubmitting ? 'default' : 'pointer',
                  opacity: isSubmitting ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#A8D104')}
                onMouseLeave={e => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.background = '#C8F50C')}
              >
                {isSubmitting
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(26,24,23,0.2)', borderTopColor: '#1A1817', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Create account →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#DDD3BC' }} />
                <span style={{ fontSize: 12, color: '#9A8B82', fontFamily: 'Inter, system-ui, sans-serif' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#DDD3BC' }} />
              </div>

              <button
                type="button"
                onClick={() => signInWithRedirect({ provider: 'Google' })}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#FBF8F0', border: '1px solid #DDD3BC', borderRadius: 8,
                  padding: '10px 20px', color: '#1A1817', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#9A8B82'; (e.currentTarget as HTMLButtonElement).style.background = '#EDE6D2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#DDD3BC'; (e.currentTarget as HTMLButtonElement).style.background = '#FBF8F0' }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 14, height: 14 }} />
                Continue with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B6359', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Already have an account?{' '}
                <Link to="/auth/signin" style={{ color: '#1A1817', fontWeight: 700, textDecoration: 'underline' }}>
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
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8F50C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,245,12,0.2)' }}
                  {...registerConfirm('code')}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#DDD3BC'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {confirmErrors.code && <p style={{ color: '#9C3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Inter, system-ui, sans-serif' }}>{confirmErrors.code.message}</p>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#9C3A3A', background: '#FAEDED', border: '1px solid rgba(156,58,58,0.25)', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isConfirming}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#C8F50C', border: 'none', borderRadius: 8, padding: '11px 20px',
                  color: '#1A1817', fontSize: 14, fontWeight: 700,
                  cursor: isConfirming ? 'default' : 'pointer',
                  opacity: isConfirming ? 0.65 : 1, fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {isConfirming
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(26,24,23,0.2)', borderTopColor: '#1A1817', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : 'Verify email →'}
              </button>

              <button
                type="button"
                onClick={() => setStage('signup')}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6359', fontFamily: 'Inter, system-ui, sans-serif' }}
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
