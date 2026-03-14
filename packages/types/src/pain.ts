import type { SyncStatusValue } from "./common.js";

export type PainScaleValue = "ONE" | "TEN";
export type BodySideValue = "LEFT" | "RIGHT" | "BOTH";

export type BodyRegion =
  | "head"
  | "neck"
  | "shoulder"
  | "arm"
  | "back"
  | "hip"
  | "leg"
  | "knee"
  | "foot"
  | "other";

export type PainQuality =
  | "aching"
  | "burning"
  | "stabbing"
  | "throbbing"
  | "cramping"
  | "shooting"
  | "pressure"
  | "other";

export interface PainPreferencesDto {
  id: string;
  scale: PainScaleValue;
  defaultBodySide: BodySideValue | null;
  reminderTime: string | null;
  syncStatus: SyncStatusValue;
  updatedAt: string;
}

export interface PainLocationTemplateDto {
  id: string;
  categoryId: string;
  name: string;
  bodyRegion: BodyRegion;
  isArchived: boolean;
  isDefault: boolean;
  syncStatus: SyncStatusValue;
  updatedAt: string;
}

export interface PainEntryDto {
  id: string;
  locationTemplateId: string;
  date: string; // "YYYY-MM-DD"
  timestamp: string; // ISO datetime
  intensity: number;
  quality: PainQuality[];
  notes: string | null;
  syncStatus: SyncStatusValue;
  createdAt: string;
  updatedAt: string;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface CreatePainEntryRequest {
  locationTemplateId: string;
  date: string;
  timestamp: string;
  intensity: number;
  quality?: PainQuality[];
  notes?: string;
}

export interface UpdatePainEntryRequest {
  intensity?: number;
  quality?: PainQuality[];
  notes?: string;
}

export interface UpsertPainPreferencesRequest {
  scale: PainScaleValue;
  defaultBodySide?: BodySideValue | null;
  reminderTime?: string | null;
}
