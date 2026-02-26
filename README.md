# Energiregnskap

En norskspråklig webapp for energiregnskap / energy envelope management, bygget for personer med fatigue, ME/CFS, fibromyalgi, long COVID og lignende energibegrensende tilstander.

Basert på **Energy Envelope Theory** (Leonard Jason, DePaul University) og prinsipper fra ergoterapifaglig energiøkonomisering.

## Tech stack

- **React 19** + TypeScript
- **Vite** som build tool
- **Tailwind CSS v4** for styling
- **Lucide React** for ikoner
- **Recharts** for grafer (klar for trend-dashboard)
- **idb** (IndexedDB wrapper) for lokal datalagring
- **date-fns** for datohåndtering med norsk locale

## Arkitektur

```
src/
├── types/              # Domenemodell og StorageAdapter-interface
│   └── index.ts
├── lib/
│   ├── storage/        # Storage-abstraksjon (repository pattern)
│   │   ├── index.ts    # getStorage() - bytter mellom backends
│   │   └── idb-storage.ts   # IndexedDB-implementasjon
│   ├── hooks/          # React hooks for state management
│   │   └── useEnergy.ts     # Profile, templates, entries, day summary
│   ├── default-templates.ts # Forhåndsdefinerte aktiviteter
│   └── utils.ts        # Utility-funksjoner
├── components/
│   ├── energy/         # Energi-visualisering
│   │   └── EnergyGauge.tsx
│   ├── activity/       # Aktivitetsregistrering
│   │   ├── ActivityPicker.tsx
│   │   └── ActivityLog.tsx
│   ├── Onboarding.tsx  # Førstegangsoppsett
│   ├── DayView.tsx     # Hovedside (dagsvisning)
│   └── SettingsView.tsx
├── App.tsx             # Root med view-routing
├── main.tsx            # Entry point
└── index.css           # Tailwind + tema-variabler
```

### Storage-abstraksjon (repository pattern)

All datalagring går gjennom et `StorageAdapter`-interface:

```typescript
interface StorageAdapter {
  getProfile(): Promise<EnergyProfile | null>;
  saveProfile(profile: EnergyProfile): Promise<void>;
  getTemplates(): Promise<ActivityTemplate[]>;
  // ...
}
```

For å legge til Supabase/Firebase: implementer dette interfacet og bytt i `lib/storage/index.ts`.

### Native-app veien

Koden er strukturert for enkel overgang til Capacitor:

1. Ingen browser-spesifikke APIer utover IndexedDB (som Capacitor støtter)
2. Mobil-first layout med `viewport-fit=cover`
3. Touch-vennlige interaksjoner (store klikkmål)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios && npx cap add android
```

## Kom i gang

```bash
npm install
npm run dev
```

## Neste steg (roadmap)

### Kort sikt
- [ ] Trend-dashboard med ukentlig/månedlig oversikt (Recharts)
- [ ] Redigering av aktivitetstemplater
- [ ] Egendefinerte aktiviteter
- [ ] Notat-felt på registreringer

### Middels sikt
- [ ] Supabase-backend for synkronisering
- [ ] PWA (service worker, offline, install prompt)
- [ ] Eksport av data (CSV/PDF) for deling med behandler
- [ ] Crash/PEM-markering med retrospektiv analyse

### Lang sikt
- [ ] Capacitor-wrapper for iOS/Android
- [ ] Integrasjon med helsedata (Apple Health / Google Fit)
- [ ] Pulsovervåking for automatisk pacing
- [ ] Deling med behandler/ergoterapeut via sikker lenke
