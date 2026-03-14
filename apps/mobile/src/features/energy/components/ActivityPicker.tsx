import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@wise-body/ui/components/scroll-area'
import { useEnergyCategories, useEnergyTemplates } from '@/services/api/energy'
import type { EnergyActivityTemplateDto } from '@wise-body/types'

interface ActivityPickerProps {
  onClick: (template: EnergyActivityTemplateDto) => void
}

const ActivityPicker: FC<ActivityPickerProps> = ({ onClick }) => {
  const { t } = useTranslation('energy')
  const { data: categories } = useEnergyCategories()
  const { data: templates } = useEnergyTemplates()

  if (!categories?.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t('dashboard.register')}
      </h2>
      <ScrollArea className="max-h-64">
        <div className="space-y-4 pr-2">
          {categories.map((cat) => {
            const catTemplates = (templates ?? []).filter(
              (tmpl) => tmpl.categoryId === cat.id && !tmpl.isArchived,
            )
            if (catTemplates.length === 0) return null
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color ?? '#6b7280' }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">{cat.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {catTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => onClick(tmpl)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent transition-all text-sm active:scale-95"
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
      </ScrollArea>
    </div>
  )
}

export default ActivityPicker
