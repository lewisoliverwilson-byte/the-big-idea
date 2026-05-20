import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Amplify handles the OAuth callback automatically
    // After a brief pause, redirect to dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in…</p>
      </div>
    </div>
  )
}
