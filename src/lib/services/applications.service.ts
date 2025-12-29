/**
 * Applications Service
 * Sosyal yardım başvurularını yönetimi için işlemler
 */

import type {
  BasvuruDurumu,
  PaginatedResponse,
  SosyalYardimBasvuru,
} from '@/types'
import { getClient, toPaginatedResponse } from './base.service'
import { mapApplication } from './mappers'

/**
 * Sosyal yardım başvuru listesini getirir (sayfalı, filtrelenebilir)
 *
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns Paginated başvuru listesi
 */
export async function fetchApplications(options?: {
  page?: number
  limit?: number
  durum?: string
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
  const supabase = getClient()
  const { page = 1, limit = 10, durum } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('social_aid_applications')
    .select(
      `
      *,
      beneficiaries (ad, soyad, telefon)
    `,
      { count: 'exact' }
    )
    .range(from, to)
    .order('basvuru_tarihi', { ascending: false })

  // Status filter
  if (durum) {
    query = query.eq('durum', durum)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).map(mapApplication as any),
    count,
    page,
    limit
  )
}

/**
 * ID'ye göre tekil başvuru getirir
 *
 * @param id - Başvuru ID
 * @returns Başvuru objesi veya null
 */
export async function fetchApplicationById(
  id: number
): Promise<SosyalYardimBasvuru | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('social_aid_applications')
    .select(
      `
      *,
      beneficiaries (ad, soyad, telefon, tc_kimlik_no, adres)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  if (!data) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapApplication(data as any)
}

/**
 * Başvuru durumunu günceller
 *
 * @param id - Başvuru ID
 * @param durum - Yeni durum
 * @param onaylananTutar - Onaylanan tutar (opsiyonel)
 * @returns Güncellenen başvuru
 */
export async function updateApplicationStatus(
  id: number,
  durum: BasvuruDurumu,
  onaylananTutar?: number
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('social_aid_applications')
    .update({
      durum: durum as string,
      onaylanan_tutar: onaylananTutar,
      degerlendirme_tarihi: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
