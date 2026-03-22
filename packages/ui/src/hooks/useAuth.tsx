import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      updateUser: (updates) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...updates } })
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
          set({ isLoading: false, isAuthenticated: false })
          return false
        }

        try {
          const user = JSON.parse(userStr)
          set({
            user,
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken'),
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch {
          set({ isLoading: false, isAuthenticated: false })
          return false
        }
      },
    }),
    {
      name: 'tradeclaw-auth',
      onRehydrateStorage: () => (state) => {
        // After rehydration, set isLoading to false since we have persisted auth state
        if (state) {
          state.isLoading = false
        }
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  const verify = async () => {
    if (!isAuthenticated) {
      return await checkAuth()
    }
    return true
  }

  return { isAuthenticated, isLoading, verify }
}
