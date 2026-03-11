import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'placeholder-anon-key' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co')
  )
}

let _warned = false
export function warnIfNotConfigured(): void {
  if (!isSupabaseConfigured() && !_warned) {
    _warned = true
    console.warn(
      '[VotoAbierto] Supabase not configured — using seed data. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use real data.'
    )
  }
}

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }
  if (!_client) {
    _client = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return _client
}

// Default export for backwards compatibility — may be null if not configured
// Prefer getSupabaseClient() in new code
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null
