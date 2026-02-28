import { z } from 'zod'
import { UUIDSchema, ISODateSchema, ISODateTimeSchema } from './common'

const BodyRegionSchema = z.enum([
  'head', 'neck', 'shoulder', 'arm', 'back',
  'hip', 'leg', 'knee', 'foot', 'other',
])

const PainQualitySchema = z.enum([
  'aching', 'burning', 'stabbing', 'throbbing',
  'cramping', 'shooting', 'pressure', 'other',
])

export const PainLocationTemplateSchema = z.object({
  id: UUIDSchema,
  categoryId: UUIDSchema,
  name: z.string().min(1).max(100),
  bodyRegion: BodyRegionSchema,
  isArchived: z.boolean(),
  isDefault: z.boolean(),
  sourceLocale: z.string().optional(),
})

export const PainEntrySchema = z.object({
  id: UUIDSchema,
  locationTemplateId: UUIDSchema,
  date: ISODateSchema,
  timestamp: ISODateTimeSchema,
  intensity: z.number().min(0).max(10),
  quality: z.array(PainQualitySchema).optional(),
  notes: z.string().max(1000).optional(),
})

export type PainEntryInput = z.infer<typeof PainEntrySchema>
