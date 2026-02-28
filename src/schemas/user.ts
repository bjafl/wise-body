import { z } from 'zod'
import { UUIDSchema, ModuleIdSchema } from './common'

export const CategorySchema = z.object({
  id: UUIDSchema,
  moduleId: ModuleIdSchema,
  name: z.string().min(1).max(100),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isDefault: z.boolean(),
  sourceLocale: z.string().optional(),
})

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().max(100).optional(),
  locale: z.string().min(2).max(10),
  onboardedModules: z.array(ModuleIdSchema),
})

export const ModulePreferencesSchema = z.object({
  id: z.string().min(1),
  moduleId: ModuleIdSchema,
  preferences: z.record(z.unknown()),
})

export type CategoryInput = z.infer<typeof CategorySchema>
export type UserProfileInput = z.infer<typeof UserProfileSchema>
