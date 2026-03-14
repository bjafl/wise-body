import type { ModuleId } from "@/types/modules"

export const ALL_MODULES: ModuleId[] = ["energy", "mood", "pain"]

export const PAGE_TITLES: Record<string, string> = {
  "/": "Wise Body",
  "/energy": "Energi",
  "/energy/onboarding": "Energi",
  "/pain": "Smerte",
  "/settings": "Innstillinger",
  "/profile": "Profil",
}
