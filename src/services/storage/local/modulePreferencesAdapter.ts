import { getDB } from '@/lib/idb'
import type { ModuleId, ModulePreferences, ModulePreferencesRecord } from '@/types'

const NOW = () => new Date().toISOString()
const USER_ID = 'local'

export const localModulePreferencesAdapter = {
  async get<TPrefs = Record<string, unknown>>(
    moduleId: ModuleId
  ): Promise<ModulePreferences<TPrefs> | null> {
    const db = await getDB()
    const id = `${USER_ID}:${moduleId}`
    const record = await db.get('modulePreferences', id)
    if (!record) return null
    const { userId: _u, createdAt: _c, updatedAt: _up, ...prefs } = record
    return prefs as ModulePreferences<TPrefs>
  },

  async save<TPrefs = Record<string, unknown>>(
    moduleId: ModuleId,
    preferences: TPrefs
  ): Promise<void> {
    const db = await getDB()
    const id = `${USER_ID}:${moduleId}`
    const existing = await db.get('modulePreferences', id)
    const record: ModulePreferencesRecord = {
      id,
      moduleId,
      preferences: preferences as Record<string, unknown>,
      userId: USER_ID,
      createdAt: existing?.createdAt ?? NOW(),
      updatedAt: NOW(),
    }
    await db.put('modulePreferences', record)
  },
}
