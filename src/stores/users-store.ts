/**
 * Users Store
 * Kullanıcı state yönetimi için Zustand store
 * Supabase auth.users tablosu ile entegre
 */

import { create } from 'zustand'
import type { User } from '@/types/users'
import { getCurrentUser } from '@/lib/supabase/client'

// ============================================
// STATE INTERFACE
// ============================================

interface UsersState {
  currentUser: User | null
  isAuthenticated: boolean
  userPermissions: Record<string, boolean>
  isAdmin: boolean
  isModerator: boolean
  isLoading: boolean
  error: string | null
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: UsersState = {
  currentUser: null,
  isAuthenticated: false,
  userPermissions: {},
  isAdmin: false,
  isModerator: false,
  isLoading: false,
  error: null,
}

// ============================================
// ACTION CREATORS
// ============================================

export const useUsersStore = create<UsersState>((set, get) => ({
  name: 'users-store',
  state: initialState,

  // ==========================================
  // ACTIONS
  // ==========================================

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user })
  },

  clearCurrentUser: () => {
    set({ currentUser: null })
  },

  setUserPermissions: (permissions: Record<string, boolean>) => {
    set({ userPermissions: permissions })
  },

  clearUserPermissions: () => {
    set({ userPermissions: {} })
  },

  setAdminStatus: (isAdmin: boolean, isModerator: boolean) => {
    set({ isAdmin, isModerator })
  },

  setAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  isAdmin: () => {
    const user = get().currentUser
    return user?.role === 'admin'
  },

  isModerator: () => {
    const user = get().currentUser
    return user?.role === 'moderator'
  },

  hasPermission: (permission: string) => {
    return get().userPermissions[permission] || false
  },

  canManageUsers: () => {
    return get().isAdmin || get().isModerator
  },
}))

// ============================================
// SELECTORS
// ============================================

export const selectCurrentUser = (state: UsersState) => state.currentUser
export const selectIsAuthenticated = (state: UsersState) => state.isAuthenticated
export const selectUserPermissions = (state: UsersState) => state.userPermissions
export const selectIsAdmin = (state: UsersState) => state.isAdmin
export const selectIsModerator = (state: UsersState) => state.isModerator
export const selectCanManageUsers = (state: UsersState) => state.canManageUsers()
