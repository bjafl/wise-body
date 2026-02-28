export interface DBMetadata {
  userId: string
  createdAt: string
  updatedAt: string
}

export type WithRecord<T> = T & DBMetadata

export type SyncStatus = 'synced' | 'pending' | 'conflict'
