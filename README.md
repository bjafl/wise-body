# Wise Body

A modular health and habit tracking application. Currently in early development as a web app, with a roadmap toward PWA and native mobile (iOS/Android via Capacitor).

## Overview

Energi is built around the concept of modular health tracking — each "module" covers a specific tracking domain (energy enveloping, pain, mood, etc.). Users manage their own templates and categories within each module, and log daily entries against those templates.

The first module implements **energy envelope tracking**: a daily energy budget system where users log activities that cost or restore energy, helping manage chronic fatigue and pacing.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router (hash-based) |
| State | Zustand |
| Local storage | IndexedDB via `idb` |
| i18n | i18next + react-i18next |
| Validation | Zod |
| Future backend | Supabase (Postgres + Auth) |
| Future native | Capacitor (iOS + Android) |

## Project Structure

```
src/
├── assets/
├── config/          # Env vars, constants, module registry
├── types/           # All TypeScript types (frontend + DB + i18n)
├── schemas/         # Zod validation schemas (mirrors types/)
├── lib/             # Third-party wrappers (idb, supabase, platform, i18n)
├── locales/         # Translation files per language and namespace
├── services/        # Storage adapters (local + supabase)
│   ├── storage/     # Adapter interfaces and switching logic
│   ├── modules/     # Per-module adapters (local + supabase)
│   └── sync/        # Cache sync service (added with Supabase)
├── hooks/           # Shared hooks (auth, user, categories, sync status)
├── store/           # Zustand stores (auth, user, sync)
├── modules/         # Feature modules (energy, pain, ...)
│   └── [module]/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── defaults/    # Locale-specific default templates and categories
│       ├── onboarding/  # Onboarding wizard for first-time module setup
│       └── index.ts
├── components/      # Shared UI (primitives, layout, domain)
├── pages/           # Route-level components
├── router/          # Route definitions and guards
├── utils/           # Pure utility functions
└── styles/          # Global CSS
```

See [ROADMAP.md](./ROADMAP.md) for development phases and task breakdown.

## Modules

| Module | Status | Description |
|---|---|---|
| Energy | 🚧 In development | Daily energy budget and activity logging |
| Pain | 📋 Planned | Body pain location and intensity tracking |
| Mood | 📋 Planned | Mood and wellbeing tracking |

## Internationalisation

The app uses `i18next` with `react-i18next`. Translations are split by module namespace so each module owns its strings. Supported languages are defined in `lib/i18n.ts`.

Translation keys are type-safe — `types/i18n.ts` declares the resource shape from the English source files, giving IDE autocomplete and compile-time errors for missing keys.

**Supported languages**

| Code | Language |
|---|---|
| `en` | English |
| `nb` | Norwegian Bokmål |

### Default templates and onboarding

Default templates and categories are **data, not translation strings**. Each module has a `defaults/` directory with locale-specific seed files (`en.ts`, `nb.ts`, etc.). When a user first opens a module, the onboarding wizard runs, detects their locale, and seeds their personal template store with localized defaults. After seeding, the templates belong to the user and can be edited freely.

Each module includes an onboarding wizard (`onboarding/`) that collects user-specific preferences (e.g. daily energy budget, pain scale) before seeding defaults. The router guards redirect to the wizard on first visit to a module.

## Data Architecture

The app uses a **storage adapter pattern** — all data access goes through typed adapters with a consistent interface. The active adapter (local IndexedDB or Supabase) is selected via environment variable, with no changes required in hooks or components.

Frontend types are kept separate from DB/backend types. DB metadata (`userId`, `createdAt`, `updatedAt`) is attached and stripped at the adapter layer, keeping components clean.

Templates and categories carry `isDefault` and `sourceLocale` flags to indicate they were seeded by onboarding, which supports future reset and re-seeding functionality.

## Getting Started

```bash
npm install
npm run dev
```

### Environment variables

```bash
# .env.local
VITE_USE_SUPABASE=false
```

## Security & Privacy

All user input is validated with Zod schemas at the adapter boundary before being written to storage. When online sync is added, Supabase Row Level Security enforces data isolation at the database level. Auth tokens are stored in `HttpOnly` cookies. CSP headers are added at the Netlify deployment layer.

See [SECURITY.md](./SECURITY.md) for the full security architecture, local cache strategy, and GDPR compliance outline.

## Local Cache Strategy

When Supabase is enabled, IndexedDB continues to function as a local cache for offline support and low-latency reads. A `syncStatus` field on cached records tracks sync state (`synced | pending | conflict`). Writes go local-first with async remote sync. Full cache sync runs on login and app foreground.

## Platform Targets

- **Web app** — current target
- **PWA** — next step (offline support, home screen install)
- **iOS / Android** — via Capacitor (planned)

All platform-specific APIs are abstracted behind `lib/platform.ts` to keep this transition low-friction.

## License

MIT — see [LICENSE](LICENSE).
