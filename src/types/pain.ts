import type { WithRecord } from './db'

// ─── Module Preferences ───────────────────────────────────────────────────────

export interface PainModulePreferences {
  scale: 1 | 10
  defaultBodySide: 'left' | 'right' | 'both' | null
  reminderTime?: string
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder'
  | 'arm'
  | 'back'
  | 'hip'
  | 'leg'
  | 'knee'
  | 'foot'
  | 'other'

export type PainQuality =
  | 'aching'
  | 'burning'
  | 'stabbing'
  | 'throbbing'
  | 'cramping'
  | 'shooting'
  | 'pressure'
  | 'other'

// ─── Templates ────────────────────────────────────────────────────────────────

export interface PainLocationTemplate {
  id: string
  categoryId: string
  name: string
  bodyRegion: BodyRegion
  isArchived: boolean
  isDefault: boolean
  sourceLocale?: string
}

export type PainLocationTemplateRecord = WithRecord<PainLocationTemplate>

// ─── Entries ──────────────────────────────────────────────────────────────────

export interface PainEntry {
  id: string
  locationTemplateId: string
  date: string
  timestamp: string
  intensity: number
  quality?: PainQuality[]
  notes?: string
}

export type PainEntryRecord = WithRecord<PainEntry>
