import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { userAdapter } from '@/services/storage'

/**
 * Bootstraps local auth on mount — loads user profile from IDB and syncs
 * onboardedModules into authStore. Replace internals in Phase 9 with Supabase auth.
 */
export function useAuth() {
  const { userId, setOnboardedModules } = useAuthStore()
  const { setProfile, setLoading } = useUserStore()

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const profile = await userAdapter.get()
        if (cancelled) return
        setProfile(profile)
        if (profile) {
          setOnboardedModules(profile.onboardedModules)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [userId, setProfile, setLoading, setOnboardedModules])

  const { profile, loading } = useUserStore()
  return { profile, loading, userId }
}
