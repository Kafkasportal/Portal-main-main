/**
 * Custom Hooks for User Management
 * Kullanıcı işlemleri için React hook'ları (API calls)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUsersStore } from '@/stores/users-store'
import type { CreateUserData, UpdateUserData, UserFilters, User } from '@/types/users'

// API response types
interface UsersResponse {
  users: User[]
  total: number
}

interface UserResponse {
  user: User
}

interface CountResponse {
  count: number
}

// ============================================
// USER LIST HOOK
// ============================================

/**
 * Kullanıcıları getirme hook'u (via API)
 */
export function useUsers(filters?: UserFilters, page = 1, pageSize = 10) {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('pageSize', pageSize.toString())

  if (filters?.role) params.append('role', filters.role)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.search) params.append('search', filters.search)

  return useQuery<UsersResponse>({
    queryKey: ['users', { filters, page, pageSize }],
    queryFn: async () => {
      const response = await fetch(`/api/users?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return response.json()
    },
  })
}

/**
 * Kullanıcı sayısını getirme hook'u (via API)
 */
export function useUserCount(role?: string) {
  const params = new URLSearchParams()
  if (role) params.append('role', role)

  return useQuery<CountResponse>({
    queryKey: ['user-count', role],
    queryFn: async () => {
      const response = await fetch(`/api/users/count?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user count')
      }
      return response.json()
    },
  })
}

// ============================================
// USER DETAIL HOOK
// ============================================

/**
 * Tek kullanıcı detaylarını getirme hook'u (via API)
 */
export function useUser(id: string) {
  return useQuery<UserResponse>({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

// ============================================
// USER CREATE HOOK
// ============================================

/**
 * Yeni kullanıcı oluşturma hook'u (via API)
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      const result: UserResponse = await response.json()
      return result.user
    },
    onSuccess: (newUser) => {
      setCurrentUser(newUser)
      toast.success('Kullanıcı başarıyla oluşturuldu')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-count'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    },
  })
}

/**
 * Kullanıcı güncelleme hook'u (via API)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateUserData) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      const result: UserResponse = await response.json()
      return result.user
    },
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser)
      toast.success('Kullanıcı bilgileri güncellendi')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    },
  })
}

// ============================================
// USER DELETE HOOK
// ============================================

/**
 * Kullanıcı silme hook'u (via API)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      return id
    },
    onSuccess: () => {
      setCurrentUser(null)
      toast.success('Kullanıcı başarıyla silindi')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-count'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    },
  })
}

/**
 * Kullanıcıları toplu silme hook'u (via API)
 */
export function useDeleteMultipleUsers() {
  const queryClient = useQueryClient()
  const { setError } = useUsersStore()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch('/api/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: ids }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete users')
      }

      return ids
    },
    onSuccess: (ids) => {
      toast.success(`${ids.length} kullanıcı başarıyla silindi`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-count'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    },
  })
}

// ============================================
// USER STATUS HOOK
// ============================================

/**
 * Kullanıcı durumunu değiştirme hook'u (Aktif/Pasif) (via API)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/users/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to toggle user status')
      }

      const result: UserResponse = await response.json()
      return { ...result.user, isActive }
    },
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser)
      const status = updatedUser.isActive ? 'aktif' : 'pasif'
      toast.success(`Kullanıcı ${status} yapıldı`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    },
  })
}

// ============================================
// COMBINED HOOKS
// ============================================

/**
 * Kullanıcı detay ve listesi için birleşik hook
 */
export function useUserManagement(id: string) {
  const userQuery = useUser(id)
  const queryClient = useQueryClient()

  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  const handleUpdate = (data: UpdateUserData) => {
    return updateMutation.mutateAsync({ id, ...data })
  }

  const handleDelete = () => {
    return deleteMutation.mutateAsync(id)
  }

  const handleToggleStatus = () => {
    return toggleStatusMutation.mutateAsync({ id, isActive: !userQuery.data?.isActive })
  }

  return {
    // Data
    user: userQuery.data?.user,
    isLoading: userQuery.isLoading,
    error: userQuery.error,

    // Actions
    updateUser: handleUpdate,
    deleteUser: handleDelete,
    toggleStatus: handleToggleStatus,

    // Refresh
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      userQuery.refetch()
    },

    // Status
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
  }
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Kullanıcı listesini yenileme hook'u
 */
export function useRefreshUsers() {
  const queryClient = useQueryClient()

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    queryClient.invalidateQueries({ queryKey: ['user-count'] })
  }

  return { refreshUsers }
}
