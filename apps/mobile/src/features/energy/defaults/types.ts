import type { ModuleId } from '@/types'

export interface EnergyDefaultCategory {
  moduleId: ModuleId
  name: string
  color: string
  icon: string
  sortOrder: number
}

export interface EnergyDefaultTemplate {
  name: string
  defaultCost: number
  defaultDuration?: number
  icon?: string
  isArchived: boolean
  /** Index into EnergyDefaults.categories — links template to its category on seed */
  categoryIndex: number
}

export interface EnergyDefaults {
  categories: EnergyDefaultCategory[]
  templates: EnergyDefaultTemplate[]
}
