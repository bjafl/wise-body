import { timingSafeEqual } from 'crypto'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { hashPassword } from '../services/authService.js'
import { adminAuth } from '../middleware/adminAuth.js'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(64).optional(),
  locale: z.string().max(10).optional(),
})

const adminRoutes: FastifyPluginAsync = async (app) => {
  // ── Public: login ───────────────────────────────────────────────────────────
  app.post('/login', async (request, reply) => {
    const { username, password } = LoginSchema.parse(request.body)

    const validUser = process.env.ADMIN_USERNAME
    const validPass = process.env.ADMIN_PASSWORD

    if (
      !validUser ||
      !validPass ||
      !safeEqual(username, validUser) ||
      !safeEqual(password, validPass)
    ) {
      // Identical error and delay for valid/invalid username to prevent enumeration
      await new Promise((r) => setTimeout(r, 300))
      return reply.unauthorized('Invalid credentials')
    }

    const token = app.jwt.sign({ sub: 'admin', role: 'admin' }, { expiresIn: '4h' })
    return { token }
  })

  // ── Protected: all routes below require admin JWT ───────────────────────────
  app.register(async (secure) => {
    secure.addHook('preHandler', adminAuth)

    // Health + stats ────────────────────────────────────────────────────────
    secure.get('/stats', async () => {
      const [userCount, sessionCount, energyEntryCount] = await Promise.all([
        secure.prisma.user.count(),
        secure.prisma.session.count(),
        secure.prisma.energyEntry.count(),
      ])
      return { userCount, sessionCount, energyEntryCount }
    })

    // User list ─────────────────────────────────────────────────────────────
    secure.get('/users', async () => {
      const users = await secure.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          locale: true,
          createdAt: true,
          consentGiven: true,
          onboardedModules: { select: { moduleId: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return users.map((u) => ({
        ...u,
        onboardedModules: u.onboardedModules.map((m) => m.moduleId),
      }))
    })

    // Create user ───────────────────────────────────────────────────────────
    secure.post('/users', async (request, reply) => {
      const body = CreateUserSchema.parse(request.body)
      const passwordHash = await hashPassword(body.password)
      const user = await secure.prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          displayName: body.displayName ?? null,
          locale: body.locale ?? 'nb',
        },
        select: { id: true, email: true, displayName: true, locale: true, createdAt: true },
      })
      return reply.code(201).send(user)
    })

    // Delete user ───────────────────────────────────────────────────────────
    secure.delete('/users/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      await secure.prisma.user.delete({ where: { id } })
      return reply.code(204).send()
    })
  })
}

export default adminRoutes
