/**
 * Beneficiaries Service
 * İhtiyaç sahipleri yönetimi için CRUD işlemleri
 */

import type { IhtiyacSahibi, PaginatedResponse } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapBeneficiary } from './mappers'

type Tables = Database['public']['Tables']

/**
 * İhtiyaç sahibi listesini getirir (sayfalı, filtrelenebilir)
 *
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns Paginated ihtiyaç sahibi listesi
 */
export async function fetchBeneficiaries(options?: {
  page?: number
  limit?: number
  search?: string
  durum?: string
  ihtiyacDurumu?: string
  kategori?: string
}): Promise<PaginatedResponse<IhtiyacSahibi>> {
  const supabase = getClient()
  const {
    page = 1,
    limit = 10,
    search,
    durum,
    ihtiyacDurumu,
    kategori,
  } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('beneficiaries')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  // Search filter
  if (search) {
    query = query.or(
      `ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`
    )
  }

  // Status filter
  if (durum && durum !== 'all') {
    query = query.eq('durum', durum)
  }

  // Need status filter
  if (ihtiyacDurumu && ihtiyacDurumu !== 'all') {
    query = query.eq('ihtiyac_durumu', ihtiyacDurumu)
  }

  // Category filter
  if (kategori && kategori !== 'all') {
    query = query.eq('kategori', kategori)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse(
    (data || []).map(mapBeneficiary),
    count,
    page,
    limit
  )
}

/**
 * ID'ye göre tekil ihtiyaç sahibi getirir
 *
 * @param id - İhtiyaç sahibi ID
 * @returns İhtiyaç sahibi objesi
 */
export async function fetchBeneficiaryById(id: number): Promise<IhtiyacSahibi> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapBeneficiary(data)
}

/**
 * Yeni ihtiyaç sahibi kaydı oluşturur
 *
 * @param beneficiary - İhtiyaç sahibi bilgileri
 * @returns Oluşturulan kayıt
 */
export async function createBeneficiary(
  beneficiary: Tables['beneficiaries']['Insert']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiary)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * İhtiyaç sahibi bilgilerini günceller
 *
 * @param id - İhtiyaç sahibi ID
 * @param beneficiary - Güncellenecek bilgiler
 * @returns Güncellenen kayıt
 */
export async function updateBeneficiary(
  id: number,
  beneficiary: Tables['beneficiaries']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .update({ ...beneficiary, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Bakmakla yükümlü kişileri getirir
 *
 * @param parentId - Ana ihtiyaç sahibi ID
 * @returns Bakmakla yükümlü kişiler listesi
 */
export async function fetchDependentPersons(
  parentId: number
): Promise<IhtiyacSahibi[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('parent_id', parentId)
    .eq('relationship_type', 'Bakmakla Yükümlü Olunan Kişi')
    .order('ad', { ascending: true })

  if (error) throw error
  return (data || []).map(mapBeneficiary)
}
