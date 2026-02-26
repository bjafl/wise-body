import type { StorageAdapter } from '@/types';
import { idbStorage } from './idb-storage';

// Future: import { supabaseStorage } from './supabase-storage';

/** 
 * Current storage backend.
 * Swap this to switch between local and cloud storage.
 * A sync layer can wrap both for offline-first with cloud backup.
 */
export function getStorage(): StorageAdapter {
  return idbStorage;
}

export { idbStorage };
