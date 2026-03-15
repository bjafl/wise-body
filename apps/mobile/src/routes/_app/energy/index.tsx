import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Battery } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card } from "@wise-body/ui/components/card"
import { useAuthStore } from "@/store/authStore"
import { todayISO } from "@/lib/dateUtils"
import {
  useEnergySummary,
  useEnergyEntries,
  useEnergyTemplates,
  useLogEnergyEntry,
} from "@/services/api/energy"
import GaugeBattery from "@/features/energy/components/GaugeBattery"
import ActivityPicker from "@/features/energy/components/ActivityPicker"
import type { NavItemMeta } from "@/types/routing"
import type { EnergyActivityTemplateDto } from "@wise-body/types"

export const Route = createFileRoute("/_app/energy/")({
  staticData: {
    nav: { label: "Energi", icon: Battery, order: 1 } satisfies NavItemMeta,
  },
  component: EnergyPage,
})

function EnergyPage() {
  const { t } = useTranslation("energy")
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const today = todayISO()

  const { data: summary } = useEnergySummary(today)
  const { data: entries } = useEnergyEntries(today)
  const { data: templates } = useEnergyTemplates()
  const { mutate: logEntry } = useLogEnergyEntry()

  // Guard: redirect to onboarding if energy module not set up yet
  if (user && !user.onboardedModules.includes("ENERGY")) {
    navigate({ to: "/energy/onboarding" })
    return null
  }

  const budget = summary?.dailyBudget ?? 20
  // totalCost is the sum of all entry costs (negative = expenditure, positive = gain)
  const remaining = budget + (summary?.totalCost ?? 0)

  const handleLogEntry = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId)
    if (!template) return

    logEntry({
      templateId: template.id,
      date: today,
      timestamp: new Date().toISOString(),
      cost: template.defaultCost,
      duration: template.defaultDuration ?? undefined,
    })
  }

  return (
    <PageContainer>
      <div className="flex flex-col space-y-5 py-4">
        <h1 className="text-xl font-bold">{t("dashboard.title")}</h1>

        <Card className="rounded-2xl p-5 text-center">
          <GaugeBattery capacity={budget} current={remaining} />
        </Card>

        <ActivityPicker onClick={handleLogEntry} />

        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            {t("dashboard.log_header")}
          </h2>
          {!entries || entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("dashboard.no_entries")}
            </p>
          ) : (
            <div className="space-y-1">
              {[...entries].reverse().map((entry) => {
                const tmpl = templates?.find(
                  (tmpl) => tmpl.id === entry.templateId
                )
                const isGain = entry.cost > 0
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 text-sm"
                  >
                    <span className="flex-1 text-foreground">
                      {tmpl?.name ?? "Aktivitet"}
                    </span>
                    <span
                      className={`font-medium tabular-nums ${isGain ? "text-energy-full" : "text-energy-low"}`}
                    >
                      {isGain ? "+" : ""}
                      {entry.cost}
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
