import { NavLink } from 'react-router-dom'
import { Home, Battery, Activity, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/router/routes'

const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'Hjem', icon: Home },
  { to: ROUTES.ENERGY, label: 'Energi', icon: Battery },
  { to: ROUTES.PAIN, label: 'Smerte', icon: Activity },
  { to: ROUTES.SETTINGS, label: 'Innstillinger', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav
      className="flex border-t bg-background"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === ROUTES.HOME}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
