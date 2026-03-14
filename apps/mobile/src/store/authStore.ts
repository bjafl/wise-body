import { create } from 'zustand'
import type { UserDto, ModuleIdValue } from '@wise-body/types'

interface AuthState {
  accessToken: string | null
  user: UserDto | null
  /** True once the initial refresh-token check has completed (success or failure) */
  isReady: boolean

  setAuth: (token: string, user: UserDto) => void
  clearAuth: () => void
  setReady: () => void
  /** Optimistically add a module after onboarding completes */
  addOnboardedModule: (moduleId: ModuleIdValue) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isReady: false,

  setAuth: (token, user) => {
    // Expose token on globalThis so api.ts can read it without circular imports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).__authStoreToken = token
    set({ accessToken: token, user, isReady: true })
  },

  clearAuth: () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).__authStoreToken = null
    set({ accessToken: null, user: null, isReady: true })
  },

  setReady: () => set({ isReady: true }),

  addOnboardedModule: (moduleId) =>
    set((state) => {
      if (!state.user) return state
      if (state.user.onboardedModules.includes(moduleId)) return state
      return {
        user: { ...state.user, onboardedModules: [...state.user.onboardedModules, moduleId] },
      }
    }),
}))
