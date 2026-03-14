# wise-body dev commands
# Usage: just <recipe>   (install just: https://just.systems)

set dotenv-load := true  # auto-loads .env

# ─── Default ──────────────────────────────────────────────────────────────────

default:
    @just --list

# ─── Dev ──────────────────────────────────────────────────────────────────────

# Start everything: postgres + all apps
dev: db-up
    pnpm dev

# Start only the API
dev-api: db-up
    pnpm --filter @wise-body/api dev

# Start only the mobile app
dev-mobile:
    pnpm --filter @wise-body/mobile dev

# Start only the admin panel
dev-admin:
    pnpm --filter @wise-body/admin dev

# ─── Build ────────────────────────────────────────────────────────────────────

build:
    pnpm build

typecheck:
    pnpm typecheck

lint:
    pnpm lint

format:
    pnpm format

# ─── Docker / Postgres ────────────────────────────────────────────────────────

# Start postgres in background
db-up:
    docker compose up -d postgres
    @just db-wait

# Stop postgres
db-down:
    docker compose down

# Stop postgres and delete the volume (wipes all data)
db-reset: db-down
    docker volume rm wise-body_postgres_data || true
    @just db-up

# Wait for postgres to be healthy before continuing
db-wait:
    @echo "Waiting for postgres..."
    @until docker compose exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB -q; do sleep 1; done
    @echo "Postgres is ready."

# Show postgres logs
db-logs:
    docker compose logs -f postgres

# Open a psql shell
db-shell:
    docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Run a raw SQL file against the DB
db-exec file:
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < {{file}}

# ─── Prisma ───────────────────────────────────────────────────────────────────

# Generate Prisma client after schema changes
generate:
    pnpm --filter @wise-body/db generate

# Create a new migration (prompts for a name)
migrate name:
    pnpm --filter @wise-body/db exec prisma migrate dev --name {{name}}

# Apply pending migrations (CI / production)
migrate-deploy:
    pnpm --filter @wise-body/db exec prisma migrate deploy

# Apply manual SQL (views + RLS) — run after migrate-deploy
migrate-manual:
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < packages/db/prisma/sql/views.sql
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < packages/db/prisma/sql/rls.sql

# Full migration run: deploy + manual SQL
migrate-all: migrate-deploy migrate-manual

# Roll back to a specific migration (dev only)
migrate-reset:
    pnpm --filter @wise-body/db exec prisma migrate reset --force

# Show migration status
migrate-status:
    pnpm --filter @wise-body/db exec prisma migrate status

# Open Prisma Studio (DB browser)
studio:
    pnpm --filter @wise-body/db exec prisma studio

# Push schema directly without a migration file (prototyping only)
db-push:
    pnpm --filter @wise-body/db exec prisma db push

# ─── Production stack ────────────────────────────────────────────────────────

# Build all Docker images (pass VITE_API_URL via env or --set)
prod-build:
    docker compose build

# Start the full production stack (postgres + api + web)
prod-up:
    docker compose up -d

# Stop the full production stack
prod-down:
    docker compose down

# Tail logs for all services, or a specific one: just prod-logs api
prod-logs service="":
    docker compose logs -f {{service}}

# ─── Setup ────────────────────────────────────────────────────────────────────

# First-time project setup
setup: install db-up generate migrate-all
    @echo "Setup complete. Run 'just dev' to start."

install:
    pnpm install
