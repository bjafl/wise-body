import { useEnergyTemplates } from "@/services/api/energy"
import { cn } from "@wise-body/ui/lib/utils"
import { useMemo, type FC } from "react"
import { Skeleton } from "@wise-body/ui/components/skeleton"
import { useLucideIcon } from "@/hooks/useLucideIcon"
import { Button } from "@wise-body/ui/components/button"

const ActivityButton: FC<{
  templateId: string
  onClick: (templateId: string) => void
  className?: string
}> = ({ templateId, onClick, className }) => {
  const { data: templates = [] } = useEnergyTemplates()

  const tmpl = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templateId, templates]
  )
  const cName = cn(
    "flex h-20 w-20 flex-col items-center gap-1.5 rounded-xl",
    "border border-border bg-card px-3 py-2 text-sm",
    "transition-all",
    "hover:border-primary/30 hover:bg-accent active:scale-95",
    className
  )
  const Icon = useLucideIcon(tmpl?.icon ?? "Activity")
  if (!tmpl) return <Skeleton className={cName} />

  return (
    <Button key={tmpl.id} onClick={() => onClick(tmpl.id)} className={cName}>
      <Icon className="h-6 w-6 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{tmpl.name}</span>
      <span
        className={`text-xs font-medium tabular-nums ${
          tmpl.defaultCost > 0 ? "text-energy-full" : "text-muted-foreground"
        }`}
      >
        {tmpl.defaultCost > 0 ? "+" : ""}
        {tmpl.defaultCost}
      </span>
    </Button>
  )
}

export default ActivityButton
