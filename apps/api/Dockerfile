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
COPY apps/admin/package.json ./apps/admin/
COPY apps/mobile/package.json ./apps/mobile/
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
# @wise-body/db and @wise-body/types are bundled inline by tsup — not needed here.
COPY --from=builder /app/node_modules ./node_modules

# Built API bundle (workspace deps inlined — self-contained ESM module)
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma CLI config + migrations (for `prisma migrate deploy` on startup)
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
# pnpm does not hoist prisma to root node_modules; copy the package-local bin
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

EXPOSE 3000

COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
