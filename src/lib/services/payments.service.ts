/**
 * Payments Service
 * Ödeme yönetimi ve finansal raporlama
 */

import type {
  CashSummary,
  PaginatedResponse,
  Payment,
} from '@/types'
import type { Database } from '@/types/supabase'
import { getClient, toPaginatedResponse } from './base.service'
import { mapPayment } from './mappers'

type Tables = Database['public']['Tables']

/**
 * Ödeme listesini getirir (sayfalı, filtrelenebilir)
 */
export async function fetchPayments(options?: {
  page?: number
  limit?: number
  durum?: string
  startDate?: string
  endDate?: string
  odemeYontemi?: string
}): Promise<PaginatedResponse<Payment>> {
  const supabase = getClient()
  const {
    page = 1,
    limit = 10,
    durum,
    startDate,
    endDate,
    odemeYontemi,
  } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('payments')
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `,
      { count: 'exact' }
    )
    .range(from, to)
    .order('odeme_tarihi', { ascending: false })

  if (durum) {
    query = query.eq('durum', durum)
  }

  if (startDate) {
    query = query.gte('odeme_tarihi', startDate)
  }

  if (endDate) {
    query = query.lte('odeme_tarihi', endDate)
  }

  if (odemeYontemi) {
    query = query.eq('odeme_yontemi', odemeYontemi)
  }

  const { data, error, count } = await query

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toPaginatedResponse((data || []).map(mapPayment as any), count, page, limit)
}

/**
 * ID'ye göre tekil ödeme getirir
 */
export async function fetchPaymentById(id: number): Promise<Payment | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
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
  return mapPayment(data as any)
}

/**
 * Tarih aralığına göre tüm ödemeleri getirir
 */
export async function fetchPaymentsByDateRange(
  startDate: string,
  endDate: string
): Promise<Payment[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .gte('odeme_tarihi', startDate)
    .lte('odeme_tarihi', endDate)
    .order('odeme_tarihi', { ascending: true })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map(mapPayment as any)
}

/**
 * Günlük nakit özeti
 */
export async function fetchDailyCashSummary(date: string): Promise<CashSummary> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .select('tutar, odeme_yontemi')
    .eq('odeme_tarihi', date)
    .eq('durum', 'tamamlandi')

  if (error) throw error

  const nakit = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'nakit').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0
  const havale = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'havale').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0
  const elden = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'elden').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0

  return {
    toplamTutar: nakit + havale + elden,
    nakitTutar: nakit,
    havaleTutar: havale,
    eldenTutar: elden,
    odemeSayisi: data?.length || 0,
    tarih: new Date(),
  }
}

/**
 * Aylık nakit özeti
 */
export async function fetchMonthlyCashSummary(year: number, month: number): Promise<CashSummary> {
  const supabase = getClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  const { data, error } = await supabase
    .from('payments')
    .select('tutar, odeme_yontemi')
    .gte('odeme_tarihi', startDate)
    .lte('odeme_tarihi', endDate)
    .eq('durum', 'tamamlandi')

  if (error) throw error

  const nakit = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'nakit').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0
  const havale = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'havale').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0
  const elden = data?.filter((p: { odeme_yontemi: string }) => p.odeme_yontemi === 'elden').reduce((sum: number, p: { tutar: number }) => sum + p.tutar, 0) || 0

  return {
    toplamTutar: nakit + havale + elden,
    nakitTutar: nakit,
    havaleTutar: havale,
    eldenTutar: elden,
    odemeSayisi: data?.length || 0,
    tarih: new Date(),
  }
}

/**
 * Yeni ödeme kaydı oluşturur
 */
export async function createPayment(payment: Tables['payments']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Ödeme bilgilerini günceller
 */
export async function updatePayment(
  id: number,
  payment: Tables['payments']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .update({ ...payment, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Ödeme kaydını siler
 */
export async function deletePayment(id: number) {
  const supabase = getClient()
  const { error } = await supabase.from('payments').delete().eq('id', id)

  if (error) throw error
}
