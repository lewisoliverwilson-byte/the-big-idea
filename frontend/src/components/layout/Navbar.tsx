import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { TrendingUp, LogOut, User, LayoutDashboard, Crown } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // On the landing page, show a minimal transparent navbar
  const isLanding = location.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isPro = user?.subscriptionStatus === 'active'
  const freeLeft = Math.max(0, 2 - (user?.reportsUsedFree || 0))

  if (isLanding) return null // Landing page has its own top bar

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-amber-400 rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-slate-900" />
            </div>
            <span className="font-bold text-white text-lg">The Big Idea</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/signin"
                className="text-sm text-slate-400 hover:text-white transition-colors"
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
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full font-semibold">
                    <Crown className="h-3 w-3" />
                    Pro
                  </span>
                ) : (
                  <span className="hidden sm:block text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    {freeLeft} free idea{freeLeft !== 1 ? 's' : ''} left
                  </span>
                )}

                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary" size="sm" className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold border-0">
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
