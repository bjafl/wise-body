-- Row Level Security — defense-in-depth layer.
-- Primary enforcement is in application code (every Prisma query includes userId).
-- These policies are a backstop: even if application code has a bug, the DB refuses
-- cross-user reads and writes.
--
-- Setup:
--   1. Create a dedicated app role (not superuser) for the Fastify API connection.
--   2. Before each query, set the session variable: SET LOCAL app.current_user_id = '<uuid>';
--      This is done inside a transaction by the Fastify auth middleware.
--   3. RLS policies below use that variable.

-- Create a non-superuser role for the API (run once as superuser):
-- CREATE ROLE api_user WITH LOGIN PASSWORD '...' NOINHERIT;
-- GRANT CONNECT ON DATABASE appdb TO api_user;
-- GRANT USAGE ON SCHEMA public TO api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_user;

-- Helper: current authenticated user UUID from session variable
-- Used in all policies below.

-- Enable RLS on every user-scoped table:
ALTER TABLE "User"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserOnboardedModule"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EnergyPreferences"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EnergyActivityTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EnergyEntry"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PainPreferences"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PainLocationTemplate"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PainEntry"              ENABLE ROW LEVEL SECURITY;

-- User: can only read/write own row
CREATE POLICY user_isolation ON "User"
  USING (id = current_setting('app.current_user_id')::uuid);

-- Session: scoped by userId
CREATE POLICY session_isolation ON "Session"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- UserOnboardedModule
CREATE POLICY onboarded_module_isolation ON "UserOnboardedModule"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- Category
CREATE POLICY category_isolation ON "Category"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- EnergyPreferences
CREATE POLICY energy_prefs_isolation ON "EnergyPreferences"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- EnergyActivityTemplate
CREATE POLICY energy_template_isolation ON "EnergyActivityTemplate"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- EnergyEntry
CREATE POLICY energy_entry_isolation ON "EnergyEntry"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- PainPreferences
CREATE POLICY pain_prefs_isolation ON "PainPreferences"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- PainLocationTemplate
CREATE POLICY pain_template_isolation ON "PainLocationTemplate"
  USING ("userId" = current_setting('app.current_user_id')::uuid);

-- PainEntry
CREATE POLICY pain_entry_isolation ON "PainEntry"
  USING ("userId" = current_setting('app.current_user_id')::uuid);
