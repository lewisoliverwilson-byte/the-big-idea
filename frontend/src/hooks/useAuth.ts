import { useEffect } from 'react'
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { useAuthStore } from '../store/authStore'
import { syncUser, getMe } from '../services/api'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // Initial auth check
    checkAuthState()

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          handleSignIn()
          break
        case 'signedOut':
          logout()
          break
        case 'tokenRefresh':
          checkAuthState()
          break
      }
    })

    return unsubscribe
  }, [])

  const checkAuthState = async () => {
    try {
      await getCurrentUser()
      await handleSignIn()
    } catch {
      setUser(null)
    }
  }

  const handleSignIn = async () => {
    try {
      // Sync user to our DB and get full profile
      await syncUser()
      const me = await getMe()
      setUser(me)
    } catch (err) {
      console.error('Failed to sync user:', err)
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      await amplifySignOut()
      logout()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return { user, isAuthenticated, isLoading, signOut }
}
