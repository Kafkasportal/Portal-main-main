/**
 * User Service
 * Supabase Auth için admin operations
 * auth.users tablosu ve app_metadata kullanımı
 */

import { createAdminClient } from '@/lib/supabase/server'
import { User, Role, Permission, UserPermissions, UserFilters, CreateUserData, UpdateUserData } from '@/types/users'

// Supabase auth.users -> User mapping
function mapSupabaseAuthUserToUser(authUser: any): User {
  const appMetadata = authUser.app_metadata || {}
  const userRole = (appMetadata.role || 'user') as Role
  const userPermissions = (appMetadata.permissions || {}) as UserPermissions

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: appMetadata.name || `${appMetadata.ad || ''} ${appMetadata.soyad || ''}`.trim(),
    phone: authUser.phone || appMetadata.phone || undefined,
    role: userRole,
    avatar_url: appMetadata.avatar_url || undefined,
    is_active: authUser.aud === 'authenticated' && !authUser.banned_until,
    last_login: authUser.last_sign_in_at || undefined,
    created_at: authUser.created_at,
    updated_at: authUser.updated_at,
    deleted_at: authUser.deleted_at || undefined,
    ad: appMetadata.ad || undefined,
    soyad: appMetadata.soyad || undefined,
    birim: appMetadata.birim || undefined,
    yetki: appMetadata.yetki || undefined,
    gorev: appMetadata.gorev || undefined,
    dahili: appMetadata.dahili || undefined,
    kisa_kod: appMetadata.kisa_kod || undefined,
    kisa_kod2: appMetadata.kisa_kod2 || undefined,
    erisim_yetkisi: appMetadata.erisim_yetkisi || undefined,
    imza_yetkisi: appMetadata.imza_yetkisi || undefined,
    fon_yetkisi: appMetadata.fon_yetkisi || undefined,
    fon_yetkisi2: appMetadata.fon_yetkisi2 || undefined,
    fon_yetkisi3: appMetadata.fon_yetkisi3 || undefined,
    fon_bolgesi_yetkisi: appMetadata.fon_bolgesi_yetkisi || undefined,
    imza_yetkisi2: appMetadata.imza_yetkisi2 || undefined,
    imza_yetkisi3: appMetadata.imza_yetkisi3 || undefined,
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
 * Şu anki oturum açmış kullanıcıyı getirir
 * Auth context'i kullanır
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createAdminClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  return mapSupabaseAuthUserToUser(authUser)
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createAdminClient()
  const { data: { user: authUser }, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !authUser) return false
  return (authUser.app_metadata.role === Role.ADMIN)
}

/**
 * Tüm kullanıcıları listeler (pagination, filtering, sorting destekler)
 */
export async function getUsers(options?: {
  filters?: UserFilters
  page?: number
  pageSize?: number
}): Promise<{ users: User[]; total: number }> {
  const supabase = await createAdminClient()
  const { filters, page = 1, pageSize = 10 } = options || {}
  
  const { data: authUsers, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    throw error
  }

  let filteredUsers = authUsers.users.map(mapSupabaseAuthUserToUser)

  if (filters?.search) {
    const lowerSearch = filters.search.toLowerCase()
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch) ||
      user.kisa_kod?.toLowerCase().includes(lowerSearch) ||
      user.birim?.toLowerCase().includes(lowerSearch) ||
      user.yetki?.toLowerCase().includes(lowerSearch) ||
      user.gorev?.toLowerCase().includes(lowerSearch) ||
      user.erisim_yetkisi?.toLowerCase().includes(lowerSearch) ||
      user.imza_yetkisi?.toLowerCase().includes(lowerSearch) ||
      user.fon_bolgesi_yetkisi?.toLowerCase().includes(lowerSearch)
    )
  }

  if (filters?.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role)
  }

  if (filters?.isActive !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.is_active === filters.isActive)
  }

  const total = filteredUsers.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return { users: paginatedUsers, total }
}

/**
 * Kullanıcı sayısını getirir
 */
export async function getUserCount(role?: string): Promise<number> {
  const supabase = await createAdminClient()
  const { data: authUsers, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error getting user count:', error)
    throw error
  }

  let filteredUsers = authUsers.users.map(mapSupabaseAuthUserToUser)

  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role)
  }

  return filteredUsers.length
}

/**
 * ID'ye göre kullanıcıyı getirir
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createAdminClient()
  const { data: { user: authUser }, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !authUser) return null
  return mapSupabaseAuthUserToUser(authUser)
}

/**
 * Yeni kullanıcı oluşturur
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  const supabase = await createAdminClient()

  const defaultPermissions = ROLE_PERMISSIONS_MAP[userData.role] || ROLE_PERMISSIONS_MAP[Role.USER]

  const { data, error } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    app_metadata: {
      role: userData.role,
      ad: userData.ad,
      soyad: userData.soyad,
      name: userData.name || `${userData.ad} ${userData.soyad}`,
      phone: userData.phone,
      birim: userData.birim,
      yetki: userData.yetki,
      gorev: userData.gorev,
      dahili: userData.dahili,
      kisa_kod: userData.kisa_kod,
      kisa_kod2: userData.kisa_kod2,
      erisim_yetkisi: userData.erisim_yetkisi,
      imza_yetkisi: userData.imza_yetkisi,
      fon_yetkisi: userData.fon_yetkisi,
      fon_bolgesi_yetkisi: userData.fon_bolgesi_yetkisi,
      fon_yetkisi2: userData.fon_yetkisi2,
      fon_yetkisi3: userData.fon_yetkisi3,
      imza_yetkisi2: userData.imza_yetkisi2,
      imza_yetkisi3: userData.imza_yetkisi3,
      permissions: userData.permissions || defaultPermissions,
    },
  })

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }
  if (!data.user) throw new Error('User creation failed')

  return mapSupabaseAuthUserToUser(data.user)
}

/**
 * Kullanıcı bilgilerini günceller
 */
export async function updateUser(userId: string, updates: Partial<UpdateUserData>): Promise<User> {
  const supabase = await createAdminClient()

  const currentAuthUser = await supabase.auth.admin.getUserById(userId)
  if (currentAuthUser.error || !currentAuthUser.data.user) {
    throw new Error('User not found')
  }

  const currentAppMetadata = currentAuthUser.data.user.app_metadata || {}
  const newAppMetadata = { ...currentAppMetadata }

  if (updates.email !== undefined) newAppMetadata.email = updates.email
  if (updates.ad !== undefined) newAppMetadata.ad = updates.ad
  if (updates.soyad !== undefined) newAppMetadata.soyad = updates.soyad
  if (updates.name !== undefined) newAppMetadata.name = updates.name
  if (updates.phone !== undefined) newAppMetadata.phone = updates.phone
  if (updates.birim !== undefined) newAppMetadata.birim = updates.birim
  if (updates.yetki !== undefined) newAppMetadata.yetki = updates.yetki
  if (updates.gorev !== undefined) newAppMetadata.gorev = updates.gorev
  if (updates.dahili !== undefined) newAppMetadata.dahili = updates.dahili
  if (updates.kisa_kod !== undefined) newAppMetadata.kisa_kod = updates.kisa_kod
  if (updates.kisa_kod2 !== undefined) newAppMetadata.kisa_kod2 = updates.kisa_kod2
  if (updates.erisim_yetkisi !== undefined) newAppMetadata.erisim_yetkisi = updates.erisim_yetkisi
  if (updates.imza_yetkisi !== undefined) newAppMetadata.imza_yetkisi = updates.imza_yetkisi
  if (updates.fon_yetkisi !== undefined) newAppMetadata.fon_yetkisi = updates.fon_yetkisi
  if (updates.fon_bolgesi_yetkisi !== undefined) newAppMetadata.fon_bolgesi_yetkisi = updates.fon_bolgesi_yetkisi
  if (updates.fon_yetkisi2 !== undefined) newAppMetadata.fon_yetkisi2 = updates.fon_yetkisi2
  if (updates.fon_yetkisi3 !== undefined) newAppMetadata.fon_yetkisi3 = updates.fon_yetkisi3
  if (updates.imza_yetkisi2 !== undefined) newAppMetadata.imza_yetkisi2 = updates.imza_yetkisi2
  if (updates.imza_yetkisi3 !== undefined) newAppMetadata.imza_yetkisi3 = updates.imza_yetkisi3
  if (updates.permissions !== undefined) newAppMetadata.permissions = updates.permissions

  // If role is updated, also update default permissions
  if (updates.role && updates.role !== currentAppMetadata.role) {
    newAppMetadata.role = updates.role
    newAppMetadata.permissions = ROLE_PERMISSIONS_MAP[updates.role] || ROLE_PERMISSIONS_MAP[Role.USER]
  }

  const userUpdateData: any = {
    email: updates.email,
    password: updates.password,
    app_metadata: newAppMetadata,
    // To activate/deactivate user, we can use `ban_until`
    ban_until: updates.is_active === false ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase.auth.admin.updateUserById(userId, userUpdateData)

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }
  if (!data.user) throw new Error('User update failed')

  return mapSupabaseAuthUserToUser(data.user)
}

/**
 * Kullanıcı durumunu değiştirir (Aktif/Pasif)
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
  return updateUser(userId, { is_active: isActive })
}

/**
 * Kullanıcıyı siler
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = await createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
