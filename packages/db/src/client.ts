import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../../../.env") }) // Load monorepo root .env file

// Single PrismaClient instance for the process.
// In development, hot-reload would create multiple instances without this guard.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV !== "production"
  const connectionString = isDev
    ? process.env["DATABASE_URL_DEV"] || process.env["DATABASE_URL"]
    : process.env["DATABASE_URL"]
  if (!connectionString)
    throw new Error("DATABASE_URL environment variable is required")
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
