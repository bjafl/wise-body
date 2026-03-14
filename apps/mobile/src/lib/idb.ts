import { openDB, type IDBPDatabase } from 'idb'
import type { AppDB } from '@/types/idb'

const DB_NAME = 'wise-body'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('userProfile', { keyPath: 'id' })

        const prefsStore = db.createObjectStore('modulePreferences', { keyPath: 'id' })
        prefsStore.createIndex('by-user', 'userId')
        prefsStore.createIndex('by-module', 'moduleId')

        const catStore = db.createObjectStore('categories', { keyPath: 'id' })
        catStore.createIndex('by-user', 'userId')
        catStore.createIndex('by-module', 'moduleId')

        const energyTmplStore = db.createObjectStore('energyTemplates', { keyPath: 'id' })
        energyTmplStore.createIndex('by-user', 'userId')
        energyTmplStore.createIndex('by-category', 'categoryId')

        const energyEntryStore = db.createObjectStore('energyEntries', { keyPath: 'id' })
        energyEntryStore.createIndex('by-user', 'userId')
        energyEntryStore.createIndex('by-date', 'date')
        energyEntryStore.createIndex('by-template', 'templateId')

        const energySummaryStore = db.createObjectStore('energyDailySummary', { keyPath: 'id' })
        energySummaryStore.createIndex('by-user', 'userId')
        energySummaryStore.createIndex('by-date', 'date')

        const painTmplStore = db.createObjectStore('painTemplates', { keyPath: 'id' })
        painTmplStore.createIndex('by-user', 'userId')
        painTmplStore.createIndex('by-category', 'categoryId')

        const painEntryStore = db.createObjectStore('painEntries', { keyPath: 'id' })
        painEntryStore.createIndex('by-user', 'userId')
        painEntryStore.createIndex('by-date', 'date')
        painEntryStore.createIndex('by-template', 'locationTemplateId')
      },
    })
  }
  return dbPromise
}
