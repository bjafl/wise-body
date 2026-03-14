import { Outlet, createRootRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useEffect } from 'react'
import TopBar from '@/components/layout/TopBar'
import BottomTabBar from '@/components/layout/BottomTabBar'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  useAuth() // kick off silent token refresh on mount

  const { isReady, user } = useAuthStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    if (isReady && !user && pathname !== '/login') {
      navigate({ to: '/login', replace: true })
    }
  }, [isReady, user, pathname, navigate])

  // Spinner while the initial refresh check is in flight
  if (!isReady) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Unauthenticated — render login page without app shell
  if (!user) {
    return <Outlet />
  }

  return (
    <>
      <div className="flex w-full flex-col" style={{ height: '100dvh' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overscroll-none">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
      )}
    </>
  )
}
