/**
 * Custom Hooks for User Management
 * Kullanıcı işlemleri için React hook'ları
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUsersStore } from '@/stores/users-store'
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  toggleUserStatus,
  updateUser,
  getUserCount,
} from '@/lib/services/users.service'
import type { CreateUserData, UpdateUserData, UserFilters } from '@/types/users'

// ============================================
// USER LIST HOOK
// ============================================

/**
 * Kullanıcıları getirme hook'u
 */
export function useUsers(filters?: UserFilters, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['users', { filters, page, pageSize }],
    queryFn: () => getUsers({ filters, page, pageSize }),
    queryClient: useQueryClient(),
  })
}

/**
 * Kullanıcı sayısını getirme hook'u
 */
export function useUserCount(role?: string) {
  return useQuery({
    queryKey: ['user-count', role],
    queryFn: () => getUserCount(role),
    queryClient: useQueryClient(),
  })
}

// ============================================
// USER DETAIL HOOK
// ============================================

/**
 * Tek kullanıcı detaylarını getirme hook'u
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    queryClient: useQueryClient(),
  })
}

// ============================================
// USER CREATE HOOK
// ============================================

/**
 * Yeni kullanıcı oluşturma hook'u
 */
export function useCreateUser() {
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      try {
        const newUser = await createUser(data)
        
        // User store'u güncelle
        setCurrentUser(newUser)
        
        toast.success('Kullanıcı başarıyla oluşturuldu')
        
        return newUser
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kullanıcı oluşturma başarısız'
        setError(message)
        toast.error(message)
        throw error
      }
    },
    onSuccess: () => {
      // Form'u temizle
      setError(null)
    },
    queryClient: useQueryClient(),
  })
}

/**
 * Yeni kullanıcı oluşturma hook'u (kullanıcıyı güncelleme için)
 */
export function useUpdateUser() {
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateUserData) => {
      try {
        const updatedUser = await updateUser(id, data)
        
        // Store'daki kullanıcıyı güncelle
        setCurrentUser(updatedUser)
        
        toast.success('Kullanıcı bilgileri güncellendi')
        
        return updatedUser
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kullanıcı güncelleme başarısız'
        setError(message)
        toast.error(message)
        throw error
      }
    },
    onSuccess: () => {
      setError(null)
    },
    queryClient: useQueryClient(),
  })
}

// ============================================
// USER DELETE HOOK
// ============================================

/**
 * Kullanıcı silme hook'u
 */
export function useDeleteUser() {
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteUser(id)
        
        // Store'daki kullanıcıyı temizle
        setCurrentUser(null)
        
        toast.success('Kullanıcı başarıyla silindi')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kullanıcı silme başarısız'
        setError(message)
        toast.error(message)
        throw error
      }
    },
    onSuccess: () => {
      setError(null)
    },
    queryClient: useQueryClient(),
  })
}

/**
 * Kullanıcıları toplu silme hook'u
 */
export function useDeleteMultipleUsers() {
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        // Tüm kullanıcıları sırayla sil
        for (const id of ids) {
          await deleteUser(id)
        }
        
        // Store'daki mevcut kullanıcıyı temizle
        setCurrentUser(null)
        
        toast.success(`${ids.length} kullanıcı başarıyla silindi`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kullanıcı silme başarısız'
        setError(message)
        toast.error(message)
        throw error
      }
    },
    onSuccess: () => {
      setError(null)
    },
    queryClient: useQueryClient(),
  })
}

// ============================================
// USER STATUS HOOK
// ============================================

/**
 * Kullanıcı durumunu değiştirme hook'u (Aktif/Pasif)
 */
export function useToggleUserStatus() {
  const { setCurrentUser, setError } = useUsersStore()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      try {
        const updatedUser = await toggleUserStatus(id, isActive)
        
        // Store'daki kullanıcıyı güncelle
        setCurrentUser(updatedUser)
        
        const status = isActive ? 'aktif' : 'pasif'
        toast.success(`Kullanıcı ${status} yapıldı`)
        
        return updatedUser
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kullanıcı durumu güncelleme başarısız'
        setError(message)
        toast.error(message)
        throw error
      }
    },
    onSuccess: () => {
      setError(null)
    },
    queryClient: useQueryClient(),
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
  const invalidateUsers = useQueryClient()

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
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,

    // Actions
    updateUser: handleUpdate,
    deleteUser: handleDelete,
    toggleStatus: handleToggleStatus,

    // Refresh
    invalidate: () => {
      invalidateUsers.invalidateQueries(['users'])
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
    queryClient.invalidateQueries(['users'])
    queryClient.invalidateQueries(['user-count'])
  }

  return { refreshUsers }
}
