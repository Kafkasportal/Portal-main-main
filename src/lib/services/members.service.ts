/**
 * Members Service
 * Üye yönetimi için CRUD işlemleri
 */

import type { PaginatedResponse, Uye } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapMember } from './mappers'

type Tables = Database['public']['Tables']

/**
 * Üye listesini getirir (sayfalı, filtrelenebilir)
 *
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns Paginated üye listesi
 */
export async function fetchMembers(options?: {
  page?: number
  limit?: number
  search?: string
  uyeTuru?: string | string[]
  aidatDurumu?: string | string[]
  cinsiyet?: string | string[]
  kanGrubu?: string | string[]
  meslek?: string | string[]
  il?: string | string[]
}): Promise<PaginatedResponse<Uye>> {
  const supabase = getClient()
  const {
    page = 1,
    limit = 10,
    search,
    uyeTuru,
    aidatDurumu,
    cinsiyet,
    kanGrubu,
    meslek,
    il,
  } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  // Search filter
  if (search) {
    query = query.or(
      `ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`
    )
  }

  // Member type filter
  if (uyeTuru && uyeTuru !== 'all') {
    const types = Array.isArray(uyeTuru) ? uyeTuru : [uyeTuru]
    const dbTypes = types.map((t) => (t === 'aktif' ? 'standart' : t))
    query = query.in('uye_turu', dbTypes)
  }

  // Membership dues status filter
  if (aidatDurumu && aidatDurumu !== 'all') {
    const statuses = Array.isArray(aidatDurumu) ? aidatDurumu : [aidatDurumu]
    const dbStatuses = statuses.map((s) =>
      s === 'guncel' ? 'odendi' : s === 'gecmis' ? 'gecikti' : 'beklemede'
    )
    query = query.in('aidat_durumu', dbStatuses)
  }

  // Gender filter
  if (cinsiyet && cinsiyet !== 'all') {
    const genders = Array.isArray(cinsiyet) ? cinsiyet : [cinsiyet]
    query = query.in(
      'cinsiyet',
      genders.map((g) => g.toLowerCase())
    )
  }

  // Blood group filter
  if (kanGrubu && kanGrubu !== 'all') {
    const groups = Array.isArray(kanGrubu) ? kanGrubu : [kanGrubu]
    query = query.in('kan_grubu', groups)
  }

  // Profession filter
  if (meslek && meslek !== 'all') {
    const professions = Array.isArray(meslek) ? meslek : [meslek]
    query = query.in('meslek', professions)
  }

  // City filter
  if (il && il !== 'all') {
    const cities = Array.isArray(il) ? il : [il]
    query = query.in('il', cities)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapMember), count, page, limit)
}

/**
 * ID'ye göre tekil üye getirir
 *
 * @param id - Üye ID
 * @returns Member database row
 */
export async function fetchMember(id: number) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Yeni üye oluşturur
 *
 * @param member - Üye bilgileri
 * @returns Oluşturulan üye
 */
export async function createMember(member: Tables['members']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Üye bilgilerini günceller
 *
 * @param id - Üye ID
 * @param member - Güncellenecek bilgiler
 * @returns Güncellenen üye
 */
export async function updateMember(
  id: number,
  member: Tables['members']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Üye siler
 *
 * @param id - Üye ID
 */
export async function deleteMember(id: number) {
  const supabase = getClient()
  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) throw error
}
