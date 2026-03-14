import { z } from 'zod'
import { UUIDSchema, ISODateSchema, ISODateTimeSchema } from './common'

export const EnergyModulePreferencesSchema = z.object({
  dailyBudget: z.number().int().positive(),
  budgetUnit: z.enum(['points', 'percent']),
  resetTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM'),
  showWarningAt: z.number().int().min(0).max(100),
})

export const EnergyActivityTemplateSchema = z.object({
  id: UUIDSchema,
  categoryId: UUIDSchema,
  name: z.string().min(1).max(100),
  defaultCost: z.number().int(),
  defaultDuration: z.number().int().positive().optional(),
  icon: z.string().optional(),
  isArchived: z.boolean(),
  isDefault: z.boolean(),
  sourceLocale: z.string().optional(),
})

export const EnergyEntrySchema = z.object({
  id: UUIDSchema,
  templateId: UUIDSchema,
  date: ISODateSchema,
  timestamp: ISODateTimeSchema,
  cost: z.number().int(),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})

export type EnergyModulePreferencesInput = z.infer<typeof EnergyModulePreferencesSchema>
export type EnergyActivityTemplateInput = z.infer<typeof EnergyActivityTemplateSchema>
export type EnergyEntryInput = z.infer<typeof EnergyEntrySchema>
