-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING', 'CONFLICT');

-- CreateEnum
CREATE TYPE "ModuleId" AS ENUM ('ENERGY', 'PAIN', 'MOOD');

-- CreateEnum
CREATE TYPE "BudgetUnit" AS ENUM ('POINTS', 'PERCENT');

-- CreateEnum
CREATE TYPE "PainScale" AS ENUM ('ONE', 'TEN');

-- CreateEnum
CREATE TYPE "BodySide" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'nb',
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnboardedModule" (
    "userId" UUID NOT NULL,
    "moduleId" "ModuleId" NOT NULL,
    "onboardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnboardedModule_pkey" PRIMARY KEY ("userId","moduleId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "moduleId" "ModuleId" NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sourceLocale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyPreferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dailyBudget" INTEGER NOT NULL DEFAULT 100,
    "budgetUnit" "BudgetUnit" NOT NULL DEFAULT 'POINTS',
    "resetTime" TEXT NOT NULL DEFAULT '00:00',
    "showWarningAt" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "EnergyPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyActivityTemplate" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "defaultCost" INTEGER NOT NULL,
    "defaultDuration" INTEGER,
    "icon" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sourceLocale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "EnergyActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cost" INTEGER NOT NULL,
    "duration" INTEGER,
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "EnergyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainPreferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scale" "PainScale" NOT NULL DEFAULT 'TEN',
    "defaultBodySide" "BodySide",
    "reminderTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "PainPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainLocationTemplate" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bodyRegion" VARCHAR(32) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sourceLocale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "PainLocationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "locationTemplateId" UUID NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "intensity" INTEGER NOT NULL,
    "quality" TEXT[],
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "PainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Category_userId_moduleId_idx" ON "Category"("userId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyPreferences_userId_key" ON "EnergyPreferences"("userId");

-- CreateIndex
CREATE INDEX "EnergyActivityTemplate_userId_idx" ON "EnergyActivityTemplate"("userId");

-- CreateIndex
CREATE INDEX "EnergyActivityTemplate_categoryId_idx" ON "EnergyActivityTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "EnergyEntry_userId_date_idx" ON "EnergyEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "EnergyEntry_userId_timestamp_idx" ON "EnergyEntry"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PainPreferences_userId_key" ON "PainPreferences"("userId");

-- CreateIndex
CREATE INDEX "PainLocationTemplate_userId_idx" ON "PainLocationTemplate"("userId");

-- CreateIndex
CREATE INDEX "PainLocationTemplate_categoryId_idx" ON "PainLocationTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "PainEntry_userId_date_idx" ON "PainEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "PainEntry_userId_timestamp_idx" ON "PainEntry"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardedModule" ADD CONSTRAINT "UserOnboardedModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyPreferences" ADD CONSTRAINT "EnergyPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyActivityTemplate" ADD CONSTRAINT "EnergyActivityTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyActivityTemplate" ADD CONSTRAINT "EnergyActivityTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyEntry" ADD CONSTRAINT "EnergyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyEntry" ADD CONSTRAINT "EnergyEntry_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EnergyActivityTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPreferences" ADD CONSTRAINT "PainPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainLocationTemplate" ADD CONSTRAINT "PainLocationTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainLocationTemplate" ADD CONSTRAINT "PainLocationTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainEntry" ADD CONSTRAINT "PainEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainEntry" ADD CONSTRAINT "PainEntry_locationTemplateId_fkey" FOREIGN KEY ("locationTemplateId") REFERENCES "PainLocationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
