FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.6 --activate

# ── Install dependencies ───────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ── Build ──────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .

# API base URL — baked into the JS bundle at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter @wise-body/admin build

# ── Runtime (nginx) ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
