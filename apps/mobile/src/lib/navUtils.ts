import type { NavItemMeta, StaticDataWithNavMeta } from "@/types/routing"

export function isNavItemMeta(meta: any): meta is NavItemMeta {
  return (
    meta &&
    typeof meta.label === "string" &&
    typeof meta.icon === "function" &&
    typeof meta.order === "number"
  )
}

export function isStaticDataWithNavMeta(
  data: any
): data is StaticDataWithNavMeta {
  return data && isNavItemMeta(data.nav)
}
