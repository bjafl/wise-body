import type { EnergyDefaults } from './types'

export async function getEnergyDefaults(locale: string): Promise<EnergyDefaults> {
  const lang = locale.split('-')[0]
  if (lang === 'nb') {
    const { default: defaults } = await import('./nb')
    return defaults
  }
  const { default: defaults } = await import('./en')
  return defaults
}
