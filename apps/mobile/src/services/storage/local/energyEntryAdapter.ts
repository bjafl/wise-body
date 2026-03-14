import { getDB } from '@/lib/idb'
import type { EnergyEntry, EnergyEntryRecord } from '@/types'
import { EnergyEntrySchema } from '@/schemas/energy'
import { v4 as uuid } from 'uuid'

const NOW = () => new Date().toISOString()
const USER_ID = 'local'

export const localEnergyEntryAdapter = {
  async getByDate(date: string): Promise<EnergyEntry[]> {
    const db = await getDB()
    const all = await db.getAllFromIndex('energyEntries', 'by-user', USER_ID)
    return all
      .filter(({ date: d }) => d === date)
      .map(({ userId: _u, createdAt: _c, updatedAt: _up, ...entry }) => entry)
  },

  async save(
    entry: Omit<EnergyEntry, 'id'> & { id?: string }
  ): Promise<EnergyEntry> {
    const db = await getDB()
    const id = entry.id ?? uuid()
    const now = NOW()
    const validated = EnergyEntrySchema.parse({ ...entry, id, timestamp: entry.timestamp ?? now })
    const existing = await db.get('energyEntries', id)
    const record: EnergyEntryRecord = {
      ...validated,
      userId: USER_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    await db.put('energyEntries', record)
    return validated
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('energyEntries', id)
  },
}
