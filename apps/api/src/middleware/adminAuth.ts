import type { FastifyRequest, FastifyReply } from 'fastify'

export async function adminAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    if ((request.user as { role?: string }).role !== 'admin') {
      return reply.forbidden('Admin access required')
    }
  } catch {
    return reply.unauthorized('Invalid or expired admin token')
  }
}
