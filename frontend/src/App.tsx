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
import { ComparePage } from './pages/ComparePage'

// Reads directly from the store — does NOT call useAuth() so there is
// only ever ONE Hub listener (the one in App below).
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <div style={{
        minHeight:      '100vh',
        background:     '#070511',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        {/* Magic spinner */}
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       '2px solid rgba(139,92,246,0.15)',
          }} />
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       '2px solid transparent',
            borderTopColor: '#8B5CF6',
            animation:    'spin 0.9s linear infinite',
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/auth/signin" replace />
  return <>{children}</>
}

function AppShell({ children }: { children: ReactNode }) {
  const location  = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070511' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
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
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <ComparePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
