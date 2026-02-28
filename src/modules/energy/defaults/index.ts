import type { EnergyDefaults } from './types'

const loaders: Record<string, () => Promise<{ default: EnergyDefaults }>> = {
  nb: () => import('./nb'),
  en: () => import('./en'),
}

export async function getEnergyDefaults(locale: string): Promise<EnergyDefaults> {
  const lang = locale.split('-')[0] // "nb-NO" → "nb"
  const loader = loaders[lang] ?? loaders['en']
  const mod = await loader()
  return mod.default
}
