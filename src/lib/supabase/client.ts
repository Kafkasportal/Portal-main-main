import { createBrowserClient } from '@supabase/ssr'

// Mock Supabase client for development without credentials
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
})

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

  // Use mock client if credentials are missing or mock mode is enabled
  if (!supabaseUrl || !supabaseAnonKey || useMockApi) {
    console.warn('Using mock Supabase client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env for real Supabase.')
    return createMockClient() as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
