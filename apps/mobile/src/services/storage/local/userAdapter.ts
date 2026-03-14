import { getDB } from '@/lib/idb'
import type { UserProfile, UserProfileRecord } from '@/types'
import { UserProfileSchema } from '@/schemas/user'

const NOW = () => new Date().toISOString()
const USER_ID = 'local'

export const localUserAdapter = {
  async get(): Promise<UserProfile | null> {
    const db = await getDB()
    const record = await db.get('userProfile', USER_ID)
    if (!record) return null
    const { createdAt: _c, updatedAt: _u, ...profile } = record
    return profile
  },

  async save(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const db = await getDB()
    const existing = await db.get('userProfile', USER_ID)
    const validated = UserProfileSchema.parse({ ...profile, id: USER_ID })
    const record: UserProfileRecord = {
      ...validated,
      createdAt: existing?.createdAt ?? NOW(),
      updatedAt: NOW(),
    }
    await db.put('userProfile', record)
    return validated
  },

  async addOnboardedModule(moduleId: string): Promise<void> {
    const db = await getDB()
    const existing = await db.get('userProfile', USER_ID)
    if (!existing) return
    const onboardedModules = Array.from(
      new Set([...existing.onboardedModules, moduleId])
    ) as UserProfile['onboardedModules']
    await db.put('userProfile', { ...existing, onboardedModules, updatedAt: NOW() })
  },
}
