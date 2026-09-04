import { createBrowserClient } from '@supabase/ssr'

/**
 * Client do Supabase para o navegador (Client Components).
 * Útil para auth client-side ou realtime — o RLS continua valendo.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}