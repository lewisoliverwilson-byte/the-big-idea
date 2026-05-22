import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, User, LayoutDashboard, TrendingUp } from 'lucide-react'

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} fill="none" aria-hidden="true">
      {/* Bar chart */}
      <rect x="2"  y="18" width="6" height="10" rx="1.5" fill="#4F46E5" opacity="0.45" />
      <rect x="10" y="11" width="6" height="17" rx="1.5" fill="#4F46E5" opacity="0.7"  />
      <rect x="18" y="4"  width="6" height="24" rx="1.5" fill="#4F46E5" />
      {/* Trend line */}
      <polyline
        points="5,15 13,8 21,3"
        stroke="#818CF8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="21" cy="3" r="2.2" fill="#818CF8" />
    </svg>
  )
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────

export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const logoSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 26
  const textSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 17
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
      <Logo size={logoSize} />
      <span style={{
        fontFamily:    'Inter, system-ui, sans-serif',
        fontWeight:    700,
        fontSize:      textSize,
        letterSpacing: '-0.025em',
        lineHeight:    1,
        color:         '#111827',
      }}>
        The Big Idea
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const isLanding = location.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isPro = user?.subscriptionStatus === 'active'

  // Landing page has its own inline nav
  if (isLanding) return null

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Wordmark />
          </Link>

          {/* Center nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link
              to="/pricing"
              style={{
                textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 13, color: '#6B7280', fontWeight: 500,
                padding: '6px 12px', borderRadius: 7, transition: 'color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#111827'; (e.currentTarget as HTMLAnchorElement).style.background = '#F9FAFB' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#6B7280'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              Pricing
            </Link>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated ? (
              <>
                {isPro ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 600, color: '#4F46E5',
                    background: '#EEF2FF', border: '1px solid #C7D2FE',
                    borderRadius: 99, padding: '3px 10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    <TrendingUp size={11} />
                    Pro
                  </span>
                ) : (
                  <span style={{
                    fontSize: 11, color: '#6B7280', background: '#F3F4F6',
                    borderRadius: 99, padding: '3px 10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    Free
                  </span>
                )}

                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 13, color: '#374151', fontWeight: 500,
                    background: '#FFFFFF', border: '1px solid #E5E7EB',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    transition: 'border-color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#D1D5DB')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </button>
                </Link>

                <Link to="/account" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#FFFFFF', border: '1px solid #E5E7EB',
                    borderRadius: 8, padding: 7, cursor: 'pointer',
                    transition: 'border-color 0.12s',
                    color: '#6B7280',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280' }}
                  >
                    <User size={14} />
                  </button>
                </Link>

                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#FFFFFF', border: '1px solid #E5E7EB',
                    borderRadius: 8, padding: 7, cursor: 'pointer',
                    transition: 'border-color 0.12s', color: '#6B7280',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/signin" style={{ textDecoration: 'none' }}>
                  <button style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 13, color: '#6B7280', fontWeight: 500,
                    background: 'none', border: 'none',
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                    transition: 'color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
                  >
                    Sign in
                  </button>
                </Link>
                <Link to="/auth/signup" style={{ textDecoration: 'none' }}>
                  <button style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 13, color: '#FFFFFF', fontWeight: 600,
                    background: '#4F46E5', border: 'none',
                    padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                    transition: 'background 0.12s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
                  >
                    Start free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
