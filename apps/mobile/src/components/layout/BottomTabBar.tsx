import { Home } from "lucide-react"
import { Link, useRouter } from "@tanstack/react-router"
import { useMemo, type FC } from "react"
import { isNavItemMeta } from "@/lib/navUtils"

const BottomNav: FC = () => {
  const router = useRouter()

  const navRoutesData = useMemo(() => {
    const children = router.routeTree.children
    if (!children) return []
    const routesNavMeta = Object.values(children)
      .map((r) => r.options.staticData?.nav)
      .filter(isNavItemMeta)
    const routesNavPaths = Object.values(children).map((r) => r.path)
    const routesNavData = routesNavMeta.map((meta, index) => ({
      ...meta,
      path: routesNavPaths[index],
    }))
    return routesNavData.sort((a, b) => a.order - b.order)
  }, [router.routeTree])

  return (
    <nav
      className="flex border-t bg-background"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <Link to="/" className="sr-only">
        <Home className="h-5 w-5" />
        Hjem
      </Link>

      {navRoutesData.map((route) => {
        const { path, label, icon: Icon } = route
        return (
          <Link
            key={path}
            to={path}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
            activeProps={{
              className:
                "flex-1 flex flex-col items-center py-2 gap-1 text-xs text-primary",
            }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
