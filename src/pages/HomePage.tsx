import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Battery, Activity } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/router/routes'

export function HomePage() {
  const { t } = useTranslation('common')
  const onboardedModules = useAuthStore((s) => s.onboardedModules)

  return (
    <PageContainer>
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">{t('app_name')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('home_subtitle', 'Your health companion')}</p>
        </div>

        <div className="grid gap-3">
          <Link
            to={onboardedModules.includes('energy') ? ROUTES.ENERGY : ROUTES.ENERGY_ONBOARDING}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Battery size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Energiregnskap</p>
              <p className="text-xs text-muted-foreground">
                {onboardedModules.includes('energy')
                  ? 'Se dagens energibudsjett'
                  : 'Start kartlegging'}
              </p>
            </div>
          </Link>

          <Link
            to={onboardedModules.includes('pain') ? ROUTES.PAIN : ROUTES.PAIN_ONBOARDING}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Activity size={24} className="text-destructive" />
            </div>
            <div>
              <p className="font-semibold">Smertekartlegging</p>
              <p className="text-xs text-muted-foreground">
                {onboardedModules.includes('pain')
                  ? 'Logg smerte'
                  : 'Kommer snart'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
