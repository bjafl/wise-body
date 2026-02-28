import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'

export function ProfilePage() {
  const { t } = useTranslation('user')

  return (
    <PageContainer>
      <div className="space-y-6 py-4">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User size={36} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm text-center">
            Profilredigering kommer i en fremtidig versjon.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
