import { Link, useRouter } from "@tanstack/react-router"
import { useMemo, type FC } from "react"
import { isNavItemMeta } from "@/lib/navUtils"

const BottomNav: FC = () => {
  const router = useRouter()

  const navRoutesData = useMemo(() => {
    const children = router.routeTree.children
    if (!children) return []
    const routesNavMeta = Object.values(children)
      .map((r) => ({ nav: r.options.staticData?.nav, path: `/${r.path}` }))
      .filter((meta) => isNavItemMeta(meta.nav))
    // const routesNavPaths = Object.values(children).map((r) => r.path)
    // const routesNavData = routesNavMeta.map((meta, index) => ({
    //   ...meta,
    //   path: routesNavPaths[index],
    // }))
    console.log({ routesNavMeta, children })
    return routesNavMeta.sort((a, b) => a.nav.order - b.nav.order)
  }, [router.routeTree])

  return (
    <nav
      className="h-content flex items-center gap-4 border-t bg-background"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {navRoutesData.map((route) => {
        const {
          path,
          nav: { icon: Icon, label },
        } = route
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
