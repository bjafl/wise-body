import { getDB } from '@/lib/idb'
import type { EnergyActivityTemplate, EnergyActivityTemplateRecord } from '@/types'
import { EnergyActivityTemplateSchema } from '@/schemas/energy'
import { v4 as uuid } from 'uuid'

const NOW = () => new Date().toISOString()
const USER_ID = 'local'

export const localEnergyTemplateAdapter = {
  async getAll(): Promise<EnergyActivityTemplate[]> {
    const db = await getDB()
    const records = await db.getAllFromIndex('energyTemplates', 'by-user', USER_ID)
    return records.map(({ userId: _u, createdAt: _c, updatedAt: _up, ...tmpl }) => tmpl)
  },

  async getByCategory(categoryId: string): Promise<EnergyActivityTemplate[]> {
    const all = await this.getAll()
    return all.filter((t) => t.categoryId === categoryId)
  },

  async save(
    template: Omit<EnergyActivityTemplate, 'id'> & { id?: string }
  ): Promise<EnergyActivityTemplate> {
    const db = await getDB()
    const id = template.id ?? uuid()
    const validated = EnergyActivityTemplateSchema.parse({ ...template, id })
    const existing = await db.get('energyTemplates', id)
    const record: EnergyActivityTemplateRecord = {
      ...validated,
      userId: USER_ID,
      createdAt: existing?.createdAt ?? NOW(),
      updatedAt: NOW(),
    }
    await db.put('energyTemplates', record)
    return validated
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('energyTemplates', id)
  },
}
