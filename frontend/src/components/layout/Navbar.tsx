import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { TrendingUp, LogOut, User, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  // Read directly from store — does NOT call useAuth() so no extra Hub listener
  const { user, isAuthenticated, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">The Big Idea</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth/signin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.subscriptionStatus === 'free' && (
                  <span className="hidden sm:block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {2 - (user.reportsUsedFree || 0)} free reports left
                  </span>
                )}
                {user?.subscriptionStatus === 'active' && (
                  <span className="hidden sm:block text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full font-medium">
                    Pro
                  </span>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary" size="sm">Start free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
