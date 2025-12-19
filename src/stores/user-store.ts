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
        if (email && password.length >= 6) {
            set({
                user: { ...CURRENT_USER, email },
                isAuthenticated: true,
                isLoading: false
            })
            return true
        }

        set({ isLoading: false })
        return false
    },

    logout: () => {
        set({ user: null, isAuthenticated: false })
    },

    updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
    }))
}))
