import { useState, useEffect, useCallback } from 'react'
import type { Category, ModuleId } from '@/types'
import { categoryAdapter } from '@/services/storage'

export function useCategories(moduleId: ModuleId) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await categoryAdapter.getByModule(moduleId)
    setCategories(data)
    setLoading(false)
  }, [moduleId])

  useEffect(() => { load() }, [load])

  const saveCategory = useCallback(
    async (category: Omit<Category, 'id'> & { id?: string }) => {
      await categoryAdapter.save(category)
      await load()
    },
    [load]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      await categoryAdapter.delete(id)
      await load()
    },
    [load]
  )

  return { categories, loading, saveCategory, deleteCategory, reload: load }
}
