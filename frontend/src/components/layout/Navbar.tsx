import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { LogOut, User, LayoutDashboard, Crown } from 'lucide-react'

function SIcon({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width:        size,
        height:       size,
        background:   '#4F46E5',
        borderRadius: Math.round(size * 0.22),
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        fontFamily:   '"Barlow Condensed","Arial Narrow",sans-serif',
        fontWeight:   700,
        fontSize:     Math.round(size * 0.58),
        color:        '#fff',
        letterSpacing: '-0.02em',
        lineHeight:   1,
        userSelect:   'none',
        flexShrink:   0,
      }}
    >
      S
    </div>
  )
}

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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none">
            <SIcon size={28} />
            <span style={{
              fontFamily:    '"Barlow Condensed","Arial Narrow",sans-serif',
              fontWeight:    700,
              fontSize:      19,
              color:         '#0F172A',
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
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/signin"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
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
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-semibold">
                    <Crown className="h-3 w-3" />
                    Pro
                  </span>
                ) : (
                  <span className="hidden sm:block text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {freeLeft} free idea{freeLeft !== 1 ? 's' : ''} left
                  </span>
                )}

                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-0"
                  >
                    Start free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
