import { addDays, format, subDays } from 'date-fns'
import { nb } from 'date-fns/locale'

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function dateFromISO(isoString: string): Date {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(isoString)) {
    return new Date(isoString)
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return new Date(isoString + 'T00:00:00')
  }
  throw new Error(`Invalid date format: ${isoString}`)
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date())
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? dateFromISO(date1) : date1
  const d2 = typeof date2 === 'string' ? dateFromISO(date2) : date2
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function nextDay(date: Date | string): Date {
  const d = typeof date === 'string' ? dateFromISO(date) : date
  return addDays(d, 1)
}

export function prevDay(date: Date | string): Date {
  const d = typeof date === 'string' ? dateFromISO(date) : date
  return subDays(d, 1)
}

export const DateFormats = {
  NorLong: 'EEEE d. MMMM',
  Short: 'd. MMM',
  NorNumeric: 'd.M.yyyy',
  NorNumericShort: 'd.M.yy',
  NorNumericShortPadded: 'dd.MM.yy',
} as const

/** Format a date with Norwegian locale by default. */
export function formatDate(
  date: string | Date,
  formatString: string = DateFormats.NorLong
): string {
  const d = typeof date === 'string' ? dateFromISO(date) : date
  return format(d, formatString, { locale: nb })
}
