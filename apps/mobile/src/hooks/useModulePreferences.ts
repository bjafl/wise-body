import { useState, useEffect, useCallback } from 'react'
import type { ModuleId } from '@/types'
import { modulePreferencesAdapter } from '@/services/storage'

export function useModulePreferences<TPrefs = Record<string, unknown>>(
  moduleId: ModuleId
) {
  const [preferences, setPreferences] = useState<TPrefs | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await modulePreferencesAdapter.get<TPrefs>(moduleId)
    setPreferences(result?.preferences ?? null)
    setLoading(false)
  }, [moduleId])

  useEffect(() => { load() }, [load])

  const savePreferences = useCallback(
    async (prefs: TPrefs) => {
      await modulePreferencesAdapter.save(moduleId, prefs)
      setPreferences(prefs)
    },
    [moduleId]
  )

  return { preferences, loading, savePreferences, reload: load }
}
