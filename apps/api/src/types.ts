import '@fastify/jwt'

export interface JwtPayload {
  sub: string  // userId
  email: string
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}
