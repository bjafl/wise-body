import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@wise-body/ui/components/scroll-area"
import { useEnergyCategories, useEnergyTemplates } from "@/services/api/energy"
import ActivityButton from "./ActivityButton"

interface ActivityPickerProps {
  onClick: (templateId: string) => void
}

const ActivityPicker: FC<ActivityPickerProps> = ({ onClick }) => {
  const { t } = useTranslation("energy")
  const { data: categories } = useEnergyCategories()
  const { data: templates } = useEnergyTemplates()

  if (!categories?.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {t("dashboard.register")}
      </h2>
      <ScrollArea className="max-h-64">
        <div className="space-y-4 pr-2">
          {categories.map((cat) => {
            const catTemplates = (templates ?? []).filter(
              (tmpl) => tmpl.categoryId === cat.id && !tmpl.isArchived
            )
            if (catTemplates.length === 0) return null
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#6b7280" }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {cat.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {catTemplates.map((tmpl) => (
                    <ActivityButton
                      key={tmpl.id}
                      templateId={tmpl.id}
                      onClick={onClick}
                    />
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
