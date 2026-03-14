#!/bin/sh
set -e

echo "Running database migrations..."
# prisma.config.ts in packages/db points to the schema and reads DATABASE_URL
cd /app/packages/db
/app/packages/db/node_modules/.bin/prisma migrate deploy

echo "Migrations complete. Starting API..."
cd /app
exec node apps/api/dist/index.mjs
