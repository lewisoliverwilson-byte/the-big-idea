import { create } from 'zustand'
import { signOut as amplifySignOut } from 'aws-amplify/auth'
import { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  signOut: async () => {
    try {
      await amplifySignOut()
    } catch (err) {
      console.error('[authStore] signOut error:', err)
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
}))
