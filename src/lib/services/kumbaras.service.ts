/**
 * Kumbaras Service
 * Kumbara (piggy bank) yönetimi için CRUD işlemleri
 */

import type { Kumbara, PaginatedResponse } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapKumbara } from './mappers'

type Tables = Database['public']['Tables']

/**
 * Kumbara listesini getirir (sayfalı, filtrelenebilir)
 *
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns Paginated kumbara listesi
 */
export async function fetchKumbaras(options?: {
  page?: number
  limit?: number
  durum?: string
}): Promise<PaginatedResponse<Kumbara>> {
  const supabase = getClient()
  const { page = 1, limit = 10, durum } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('kumbaras')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  // Filter by status
  if (durum) {
    query = query.eq('durum', durum)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapKumbara), count, page, limit)
}

/**
 * QR koda göre kumbara getirir
 *
 * @param kod - Kumbara QR kodu
 * @returns Kumbara database row
 */
export async function fetchKumbaraByCode(kod: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('kumbaras')
    .select('*')
    .eq('kod', kod)
    .single()

  if (error) throw error
  return data
}

/**
 * Yeni kumbara oluşturur
 *
 * @param kumbara - Kumbara bilgileri
 * @returns Oluşturulan kumbara
 */
export async function createKumbara(kumbara: Tables['kumbaras']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('kumbaras')
    .insert(kumbara)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Kumbara toplamasını kaydeder ve toplam tutarı günceller
 *
 * @param data - Kumbara ID ve toplanan tutar
 * @returns Güncellenen kumbara
 */
export async function collectKumbara(data: { id: number; tutar: number }) {
  const supabase = getClient()
  const { id, tutar } = data

  // Get current kumbara
  const { data: current } = await supabase
    .from('kumbaras')
    .select('toplam_toplanan')
    .eq('id', id)
    .single()

  // Update with collected amount
  const { data: updated, error } = await supabase
    .from('kumbaras')
    .update({
      durum: 'toplandi',
      son_toplama_tarihi: new Date().toISOString(),
      toplam_toplanan: (current?.toplam_toplanan || 0) + tutar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}
