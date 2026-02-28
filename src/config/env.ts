export const env = {
  useSupabase: import.meta.env.VITE_USE_SUPABASE === 'true',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
} as const
