'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { PermissionName, Role, Permission } from '@/types/rbac'

/**
 * Hook to check user permissions
 * Kullanıcının yetkilerini kontrol etmek için hook
 */

interface UserPermissionsData {
  permissions: PermissionName[]
  role: Role | null
  isLoading: boolean
  error: Error | null
}

// Fetch user permissions from database
async function fetchUserPermissions(userId: string): Promise<{
  permissions: PermissionName[]
  role: Role | null
}> {
  const supabase = getSupabaseClient()

  // Get user's role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      role_id,
      roles (
        id,
        name,
        display_name,
        description,
        hierarchy_level,
        is_system_role,
        is_active
      )
    `)
    .eq('id', userId)
    .single()

  if (userError) throw userError

  const role = userData?.roles
    ? {
        id: (userData.roles as Record<string, unknown>).id as string,
        name: (userData.roles as Record<string, unknown>).name as PermissionName,
        displayName: (userData.roles as Record<string, unknown>).display_name as string,
        description: (userData.roles as Record<string, unknown>).description as string | undefined,
        hierarchyLevel: (userData.roles as Record<string, unknown>).hierarchy_level as number,
        isSystemRole: (userData.roles as Record<string, unknown>).is_system_role as boolean,
        isActive: (userData.roles as Record<string, unknown>).is_active as boolean,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : null

  // Get role permissions
  const { data: rolePerms, error: rolePermsError } = await supabase
    .from('role_permissions')
    .select(`
      permissions (name)
    `)
    .eq('role_id', userData?.role_id)

  if (rolePermsError) throw rolePermsError

  // Get direct user permissions
  const { data: userPerms, error: userPermsError } = await supabase
    .from('user_permissions')
    .select(`
      permissions (name),
      expires_at
    `)
    .eq('user_id', userId)

  if (userPermsError) throw userPermsError

  // Combine permissions
  const permissions = new Set<PermissionName>()

  rolePerms?.forEach((rp: { permissions: { name: string } | null }) => {
    const perm = rp.permissions
    if (perm?.name) {
      permissions.add(perm.name as PermissionName)
    }
  })

  userPerms?.forEach((up: { permissions: { name: string } | null; expires_at: string | null }) => {
    const perm = up.permissions
    if (perm?.name) {
      // Check if not expired
      if (!up.expires_at || new Date(up.expires_at) > new Date()) {
        permissions.add(perm.name as PermissionName)
      }
    }
  })

  return {
    permissions: Array.from(permissions),
    role: role as Role | null,
  }
}

/**
 * Main hook to get and check user permissions
 */
export function usePermissions(userId?: string): UserPermissionsData & {
  hasPermission: (permission: PermissionName) => boolean
  hasAnyPermission: (permissions: PermissionName[]) => boolean
  hasAllPermissions: (permissions: PermissionName[]) => boolean
  canManageUser: (targetHierarchyLevel: number) => boolean
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => (userId ? fetchUserPermissions(userId) : Promise.resolve({ permissions: [], role: null })),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const permissions = data?.permissions || []
  const role = data?.role || null

  // Check if user has a specific permission
  const hasPermission = (permission: PermissionName): boolean => {
    return permissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (perms: PermissionName[]): boolean => {
    return perms.some((p) => permissions.includes(p))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (perms: PermissionName[]): boolean => {
    return perms.every((p) => permissions.includes(p))
  }

  // Check if user can manage another user based on hierarchy
  const canManageUser = (targetHierarchyLevel: number): boolean => {
    if (!role) return false
    return role.hierarchyLevel < targetHierarchyLevel
  }

  return {
    permissions,
    role,
    isLoading,
    error: error as Error | null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUser,
  }
}

/**
 * Hook to fetch all roles
 */
export function useRoles() {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('hierarchy_level', { ascending: true })

      if (error) throw error

      return data.map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        displayName: r.display_name,
        description: r.description,
        hierarchyLevel: r.hierarchy_level,
        isSystemRole: r.is_system_role,
        isActive: r.is_active,
        createdAt: new Date(r.created_at as string),
        updatedAt: new Date(r.updated_at as string),
      })) as Role[]
    },
  })
}

/**
 * Hook to fetch all permissions
 */
export function useAllPermissions() {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })

      if (error) throw error

      return data.map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name as PermissionName,
        displayName: p.display_name,
        description: p.description,
        module: p.module,
        action: p.action,
        createdAt: new Date(p.created_at as string),
      })) as Permission[]
    },
  })
}

/**
 * Hook to fetch role with its permissions
 */
export function useRolePermissions(roleId?: string) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return []

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (*)
        `)
        .eq('role_id', roleId)

      if (error) throw error

      return data.map((rp: { permissions: Record<string, unknown> }) => {
        const p = rp.permissions as Record<string, unknown>
        return {
          id: p.id as string,
          name: p.name as PermissionName,
          displayName: p.display_name as string,
          description: p.description as string | undefined,
          module: p.module as string,
          action: p.action as string,
          createdAt: new Date(p.created_at as string),
        }
      }) as Permission[]
    },
    enabled: !!roleId,
  })
}

/**
 * Permission check component wrapper
 */
interface RequirePermissionProps {
  permission: PermissionName | PermissionName[]
  userId?: string
  fallback?: React.ReactNode
  children: React.ReactNode
  requireAll?: boolean
}

export function RequirePermission({
  permission,
  userId,
  fallback = null,
  children,
  requireAll = false,
}: RequirePermissionProps) {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions(userId)

  if (isLoading) {
    return null
  }

  const permissions = Array.isArray(permission) ? permission : [permission]

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (!hasAccess) {
    return fallback as React.ReactElement | null
  }

  return children as React.ReactElement
}
