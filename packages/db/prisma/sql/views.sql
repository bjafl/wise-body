-- Run this after `prisma migrate deploy` — Prisma does not manage views automatically.
-- Re-run whenever EnergyEntry schema changes.

CREATE OR REPLACE VIEW "EnergyDailySummary" AS
SELECT
  "userId",
  "date",
  CAST(SUM("cost")  AS INTEGER) AS "totalCost",
  CAST(COUNT(*)     AS INTEGER) AS "entryCount"
FROM "EnergyEntry"
GROUP BY "userId", "date";
