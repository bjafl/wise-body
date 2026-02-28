import { z } from 'zod'

export const UUIDSchema = z.string().uuid()
export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
export const ISODateTimeSchema = z.string().datetime()
export const LocaleSchema = z.enum(['en', 'nb'])
export const ModuleIdSchema = z.enum(['energy', 'pain', 'mood'])
