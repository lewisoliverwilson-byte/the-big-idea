import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Amplify handles the OAuth callback automatically.
    // After a brief pause, redirect to dashboard.
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     '#070511',
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Magic spinner */}
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       '2px solid rgba(139,92,246,0.15)',
          }} />
          <div style={{
            position:       'absolute',
            inset:          0,
            borderRadius:   '50%',
            border:         '2px solid transparent',
            borderTopColor: '#8B5CF6',
            animation:      'spin 0.9s linear infinite',
          }} />
          <div style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       16,
          }}>
            ✦
          </div>
        </div>
        <p style={{ color: '#9B8ECF', fontSize: 14, fontWeight: 500 }}>Completing your sign-in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
