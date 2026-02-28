import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Wise Body',
  '/energy': 'Energi',
  '/energy/onboarding': 'Energi',
  '/pain': 'Smerte',
  '/settings': 'Innstillinger',
  '/profile': 'Profil',
}

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRoot = location.pathname === '/'
  const title = PAGE_TITLES[location.pathname] ?? 'Wise Body'

  return (
    <header
      className="flex items-center gap-2 px-4 py-3 border-b bg-background/80 backdrop-blur-sm"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      {!isRoot && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Tilbake"
          className="-ml-2"
        >
          <ArrowLeft size={20} />
        </Button>
      )}
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>
    </header>
  )
}
