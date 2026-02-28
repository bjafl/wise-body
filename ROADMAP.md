# Roadmap

Development is organized in phases. Earlier phases are prerequisites for later ones — resist jumping ahead.

Current target is a functional web app. PWA and Capacitor come after the core is solid.

---

## Phase 1 — Project Foundation

> Goal: correct scaffolding before writing any feature code.

- [ ] Configure Vite with `@` path alias (`vite.config.ts` + `tsconfig.json`)
- [ ] Install core dependencies: `idb`, `uuid`, `react-router-dom`, `zustand`, `zod`
- [ ] Install i18n dependencies: `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [ ] Initialize shadcn (`npx shadcn@latest init`)
- [ ] Set up `src/types/` directory with all type files as designed (including `i18n.ts`)
- [ ] Configure `globals.css` — Tailwind base, `100dvh`, `overscroll-behavior`, tap highlight
- [ ] Set `index.html` meta tags — viewport, PWA, apple-mobile-web-app, theme-color
- [ ] Add `public/manifest.json` stub (name, icons, theme color, display: standalone)

---

## Phase 2 — Core Infrastructure

> Goal: data layer, platform abstraction, and auth stub in place.

- [ ] `lib/idb.ts` — `getDB()` singleton with full `AppDB` schema and all object stores/indexes
- [ ] `lib/platform.ts` — platform detection stub (`isCapacitor`, `vibrate`, expand later)
- [ ] `lib/supabase.ts` — stubbed out, commented, ready to uncomment when needed
- [ ] `config/env.ts` — typed wrappers for all `import.meta.env` variables
- [ ] `.env.local` — `VITE_USE_SUPABASE=false`, confirm in `.gitignore`
- [ ] `services/storage/types.ts` — `StorageAdapter<T>` interface
- [ ] `schemas/` directory — Zod schemas mirroring all frontend types (see SNIPPETS.md)
- [ ] Core local adapters: `userAdapter`, `categoryAdapter`, `modulePreferencesAdapter`
- [ ] `store/authStore.ts` — Zustand store, `userId` hardcoded to `'local'` for now, `locale` from i18n
- [ ] `store/userStore.ts` — includes `onboardedModules: ModuleId[]`
- [ ] `hooks/useAuth.ts`, `hooks/useCategories.ts`, `hooks/useModulePreferences.ts`

---

## Phase 3 — Internationalisation

> Goal: i18n fully wired before building any UI strings, so nothing needs retrofitting.

- [ ] `lib/i18n.ts` — i18next init, language detector, namespace config, fallback to `en`
- [ ] `types/i18n.ts` — type-safe key declarations from English source files
- [ ] Wire `i18n.ts` import into `main.tsx` before `RouterProvider`
- [ ] Create `locales/en/` and `locales/nb/` directories
- [ ] `locales/en/common.json` — buttons, errors, dates, navigation, generic UI
- [ ] `locales/nb/common.json`
- [ ] `locales/en/user.json` — profile, settings strings
- [ ] `locales/nb/user.json`
- [ ] Language selector component in settings (`components/shared/LanguageSelector.tsx`)
- [ ] Persist language choice to `userProfile.locale` via user adapter
- [ ] Verify language detection order: stored preference → browser language → fallback `en`

---

## Phase 4 — App Shell and Routing

> Goal: navigable app skeleton with correct mobile layout.

- [ ] `router/routes.ts` — `ROUTES` constants
- [ ] `router/guards.tsx` — `ModuleGuard` that redirects to onboarding if module not yet set up
- [ ] `router/index.tsx` — `createHashRouter` with `AppShell` as root layout, onboarding routes per module
- [ ] `components/layout/AppShell.tsx` — flex column, `100dvh`, scroll inside main
- [ ] `components/layout/TopBar.tsx` — title, back button placeholder
- [ ] `components/layout/BottomNav.tsx` — safe area inset padding, active NavLink styling
- [ ] `components/layout/PageContainer.tsx` — consistent page padding wrapper
- [ ] Stub pages: `HomePage`, `SettingsPage`, `ProfilePage`, `EnergyPage`, `PainPage`
- [ ] `main.tsx` — wire up `RouterProvider`
- [ ] Verify layout on mobile viewport in browser devtools

---

## Phase 5 — Shared UI Components

> Goal: component primitives in place before building module UIs.

- [ ] Wrap shadcn primitives in `components/ui/`: `Button`, `Input`, `Modal`/`Dialog`, `Card`, `Badge`, `Select`, `Sheet`, `Tabs`
- [ ] `components/shared/CategoryBadge.tsx`
- [ ] `components/shared/DatePicker.tsx`
- [ ] `components/shared/ConfirmDialog.tsx`
- [ ] `components/shared/LanguageSelector.tsx`
- [ ] Shared onboarding primitives: `WizardShell.tsx`, `WizardStep.tsx`, `WizardProgress.tsx` (reused across all module wizards)
- [ ] Verify all components respect safe area insets and mobile touch targets (min 44px)

---

## Phase 6 — Energy Module

> Goal: first fully working module, end to end, with onboarding and localised defaults.

**Translations**
- [ ] `locales/en/energy.json` — all energy module strings
- [ ] `locales/nb/energy.json`

**Default templates**
- [ ] `modules/energy/defaults/types.ts` — `EnergyDefaults` interface
- [ ] `modules/energy/defaults/en.ts` — English default categories and templates
- [ ] `modules/energy/defaults/nb.ts` — Norwegian default categories and templates
- [ ] `modules/energy/defaults/index.ts` — `getEnergyDefaults(locale)` loader

**Onboarding wizard**
- [ ] `modules/energy/onboarding/useEnergyOnboarding.ts` — wizard state, preference saving, template seeding
- [ ] `modules/energy/onboarding/steps/WelcomeStep.tsx`
- [ ] `modules/energy/onboarding/steps/BudgetSetupStep.tsx`
- [ ] `modules/energy/onboarding/steps/ScheduleStep.tsx`
- [ ] `modules/energy/onboarding/steps/DefaultTemplatesStep.tsx` — preview seeded templates before confirming
- [ ] `modules/energy/onboarding/EnergyOnboardingWizard.tsx`
- [ ] Wire onboarding route and `ModuleGuard` for energy

**Storage adapters**
- [ ] `services/modules/energy/local/energyTemplateAdapter.ts`
- [ ] `services/modules/energy/local/energyEntryAdapter.ts`
- [ ] `services/modules/energy/local/energyDailySummaryAdapter.ts`

**Hooks**
- [ ] `modules/energy/hooks/useEnergyTemplates.ts`
- [ ] `modules/energy/hooks/useEnergyEntries.ts`
- [ ] `modules/energy/hooks/useEnergyDailySummary.ts`
- [ ] `modules/energy/hooks/useEnergyPreferences.ts`

**Components and utils**
- [ ] `modules/energy/utils/energyCalculations.ts`
- [ ] `modules/energy/components/EnergyDashboard.tsx`
- [ ] `modules/energy/components/EnergyBudgetBar.tsx`
- [ ] `modules/energy/components/EnergyEntryForm.tsx`
- [ ] `modules/energy/components/EnergyEntryList.tsx`
- [ ] `modules/energy/components/EnergyTemplateEditor.tsx`
- [ ] `modules/energy/index.ts`
- [ ] Wire into `EnergyPage.tsx`

---

## Phase 7 — PWA

> Goal: installable, offline-capable web app.

- [ ] Configure `vite-plugin-pwa` fully (workbox strategy, cache rules)
- [ ] `public/manifest.json` — finalize icons, name, colors, display mode
- [ ] Generate all icon sizes from master 1024×1024 source (`pwa-asset-generator`)
- [ ] Add apple touch icon and splash screen meta tags to `index.html`
- [ ] Test offline behavior — app loads, local data accessible
- [ ] Test "Add to Home Screen" on iOS Safari and Android Chrome
- [ ] Verify storage persistence (request persistent storage API)

---

## Phase 8 — Pain Module

> Follow the same pattern established in Phase 6.

- [ ] `locales/en/pain.json`, `locales/nb/pain.json`
- [ ] `modules/pain/defaults/` — locale-specific seed files
- [ ] `modules/pain/onboarding/` — wizard (scale choice, body side default, reminder time)
- [ ] Local adapters: `painTemplateAdapter`, `painEntryAdapter`
- [ ] Hooks: `usePainTemplates`, `usePainEntries`, `usePainPreferences`
- [ ] Components: `PainDashboard`, `PainEntryForm`, `PainTemplateEditor`
- [ ] Wire into `PainPage.tsx`, add to `BottomNav` and router

---

## Phase 9 — Supabase Backend + Local Cache

> Goal: multi-device sync, persistent auth, data safety, offline-capable cache.

**Backend setup**
- [ ] Create Supabase project — select EU (Frankfurt) region
- [ ] Write SQL schema migrations (tables, indexes, RLS policies)
- [ ] Sign Supabase Data Processing Agreement (GDPR requirement)
- [ ] Uncomment and configure `lib/supabase.ts`
- [ ] Implement Supabase adapters for all existing tables
- [ ] `services/storage/index.ts` — switch on `VITE_USE_SUPABASE`
- [ ] Wire Supabase Auth into `authStore` — replace hardcoded `'local'` userId
- [ ] `hooks/useAuth.ts` — login, logout, session handling
- [ ] Persist `locale` from `userProfile` on login, sync with i18next
- [ ] Test RLS: verify users cannot access each other's data

**Local cache layer**
- [ ] Add `syncStatus: 'synced' | 'pending' | 'conflict'` field to all `*Record` DB types
- [ ] Add `syncedAt?: string` to `DBMetadata`
- [ ] `services/sync/syncService.ts` — full sync on login, background sync on app foreground
- [ ] Write-through strategy: local write first, remote async, rollback on failure
- [ ] Pending queue: retry failed remote writes on next online event (`window.addEventListener('online', ...)`)
- [ ] Conflict resolution: surface conflicts to user via `store/syncStore.ts`
- [ ] Settings option: clear local cache on logout (privacy vs convenience)
- [ ] `hooks/useSyncStatus.ts` — exposes pending count and last sync time to UI

**Security hardening**
- [ ] CSP headers via `public/_headers` (Netlify)
- [ ] Verify `HttpOnly` cookie auth is active in Supabase Auth config
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Enable refresh token rotation in Supabase Auth settings
- [ ] One-time local → Supabase data migration utility for existing users

---

## Phase 10 — Capacitor (Native)

> Goal: App Store ready iOS build. Android follows same steps.

- [ ] `npm install @capacitor/core @capacitor/cli @capacitor/ios`
- [ ] `npx cap init` — configure app ID and name
- [ ] `capacitor.config.ts` — server URL, splash screen, keyboard settings
- [ ] `npx cap add ios`
- [ ] First build: `npm run build && npx cap sync && npx cap open ios`
- [ ] Test on device — layout, safe areas, touch targets
- [ ] Expand `lib/platform.ts` — wire up Capacitor plugins (haptics, share, etc.)
- [ ] Add native splash screen and app icon assets
- [ ] Configure status bar and keyboard behavior
- [ ] Add Android: `npx cap add android`, repeat above steps

---

## Deferred / Future

- Mood module (same pattern as energy and pain)
- Additional language support
- Data export (CSV / JSON) — GDPR right of portability
- Account deletion — GDPR right to erasure
- GDPR consent flow and privacy policy
- 2FA / TOTP via Supabase Auth
- Charts and history views per module
- Push notifications / reminders
- Widgets (requires Swift for iOS WidgetKit)
- Multi-profile / household support