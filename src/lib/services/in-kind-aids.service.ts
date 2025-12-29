/**
 * In-Kind Aids Service
 * Ayni yardım (gıda, giysi vb.) yönetimi
 */

import type { InKindAid, PaginatedResponse } from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapInKindAid } from './mappers'

type Tables = Database['public']['Tables']

/**
 * Ayni yardım listesini getirir (sayfalı, filtrelenebilir)
 */
export async function fetchInKindAids(options?: {
  page?: number
  limit?: number
  yardimTuru?: string
  startDate?: string
  endDate?: string
}): Promise<PaginatedResponse<InKindAid>> {
  const supabase = getClient()
  const {
    page = 1,
    limit = 10,
    yardimTuru,
    startDate,
    endDate,
  } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('in_kind_aids')
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `,
      { count: 'exact' }
    )
    .range(from, to)
    .order('dagitim_tarihi', { ascending: false })

  if (yardimTuru) {
    query = query.eq('yardim_turu', yardimTuru)
  }

  if (startDate) {
    query = query.gte('dagitim_tarihi', startDate)
  }

  if (endDate) {
    query = query.lte('dagitim_tarihi', endDate)
  }

  const { data, error, count } = await query

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toPaginatedResponse((data || []).map(mapInKindAid as any), count, page, limit)
}

/**
 * ID'ye göre tekil ayni yardım kaydı getirir
 */
export async function fetchInKindAidById(id: number): Promise<InKindAid | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('in_kind_aids')
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapInKindAid(data as any)
}

/**
 * Yeni ayni yardım kaydı oluşturur
 */
export async function createInKindAid(aid: Tables['in_kind_aids']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('in_kind_aids')
    .insert(aid)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Ayni yardım kaydını günceller
 */
export async function updateInKindAid(
  id: number,
  aid: Tables['in_kind_aids']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('in_kind_aids')
    .update({ ...aid, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Ayni yardım kaydını siler
 */
export async function deleteInKindAid(id: number) {
  const supabase = getClient()
  const { error } = await supabase.from('in_kind_aids').delete().eq('id', id)

  if (error) throw error
}
