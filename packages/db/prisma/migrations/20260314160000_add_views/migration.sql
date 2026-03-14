-- EnergyDailySummary view
-- Aggregates energy entries per user per day. Used by the energy API for the
-- daily summary endpoint. Prisma exposes this as a read-only view model.
-- CREATE OR REPLACE is idempotent so re-running is safe.

CREATE OR REPLACE VIEW "EnergyDailySummary" AS
SELECT
  "userId",
  "date",
  CAST(SUM("cost")  AS INTEGER) AS "totalCost",
  CAST(COUNT(*)     AS INTEGER) AS "entryCount"
FROM "EnergyEntry"
GROUP BY "userId", "date";
