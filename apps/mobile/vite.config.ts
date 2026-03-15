import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "") // ../../ = monorepo-rot

  return {
    plugins: [
      devtools(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
        manifest: {
          name: "Wise Body",
          short_name: "Wise Body",
          description:
            "Helsedagbok for ME/CFS – energiregnskap og smertekartlegging",
          lang: "nb",
          theme_color: "#059669",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "icon-72.png", sizes: "72x72", type: "image/png" },
            { src: "icon-96.png", sizes: "96x96", type: "image/png" },
            { src: "icon-128.png", sizes: "128x128", type: "image/png" },
            { src: "icon-144.png", sizes: "144x144", type: "image/png" },
            { src: "icon-152.png", sizes: "152x152", type: "image/png" },
            { src: "icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icon-384.png", sizes: "384x384", type: "image/png" },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "maskable-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Cache static assets and app shell
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          // API calls should never be served from cache
          navigateFallback: "/index.html",
          runtimeCaching: [
            {
              // All API requests: network-first (fresh data preferred, fall back to cache)
              urlPattern: /^https?:\/\/.*\/api\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Google Fonts / external assets: cache-first
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // keep SW off in dev to avoid cache confusion
        },
      }),
    ],
    server: {
      port: Number(env.WEB_PORT) || 5173,
      strictPort: Boolean(env.WEB_PORT),
      proxy: {
        "/api": {
          target: `http://localhost:${env.API_PORT || 3000}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    envDir: path.resolve(__dirname, "../../"),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
