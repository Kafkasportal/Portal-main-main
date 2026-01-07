import { createBrowserClient } from '@supabase/ssr'

// Mock Supabase client for development without credentials
const createMockClient = () => ({
  auth: {
    getSession: () => {
      const storedSession =
        typeof window !== 'undefined'
          ? localStorage.getItem('mock_session')
          : null
      return Promise.resolve({
        data: { session: storedSession ? JSON.parse(storedSession) : null },
        error: null,
      })
    },
    signInWithPassword: ({ email }: { email: string }) => {
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: {
          name: 'Demo Admin',
          role: 'admin',
          permissions: ['admin'],
          avatar_url: '',
        },
        created_at: new Date().toISOString(),
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      }
      // Persist mock session
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_session', JSON.stringify(mockSession))
        document.cookie = 'auth-token=mock-auth-token; path=/; max-age=604800'
      }
      return Promise.resolve({
        data: { user: mockUser, session: mockSession },
        error: null,
      })
    },
    signOut: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_session')
        document.cookie = 'auth-token=; path=/; max-age=0'
      }
      return Promise.resolve({ error: null })
    },
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: () => ({
    select: () => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
})

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false' // Default to true for now

  // Use mock client if credentials are missing or mock mode is enabled
  if (!supabaseUrl || !supabaseAnonKey || useMockApi) {
    console.warn(
      'Using mock Supabase client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env for real Supabase.'
    )
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
