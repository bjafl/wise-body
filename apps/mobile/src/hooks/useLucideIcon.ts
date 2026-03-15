import * as Icons from "lucide-react"
import { ImageOff, type LucideIcon } from "lucide-react"
import { useMemo } from "react"

function toPascalCase(str: string): string {
  return str
    .replace(/[-_ ](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
}

export function useLucideIcon(
  name: string,
  fallback: LucideIcon = ImageOff
): LucideIcon {
  return useMemo(() => {
    const key = toPascalCase(name)
    const icon = (Icons as Record<string, unknown>)[key]
    console.log({ name, key, icon, Icons })
    if (icon) return icon as LucideIcon
    return fallback
  }, [name, fallback])
}
