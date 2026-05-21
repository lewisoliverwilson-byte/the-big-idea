import { useEffect, useRef } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { useAuthStore } from '../store/authStore'
import { syncUser, getMe } from '../services/api'

/**
 * useAuth — initialises auth state and subscribes to Cognito Hub events.
 *
 * Call this ONCE at the App level only. Every other component should read
 * from useAuthStore() directly to avoid creating extra Hub listeners.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()
  const syncing = useRef(false)

  useEffect(() => {
    checkAuthState()

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
      await handleSignIn()
    } catch {
      // No valid Cognito session
      setUser(null)
    }
  }

  const handleSignIn = async () => {
    if (syncing.current) return
    syncing.current = true
    try {
      await syncUser()
      const me = await getMe()
      setUser(me)
    } catch (err) {
      console.error('[useAuth] Backend sync failed:', err)
      // Cognito session is valid but backend call failed (cold start, etc.)
      // Don't clear auth — just stop loading so the app isn't stuck.
      setLoading(false)
    } finally {
      syncing.current = false
    }
  }

  return { user, isAuthenticated, isLoading }
}
