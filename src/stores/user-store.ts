import { create } from 'zustand'
import type { User } from '@/types'
import { CURRENT_USER } from '@/lib/mock-data'

interface UserState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    updateUser: (updates: Partial<User>) => void
}

export const useUserStore = create<UserState>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
        set({ isLoading: true })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock authentication - accept any valid email/password
        // For demo: accept any non-empty email and password >= 6 chars
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()
        
        if (trimmedEmail && trimmedPassword.length >= 6) {
            // Set auth token cookie for middleware
            if (typeof document !== 'undefined') {
                // Use more reliable cookie setting
                const cookieValue = `mock-token-${Date.now()}`
                const expires = new Date()
                expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000) // 24 hours
                document.cookie = `auth-token=${cookieValue}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
            }
            
            set({
                user: { ...CURRENT_USER, email: trimmedEmail },
                isAuthenticated: true,
                isLoading: false
            })
            return true
        }

        set({ isLoading: false })
        return false
    },

    logout: () => {
        // Remove auth token cookie
        if (typeof document !== 'undefined') {
            document.cookie = 'auth-token=; path=/; max-age=0'
        }
        set({ user: null, isAuthenticated: false })
    },

    updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
    }))
}))
