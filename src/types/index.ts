// === Core domain types for energy accounting ===

export interface EntryBase {
  id: string;
  // userId: string;
  createdAt: string;
  updatedAt?: string;
}
export interface EnergyProfile extends EntryBase {
  /** Daily energy budget (arbitrary unit, user-defined scale) */
  dailyBudget: number;
  /** Scale label, e.g. "poeng" or "spoons" */
  scaleUnit: string;
  updatedAt: string;
}

export interface ActivityTemplate extends EntryBase {
  name: string;
  /** Default energy cost for this activity */
  defaultCost: number;
  /** Category for grouping */
  category: ActivityCategory;
  /** Icon identifier (lucide icon name) */
  icon: string;
  /** Whether this activity gives energy (positive) or costs energy (negative) */
  type: 'cost' | 'gain';
  /** User-defined sort order */
  sortOrder: number;
}

export type ActivityCategory =
  | 'personal_care'
  | 'household'
  | 'work'
  | 'social'
  | 'physical'
  | 'rest'
  | 'transport'
  | 'other';

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  personal_care: 'Personlig stell',
  household: 'Husarbeid',
  work: 'Jobb / studier',
  social: 'Sosialt',
  physical: 'Fysisk aktivitet',
  rest: 'Hvile / restitusjon',
  transport: 'Transport',
  other: 'Annet',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  personal_care: 'Droplets',
  household: 'Home',
  work: 'Briefcase',
  social: 'Users',
  physical: 'Heart',
  rest: 'Moon',
  transport: 'Car',
  other: 'MoreHorizontal',
};

export interface ActivityEntry extends EntryBase {
  templateId: string | null;
  /** Custom name if not using a template */
  name: string;
  /** Actual energy cost/gain for this specific instance */
  energyValue: number;
  /** 'cost' subtracts from budget, 'gain' adds */
  type: 'cost' | 'gain';
  category: ActivityCategory;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** ISO datetime string */
  startedAt: string;
  /** Optional duration in minutes */
  durationMinutes: number | null;
  /** Optional user note */
  note: string;
}

export interface DaySummary {
  date: string;
  totalBudget: number;
  totalSpent: number;
  totalGained: number;
  remaining: number;
  entries: ActivityEntry[];
}

// === Storage abstraction ===

export interface StorageAdapter {
  // Profile
  getProfile(): Promise<EnergyProfile | null>;
  saveProfile(profile: EnergyProfile): Promise<void>;

  // Templates
  getTemplates(): Promise<ActivityTemplate[]>;
  saveTemplate(template: ActivityTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  // Entries
  getEntriesByDate(date: string): Promise<ActivityEntry[]>;
  getEntriesByDateRange(from: string, to: string): Promise<ActivityEntry[]>;
  saveEntry(entry: ActivityEntry): Promise<void>;
  deleteEntry(id: string): Promise<void>;
}
