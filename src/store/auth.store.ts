import { create } from 'zustand'
import type { User } from '@/types/auth.types'
import { clearTokens, setTokens } from '@/api/client'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  bootstrapping: boolean
  bootstrap: () => Promise<void>
  login: (user: User, accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  logout: () => void
}

let bootstrapPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  bootstrapping: true,
  bootstrap: () => {
    if (bootstrapPromise) return bootstrapPromise
    bootstrapPromise = (async () => {
      const user = await authService.restoreSession()
      if (user) {
        set({ user, isAuthenticated: true, bootstrapping: false })
      } else {
        set({ user: null, isAuthenticated: false, bootstrapping: false })
      }
    })()
    return bootstrapPromise
  },
  login: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken)
    set({ user, isAuthenticated: true, bootstrapping: false })
  },
  setUser: (user) => set({ user }),
  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false })
  },
}))
