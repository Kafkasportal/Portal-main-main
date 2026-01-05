/**
 * User Service (Client)
 * Client-side user operations for browser context
 */

import { createClient } from '@/lib/supabase/client'
import { User, Role, UserPermissions, UserFilters, CreateUserData, UpdateUserData } from '@/types/users'

// Type for Supabase auth user
interface SupabaseAuthUser {
  id: string;
  email?: string;
  phone?: string;
  aud?: string;
  banned_until?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  app_metadata?: Record<string, unknown>;
}

// Supabase auth.users -> User mapping
function mapSupabaseAuthUserToUser(authUser: SupabaseAuthUser): User {
  const appMetadata = authUser.app_metadata || {}
  const userRole = (appMetadata.role || 'user') as Role
  const userPermissions = (appMetadata.permissions || {}) as UserPermissions

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: String(appMetadata.name || `${appMetadata.ad || ''} ${appMetadata.soyad || ''}`.trim()),
    phone: authUser.phone || (appMetadata.phone as string) || undefined,
    role: userRole,
    avatar_url: appMetadata.avatar_url as string | undefined,
    isActive: authUser.aud === 'authenticated' && !authUser.banned_until,
    last_login: authUser.last_sign_in_at || undefined,
    created_at: authUser.created_at,
    updated_at: authUser.updated_at,
    deleted_at: authUser.deleted_at || undefined,
    ad: appMetadata.ad as string | undefined,
    soyad: appMetadata.soyad as string | undefined,
    birim: appMetadata.birim as string | undefined,
    yetki: appMetadata.yetki as string | undefined,
    gorev: appMetadata.gorev as string | undefined,
    dahili: appMetadata.dahili as string | undefined,
    kisa_kod: appMetadata.kisa_kod as string | undefined,
    kisa_kod2: appMetadata.kisa_kod2 as string | undefined,
    erisim_yetkisi: appMetadata.erisim_yetkisi as string | undefined,
    imza_yetkisi: appMetadata.imza_yetkisi as string | undefined,
    fon_yetkisi: appMetadata.fon_yetkisi as string | undefined,
    fon_yetkisi2: appMetadata.fon_yetkisi2 as string | undefined,
    fon_yetkisi3: appMetadata.fon_yetkisi3 as string | undefined,
    fon_bolgesi_yetkisi: appMetadata.fon_bolgesi_yetkisi as string | undefined,
    imza_yetkisi2: appMetadata.imza_yetkisi2 as string | undefined,
    imza_yetkisi3: appMetadata.imza_yetkisi3 as string | undefined,
    permissions: userPermissions,
  }
}

// Role bazlı varsayılan yetkiler
export const ROLE_PERMISSIONS_MAP: Record<Role, UserPermissions> = {
  admin: {
    LOGIN: true,
    VIEW_PROFILE: true,
    UPDATE_PROFILE: true,
    VIEW_USERS: true,
    CREATE_USER: true,
    UPDATE_USER: true,
    DELETE_USER: true,
    MANAGE_ROLES: true,
    VIEW_DONATIONS: true,
    CREATE_DONATION: true,
    VIEW_FINANCIAL_REPORTS: true,
    VIEW_APPLICATIONS: true,
    APPROVE_APPLICATION: true,
    CREATE_PAYMENT: true,
    VIEW_BENEFICIARIES: true,
    CREATE_BENEFICIARY: true,
    UPDATE_BENEFICIARY: true,
    VIEW_SETTINGS: true,
    UPDATE_SETTINGS: true,
    MANAGE_SYSTEM: true,
  },
  moderator: {
    LOGIN: true,
    VIEW_PROFILE: true,
    UPDATE_PROFILE: true,
    VIEW_USERS: true,
    CREATE_USER: true,
    UPDATE_USER: true,
    DELETE_USER: true,
    VIEW_DONATIONS: true,
    CREATE_DONATION: true,
    VIEW_FINANCIAL_REPORTS: true,
    VIEW_APPLICATIONS: true,
    APPROVE_APPLICATION: true,
    CREATE_PAYMENT: true,
    VIEW_BENEFICIARIES: true,
    CREATE_BENEFICIARY: true,
    UPDATE_BENEFICIARY: true,
    VIEW_SETTINGS: true,
  },
  user: {
    LOGIN: true,
    VIEW_PROFILE: true,
    UPDATE_PROFILE: true,
  },
}

/**
 * Get all users with filtering and pagination
 */
export async function getUsers(_options: {
  filters?: UserFilters
  page?: number
  pageSize?: number
}): Promise<{ users: User[]; total: number }> {
  // Since we can't directly query auth.users from client, we need to use a different approach
  // For now, return empty array - this should be handled by API routes
  throw new Error('getUsers should be called from server side or via API route')
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

  if (error || !user) {
    return null
  }

  return mapSupabaseAuthUserToUser(user)
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password || 'tempPassword123!',
    options: {
      data: {
        role: data.role,
        ad: data.ad,
        soyad: data.soyad,
        name: `${data.ad} ${data.soyad}`.trim(),
        phone: data.phone,
        birim: data.birim,
        yetki: data.yetki,
        gorev: data.gorev,
        dahili: data.dahili,
        kisa_kod: data.kisa_kod,
        kisa_kod2: data.kisa_kod2,
        erisim_yetkisi: data.erisim_yetkisi,
        imza_yetkisi: data.imza_yetkisi,
        fon_yetkisi: data.fon_yetkisi,
        fon_yetkisi2: data.fon_yetkisi2,
        fon_yetkisi3: data.fon_yetkisi3,
        fon_bolgesi_yetkisi: data.fon_bolgesi_yetkisi,
        imza_yetkisi2: data.imza_yetkisi2,
        imza_yetkisi3: data.imza_yetkisi3,
        permissions: data.permissions || ROLE_PERMISSIONS_MAP[data.role],
      },
    },
  })

  if (error || !user) {
    throw new Error(error?.message || 'Failed to create user')
  }

  return mapSupabaseAuthUserToUser(user)
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<User> {
  const supabase = createClient()

  const updates: { data: Record<string, unknown>; password?: string; email?: string } = {
    data: {
      role: data.role,
      ad: data.ad,
      soyad: data.soyad,
      name: data.ad && data.soyad ? `${data.ad} ${data.soyad}`.trim() : undefined,
      phone: data.phone,
      birim: data.birim,
      yetki: data.yetki,
      gorev: data.gorev,
      dahili: data.dahili,
      kisa_kod: data.kisa_kod,
      kisa_kod2: data.kisa_kod2,
      erisim_yetkisi: data.erisim_yetkisi,
      imza_yetkisi: data.imza_yetkisi,
      fon_yetkisi: data.fon_yetkisi,
      fon_yetkisi2: data.fon_yetkisi2,
      fon_yetkisi3: data.fon_yetkisi3,
      fon_bolgesi_yetkisi: data.fon_bolgesi_yetkisi,
      imza_yetkisi2: data.imza_yetkisi2,
      imza_yetkisi3: data.imza_yetkisi3,
      permissions: data.permissions,
    },
  }

  if (data.password) {
    updates.password = data.password
  }

  if (data.email) {
    updates.email = data.email
  }

  const { data: { user }, error } = await supabase.auth.updateUser(updates)

  if (error || !user) {
    throw new Error(error?.message || 'Failed to update user')
  }

  return mapSupabaseAuthUserToUser(user)
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.admin.updateUserById(
    userId,
    {
      ban_duration: isActive ? 'none' : '31536000s', // 1 year
    }
  )

  if (error || !user) {
    throw new Error(error?.message || 'Failed to toggle user status')
  }

  return mapSupabaseAuthUserToUser(user)
}

/**
 * Get user count by role
 */
export async function getUserCount(_role?: string): Promise<number> {
  // This needs to be called from server side or via API route
  throw new Error('getUserCount should be called from server side or via API route')
}

/**
 * Get multiple users by IDs
 */
export async function getUsersByIds(_userIds: string[]): Promise<User[]> {
  // This needs to be called from server side or via API route
  throw new Error('getUsersByIds should be called from server side or via API route')
}

/**
 * Delete multiple users
 */
export async function deleteMultipleUsers(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    await deleteUser(userId)
  }
}
