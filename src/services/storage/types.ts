export interface StorageAdapter<T> {
  save(item: T): Promise<void>
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  delete(id: string): Promise<void>
}

export interface IndexedStorageAdapter<T> extends StorageAdapter<T> {
  getByIndex(indexName: string, value: IDBValidKey | IDBKeyRange): Promise<T[]>
}
