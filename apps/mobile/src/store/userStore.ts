import { create } from 'zustand'
import type { UserProfile } from '@/types'

interface UserState {
  profile: UserProfile | null
  loading: boolean
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}))
