import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* ------------------------------------------------------------------
   Supabase helper
   ------------------------------------------------------------------ */

const REAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const REAL_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * When both env vars are present we connect to the real project.
 * Otherwise we fall back to a dummy public project so that the full
 * Supabase API (auth, from, storage, etc.) still exists and the app
 * code can call it without throwing “… is not a function”.
 *
 * NOTE: Data-fetch helpers already short-circuit when
 *       `hasSupabaseConfig === false`, so no unnecessary network
 *       calls will be made from the UI.
 */
export const hasSupabaseConfig = Boolean(REAL_URL && REAL_KEY)

const FALLBACK_URL = "https://placeholder.supabase.co"
const FALLBACK_KEY = "public-anon-key"

const client: SupabaseClient = hasSupabaseConfig
  ? createClient(REAL_URL!, REAL_KEY!)
  : createClient(FALLBACK_URL, FALLBACK_KEY)

export const supabase = client

/** Helper for Server Components / Route Handlers */
export const createServerClient = (): SupabaseClient =>
  hasSupabaseConfig ? createClient(REAL_URL!, REAL_KEY!) : createClient(FALLBACK_URL, FALLBACK_KEY)
