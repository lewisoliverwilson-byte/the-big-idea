import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, User, LayoutDashboard, TrendingUp } from 'lucide-react'

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="scoutr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6366F1" />
          <stop offset="55%"  stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="url(#scoutr-bg)" />
      {/* Sonar arcs — sweeping from focal point (bottom-left) to upper-right */}
      <path d="M 10,18 A 7,7 0 0 1 17,23"
        stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M 10,12 A 13,13 0 0 1 23,23"
        stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M 10,6 A 19,19 0 0 1 29,23"
        stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Focal dot */}
      <circle cx="10" cy="23" r="2.6" fill="white" />
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
        fontWeight:    800,
        fontSize:      textSize,
        letterSpacing: '-0.03em',
        lineHeight:    1,
        color:         '#111827',
      }}>
        Scout<span style={{ color: '#6366F1' }}>r</span>
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
