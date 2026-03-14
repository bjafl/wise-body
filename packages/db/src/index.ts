// Prisma client singleton
export { prisma } from "./client.js";

// Row-ownership helpers
export { userScoped, withUserId } from "./userScoped.js";
export type { UserScopedWhere } from "./userScoped.js";

// Re-export all Prisma-generated types so consumers only need @wise-body/db
export type {
  // Enums
  SyncStatus,
  ModuleId,
  BudgetUnit,
  PainScale,
  BodySide,

  // Models — full DB rows (include all fields, incl. passwordHash / syncStatus)
  User,
  Session,
  UserOnboardedModule,
  Category,
  EnergyPreferences,
  EnergyActivityTemplate,
  EnergyEntry,
  PainPreferences,
  PainLocationTemplate,
  PainEntry,

  // View
  EnergyDailySummary,

  // Prisma input types — useful for building typed service functions
  Prisma,
} from "../generated/prisma/client.js";
