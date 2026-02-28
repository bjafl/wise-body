import type { DBSchema } from 'idb'
import type { UserProfileRecord, ModulePreferencesRecord, CategoryRecord } from './user'
import type {
  EnergyActivityTemplateRecord,
  EnergyEntryRecord,
  EnergyDailySummaryRecord,
} from './energy'
import type { PainLocationTemplateRecord, PainEntryRecord } from './pain'

export interface AppDB extends DBSchema {
  userProfile: {
    key: string
    value: UserProfileRecord
  }
  modulePreferences: {
    key: string
    value: ModulePreferencesRecord
    indexes: { 'by-user': string; 'by-module': string }
  }
  categories: {
    key: string
    value: CategoryRecord
    indexes: { 'by-user': string; 'by-module': string }
  }
  energyTemplates: {
    key: string
    value: EnergyActivityTemplateRecord
    indexes: { 'by-user': string; 'by-category': string }
  }
  energyEntries: {
    key: string
    value: EnergyEntryRecord
    indexes: { 'by-user': string; 'by-date': string; 'by-template': string }
  }
  energyDailySummary: {
    key: string
    value: EnergyDailySummaryRecord
    indexes: { 'by-user': string; 'by-date': string }
  }
  painTemplates: {
    key: string
    value: PainLocationTemplateRecord
    indexes: { 'by-user': string; 'by-category': string }
  }
  painEntries: {
    key: string
    value: PainEntryRecord
    indexes: { 'by-user': string; 'by-date': string; 'by-template': string }
  }
}
