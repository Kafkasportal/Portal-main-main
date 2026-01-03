import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // CHECK: Hardcoded for debugging Render Env Var issue
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://idsiiayyvygcgegmqcov.supabase.co'
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDg4NjMsImV4cCI6MjA4MTkyNDg2M30.blDE-L_aRNSwoawUCD3esFt_CMk2fhy8TpShsgyshZQ'

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase keys missing!')
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
