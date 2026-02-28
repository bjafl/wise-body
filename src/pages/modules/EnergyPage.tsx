import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer'
import { useCategories } from '@/hooks/useCategories'
import { useModulePreferences } from '@/hooks/useModulePreferences'
import { energyTemplateAdapter, energyEntryAdapter } from '@/services/storage'
import {
  computeDailySummary,
  remainingEnergy,
  energyPercentage,
  energyColor,
} from '@/modules/energy/utils/energyCalculations'
import type { EnergyActivityTemplate, EnergyEntry, EnergyModulePreferences } from '@/types'
import { todayISO } from '@/utils/dateUtils'

export function EnergyPage() {
  const { t } = useTranslation('energy')
  const { preferences: prefs } = useModulePreferences<EnergyModulePreferences>('energy')
  const { categories } = useCategories('energy')

  const [templates, setTemplates] = useState<EnergyActivityTemplate[]>([])
  const [entries, setEntries] = useState<EnergyEntry[]>([])
  const today = todayISO()

  useEffect(() => {
    energyTemplateAdapter.getAll().then(setTemplates)
  }, [])

  useEffect(() => {
    energyEntryAdapter.getByDate(today).then(setEntries)
  }, [today])

  const budget = prefs?.dailyBudget ?? 20
  const summary = computeDailySummary('local', today, entries, {
    dailyBudget: budget,
    budgetUnit: 'points',
    resetTime: '00:00',
    showWarningAt: 20,
  })
  const remaining = remainingEnergy(summary)
  const pct = energyPercentage(remaining, budget)
  const gaugeColor = energyColor(pct)

  const logEntry = async (template: EnergyActivityTemplate) => {
    await energyEntryAdapter.save({
      templateId: template.id,
      date: today,
      timestamp: new Date().toISOString(),
      cost: template.defaultCost,
      duration: template.defaultDuration,
    })
    const updated = await energyEntryAdapter.getByDate(today)
    setEntries(updated)
  }

  return (
    <PageContainer>
      <div className="space-y-5 py-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
        </div>

        {/* Energy gauge */}
        <div className="p-5 rounded-2xl border border-border bg-card text-center space-y-2">
          <div
            className="text-5xl font-bold tabular-nums transition-colors"
            style={{ color: gaugeColor }}
          >
            {remaining}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.remaining')} · {budget} {t('dashboard.of')} {budget}
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: gaugeColor }}
            />
          </div>
        </div>

        {/* Activity picker */}
        {categories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t('dashboard.register')}
            </h2>
            {categories.map((cat) => {
              const catTemplates = templates.filter((t) => t.categoryId === cat.id)
              if (catTemplates.length === 0) return null
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color ?? '#6b7280' }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catTemplates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => logEntry(tmpl)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent transition-all text-sm"
                      >
                        <span>{tmpl.name}</span>
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            tmpl.defaultCost > 0 ? 'text-energy-full' : 'text-muted-foreground'
                          }`}
                        >
                          {tmpl.defaultCost > 0 ? '+' : ''}{tmpl.defaultCost}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Today's log */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t('dashboard.log_header')}
          </h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t('dashboard.no_entries')}
            </p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => {
                const tmpl = templates.find((t) => t.id === entry.templateId)
                const isGain = entry.cost > 0
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm"
                  >
                    <span className="flex-1 text-foreground">
                      {tmpl?.name ?? 'Aktivitet'}
                    </span>
                    <span
                      className={`font-medium tabular-nums ${
                        isGain ? 'text-energy-full' : 'text-energy-low'
                      }`}
                    >
                      {isGain ? '+' : ''}{entry.cost}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
