import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "") // ../../ = monorepo-rot

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: Number(env.ADMIN_PORT) || 5173,
      strictPort: Boolean(env.ADMIN_PORT),
      proxy: {
        "/api": {
          target: `http://localhost:${env.API_PORT || 3000}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
