# Security & Privacy — Wise Body

This document outlines the security architecture, data protection approach, and GDPR considerations for Wise Body. Many items here are future work — this serves as an outline to ensure nothing is overlooked as the app grows.

---

## Current State (Local-only)

While the app operates in local-only mode (IndexedDB, no backend), data never leaves the user's device. There is no authentication, no network transmission, and no server-side risk surface. Security focus in this phase is limited to dependency hygiene and input validation.

---

## Security Layers

### 1. Input Validation — Zod

All user input is validated with Zod schemas before being written to storage. Schemas mirror the TypeScript types and are the single source of truth for data shape at runtime.

Validation happens at the adapter boundary — data coming in from forms is parsed through a schema before `save()` is called. Invalid data throws and is never persisted.

```typescript
// Example pattern — see SNIPPETS.md for full implementation
const EnergyEntrySchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timestamp: z.string().datetime(),
  cost: z.number().int(),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})
```

### 2. Authentication — Supabase Auth (Phase 9)

Supabase Auth handles session management. Key configuration:

- Auth tokens stored in `HttpOnly` cookies — inaccessible to JavaScript, protects against XSS token theft
- Email confirmation required on signup
- Short JWT expiry with refresh token rotation enabled
- Sessions invalidated on password change

### 3. Database-level Access Control — Row Level Security (Phase 9)

RLS policies are enforced at the Postgres level, not just in application code. Every table has a policy that restricts reads and writes to the authenticated user's own rows. Even if application code has a bug, the database refuses cross-user data access.

### 4. Transport Security

HTTPS enforced everywhere. Handled automatically by Netlify (frontend) and Supabase (backend). No configuration required.

### 5. Content Security Policy (Phase 9)

CSP headers added via Netlify `_headers` file when deploying with Supabase backend. Restricts what scripts and resources the browser will load, significantly reducing XSS impact.

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### 6. Secrets Management

- Supabase anon key is safe to expose in frontend code (RLS is the enforcement layer)
- Supabase service role key must never appear in frontend code or be committed to git
- All secrets via environment variables, never hardcoded
- `.env.local` in `.gitignore`

### 7. Two-Factor Authentication (Future)

Supabase supports TOTP (authenticator apps) natively. To be added as an optional setting after core auth is stable. Moderate UI effort, backend is handled by Supabase.

### 8. Dependency Hygiene

- `npm audit` run regularly
- Known acceptable vulnerability: `serialize-javascript` via `workbox-build` / `vite-plugin-pwa` — build-time only, not present in deployed app
- Dependency updates reviewed before merging

---

## Local Cache Architecture (Phase 9+)

When online storage is introduced, IndexedDB continues to function as a local cache. This enables offline use and reduces latency for frequent reads.

### Cache Strategy

**Write-through:** writes go to both local cache and Supabase simultaneously. If the remote write fails, the local write is rolled back (or marked as pending sync).

**Read-local-first:** reads always return from IndexedDB immediately. A background sync updates the cache from Supabase on app load and after writes.

**Sync state tracking:** each cached record carries a `syncStatus` field:

```typescript
type SyncStatus = 'synced' | 'pending' | 'conflict'
```

Pending records are retried on next online event. Conflicts (same record modified locally and remotely) surface to the user for resolution — rare in a single-user app but possible across devices.

### Cache Invalidation

- On login: full sync from Supabase to local cache
- On write: update local immediately, sync remote async
- On app foreground: background sync for records modified since last sync
- On logout: optionally clear local cache (user preference — privacy vs convenience tradeoff)

### Security Considerations for Local Cache

- IndexedDB is origin-scoped — other sites cannot access it
- Data in IndexedDB is not encrypted at rest by default
- On shared devices, a logged-out user's cached data remains in IndexedDB until explicitly cleared
- Clear cache on logout option should be offered in privacy settings
- Sensitive fields (if any added in future) could be encrypted before IndexedDB storage using Web Crypto API

---

## GDPR Compliance Outline

> This section is future work, required before opening the app to real users in the EU/EEA. Norwegian users fall under GDPR.

### Legal Basis for Processing

Health-related data (energy tracking, pain tracking) is **special category data** under GDPR Article 9. Processing requires explicit consent. The onboarding flow must obtain clear, specific, informed consent before any health data is collected.

Consent must be:
- Freely given (not bundled with terms of service)
- Specific to each data type collected
- Informed (plain language explanation of what is collected and why)
- Unambiguous (active opt-in, not pre-ticked boxes)
- Withdrawable at any time

### User Rights to Implement

| Right | Implementation |
|---|---|
| Right of access | Data export — user can download all their data (JSON/CSV) |
| Right to rectification | Users can edit all their own data |
| Right to erasure | Account deletion — removes all data from Supabase, clears local cache |
| Right to portability | Structured data export in machine-readable format |
| Right to restrict processing | Pause data sync / go local-only mode |
| Right to object | Opt out of any analytics or non-essential processing |

### Technical Requirements

- **Data export** — endpoint or UI to export all user data as JSON or CSV
- **Account deletion** — hard delete all rows across all tables, not soft delete
- **Consent log** — store when and what the user consented to, with version of privacy policy
- **Privacy policy** — plain language, covers what data is collected, why, retention period, third parties (Supabase)
- **Data Processing Agreement (DPA)** — Supabase offers a DPA, must be signed before processing EU user data
- **Data retention policy** — define how long data is kept, implement automatic deletion of old data if applicable
- **Breach notification** — process for detecting and notifying users of data breaches within 72 hours (GDPR requirement)

### Third Parties

| Service | Role | GDPR notes |
|---|---|---|
| Supabase | Database, Auth | EU hosting available (Frankfurt region), DPA available |
| Netlify | Frontend hosting | DPA available, no user data processed |

**Choose EU region for Supabase** when creating the production project — keeps data within EEA, simplifies compliance.

### Consent Management (Onboarding)

The first-run onboarding must include an explicit consent step before any health data is collected:

```
Before you begin, Wise Body needs your permission to store health-related 
information on your device and, if you choose to enable sync, on secure 
servers in the EU.

This includes: [specific list per module]

You can withdraw consent and delete all your data at any time in Settings.

[ ] I agree to the Privacy Policy and consent to processing my health data
```

This consent record must be stored with timestamp and policy version.

### Data Minimisation

Collect only what is necessary for the feature. Specifically:
- No tracking, analytics, or telemetry without explicit consent
- No advertising identifiers
- Email only required if sync is enabled
- Display name optional

---

## Security Checklist by Phase

| Phase | Item | Status |
|---|---|---|
| 1–5 | Zod validation on all inputs | 📋 Planned |
| 2 | `.env.local` in `.gitignore` | 📋 Planned |
| 9 | Supabase RLS on all tables | 📋 Planned |
| 9 | `HttpOnly` cookie auth | 📋 Planned (Supabase default) |
| 9 | CSP headers via `_headers` | 📋 Planned |
| 9 | Local cache sync with `syncStatus` | 📋 Planned |
| 9 | Clear cache on logout option | 📋 Planned |
| 10+ | 2FA (TOTP) | 🔮 Future |
| 10+ | GDPR consent flow | 🔮 Future |
| 10+ | Data export | 🔮 Future |
| 10+ | Account deletion | 🔮 Future |
| 10+ | Privacy policy | 🔮 Future |
| 10+ | Supabase DPA signed | 🔮 Future |