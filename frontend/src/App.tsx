import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Landing } from './pages/Landing'
import { SignUp } from './pages/auth/SignUp'
import { SignIn } from './pages/auth/SignIn'
import { AuthCallback } from './pages/auth/AuthCallback'
import { Dashboard } from './pages/Dashboard'
import { ReportPage } from './pages/ReportPage'
import { Pricing } from './pages/Pricing'
import { Account } from './pages/Account'

// Reads directly from the store — does NOT call useAuth() so there is
// only ever ONE Hub listener (the one in App below).
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/auth/signin" replace />
  return <>{children}</>
}

function AppShell({ children }: { children: ReactNode }) {
  const location  = useLocation()
  const isLanding = location.pathname === '/'

  // App pages (dashboard, account, reports) keep the dark slate theme.
  // Public pages (landing, pricing, auth) use white.
  const isDark = ['/dashboard', '/account'].some(p => location.pathname.startsWith(p))
    || location.pathname.startsWith('/report/')

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!isLanding && <Footer />}
    </div>
  )
}

export default function App() {
  // Single useAuth() call for the whole app — sets up Hub listener + initial sync
  useAuth()

  return (
    <AppShell>
      <Routes>
        <Route path="/"               element={<Landing />} />
        <Route path="/auth/signup"    element={<SignUp />} />
        <Route path="/auth/signin"    element={<SignIn />} />
        <Route path="/auth/callback"  element={<AuthCallback />} />
        <Route path="/pricing"        element={<Pricing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:reportId"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
