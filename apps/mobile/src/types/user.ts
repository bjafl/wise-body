import type { ModuleId } from './modules'
import type { WithRecord } from './db'

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  locale: string
  onboardedModules: ModuleId[]
}

export interface ModulePreferences<TPrefs = Record<string, unknown>> {
  id: string // `${userId}:${moduleId}`
  moduleId: ModuleId
  preferences: TPrefs
}

export interface Category {
  id: string
  moduleId: ModuleId
  name: string
  color?: string
  icon?: string
  sortOrder: number
  isDefault: boolean
  sourceLocale?: string
}

export interface UserProfileRecord extends UserProfile {
  createdAt: string
  updatedAt: string
}

export type ModulePreferencesRecord<TPrefs = Record<string, unknown>> =
  WithRecord<ModulePreferences<TPrefs>>

export type CategoryRecord = WithRecord<Category>
