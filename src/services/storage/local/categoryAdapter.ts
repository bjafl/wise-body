import { getDB } from '@/lib/idb'
import type { Category, CategoryRecord } from '@/types'
import { CategorySchema } from '@/schemas/user'
import { v4 as uuid } from 'uuid'

const NOW = () => new Date().toISOString()
const USER_ID = 'local'

export const localCategoryAdapter = {
  async getAll(): Promise<Category[]> {
    const db = await getDB()
    const records = await db.getAllFromIndex('categories', 'by-user', USER_ID)
    return records.map(({ userId: _u, createdAt: _c, updatedAt: _up, ...cat }) => cat)
  },

  async getByModule(moduleId: string): Promise<Category[]> {
    const all = await this.getAll()
    return all.filter((c) => c.moduleId === moduleId)
  },

  async save(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    const db = await getDB()
    const id = category.id ?? uuid()
    const validated = CategorySchema.parse({ ...category, id })
    const existing = await db.get('categories', id)
    const record: CategoryRecord = {
      ...validated,
      userId: USER_ID,
      createdAt: existing?.createdAt ?? NOW(),
      updatedAt: NOW(),
    }
    await db.put('categories', record)
    return validated
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('categories', id)
  },
}
