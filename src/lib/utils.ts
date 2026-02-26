import { addDays, format, subDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import type { ActivityEntry, DaySummary } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function dateFromISO(isoString: string): Date {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(isoString)) {
    return new Date(isoString);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return new Date(isoString + 'T00:00:00');
  }
  throw new Error(`Invalid date format: ${isoString}`);
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? dateFromISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? dateFromISO(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function nextDay(date: Date | string): Date {
  const d = typeof date === 'string' ? dateFromISO(date) : date;
  return addDays(d, 1);
}

export function prevDay(date: Date | string): Date {
  const d = typeof date === 'string' ? dateFromISO(date) : date;
  return subDays(d, 1);
}

export const DateFormats = {
  NorLong: 'EEEE d. MMMM',
  Short: 'd. MMM',
  NorNumeric: 'd.M.yyyy',
  NorNumericShort: 'd.M.yy',
  NorNumericShortPadded: 'dd.MM.yy',
} as const;

export function formatDate(
  date: string | Date,
  formatString: string = DateFormats.NorLong
): string {
  const d = typeof date === 'string' ? dateFromISO(date) : date;
  return format(d, formatString, { locale: nb });
}

export function computeDaySummary(
  date: string,
  entries: ActivityEntry[],
  dailyBudget: number
): DaySummary {
  let totalSpent = 0;
  let totalGained = 0;

  for (const entry of entries) {
    if (entry.type === 'cost') {
      totalSpent += entry.energyValue;
    } else {
      totalGained += entry.energyValue;
    }
  }

  return {
    date,
    totalBudget: dailyBudget,
    totalSpent,
    totalGained,
    remaining: dailyBudget - totalSpent + totalGained,
    entries,
  };
}

export function energyPercentage(remaining: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / budget) * 100));
}

export function energyColor(percentage: number): string {
  if (percentage > 60) return 'var(--color-energy-full)';
  if (percentage > 40) return 'var(--color-energy-good)';
  if (percentage > 20) return 'var(--color-energy-medium)';
  if (percentage > 0) return 'var(--color-energy-low)';
  return 'var(--color-energy-empty)';
}

/** CSS class variant based on energy level */
export function energyColorClass(percentage: number): string {
  if (percentage > 60) return 'text-energy-full';
  if (percentage > 40) return 'text-energy-good';
  if (percentage > 20) return 'text-energy-medium';
  if (percentage > 0) return 'text-energy-low';
  return 'text-energy-empty';
}
