import dotenv from "dotenv"
import { get } from "http"
import path from "path"
import { defineConfig } from "prisma/config"

// Load from monorepo root .env (two levels up from packages/db)
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

function getDatabaseUrl(): string {
  const isDev = process.env.NODE_ENV !== "production"
  const dbUrl = isDev
    ? process.env["DATABASE_URL_DEV"] || process.env["DATABASE_URL"]
    : process.env["DATABASE_URL"]
  if (!dbUrl) throw new Error("DATABASE_URL environment variable is required")
  return dbUrl
}
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
})
