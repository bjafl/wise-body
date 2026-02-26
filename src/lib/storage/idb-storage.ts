import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  StorageAdapter,
  EnergyProfile,
  ActivityTemplate,
  ActivityEntry,
} from '@/types';

interface EnergiDB extends DBSchema {
  profile: {
    key: string;
    value: EnergyProfile;
  };
  templates: {
    key: string;
    value: ActivityTemplate;
    indexes: { 'by-category': string };
  };
  entries: {
    key: string;
    value: ActivityEntry;
    indexes: { 'by-date': string; 'by-template': string };
  };
}

const DB_NAME = 'energi-app';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EnergiDB>> | null = null;

function getDB(): Promise<IDBPDatabase<EnergiDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EnergiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Profile store (singleton)
        db.createObjectStore('profile', { keyPath: 'id' });

        // Activity templates
        const templateStore = db.createObjectStore('templates', {
          keyPath: 'id',
        });
        templateStore.createIndex('by-category', 'category');

        // Activity entries (the log)
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by-date', 'date');
        entryStore.createIndex('by-template', 'templateId');
      },
    });
  }
  return dbPromise;
}

export const idbStorage: StorageAdapter = {
  async getProfile() {
    const db = await getDB();
    const all = await db.getAll('profile');
    return all[0] ?? null;
  },

  async saveProfile(profile) {
    const db = await getDB();
    await db.put('profile', profile);
  },

  async getTemplates() {
    const db = await getDB();
    const templates = await db.getAll('templates');
    return templates.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async saveTemplate(template) {
    const db = await getDB();
    await db.put('templates', template);
  },

  async deleteTemplate(id) {
    const db = await getDB();
    await db.delete('templates', id);
  },

  async getEntriesByDate(date) {
    const db = await getDB();
    return db.getAllFromIndex('entries', 'by-date', date);
  },

  async getEntriesByDateRange(from, to) {
    const db = await getDB();
    const range = IDBKeyRange.bound(from, to);
    return db.getAllFromIndex('entries', 'by-date', range);
  },

  async saveEntry(entry) {
    const db = await getDB();
    await db.put('entries', entry);
  },

  async deleteEntry(id) {
    const db = await getDB();
    await db.delete('entries', id);
  },
};
