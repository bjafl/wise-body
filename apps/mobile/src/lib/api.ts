import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  EnergyPreferencesDto,
  CategoryDto,
  EnergyActivityTemplateDto,
  EnergyEntryDto,
  EnergyDailySummaryDto,
  CreateEnergyEntryRequest,
  UpsertEnergyPreferencesRequest,
} from '@wise-body/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(status: number, body: unknown) {
    super(`API ${status}`)
    this.status = status
    this.body = body
  }
}

// Import lazily to avoid circular dep (api.ts ← authStore.ts imports nothing from here)
function getToken(): string | null {
  // Dynamic import of the store to avoid circular references
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).__authStoreToken ?? null
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include', // send/receive the refresh token cookie
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface OnboardEnergyRequest {
  preferences: UpsertEnergyPreferencesRequest
  categories: {
    name: string
    color?: string
    icon?: string
    sortOrder: number
    isDefault: boolean
    sourceLocale?: string
  }[]
  templates: {
    categoryIndex: number
    name: string
    defaultCost: number
    defaultDuration?: number
    icon?: string
    isDefault: boolean
    sourceLocale?: string
  }[]
}

export interface OnboardEnergyResponse {
  preferences: EnergyPreferencesDto
  categories: CategoryDto[]
  templates: EnergyActivityTemplateDto[]
}

export const api = {
  auth: {
    register: (body: RegisterRequest) =>
      request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: LoginRequest) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    refresh: () =>
      request<AuthResponse>('/api/auth/refresh', { method: 'POST' }),
    logout: () =>
      request<void>('/api/auth/logout', { method: 'DELETE' }),
  },

  energy: {
    getPreferences: () =>
      request<EnergyPreferencesDto>('/api/energy/preferences'),
    updatePreferences: (body: UpsertEnergyPreferencesRequest) =>
      request<EnergyPreferencesDto>('/api/energy/preferences', { method: 'PUT', body: JSON.stringify(body) }),
    getCategories: () =>
      request<CategoryDto[]>('/api/energy/categories'),
    getTemplates: () =>
      request<EnergyActivityTemplateDto[]>('/api/energy/templates'),
    getEntries: (date: string) =>
      request<EnergyEntryDto[]>(`/api/energy/entries?date=${date}`),
    createEntry: (body: CreateEnergyEntryRequest) =>
      request<EnergyEntryDto>('/api/energy/entries', { method: 'POST', body: JSON.stringify(body) }),
    deleteEntry: (id: string) =>
      request<void>(`/api/energy/entries/${id}`, { method: 'DELETE' }),
    getSummary: (date: string) =>
      request<EnergyDailySummaryDto>(`/api/energy/summary?date=${date}`),
    onboard: (body: OnboardEnergyRequest) =>
      request<OnboardEnergyResponse>('/api/energy/onboard', { method: 'POST', body: JSON.stringify(body) }),
  },
}
