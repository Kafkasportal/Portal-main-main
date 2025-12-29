/**
 * Users Service
 * Kullanıcı yönetimi - Auth + Database dual management
 * CRITICAL: Manages both Supabase Auth and database records
 */

import type { NotificationPreferences, PaginatedResponse, User } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'

type Tables = Database['public']['Tables']

/**
 * Map database user row to User type
 */
function mapUser(db: Tables['users']['Row']): User {
  return {
    id: db.id,
    email: db.email,
    ad: db.ad || '',
    soyad: db.soyad || '',
    rol: (db.rol || 'user') as User['rol'],
    telefon: db.telefon || undefined,
    aktif: db.aktif ?? true,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

/**
 * Kullanıcı listesini getirir
 */
export async function fetchUsers(options?: {
  page?: number
  limit?: number
  search?: string
  rol?: string
}): Promise<PaginatedResponse<User>> {
  const supabase = getClient()
  const { page = 1, limit = 10, search, rol } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`ad.ilike.%${search}%,soyad.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (rol) {
    query = query.eq('rol', rol)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapUser), count, page, limit)
}

/**
 * ID'ye göre kullanıcı getirir
 */
export async function fetchUser(id: string): Promise<User | null> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapUser(data)
}

/**
 * Mevcut kullanıcıyı getirir (auth'dan)
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const supabase = getClient()

  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return null

  return fetchUser(authData.user.id)
}

/**
 * Yeni kullanıcı oluşturur (Auth + DB)
 */
export async function createUser(user: {
  email: string
  password: string
  ad: string
  soyad: string
  rol?: string
  telefon?: string
}) {
  const supabase = getClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('User creation failed')

  // Create database record
  const { data: dbData, error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      rol: user.rol || 'user',
      telefon: user.telefon,
      aktif: true,
    })
    .select()
    .single()

  if (dbError) throw dbError

  return mapUser(dbData)
}

/**
 * Kullanıcı bilgilerini günceller
 */
export async function updateUser(
  id: string,
  updates: Tables['users']['Update']
) {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapUser(data)
}

/**
 * Kullanıcı profilini günceller (email sync ile)
 */
export async function updateUserProfile(
  id: string,
  updates: { ad?: string; soyad?: string; telefon?: string; email?: string }
) {
  const supabase = getClient()

  // Update database
  const { data, error: dbError } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (dbError) throw dbError

  // Update auth email if changed
  if (updates.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: updates.email,
    })

    if (authError) throw authError
  }

  return mapUser(data)
}

/**
 * Şifre değiştirir
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const supabase = getClient()

  // Verify current password by attempting sign in
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email!,
    password: currentPassword,
  })

  if (signInError) throw new Error('Current password is incorrect')

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

/**
 * Kullanıcıyı siler (Auth + DB)
 */
export async function deleteUser(id: string) {
  const supabase = getClient()

  // Delete from database
  const { error: dbError } = await supabase.from('users').delete().eq('id', id)

  if (dbError) throw dbError

  // Delete from auth (requires admin privileges)
  // Note: This may not work in client-side code
  // TODO: Implement via server-side admin API
}

/**
 * Bildirim tercihlerini günceller
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
) {
  const supabase = getClient()

  const { error } = await supabase.auth.updateUser({
    data: { notifications: preferences },
  })

  if (error) throw error
}

/**
 * Bildirim tercihlerini getirir
 */
export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = getClient()

  const { data } = await supabase.auth.getUser()

  return (
    (data.user?.user_metadata?.notifications as NotificationPreferences) || {
      email: true,
      push: false,
      sms: false,
    }
  )
}
