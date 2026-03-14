import { useNavigate, useRouterState } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@wise-body/ui/components/button"
import { useMemo, type FC } from "react"
import { isStaticDataWithNavMeta } from "@/lib/navUtils"
import type { StaticDataWithNavMeta } from "@/types/routing"

const TopBar: FC = () => {
  const { matches } = useRouterState()
  const isSubRoute = matches.length > 2
  const navigate = useNavigate()
  const title = useMemo(() => {
    const staticData = matches
      .filter((m) => isStaticDataWithNavMeta(m.staticData))
      .at(-1)?.staticData as StaticDataWithNavMeta | undefined
    // if (isStaticDataWithNavMeta(staticData)) {
    //   return staticData.nav.label
    // }
    return staticData?.nav.label ?? "Wise Body"
  }, [matches])

  return (
    <header
      className="flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-sm"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      {isSubRoute && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: ".." })}
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

export default TopBar
