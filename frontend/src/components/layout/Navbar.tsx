import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, User, LayoutDashboard } from 'lucide-react'
import type { CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'

const NAV_GLASS: CSSProperties = {
  background:           'rgba(7,5,17,0.75)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom:         '1px solid rgba(139,92,246,0.12)',
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function SIcon({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width:          size,
      height:         size,
      background:     GRAD,
      borderRadius:   Math.round(size * 0.28),
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     '"Barlow Condensed","Arial Narrow",sans-serif',
      fontWeight:     700,
      fontSize:       Math.round(size * 0.62),
      color:          '#fff',
      letterSpacing:  '-0.02em',
      lineHeight:     1,
      userSelect:     'none',
      flexShrink:     0,
      boxShadow:      '0 0 12px rgba(139,92,246,0.35)',
    }}>
      S
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

  const isPro    = user?.subscriptionStatus === 'active'
  const freeLeft = Math.max(0, 2 - (user?.reportsUsedFree || 0))

  // Landing page has its own nav
  if (isLanding) return null

  return (
    <nav style={{ ...NAV_GLASS, position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none" style={{ textDecoration: 'none' }}>
            <SIcon size={28} />
            <span style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700,
              fontSize:      19,
              color:         '#F0EEFF',
              letterSpacing: '-0.01em',
              lineHeight:    1,
            }}>
              Sourcery
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              style={{ fontSize: 14, color: '#9B8ECF', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0EEFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9B8ECF')}
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/signin"
                style={{ fontSize: 14, color: '#9B8ECF', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0EEFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9B8ECF')}
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Status pill */}
                {isPro ? (
                  <span style={{
                    display:       'inline-flex',
                    alignItems:    'center',
                    gap:           4,
                    fontSize:      11,
                    fontWeight:    700,
                    background:    'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    color:         '#F0EEFF',
                    border:        '1px solid rgba(139,92,246,0.4)',
                    padding:       '3px 10px',
                    borderRadius:  99,
                    boxShadow:     '0 0 8px rgba(139,92,246,0.25)',
                  }} className="hidden sm:inline-flex">
                    ✦ Sorcerer
                  </span>
                ) : (
                  <span style={{
                    fontSize:    11,
                    color:       '#9B8ECF',
                    background:  'rgba(139,92,246,0.08)',
                    border:      '1px solid rgba(139,92,246,0.15)',
                    padding:     '3px 10px',
                    borderRadius: 99,
                  }} className="hidden sm:block">
                    {freeLeft} spell{freeLeft !== 1 ? 's' : ''} left
                  </span>
                )}

                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          5,
                    background:   'transparent',
                    border:       '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 10,
                    padding:      '6px 12px',
                    color:        '#9B8ECF',
                    fontSize:     13,
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0EEFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9B8ECF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}>
                    <LayoutDashboard size={14} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                </Link>

                <Link to="/account" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background:   'transparent',
                    border:       '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 10,
                    padding:      '6px 10px',
                    color:        '#9B8ECF',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                    display:      'flex',
                    alignItems:   'center',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0EEFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9B8ECF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}>
                    <User size={14} />
                  </button>
                </Link>

                <button
                  onClick={handleSignOut}
                  style={{
                    background:   'transparent',
                    border:       '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 10,
                    padding:      '6px 10px',
                    color:        '#9B8ECF',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                    display:      'flex',
                    alignItems:   'center',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0EEFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9B8ECF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/signin" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background:   'transparent',
                    border:       '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 10,
                    padding:      '6px 14px',
                    color:        '#9B8ECF',
                    fontSize:     13,
                    fontWeight:   500,
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0EEFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9B8ECF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}>
                    Sign in
                  </button>
                </Link>

                <Link to="/auth/signup" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background:   'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    border:       '1px solid rgba(139,92,246,0.4)',
                    borderRadius: 10,
                    padding:      '6px 14px',
                    color:        '#fff',
                    fontSize:     13,
                    fontWeight:   700,
                    cursor:       'pointer',
                    transition:   'opacity 0.15s',
                    boxShadow:    '0 0 16px rgba(139,92,246,0.3)',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                    Start free ✦
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
