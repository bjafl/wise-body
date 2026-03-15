import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@/lib/i18n" // initialize i18next before any component renders
import "@wise-body/ui/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000, // 30s default stale time
    },
  },
})

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
