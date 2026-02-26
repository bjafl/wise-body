import { useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { getStorage } from '@/lib/storage';
import { createDefaultTemplates } from '@/lib/default-templates';
import { todayISO, computeDaySummary } from '@/lib/utils';
import type {
  EnergyProfile,
  ActivityTemplate,
  ActivityEntry,
  DaySummary,
} from '@/types';

const storage = getStorage();

// ─── Profile ───

export function useProfile() {
  const [profile, setProfile] = useState<EnergyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getProfile().then((p) => {
      if (!p) {
        // Create default profile on first use
        const defaultProfile: EnergyProfile = {
          id: 'default',
          dailyBudget: 20,
          scaleUnit: 'poeng',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.saveProfile(defaultProfile).then(() => {
          setProfile(defaultProfile);
          setLoading(false);
        });
      } else {
        setProfile(p);
        setLoading(false);
      }
    });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<EnergyProfile, 'dailyBudget' | 'scaleUnit'>>) => {
      if (!profile) return;
      const updated = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await storage.saveProfile(updated);
      setProfile(updated);
    },
    [profile]
  );

  return { profile, loading, updateProfile };
}

// ─── Templates ───

export function useTemplates() {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    let t = await storage.getTemplates();
    if (t.length === 0) {
      // Seed default templates
      const defaults = createDefaultTemplates();
      for (const tmpl of defaults) {
        await storage.saveTemplate(tmpl);
      }
      t = defaults;
    }
    setTemplates(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = useCallback(
    async (template: ActivityTemplate) => {
      await storage.saveTemplate(template);
      await loadTemplates();
    },
    [loadTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await storage.deleteTemplate(id);
      await loadTemplates();
    },
    [loadTemplates]
  );

  return { templates, loading, saveTemplate, deleteTemplate };
}

// ─── Entries & Day Summary ───

export function useDayEntries(date?: string) {
  const currentDate = date ?? todayISO();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const e = await storage.getEntriesByDate(currentDate);
    // Sort by startedAt descending (newest first)
    e.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    setEntries(e);
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    setLoading(true);
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(
    async (
      input: Pick<ActivityEntry, 'name' | 'energyValue' | 'type' | 'category'> & {
        templateId?: string | null;
        durationMinutes?: number | null;
        note?: string;
      }
    ) => {
      const entry: ActivityEntry = {
        id: uuid(),
        templateId: input.templateId ?? null,
        name: input.name,
        energyValue: input.energyValue,
        type: input.type,
        category: input.category,
        date: currentDate,
        startedAt: new Date().toISOString(),
        durationMinutes: input.durationMinutes ?? null,
        note: input.note ?? '',
        createdAt: new Date().toISOString(),
      };
      await storage.saveEntry(entry);
      await loadEntries();
      return entry;
    },
    [currentDate, loadEntries]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      await storage.deleteEntry(id);
      await loadEntries();
    },
    [loadEntries]
  );

  return { entries, loading, addEntry, removeEntry, refresh: loadEntries };
}

export function useDaySummary(
  entries: ActivityEntry[],
  dailyBudget: number,
  date?: string
): DaySummary {
  const currentDate = date ?? todayISO();
  return computeDaySummary(currentDate, entries, dailyBudget);
}

// ─── Date range entries (for trends) ───

export function useDateRangeEntries(from: string, to: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    storage.getEntriesByDateRange(from, to).then((e) => {
      setEntries(e);
      setLoading(false);
    });
  }, [from, to]);

  return { entries, loading };
}
