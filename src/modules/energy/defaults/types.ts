import type { Category, EnergyActivityTemplate } from '@/types'

export type EnergyDefaultCategory = Omit<Category, 'id' | 'isDefault' | 'sourceLocale'>

export type EnergyDefaultTemplate = Omit<
  EnergyActivityTemplate,
  'id' | 'categoryId' | 'isDefault' | 'sourceLocale'
> & {
  /** Index into the `categories` array — links this template to its category */
  categoryIndex: number
}

export interface EnergyDefaults {
  categories: EnergyDefaultCategory[]
  templates: EnergyDefaultTemplate[]
}
