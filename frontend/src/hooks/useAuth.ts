import { useEffect, useRef } from 'react'
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { useAuthStore } from '../store/authStore'
import { syncUser, getMe } from '../services/api'

/**
 * useAuth — initialises auth state and subscribes to Cognito Hub events.
 *
 * Call this ONCE at the App level. ProtectedRoute and other components should
 * read from useAuthStore() directly to avoid duplicate Hub listeners and
 * redundant checkAuthState() calls.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()
  const syncing = useRef(false)

  useEffect(() => {
    // Initial auth check on mount
    checkAuthState()

    // Listen for auth events from Amplify (signedIn fires after signIn())
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuthState = async () => {
    try {
      await getCurrentUser()
      // Cognito session is valid — sync with our backend
      await handleSignIn()
    } catch {
      // getCurrentUser() threw = no valid Cognito session
      setUser(null)
    }
  }

  const handleSignIn = async () => {
    // Prevent concurrent sync calls (Hub + checkAuthState can both fire)
    if (syncing.current) return
    syncing.current = true
    try {
      await syncUser()
      const me = await getMe()
      setUser(me)
    } catch (err) {
      console.error('[useAuth] Backend sync failed:', err)
      // Backend failed but Cognito session IS valid. Don't clear auth —
      // instead mark loading as done so the app isn't stuck on a spinner.
      // The user will be authenticated with no profile data; retries will
      // re-sync on next navigation.
      setLoading(false)
    } finally {
      syncing.current = false
    }
  }

  const signOut = async () => {
    try {
      await amplifySignOut()
      logout()
    } catch (err) {
      console.error('[useAuth] Sign out error:', err)
      logout() // clear local state even if Amplify call fails
    }
  }

  return { user, isAuthenticated, isLoading, signOut }
}
