import "./types.js"

import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
dotenv.config({ path: resolve(dirname(__filename), "../../.env") })

import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import jwt from "@fastify/jwt"
import sensible from "@fastify/sensible"

import prismaPlugin from "./plugins/prisma.js"
import authRoutes from "./routes/auth.js"
import energyRoutes from "./routes/energy.js"
import adminRoutes from "./routes/admin.js"

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
})

// ─── Core plugins ─────────────────────────────────────────────────────────────
async function registerPlugins() {
  const isDev = process.env.NODE_ENV !== "production"
  const allowedOrigins = [
    process.env.CORS_ORIGIN ?? "http://localhost:5173",
    ...(process.env.ADMIN_CORS_ORIGIN ? [process.env.ADMIN_CORS_ORIGIN] : []),
  ]
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      if (isDev && /^https?:\/\/localhost(:\d+)?$/.test(origin))
        return cb(null, true)
      cb(new Error("Not allowed by CORS"), false)
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
  await app.register(cookie, { secret: process.env.COOKIE_SECRET })
  await app.register(jwt, { secret: process.env.JWT_SECRET! })
  await app.register(sensible)
  await app.register(prismaPlugin)
}

// ─── Routes ───────────────────────────────────────────────────────────────────
async function registerRoutes() {
  await app.register(authRoutes, { prefix: "/api/auth" })
  await app.register(energyRoutes, { prefix: "/api/energy" })
  await app.register(adminRoutes, { prefix: "/api/admin" })

  app.get("/health", async () => ({ status: "ok" }))
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await app.listen({
      port: Number(process.env.API_PORT ?? 3000),
      host: process.env.HOST ?? "0.0.0.0",
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap() {
  await registerPlugins()
  await registerRoutes()
  await start()
}

bootstrap()
