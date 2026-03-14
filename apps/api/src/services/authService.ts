import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { prisma } from '@wise-body/db'

type PrismaClient = typeof prisma
import type { UserDto, ModuleIdValue } from '@wise-body/types'

const BCRYPT_ROUNDS = 12
const REFRESH_TOKEN_BYTES = 32
const REFRESH_TOKEN_TTL_DAYS = 30

export const REFRESH_TOKEN_COOKIE = 'refresh_token'
export const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 // seconds

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function signAccessToken(
  fastify: FastifyInstance,
  payload: { sub: string; email: string },
): string {
  return fastify.jwt.sign(payload, { expiresIn: '15m' })
}

export async function createSession(
  prisma: PrismaClient,
  userId: string,
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
    },
  })
}

export async function rotateSession(
  prisma: PrismaClient,
  oldTokenHash: string,
  newRefreshToken: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<{ userId: string } | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: oldTokenHash },
  })

  if (!session || session.expiresAt < new Date()) {
    // Delete expired/invalid session if it exists
    if (session) await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

  await prisma.session.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(newRefreshToken),
      expiresAt,
      lastUsedAt: new Date(),
      userAgent: userAgent ?? session.userAgent,
      ipAddress: ipAddress ?? session.ipAddress,
    },
  })

  return { userId: session.userId }
}

export async function deleteSession(prisma: PrismaClient, tokenHash: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash } })
}

export function buildUserDto(
  user: { id: string; email: string; displayName: string | null; locale: string; consentGiven: boolean },
  onboardedModules: ModuleIdValue[],
): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale,
    consentGiven: user.consentGiven,
    onboardedModules,
  }
}
