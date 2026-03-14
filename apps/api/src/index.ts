import './types.js'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'

import prismaPlugin from './plugins/prisma.js'
import authRoutes from './routes/auth.js'
import energyRoutes from './routes/energy.js'
import adminRoutes from './routes/admin.js'

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
})

// ─── Core plugins ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  ...(process.env.ADMIN_CORS_ORIGIN ? [process.env.ADMIN_CORS_ORIGIN] : []),
]
await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
})
await app.register(cookie, { secret: process.env.COOKIE_SECRET })
await app.register(jwt, { secret: process.env.JWT_SECRET! })
await app.register(sensible)
await app.register(prismaPlugin)

// ─── Routes ───────────────────────────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(energyRoutes, { prefix: '/api/energy' })
await app.register(adminRoutes, { prefix: '/api/admin' })

app.get('/health', async () => ({ status: 'ok' }))

// ─── Start ────────────────────────────────────────────────────────────────────
try {
  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? '0.0.0.0',
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
