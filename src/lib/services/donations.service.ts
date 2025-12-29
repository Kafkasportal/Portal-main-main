/**
 * Donations Service
 * Bağış yönetimi için CRUD işlemleri
 */

import type { Bagis, PaginatedResponse } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapDonation } from './mappers'

type Tables = Database['public']['Tables']

/**
 * Bağış listesini getirir (sayfalı, filtrelenebilir)
 *
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns Paginated bağış listesi
 */
export async function fetchDonations(options?: {
  page?: number
  limit?: number
  search?: string
  amac?: string
  memberId?: number
}): Promise<PaginatedResponse<Bagis>> {
  const supabase = getClient()
  const { page = 1, limit = 10, search, amac, memberId } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('donations')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('tarih', { ascending: false })

  // Search by donor name
  if (search) {
    query = query.ilike('bagisci_adi', `%${search}%`)
  }

  // Filter by donation purpose
  if (amac) {
    query = query.eq('amac', amac)
  }

  // Filter by member ID
  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapDonation), count, page, limit)
}

/**
 * ID'ye göre tekil bağış getirir
 *
 * @param id - Bağış ID
 * @returns Bağış objesi
 */
export async function fetchDonation(id: number) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapDonation(data)
}

/**
 * Yeni bağış kaydı oluşturur
 *
 * @param donation - Bağış bilgileri
 * @returns Oluşturulan bağış
 */
export async function createDonation(donation: Tables['donations']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()

  if (error) throw error
  return data
}
