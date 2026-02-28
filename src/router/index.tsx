import { createHashRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ModuleGuard } from './guards'
import { HomePage } from '@/pages/HomePage'
import { EnergyPage } from '@/pages/modules/EnergyPage'
import { EnergyOnboardingWizard } from '@/modules/energy/onboarding/EnergyOnboardingWizard'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PainPage } from '@/pages/modules/PainPage'
import { ROUTES } from './routes'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.SETTINGS, element: <SettingsPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      { path: ROUTES.ENERGY_ONBOARDING, element: <EnergyOnboardingWizard /> },
      {
        path: ROUTES.ENERGY,
        element: (
          <ModuleGuard moduleId="energy">
            <EnergyPage />
          </ModuleGuard>
        ),
      },
      {
        path: ROUTES.PAIN,
        element: (
          <ModuleGuard moduleId="pain">
            <PainPage />
          </ModuleGuard>
        ),
      },
    ],
  },
])
