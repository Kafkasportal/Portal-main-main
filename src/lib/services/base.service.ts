/**
 * Base Service
 * Tüm servisler için paylaşılan utilities ve helper fonksiyonlar
 */

import type { PaginatedResponse } from '@/types'
import { getSupabaseClient } from '../supabase/client'

/**
 * Supabase client instance'ını döner
 */
export function getClient() {
  return getSupabaseClient()
}

/**
 * Array'i paginated response formatına çevirir
 *
 * @template T - Response data tipi
 * @param data - Data array
 * @param count - Toplam kayıt sayısı
 * @param page - Mevcut sayfa numarası
 * @param pageSize - Sayfa başına kayıt sayısı
 * @returns PaginatedResponse formatında data
 */
export function toPaginatedResponse<T>(
  data: T[],
  count: number | null,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}
