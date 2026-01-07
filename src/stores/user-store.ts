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
  initializeAuth: () => void
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
              name:
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                '',
              phone: session.user.phone || '',
              role: session.user.user_metadata?.role || 'admin',
              avatar: session.user.user_metadata?.avatar_url,
              isActive: true,
              permissions: session.user.user_metadata?.permissions || [],
              createdAt: session.user.created_at
                ? new Date(session.user.created_at)
                : new Date(),
              updatedAt: session.user.updated_at
                ? new Date(session.user.updated_at)
                : new Date(),
            } as User,
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
              name:
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                '',
              phone: session.user.phone || '',
              role: session.user.user_metadata?.role || 'admin',
              avatar: session.user.user_metadata?.avatar_url,
              isActive: true,
              permissions: session.user.user_metadata?.permissions || [],
              createdAt: session.user.created_at
                ? new Date(session.user.created_at)
                : new Date(),
              updatedAt: session.user.updated_at
                ? new Date(session.user.updated_at)
                : new Date(),
            } as User,
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
            name:
              data.user.user_metadata?.name ||
              data.user.email?.split('@')[0] ||
              '',
            phone: data.user.phone || '',
            role: data.user.user_metadata?.role || 'admin',
            avatar: data.user.user_metadata?.avatar_url,
            isActive: true,
            permissions: data.user.user_metadata?.permissions || [],
            createdAt: data.user.created_at
              ? new Date(data.user.created_at)
              : new Date(),
            updatedAt: data.user.updated_at
              ? new Date(data.user.updated_at)
              : new Date(),
          } as User,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
    } catch (err) {
      // Supabase error details
      let message = 'Giriş yapılamadı'
      if (err instanceof Error) {
        message = err.message
        // Provide user-friendly Turkish messages
        if (message.includes('Invalid login credentials')) {
          message = 'Geçersiz e-posta veya şifre'
        } else if (message.includes('Email not confirmed')) {
          message =
            'E-posta adresiniz onaylanmamış. Lütfen e-postanızı kontrol edin.'
        } else if (message.includes('User not found')) {
          message = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı'
        }
      }
      console.error('Login error:', err)
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
