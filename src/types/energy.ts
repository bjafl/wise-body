import type { WithRecord } from './db'

// ─── Module Preferences ───────────────────────────────────────────────────────

export interface EnergyModulePreferences {
  dailyBudget: number
  budgetUnit: 'points' | 'percent'
  resetTime: string
  showWarningAt: number
}

// ─── Templates ────────────────────────────────────────────────────────────────

export interface EnergyActivityTemplate {
  id: string
  categoryId: string
  name: string
  /** Negative = energy cost, positive = energy gain */
  defaultCost: number
  defaultDuration?: number
  icon?: string
  isArchived: boolean
  isDefault: boolean
  sourceLocale?: string
}

export type EnergyActivityTemplateRecord = WithRecord<EnergyActivityTemplate>

// ─── Entries ──────────────────────────────────────────────────────────────────

export interface EnergyEntry {
  id: string
  templateId: string
  date: string       // "YYYY-MM-DD"
  timestamp: string  // ISO datetime
  /** Negative = energy cost, positive = energy gain */
  cost: number
  duration?: number
  notes?: string
}

export type EnergyEntryRecord = WithRecord<EnergyEntry>

// ─── Daily Summary ────────────────────────────────────────────────────────────

export interface EnergyDailySummary {
  id: string  // `${userId}:${date}`
  date: string
  budgetAtDate: number
  totalCost: number
  entryCount: number
}

export type EnergyDailySummaryRecord = WithRecord<EnergyDailySummary>
