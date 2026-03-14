import { createFileRoute } from '@tanstack/react-router'
import { EnergyOnboardingWizard } from '@/features/energy/onboarding/EnergyOnboardingWizard'

export const Route = createFileRoute('/energy/onboarding')({
  component: EnergyOnboardingWizard,
})
