import { create } from 'zustand'
import type { ModuleId } from '@/types'

interface AuthState {
  userId: string
  locale: string
  isLocalMode: boolean
  onboardedModules: ModuleId[]
  setLocale: (locale: string) => void
  addOnboardedModule: (moduleId: ModuleId) => void
  setOnboardedModules: (modules: ModuleId[]) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: 'local', // replaced with real auth userId in Phase 9
  locale: 'nb',   // updated by i18n detector
  isLocalMode: true,
  onboardedModules: [],

  setLocale: (locale) => set({ locale }),

  addOnboardedModule: (moduleId) =>
    set((state) => ({
      onboardedModules: [...new Set([...state.onboardedModules, moduleId])],
    })),

  setOnboardedModules: (modules) => set({ onboardedModules: modules }),
}))
