import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'

export function SettingsPage() {
  const { t } = useTranslation('user')
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: 'light', label: t('settings.theme_light'), icon: <Sun size={16} /> },
    { value: 'dark', label: t('settings.theme_dark'), icon: <Moon size={16} /> },
    { value: 'system', label: t('settings.theme_system'), icon: <Monitor size={16} /> },
  ] as const

  return (
    <PageContainer>
      <div className="space-y-6 py-4">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

        {/* Theme */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t('settings.appearance')}
          </h2>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium ${
                  theme === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe size={14} /> {t('settings.language')}
          </h2>
          <div className="p-3 rounded-xl border border-border bg-card text-sm text-muted-foreground">
            Norsk (bokmål) — norsk er standard. Støtte for flere språk er planlagt.
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
