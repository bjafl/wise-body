import { PrismaClient } from "../generated/prisma/client.js";

// Single PrismaClient instance for the process.
// In development, hot-reload would create multiple instances without this guard.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 types require `adapter` or `accelerateUrl` in the constructor,
// but the traditional query engine reads the URL from prisma.config.ts at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient = globalForPrisma.prisma ?? new (PrismaClient as any)();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
