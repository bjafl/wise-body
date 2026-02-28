import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from './routes'
import type { ModuleId } from '@/types'

const onboardingRoute: Record<ModuleId, string> = {
  energy: ROUTES.ENERGY_ONBOARDING,
  pain: ROUTES.PAIN_ONBOARDING,
  mood: '/mood/onboarding',
}

export function ModuleGuard({
  moduleId,
  children,
}: {
  moduleId: ModuleId
  children: React.ReactNode
}) {
  const onboardedModules = useAuthStore((s) => s.onboardedModules)
  if (!onboardedModules.includes(moduleId)) {
    return <Navigate to={onboardingRoute[moduleId]} replace />
  }
  return <>{children}</>
}
