import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Battery, Activity, Home } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import type { NavItemMeta } from '@/types/routing'

export const Route = createFileRoute('/')({
  staticData: {
    nav: { label: 'Hjem', icon: Home, order: 0 } satisfies NavItemMeta,
  },
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const onboardedModules = user?.onboardedModules ?? []

  return (
    <PageContainer>
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">{t('app_name')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('home_subtitle')}</p>
        </div>

        <div className="grid gap-3">
          <Link
            to={onboardedModules.includes('ENERGY') ? '/energy' : '/energy/onboarding'}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Battery size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Energiregnskap</p>
              <p className="text-xs text-muted-foreground">
                {onboardedModules.includes('ENERGY') ? 'Se dagens energibudsjett' : 'Start kartlegging'}
              </p>
            </div>
          </Link>

          <Link
            to="/pain"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 active:scale-[0.98] opacity-60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <Activity size={24} className="text-destructive" />
            </div>
            <div>
              <p className="font-semibold">Smertekartlegging</p>
              <p className="text-xs text-muted-foreground">Kommer snart</p>
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
