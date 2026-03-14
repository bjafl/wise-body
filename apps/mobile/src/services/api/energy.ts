import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import type { CreateEnergyEntryRequest } from '@wise-body/types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const energyKeys = {
  preferences: ['energy', 'preferences'] as const,
  categories: ['energy', 'categories'] as const,
  templates: ['energy', 'templates'] as const,
  entries: (date: string) => ['energy', 'entries', date] as const,
  summary: (date: string) => ['energy', 'summary', date] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useEnergyPreferences() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: energyKeys.preferences,
    queryFn: api.energy.getPreferences,
    enabled: isAuthed,
  })
}

export function useEnergyCategories() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: energyKeys.categories,
    queryFn: api.energy.getCategories,
    enabled: isAuthed,
    staleTime: 5 * 60 * 1000, // categories rarely change
  })
}

export function useEnergyTemplates() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: energyKeys.templates,
    queryFn: api.energy.getTemplates,
    enabled: isAuthed,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEnergyEntries(date: string) {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: energyKeys.entries(date),
    queryFn: () => api.energy.getEntries(date),
    enabled: isAuthed && !!date,
  })
}

export function useEnergySummary(date: string) {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: energyKeys.summary(date),
    queryFn: () => api.energy.getSummary(date),
    enabled: isAuthed && !!date,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useLogEnergyEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateEnergyEntryRequest) => api.energy.createEntry(req),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: energyKeys.entries(entry.date) })
      queryClient.invalidateQueries({ queryKey: energyKeys.summary(entry.date) })
    },
  })
}

export function useDeleteEnergyEntry(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.energy.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: energyKeys.entries(date) })
      queryClient.invalidateQueries({ queryKey: energyKeys.summary(date) })
    },
  })
}
