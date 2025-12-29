/**
 * Hospital Service
 * Hastane sevkleri, randevular, tedavi maliyetleri ve sonuçları
 * Multi-entity domain - hospitals, referrals, appointments, costs, outcomes
 */

import type { Database } from '@/types/supabase'
import { getClient } from './base.service'
import {
  mapHospital,
  mapReferral,
  mapAppointment,
  mapTreatmentCost,
  mapTreatmentOutcome,
} from './mappers'

type Tables = Database['public']['Tables']

// ============================================
// HOSPITALS
// ============================================

/**
 * Hastane listesini getirir (filtrelenebilir)
 */
export async function fetchHospitals(options?: {
  search?: string
  specialty?: string
}): Promise<import('@/types').Hospital[]> {
  const supabase = getClient()
  let query = supabase
    .from('hospitals')
    .select('*')
    .order('name', { ascending: true })

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.specialty) {
    query = query.contains('specialties', [options.specialty])
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapHospital)
}

/**
 * Yeni hastane oluşturur
 */
export async function createHospital(hospital: Tables['hospitals']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospital)
    .select()
    .single()
  if (error) throw error
  return mapHospital(data)
}

/**
 * Hastane bilgilerini günceller
 */
export async function updateHospital(
  id: string,
  hospital: Tables['hospitals']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('hospitals')
    .update(hospital)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapHospital(data)
}

// ============================================
// REFERRALS (Sevkler)
// ============================================

/**
 * Sevk listesini getirir (filtrelenebilir)
 */
export async function fetchReferrals(options?: {
  beneficiaryId?: string
  hospitalId?: string
  status?: string
}): Promise<import('@/types').Referral[]> {
  const supabase = getClient()
  let query = supabase
    .from('referrals')
    .select('*, beneficiaries(ad, soyad), hospitals(name)')
    .order('created_at', { ascending: false })

  if (options?.beneficiaryId)
    query = query.eq('beneficiary_id', options.beneficiaryId)
  if (options?.hospitalId) query = query.eq('hospital_id', options.hospitalId)
  if (options?.status) query = query.eq('status', options.status)

  const { data, error } = await query
  if (error) throw error

  // Type assertion needed due to Supabase join types
  type ReferralWithJoins = Tables['referrals']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
    hospitals?: { name: string } | null
  }
  return ((data || []) as ReferralWithJoins[]).map(mapReferral)
}

/**
 * ID'ye göre tekil sevk getirir
 */
export async function fetchReferral(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('referrals')
    .select('*, beneficiaries(ad, soyad), hospitals(name)')
    .eq('id', id)
    .single()
  if (error) throw error

  // Type assertion needed due to Supabase join types
  type ReferralWithJoins = Tables['referrals']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
    hospitals?: { name: string } | null
  }
  return mapReferral(data as ReferralWithJoins)
}

/**
 * Yeni sevk oluşturur
 */
export async function createReferral(referral: Tables['referrals']['Insert']) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('referrals')
    .insert(referral)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Sevk bilgilerini günceller
 */
export async function updateReferral(
  id: string,
  referral: Tables['referrals']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('referrals')
    .update(referral)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// APPOINTMENTS (Randevular)
// ============================================

/**
 * Sevke ait randevuları getirir
 */
export async function fetchAppointments(
  referralId: string
): Promise<import('@/types').HospitalAppointment[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('hospital_appointments')
    .select('*')
    .eq('referral_id', referralId)
    .order('appointment_date', { ascending: true })
  if (error) throw error
  return (data || []).map(mapAppointment)
}

/**
 * Yeni randevu oluşturur
 */
export async function createAppointment(
  appointment: Tables['hospital_appointments']['Insert']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('hospital_appointments')
    .insert(appointment)
    .select()
    .single()
  if (error) throw error
  return mapAppointment(data)
}

// ============================================
// TREATMENT COSTS (Tedavi Maliyetleri)
// ============================================

/**
 * Sevke ait tedavi maliyetlerini getirir
 */
export async function fetchTreatmentCosts(
  referralId: string
): Promise<import('@/types').TreatmentCost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('treatment_costs')
    .select('*')
    .eq('referral_id', referralId)
    .order('incurred_date', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTreatmentCost)
}

/**
 * Yeni tedavi maliyeti oluşturur
 */
export async function createTreatmentCost(
  cost: Tables['treatment_costs']['Insert']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('treatment_costs')
    .insert(cost)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentCost(data)
}

// ============================================
// TREATMENT OUTCOMES (Tedavi Sonuçları)
// ============================================

/**
 * Sevke ait tedavi sonuçlarını getirir
 */
export async function fetchTreatmentOutcomes(
  referralId: string
): Promise<import('@/types').TreatmentOutcome[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTreatmentOutcome)
}

/**
 * Yeni tedavi sonucu oluşturur
 */
export async function createTreatmentOutcome(
  outcome: Tables['treatment_outcomes']['Insert']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .insert(outcome)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentOutcome(data)
}

/**
 * Tedavi sonucunu günceller
 */
export async function updateTreatmentOutcome(
  id: string,
  outcome: Tables['treatment_outcomes']['Update']
) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .update(outcome)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentOutcome(data)
}
