import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

/**
 * Bootstraps auth on mount by attempting a silent token refresh (uses httpOnly cookie).
 * On success → setAuth(token, user).
 * On failure → clearAuth(), triggering a redirect to /login via __root.tsx.
 *
 * Called once from __root.tsx.
 */
export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    api.auth.refresh()
      .then(({ accessToken, user }) => setAuth(accessToken, user))
      .catch(() => clearAuth())
  // Run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
