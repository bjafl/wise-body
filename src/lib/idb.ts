import { openDB, type IDBPDatabase } from 'idb'
import type { AppDB } from '@/types/idb'

const DB_NAME = 'wise-body'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // User profile (singleton per user)
        db.createObjectStore('userProfile', { keyPath: 'id' })

        // Module preferences — one record per user+module
        const prefsStore = db.createObjectStore('modulePreferences', {
          keyPath: 'id',
        })
        prefsStore.createIndex('by-user', 'userId')
        prefsStore.createIndex('by-module', 'moduleId')

        // Categories — user-owned, per module
        const catStore = db.createObjectStore('categories', { keyPath: 'id' })
        catStore.createIndex('by-user', 'userId')
        catStore.createIndex('by-module', 'moduleId')

        // Energy templates
        const energyTmplStore = db.createObjectStore('energyTemplates', {
          keyPath: 'id',
        })
        energyTmplStore.createIndex('by-user', 'userId')
        energyTmplStore.createIndex('by-category', 'categoryId')

        // Energy entries
        const energyEntryStore = db.createObjectStore('energyEntries', {
          keyPath: 'id',
        })
        energyEntryStore.createIndex('by-user', 'userId')
        energyEntryStore.createIndex('by-date', 'date')
        energyEntryStore.createIndex('by-template', 'templateId')

        // Energy daily summary
        const energySummaryStore = db.createObjectStore('energyDailySummary', {
          keyPath: 'id',
        })
        energySummaryStore.createIndex('by-user', 'userId')
        energySummaryStore.createIndex('by-date', 'date')

        // Pain templates
        const painTmplStore = db.createObjectStore('painTemplates', {
          keyPath: 'id',
        })
        painTmplStore.createIndex('by-user', 'userId')
        painTmplStore.createIndex('by-category', 'categoryId')

        // Pain entries
        const painEntryStore = db.createObjectStore('painEntries', {
          keyPath: 'id',
        })
        painEntryStore.createIndex('by-user', 'userId')
        painEntryStore.createIndex('by-date', 'date')
        painEntryStore.createIndex('by-template', 'locationTemplateId')
      },
    })
  }
  return dbPromise
}
