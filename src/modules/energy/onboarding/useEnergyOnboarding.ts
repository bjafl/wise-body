import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { categoryAdapter, modulePreferencesAdapter, userAdapter } from '@/services/storage'
import { localEnergyTemplateAdapter } from '@/services/storage/local/energyTemplateAdapter'
import { getEnergyDefaults } from '@/modules/energy/defaults'
import { ROUTES } from '@/router/routes'
import type { EnergyModulePreferences } from '@/types'

// ─── Step types ────────────────────────────────────────────────────────────────

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

// ─── Bell scale ────────────────────────────────────────────────────────────────

const BELL_BUDGET_RANGES: Record<number, [number, number]> = {
  80: [25, 35],
  60: [18, 25],
  40: [12, 18],
  20: [6, 12],
  10: [3, 6],
}

// ─── Ability weights ──────────────────────────────────────────────────────────

const ABILITY_WEIGHTS: Record<AbilityRating, number> = {
  easy: 1.0,
  manageable: 0.7,
  difficult: 0.4,
  very_difficult: 0.2,
  impossible: 0.0,
}

// ─── Budget calculation ───────────────────────────────────────────────────────

function calcBellBudget(bellValue: number): number {
  const range = BELL_BUDGET_RANGES[bellValue]
  if (!range) return 20
  return Math.round((range[0] + range[1]) / 2)
}

function calcDayBudget(ratings: Record<string, AbilityRating>): number {
  const entries = Object.values(ratings)
  if (entries.length === 0) return 20
  const avgWeight =
    entries.reduce((sum, r) => sum + ABILITY_WEIGHTS[r], 0) / entries.length
  return Math.round(3 + avgWeight * 32)
}

function combineBudgets(bell: number | null, day: number | null): number {
  if (bell !== null && day !== null) {
    // Bell scale is more validated — weight it slightly more
    return Math.round(bell * 0.55 + day * 0.45)
  }
  return bell ?? day ?? 20
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEnergyOnboarding() {
  const navigate = useNavigate()
  const locale = useAuthStore((s) => s.locale)
  const addOnboardedModule = useAuthStore((s) => s.addOnboardedModule)

  const [step, setStepRaw] = useState<OnboardingStep>('welcome')
  const [bellValue, setBellValue] = useState<number | null>(null)
  const [dayRatings, setDayRatings] = useState<Record<string, AbilityRating>>({})
  const [finalBudget, setFinalBudget] = useState(20)
  const [isSeeding, setIsSeeding] = useState(false)

  const bellBudget = bellValue !== null ? calcBellBudget(bellValue) : null
  const dayBudget =
    Object.keys(dayRatings).length > 0 ? calcDayBudget(dayRatings) : null

  const currentIndex = STEP_ORDER.indexOf(step)
  const progress = (currentIndex / (STEP_ORDER.length - 1)) * 100

  const goToStep = useCallback(
    (next: OnboardingStep) => {
      if (next === 'budget_result') {
        setFinalBudget(combineBudgets(bellBudget, dayBudget))
      }
      setStepRaw(next)
    },
    [bellBudget, dayBudget]
  )

  const completeOnboarding = useCallback(async () => {
    setIsSeeding(true)
    try {
      const locale2 = locale.split('-')[0] // "nb-NO" → "nb"
      const defaults = await getEnergyDefaults(locale)

      // 1. Seed categories — collect their new IDs
      const categoryIds: string[] = []
      for (const catDefault of defaults.categories) {
        const saved = await categoryAdapter.save({
          ...catDefault,
          isDefault: true,
          sourceLocale: locale2,
        })
        categoryIds.push(saved.id)
      }

      // 2. Seed templates linked to their categories via categoryIndex
      for (const tmplDefault of defaults.templates) {
        const { categoryIndex, ...tmplData } = tmplDefault
        const categoryId = categoryIds[categoryIndex]
        if (!categoryId) continue
        await localEnergyTemplateAdapter.save({
          ...tmplData,
          categoryId,
          isDefault: true,
          sourceLocale: locale2,
        })
      }

      // 3. Save module preferences
      const prefs: EnergyModulePreferences = {
        dailyBudget: finalBudget,
        budgetUnit: 'points',
        resetTime: '00:00',
        showWarningAt: 20,
      }
      await modulePreferencesAdapter.save('energy', prefs)

      // 4. Mark module as onboarded in DB
      await userAdapter.addOnboardedModule('energy')

      // 5. Update in-memory store so ModuleGuard lets through immediately
      addOnboardedModule('energy')

      navigate(ROUTES.ENERGY)
    } finally {
      setIsSeeding(false)
    }
  }, [locale, finalBudget, addOnboardedModule, navigate])

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
