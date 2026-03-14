export interface NavItemMeta {
  label: string
  icon: React.ComponentType<{ className?: string }>
  order: number
}

export interface StaticDataWithNavMeta {
  nav: NavItemMeta
}
