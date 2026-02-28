import '@/lib/i18n'           // initialise i18next before any component renders
import '@/styles/globals.css'  // global styles (Tailwind + CSS variables)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
