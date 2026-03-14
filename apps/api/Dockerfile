FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.6 --activate

# ── Install dependencies ───────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ── Build ──────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
# Generate Prisma TypeScript client (platform-matched to the container OS)
RUN pnpm --filter @wise-body/db generate
# Bundle the API (tsup inlines workspace packages, externalises node_modules)
RUN pnpm --filter @wise-body/api build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Workspace node_modules (fastify, @prisma/client, pg, etc.)
COPY --from=builder /app/node_modules ./node_modules

# Built API bundle
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma workspace package source (needed so workspace symlinks resolve)
COPY --from=builder /app/packages/db/src ./packages/db/src
COPY --from=builder /app/packages/db/generated ./packages/db/generated

# Prisma CLI config + migrations (for `prisma migrate deploy` on startup)
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json

EXPOSE 3000

COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
