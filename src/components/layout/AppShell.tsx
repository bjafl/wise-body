import { Outlet } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/hooks/useAuth'

export function AppShell() {
  useAuth() // bootstrap user profile and onboarded modules on mount

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="dark">
      <div className="flex flex-col w-full" style={{ height: '100dvh' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overscroll-none">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ThemeProvider>
  )
}
