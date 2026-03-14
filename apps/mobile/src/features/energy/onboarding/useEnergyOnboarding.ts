import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { getEnergyDefaults } from '@/features/energy/defaults'

export type OnboardingStep =
  | 'welcome'
  | 'bell'
  | 'typical_day'
  | 'energy_anchors'
  | 'budget_result'
  | 'confirm'

export type AbilityRating =
  | 'easy'
  | 'manageable'
  | 'difficult'
  | 'very_difficult'
  | 'impossible'

export const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'bell',
  'typical_day',
  'energy_anchors',
  'budget_result',
  'confirm',
]

const BELL_BUDGET_RANGES: Record<number, [number, number]> = {
  80: [25, 35],
  60: [18, 25],
  40: [12, 18],
  20: [6, 12],
  10: [3, 6],
}

const ABILITY_WEIGHTS: Record<AbilityRating, number> = {
  easy: 1.0,
  manageable: 0.7,
  difficult: 0.4,
  very_difficult: 0.2,
  impossible: 0.0,
}

function calcBellBudget(bellValue: number): number {
  const range = BELL_BUDGET_RANGES[bellValue]
  if (!range) return 20
  return Math.round((range[0] + range[1]) / 2)
}

function calcDayBudget(ratings: Record<string, AbilityRating>): number {
  const entries = Object.values(ratings)
  if (entries.length === 0) return 20
  const avgWeight = entries.reduce((sum, r) => sum + ABILITY_WEIGHTS[r], 0) / entries.length
  return Math.round(3 + avgWeight * 32)
}

function combineBudgets(bell: number | null, day: number | null): number {
  if (bell !== null && day !== null) return Math.round(bell * 0.55 + day * 0.45)
  return bell ?? day ?? 20
}

export function useEnergyOnboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const addOnboardedModule = useAuthStore((s) => s.addOnboardedModule)

  const [step, setStepRaw] = useState<OnboardingStep>('welcome')
  const [bellValue, setBellValue] = useState<number | null>(null)
  const [dayRatings, setDayRatings] = useState<Record<string, AbilityRating>>({})
  const [finalBudget, setFinalBudget] = useState(20)
  const [isSeeding, setIsSeeding] = useState(false)

  const bellBudget = bellValue !== null ? calcBellBudget(bellValue) : null
  const dayBudget = Object.keys(dayRatings).length > 0 ? calcDayBudget(dayRatings) : null

  const currentIndex = STEP_ORDER.indexOf(step)
  const progress = (currentIndex / (STEP_ORDER.length - 1)) * 100

  const goToStep = useCallback(
    (next: OnboardingStep) => {
      if (next === 'budget_result') setFinalBudget(combineBudgets(bellBudget, dayBudget))
      setStepRaw(next)
    },
    [bellBudget, dayBudget],
  )

  const completeOnboarding = useCallback(async () => {
    setIsSeeding(true)
    try {
      const locale = user?.locale ?? 'nb'
      const lang = locale.split('-')[0]
      const defaults = await getEnergyDefaults(locale)

      await api.energy.onboard({
        preferences: {
          dailyBudget: finalBudget,
          budgetUnit: 'POINTS',
          resetTime: '00:00',
          showWarningAt: 20,
        },
        categories: defaults.categories.map((cat, i) => ({
          name: cat.name,
          color: cat.color ?? undefined,
          icon: cat.icon ?? undefined,
          sortOrder: i,
          isDefault: true,
          sourceLocale: lang,
        })),
        templates: defaults.templates.map((tmpl) => ({
          categoryIndex: tmpl.categoryIndex,
          name: tmpl.name,
          defaultCost: tmpl.defaultCost,
          defaultDuration: tmpl.defaultDuration ?? undefined,
          icon: tmpl.icon ?? undefined,
          isDefault: true,
          sourceLocale: lang,
        })),
      })

      // Update local auth state and invalidate all energy queries
      addOnboardedModule('ENERGY')
      await queryClient.invalidateQueries({ queryKey: ['energy'] })

      navigate({ to: '/energy' })
    } finally {
      setIsSeeding(false)
    }
  }, [user, finalBudget, addOnboardedModule, queryClient, navigate])

  return {
    step,
    goToStep,
    bellValue,
    setBellValue,
    dayRatings,
    setDayRatings,
    finalBudget,
    setFinalBudget,
    bellBudget,
    dayBudget,
    progress,
    isSeeding,
    completeOnboarding,
  }
}
