# PWA → Native App: Arkitektur og bibliotekvalg

## Overordnet strategi

Bygg med **"app-first"** tankegang fra dag én – selv om du starter som webapp.
Det betyr tab-basert navigasjon, ikke sidebar/header-nav som på desktop.

---

## Routing: TanStack Router ✅

Bedre enn React Router for PWA/app-use-case:

- **File-based routing** → automatisk code splitting → raskere initial load (kritisk for PWA)
- **Type-safe routes** end-to-end
- **Nested layouts** er førsteklasses – passer perfekt for tab-shell + child-routes
- **Scroll restoration** og **search params** innebygd og robust
- Fungerer identisk i Capacitor/React Native Web

---

## Mappestruktur

```
apps/
  mobile/                  ← React + Vite + TS frontend
    src/
      app/                 ← App-shell, providers, global setup
        App.tsx
        router.tsx
        providers.tsx
      routes/              ← TanStack file-based routes
        __root.tsx         ← Root layout (tab-bar, shell)
        index.tsx
        dashboard/
          index.tsx
        profile/
          index.tsx
      features/            ← Feature-sliced design
        participants/
          components/
          hooks/
          api/             ← tRPC hooks
        documents/
      components/          ← Delte UI-komponenter (shadcn + egne)
        ui/                ← shadcn output-dir
      hooks/               ← Globale hooks
      lib/                 ← Utils, constants, config
      stores/              ← Zustand / Jotai state
      pwa/                 ← Service worker logic, offline-handlers
    public/
      icons/               ← App icons (alle størrelser)
      screenshots/         ← For install-prompt
    index.html
    vite.config.ts
    manifest.json          ← Generert av vite-plugin-pwa

  api/                     ← Fastify backend

packages/
  db/                      ← Prisma schema + client
  types/                   ← Delte typer
  ui/                      ← Evt. delt komponentbibliotek
```

---

## PWA-kritiske valg

### vite-plugin-pwa

```ts
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [...]
  },
  manifest: {
    display: 'standalone',      // ← viktig for app-følelse
    orientation: 'portrait',
    theme_color: '#...',
    background_color: '#...',
  }
})
```

### Offline-strategi

| Strategi | Bruksområde |
|---|---|
| Network-first + fallback | API-kall |
| Cache-first | Statiske assets |
| Stale-while-revalidate | TanStack Query via tRPC |

### Viewport og safe areas

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1,
  viewport-fit=cover, user-scalable=no">
```

```css
/* iOS safe areas */
padding-bottom: env(safe-area-inset-bottom);
```

---

## Veien til native app

| | **Capacitor** | **React Native (Expo)** |
|---|---|---|
| Kodebase | Beholder React + Vite | Separat RN-kodebase |
| Widgets/notif | Plugin-basert | Expo Notifications (robust) |
| Effort for port | Lav – wrapper rundt webview | Medium–høy rewrite |
| Native feel | OK–god | Utmerket |
| Anbefalt hvis | PWA-first, rask port | Notifikasjoner + widgets er kritisk |

> **NB:** Ekte widgets (iOS WidgetKit, Android App Widgets) krever native kode uansett.
> Capacitor-plugins finnes men er begrenset. Hvis widgets blir sentralt → vurder Expo tidlig.

---

## Anbefalte biblioteker

| Kategori | Valg |
|---|---|
| Routing | TanStack Router |
| Server state / cache | TanStack Query (via tRPC) |
| Client state | Zustand |
| PWA | vite-plugin-pwa |
| Forms | react-hook-form + zod |
| Animasjon | Framer Motion eller CSS transitions |
| Virtuelle lister | TanStack Virtual |
| Datoer | date-fns |
| Native port (fase 2) | Capacitor |

---

## Viktigste enkeltgrep

Bruk `display: standalone` i manifest og bygg tab-shell-layouten fra start –
da ser og oppfører appen seg som en native app allerede i PWA-fasen.