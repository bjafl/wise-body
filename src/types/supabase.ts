import type { UserProfileRecord, ModulePreferencesRecord, CategoryRecord } from './user'
import type {
  EnergyActivityTemplateRecord,
  EnergyEntryRecord,
  EnergyDailySummaryRecord,
} from './energy'
import type { PainLocationTemplateRecord, PainEntryRecord } from './pain'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRecord
        Insert: Omit<UserProfileRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<UserProfileRecord, 'id'>>
      }
      module_preferences: {
        Row: ModulePreferencesRecord
        Insert: Omit<ModulePreferencesRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<ModulePreferencesRecord, 'id' | 'userId'>>
      }
      categories: {
        Row: CategoryRecord
        Insert: Omit<CategoryRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<CategoryRecord, 'id' | 'userId'>>
      }
      energy_templates: {
        Row: EnergyActivityTemplateRecord
        Insert: Omit<EnergyActivityTemplateRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<EnergyActivityTemplateRecord, 'id' | 'userId'>>
      }
      energy_entries: {
        Row: EnergyEntryRecord
        Insert: Omit<EnergyEntryRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<EnergyEntryRecord, 'id' | 'userId'>>
      }
      energy_daily_summary: {
        Row: EnergyDailySummaryRecord
        Insert: Omit<EnergyDailySummaryRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<EnergyDailySummaryRecord, 'id' | 'userId'>>
      }
      pain_templates: {
        Row: PainLocationTemplateRecord
        Insert: Omit<PainLocationTemplateRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<PainLocationTemplateRecord, 'id' | 'userId'>>
      }
      pain_entries: {
        Row: PainEntryRecord
        Insert: Omit<PainEntryRecord, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<PainEntryRecord, 'id' | 'userId'>>
      }
    }
  }
}
