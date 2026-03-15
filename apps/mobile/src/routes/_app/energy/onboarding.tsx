import { createFileRoute } from '@tanstack/react-router'
import { EnergyOnboardingWizard } from '@/features/energy/onboarding/EnergyOnboardingWizard'

export const Route = createFileRoute('/_app/energy/onboarding')({
  component: EnergyOnboardingWizard,
})
