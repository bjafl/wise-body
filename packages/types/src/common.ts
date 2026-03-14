// Shared primitives used across energy, pain, and future modules.

export type SyncStatusValue = "SYNCED" | "PENDING" | "CONFLICT";

// Generic API response envelope
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Sync payload shape for write-through local cache (Phase 9+)
export interface SyncRecord {
  id: string;
  updatedAt: string;
  syncStatus: SyncStatusValue;
}
