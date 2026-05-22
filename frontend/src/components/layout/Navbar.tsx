import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, User, LayoutDashboard, TrendingUp } from 'lucide-react'

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} fill="none" aria-hidden="true">
      <rect x="2" y="16" width="5" height="10" rx="1" fill="#4F46E5" opacity="0.6" />
      <rect x="9" y="11" width="5" height="15" rx="1" fill="#4F46E5" opacity="0.8" />
      <rect x="16" y="5" width="5" height="21" rx="1" fill="#4F46E5" />
      <path d="M4 14 L11.5 9 L18.5 4" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="3.5" r="2" fill="#6366F1" />
    </svg>
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

  // Landing page has its own nav
  if (isLanding) return null

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none" style={{ textDecoration: 'none' }}>
            <Logo size={22} />
            <span style={{
              fontFamily:    'Inter, system-ui, sans-serif',
              fontWeight:    700,
              fontSize:      16,
              color:         '#0F172A',
              letterSpacing: '-0.02em',
            }}>
              Sorcery
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/pricing"
              className="px-3 py-2 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/signin"
                className="px-3 py-2 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isPro ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                    <TrendingUp size={11} />
                    Pro
                  </span>
                ) : (
                  <span className="hidden sm:block text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                )}

                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 bg-white transition-all">
                    <LayoutDashboard size={14} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                </Link>

                <Link to="/account" style={{ textDecoration: 'none' }}>
                  <button className="flex items-center text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg p-1.5 bg-white transition-all">
                    <User size={14} />
                  </button>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg p-1.5 bg-white transition-all"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/signin" style={{ textDecoration: 'none' }}>
                  <button className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link to="/auth/signup" style={{ textDecoration: 'none' }}>
                  <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-sm transition-colors">
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
