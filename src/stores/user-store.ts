import { getSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@/types'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { create } from 'zustand'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  initializeAuth: () => void // Changed to sync or managed as it sets up listener
  updateUser: (updates: Partial<User>) => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initializeAuth: () => {
    const supabase = getSupabaseClient()

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              ad: session.user.user_metadata?.ad || '',
              soyad: session.user.user_metadata?.soyad || '',
              role: session.user.user_metadata?.role || 'user',
            } as unknown as User,
            isAuthenticated: true,
          })
        }
      })

    // Listen for auth changes
    supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              ad: session.user.user_metadata?.ad || '',
              soyad: session.user.user_metadata?.soyad || '',
              role: session.user.user_metadata?.role || 'user',
            } as unknown as User,
            isAuthenticated: true,
          })
        } else {
          set({ user: null, isAuthenticated: false })
        }
      }
    )
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            ad: data.user.user_metadata?.ad || '',
            soyad: data.user.user_metadata?.soyad || '',
            role: data.user.user_metadata?.role || 'user',
          } as unknown as User,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş yapılamadı'
      set({ error: message, isLoading: false })
      return false
    }

    set({ isLoading: false })
    return false
  },

  logout: async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false, error: null })
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}))
