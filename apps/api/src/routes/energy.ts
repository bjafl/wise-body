import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { Prisma } from '@wise-body/db'
import { authenticate } from '../middleware/authenticate.js'

// ─── Validation schemas ────────────────────────────────────────────────────────

const UpsertPreferencesSchema = z.object({
  dailyBudget: z.number().int().positive(),
  budgetUnit: z.enum(['POINTS', 'PERCENT']),
  resetTime: z.string().regex(/^\d{2}:\d{2}$/),
  showWarningAt: z.number().int().min(0).max(100),
})

const CreateEntrySchema = z.object({
  templateId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timestamp: z.string().datetime(),
  cost: z.number().int(),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})

const CreateTemplateSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(64),
  defaultCost: z.number().int(),
  defaultDuration: z.number().int().positive().optional(),
  icon: z.string().max(64).optional(),
})

const OnboardSchema = z.object({
  preferences: UpsertPreferencesSchema,
  categories: z.array(z.object({
    name: z.string().min(1).max(64),
    color: z.string().max(32).optional(),
    icon: z.string().max(64).optional(),
    sortOrder: z.number().int(),
    isDefault: z.boolean(),
    sourceLocale: z.string().max(10).optional(),
  })),
  templates: z.array(z.object({
    categoryIndex: z.number().int().min(0),
    name: z.string().min(1).max(64),
    defaultCost: z.number().int(),
    defaultDuration: z.number().int().positive().optional(),
    icon: z.string().max(64).optional(),
    isDefault: z.boolean(),
    sourceLocale: z.string().max(10).optional(),
  })),
})

// ─── Routes ───────────────────────────────────────────────────────────────────

const energyRoutes: FastifyPluginAsync = async (fastify) => {
  const { prisma } = fastify

  fastify.addHook('preHandler', authenticate)

  // ─── Preferences ────────────────────────────────────────────────────────────

  fastify.get('/preferences', async (request, reply) => {
    const prefs = await prisma.energyPreferences.findUnique({
      where: { userId: request.userId },
    })
    if (!prefs) return reply.notFound('Energy preferences not set')
    return prefs
  })

  fastify.put('/preferences', async (request, reply) => {
    const body = UpsertPreferencesSchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    const prefs = await prisma.energyPreferences.upsert({
      where: { userId: request.userId },
      create: { userId: request.userId, ...body.data },
      update: body.data,
    })
    return prefs
  })

  // ─── Categories ─────────────────────────────────────────────────────────────

  fastify.get('/categories', async (request) => {
    return prisma.category.findMany({
      where: { userId: request.userId, moduleId: 'ENERGY' },
      orderBy: { sortOrder: 'asc' },
    })
  })

  // ─── Templates ──────────────────────────────────────────────────────────────

  fastify.get('/templates', async (request) => {
    return prisma.energyActivityTemplate.findMany({
      where: { userId: request.userId, isArchived: false },
      orderBy: { name: 'asc' },
    })
  })

  fastify.post('/templates', async (request, reply) => {
    const body = CreateTemplateSchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    // Verify category belongs to this user
    const category = await prisma.category.findFirst({
      where: { id: body.data.categoryId, userId: request.userId, moduleId: 'ENERGY' },
    })
    if (!category) return reply.notFound('Category not found')

    const template = await prisma.energyActivityTemplate.create({
      data: {
        userId: request.userId,
        categoryId: body.data.categoryId,
        name: body.data.name,
        defaultCost: body.data.defaultCost,
        defaultDuration: body.data.defaultDuration ?? null,
        icon: body.data.icon ?? null,
      },
    })
    return reply.code(201).send(template)
  })

  fastify.delete('/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const template = await prisma.energyActivityTemplate.findFirst({
      where: { id, userId: request.userId },
    })
    if (!template) return reply.notFound('Template not found')

    // Soft-delete if template has entries, hard-delete if not
    const hasEntries = await prisma.energyEntry.findFirst({
      where: { templateId: id, userId: request.userId },
    })

    if (hasEntries) {
      await prisma.energyActivityTemplate.update({
        where: { id },
        data: { isArchived: true },
      })
    } else {
      await prisma.energyActivityTemplate.delete({ where: { id } })
    }

    return reply.code(204).send()
  })

  // ─── Entries ────────────────────────────────────────────────────────────────

  fastify.get('/entries', async (request, reply) => {
    const { date } = request.query as { date?: string }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return reply.badRequest('Query param `date` is required (YYYY-MM-DD)')
    }

    return prisma.energyEntry.findMany({
      where: { userId: request.userId, date },
      orderBy: { timestamp: 'asc' },
    })
  })

  fastify.post('/entries', async (request, reply) => {
    const body = CreateEntrySchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    // Verify template belongs to this user
    const template = await prisma.energyActivityTemplate.findFirst({
      where: { id: body.data.templateId, userId: request.userId, isArchived: false },
    })
    if (!template) return reply.notFound('Template not found')

    const entry = await prisma.energyEntry.create({
      data: {
        userId: request.userId,
        templateId: body.data.templateId,
        date: body.data.date,
        timestamp: new Date(body.data.timestamp),
        cost: body.data.cost,
        duration: body.data.duration ?? null,
        notes: body.data.notes ?? null,
      },
    })
    return reply.code(201).send(entry)
  })

  fastify.delete('/entries/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const entry = await prisma.energyEntry.findFirst({
      where: { id, userId: request.userId },
    })
    if (!entry) return reply.notFound('Entry not found')

    await prisma.energyEntry.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Daily summary ───────────────────────────────────────────────────────────

  fastify.get('/summary', async (request, reply) => {
    const { date } = request.query as { date?: string }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return reply.badRequest('Query param `date` is required (YYYY-MM-DD)')
    }

    const [summary, prefs] = await Promise.all([
      prisma.energyDailySummary.findFirst({
        where: { userId: request.userId, date },
      }),
      prisma.energyPreferences.findUnique({ where: { userId: request.userId } }),
    ])

    return {
      date,
      totalCost: summary?.totalCost ?? 0,
      entryCount: summary?.entryCount ?? 0,
      dailyBudget: prefs?.dailyBudget ?? 100,
    }
  })

  // ─── Onboarding (atomic setup) ───────────────────────────────────────────────

  fastify.post('/onboard', async (request, reply) => {
    const body = OnboardSchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    // Check not already onboarded
    const existing = await prisma.userOnboardedModule.findUnique({
      where: { userId_moduleId: { userId: request.userId, moduleId: 'ENERGY' } },
    })
    if (existing) return reply.conflict('Already onboarded for energy module')

    const { preferences, categories, templates } = body.data

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create categories
      const createdCategories = await Promise.all(
        categories.map((cat) =>
          tx.category.create({
            data: {
              userId: request.userId,
              moduleId: 'ENERGY',
              name: cat.name,
              color: cat.color ?? null,
              icon: cat.icon ?? null,
              sortOrder: cat.sortOrder,
              isDefault: cat.isDefault,
              sourceLocale: cat.sourceLocale ?? null,
            },
          }),
        ),
      )

      // 2. Create templates (resolve categoryIndex → categoryId)
      const createdTemplates = await Promise.all(
        templates.map((tmpl) => {
          const category = createdCategories[tmpl.categoryIndex]
          if (!category) throw new Error(`Invalid categoryIndex: ${tmpl.categoryIndex}`)
          return tx.energyActivityTemplate.create({
            data: {
              userId: request.userId,
              categoryId: category.id,
              name: tmpl.name,
              defaultCost: tmpl.defaultCost,
              defaultDuration: tmpl.defaultDuration ?? null,
              icon: tmpl.icon ?? null,
              isDefault: tmpl.isDefault,
              sourceLocale: tmpl.sourceLocale ?? null,
            },
          })
        }),
      )

      // 3. Create preferences
      const createdPreferences = await tx.energyPreferences.create({
        data: { userId: request.userId, ...preferences },
      })

      // 4. Mark user as onboarded
      await tx.userOnboardedModule.create({
        data: { userId: request.userId, moduleId: 'ENERGY' },
      })

      return { preferences: createdPreferences, categories: createdCategories, templates: createdTemplates }
    })

    return reply.code(201).send(result)
  })
}

export default energyRoutes
