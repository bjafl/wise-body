import type { SyncStatusValue } from "./common.js";

export type BudgetUnitValue = "POINTS" | "PERCENT";

export interface EnergyPreferencesDto {
  id: string;
  dailyBudget: number;
  budgetUnit: BudgetUnitValue;
  resetTime: string; // "HH:MM"
  showWarningAt: number;
  syncStatus: SyncStatusValue;
  updatedAt: string; // ISO datetime
}

export interface CategoryDto {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isDefault: boolean;
  syncStatus: SyncStatusValue;
}

export interface EnergyActivityTemplateDto {
  id: string;
  categoryId: string;
  name: string;
  defaultCost: number;
  defaultDuration: number | null;
  icon: string | null;
  isArchived: boolean;
  isDefault: boolean;
  syncStatus: SyncStatusValue;
  updatedAt: string;
}

export interface EnergyEntryDto {
  id: string;
  templateId: string;
  date: string; // "YYYY-MM-DD"
  timestamp: string; // ISO datetime
  cost: number;
  duration: number | null;
  notes: string | null;
  syncStatus: SyncStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyDailySummaryDto {
  date: string; // "YYYY-MM-DD"
  totalCost: number;
  entryCount: number;
  dailyBudget: number; // joined from EnergyPreferences at query time
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface CreateEnergyEntryRequest {
  templateId: string;
  date: string;
  timestamp: string;
  cost: number;
  duration?: number;
  notes?: string;
}

export interface UpdateEnergyEntryRequest {
  cost?: number;
  duration?: number;
  notes?: string;
}

export interface UpsertEnergyPreferencesRequest {
  dailyBudget: number;
  budgetUnit: BudgetUnitValue;
  resetTime: string;
  showWarningAt: number;
}
