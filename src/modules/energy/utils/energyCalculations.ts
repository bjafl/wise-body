import type { EnergyEntry, EnergyDailySummary, EnergyModulePreferences } from '@/types'

/**
 * Compute a daily summary from a list of entries and preferences.
 * Cost < 0 means energy expenditure, cost > 0 means energy gain.
 */
export function computeDailySummary(
  userId: string,
  date: string,
  entries: EnergyEntry[],
  prefs: EnergyModulePreferences
): EnergyDailySummary {
  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0)
  return {
    id: `${userId}:${date}`,
    date,
    budgetAtDate: prefs.dailyBudget,
    totalCost,
    entryCount: entries.length,
  }
}

/** Remaining energy: budget minus net cost (negative cost = spent, positive = gained) */
export function remainingEnergy(summary: EnergyDailySummary): number {
  return summary.budgetAtDate + summary.totalCost
}

/** 0–100 percentage of budget remaining */
export function energyPercentage(remaining: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.max(0, Math.min(100, (remaining / budget) * 100))
}

export function energyColor(percentage: number): string {
  if (percentage > 60) return 'var(--color-energy-full)'
  if (percentage > 40) return 'var(--color-energy-good)'
  if (percentage > 20) return 'var(--color-energy-medium)'
  if (percentage > 0) return 'var(--color-energy-low)'
  return 'var(--color-energy-empty)'
}

export function energyColorClass(percentage: number): string {
  if (percentage > 60) return 'text-energy-full'
  if (percentage > 40) return 'text-energy-good'
  if (percentage > 20) return 'text-energy-medium'
  if (percentage > 0) return 'text-energy-low'
  return 'text-energy-empty'
}

export const DEFAULT_ENERGY_PREFERENCES: EnergyModulePreferences = {
  dailyBudget: 20,
  budgetUnit: 'points',
  resetTime: '00:00',
  showWarningAt: 20,
}
