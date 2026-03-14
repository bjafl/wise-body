import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { ModuleIdValue } from '@wise-body/types'
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashToken,
  signAccessToken,
  createSession,
  rotateSession,
  deleteSession,
  buildUserDto,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from '../services/authService.js'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(64).optional(),
  locale: z.string().max(10).optional(),
  consentGiven: z.boolean().optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const { prisma } = fastify

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  }

  // ─── POST /auth/register ─────────────────────────────────────────────────────
  fastify.post('/register', async (request, reply) => {
    const body = RegisterSchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    const { email, password, displayName, locale, consentGiven } = body.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.conflict('Email already in use')

    const user = await prisma.user.create({
      data: {
        email,
        displayName: displayName ?? null,
        locale: locale ?? 'nb',
        passwordHash: await hashPassword(password),
        consentGiven: consentGiven ?? false,
        consentAt: consentGiven ? new Date() : null,
        consentVersion: consentGiven ? '1.0' : null,
      },
    })

    const refreshToken = generateRefreshToken()
    await createSession(prisma, user.id, refreshToken, request.headers['user-agent'], request.ip)

    reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOpts)
    return reply.code(201).send({
      accessToken: signAccessToken(fastify, { sub: user.id, email: user.email }),
      user: buildUserDto(user, []),
    })
  })

  // ─── POST /auth/login ────────────────────────────────────────────────────────
  fastify.post('/login', async (request, reply) => {
    const body = LoginSchema.safeParse(request.body)
    if (!body.success) return reply.badRequest(body.error.message)

    const { email, password } = body.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { onboardedModules: true },
    })
    if (!user) return reply.unauthorized('Invalid credentials')

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return reply.unauthorized('Invalid credentials')

    const refreshToken = generateRefreshToken()
    await createSession(prisma, user.id, refreshToken, request.headers['user-agent'], request.ip)

    const onboardedModules = user.onboardedModules.map((m: { moduleId: string }) => m.moduleId as ModuleIdValue)

    reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOpts)
    return {
      accessToken: signAccessToken(fastify, { sub: user.id, email: user.email }),
      user: buildUserDto(user, onboardedModules),
    }
  })

  // ─── POST /auth/refresh ──────────────────────────────────────────────────────
  fastify.post('/refresh', async (request, reply) => {
    const oldToken = request.cookies[REFRESH_TOKEN_COOKIE]
    if (!oldToken) return reply.unauthorized('Missing refresh token')

    const newRefreshToken = generateRefreshToken()
    const result = await rotateSession(
      prisma,
      hashToken(oldToken),
      newRefreshToken,
      request.headers['user-agent'],
      request.ip,
    )

    if (!result) {
      reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' })
      return reply.unauthorized('Refresh token expired or invalid')
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: result.userId },
      include: { onboardedModules: true },
    })
    const onboardedModules = user.onboardedModules.map((m: { moduleId: string }) => m.moduleId as ModuleIdValue)

    reply.setCookie(REFRESH_TOKEN_COOKIE, newRefreshToken, cookieOpts)
    return {
      accessToken: signAccessToken(fastify, { sub: user.id, email: user.email }),
      user: buildUserDto(user, onboardedModules),
    }
  })

  // ─── DELETE /auth/logout ─────────────────────────────────────────────────────
  fastify.delete('/logout', async (request, reply) => {
    const token = request.cookies[REFRESH_TOKEN_COOKIE]
    if (token) await deleteSession(prisma, hashToken(token))

    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' })
    return reply.code(204).send()
  })
}

export default authRoutes
