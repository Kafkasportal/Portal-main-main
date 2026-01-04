/**
 * Beneficiary Family Management Service
 * Handles CRUD operations for beneficiary family members/dependents
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import type { FamilyMember } from '@/types'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

// Helper function to map database row to FamilyMember
function mapFamilyMember(db: Tables['beneficiary_family_members']['Row']): FamilyMember {
  return {
    id: db.id,
    beneficiaryId: db.beneficiary_id,
    ad: db.ad,
    soyad: db.soyad,
    tcKimlikNo: db.tc_kimlik_no,
    cinsiyet: (db.cinsiyet as 'erkek' | 'kadın') || 'erkek',
    dogumTarihi: db.dogum_tarihi ? new Date(db.dogum_tarihi) : undefined,
    iliski: (db.iliski as any),
    medeniDurum: (db.medeni_durum as any) || 'belirtilmemiş',
    egitimDurumu: db.egitim_durumu || undefined,
    meslek: db.meslek || undefined,
    gelirDurumu: db.gelir_durumu || undefined,
    aciklama: db.aciklama || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

// ============================================
// FETCH FAMILY MEMBERS
// ============================================

/**
 * Fetch all family members for a beneficiary
 */
export async function fetchFamilyMembers(
  beneficiaryId: number
): Promise<FamilyMember[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapFamilyMember)
}

/**
 * Fetch a specific family member by ID
 */
export async function fetchFamilyMember(id: number): Promise<FamilyMember> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapFamilyMember(data)
}

/**
 * Search family members by name or TC Kimlik No
 */
export async function searchFamilyMembers(
  search: string
): Promise<FamilyMember[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .select(`
      *,
      beneficiaries!inner(ad, soyad)
    `)
    .or(
      `ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapFamilyMember)
}

// ============================================
// CREATE FAMILY MEMBER
// ============================================

/**
 * Add a new family member to a beneficiary
 */
export async function addFamilyMember(
  member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FamilyMember> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .insert({
      beneficiary_id: member.beneficiaryId,
      ad: member.ad,
      soyad: member.soyad,
      tc_kimlik_no: member.tcKimlikNo,
      cinsiyet: member.cinsiyet,
      dogum_tarihi: member.dogumTarihi?.toISOString().split('T')[0],
      iliski: member.iliski,
      medeni_durum: member.medeniDurum,
      egitim_durumu: member.egitimDurumu,
      meslek: member.meslek,
      gelir_durumu: member.gelirDurumu,
      aciklama: member.aciklama,
    })
    .select()
    .single()

  if (error) throw error
  return mapFamilyMember(data)
}

// ============================================
// UPDATE FAMILY MEMBER
// ============================================

/**
 * Update an existing family member
 */
export async function updateFamilyMember(
  id: number,
  updates: Partial<Omit<FamilyMember, 'id' | 'beneficiaryId' | 'createdAt' | 'updatedAt'>>
): Promise<FamilyMember> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .update({
      ...(updates.ad && { ad: updates.ad }),
      ...(updates.soyad && { soyad: updates.soyad }),
      ...(updates.tcKimlikNo && { tc_kimlik_no: updates.tcKimlikNo }),
      ...(updates.cinsiyet && { cinsiyet: updates.cinsiyet }),
      ...(updates.dogumTarihi && { 
        dogum_tarihi: updates.dogumTarihi.toISOString().split('T')[0] 
      }),
      ...(updates.iliski && { iliski: updates.iliski }),
      ...(updates.medeniDurum && { medeni_durum: updates.medeniDurum }),
      ...(updates.egitimDurumu && { egitim_durumu: updates.egitimDurumu }),
      ...(updates.meslek && { meslek: updates.meslek }),
      ...(updates.gelirDurumu && { gelir_durumu: updates.gelirDurumu }),
      ...(updates.aciklama && { aciklama: updates.aciklama }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapFamilyMember(data)
}

// ============================================
// DELETE FAMILY MEMBER
// ============================================

/**
 * Delete a family member
 */
export async function deleteFamilyMember(id: number): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('beneficiary_family_members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Delete all family members for a beneficiary
 */
export async function deleteAllFamilyMembers(beneficiaryId: number): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('beneficiary_family_members')
    .delete()
    .eq('beneficiary_id', beneficiaryId)

  if (error) throw error
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Add multiple family members at once
 */
export async function batchAddFamilyMembers(
  members: Array<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<FamilyMember[]> {
  const supabase = getSupabaseClient()
  
  const inserts = members.map(member => ({
    beneficiary_id: member.beneficiaryId,
    ad: member.ad,
    soyad: member.soyad,
    tc_kimlik_no: member.tcKimlikNo,
    cinsiyet: member.cinsiyet,
    dogum_tarihi: member.dogumTarihi?.toISOString().split('T')[0],
    iliski: member.iliski,
    medeni_durum: member.medeniDurum,
    egitim_durumu: member.egitimDurumu,
    meslek: member.meslek,
    gelir_durumu: member.gelirDurumu,
    aciklama: member.aciklama,
  }))

  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .insert(inserts)
    .select()

  if (error) throw error
  return (data || []).map(mapFamilyMember)
}

// ============================================
// ANALYTICS & REPORTS
// ============================================

/**
 * Get family composition summary
 */
export async function getFamilyCompositionSummary(beneficiaryId: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiary_family_members')
    .select('iliski, medeni_durum, cinsiyet, egitim_durumu, meslek, gelir_durumu')
    .eq('beneficiary_id', beneficiaryId)

  if (error) throw error
  if (!data || data.length === 0) {
    return {
      total: 0,
      byRelationship: {},
      byMaritalStatus: {},
      byGender: {},
      byEducation: {},
      byEmployment: {},
      byOccupation: {},
    }
  }

  return {
    total: data.length,
    byRelationship: data.reduce((acc, m) => {
      acc[m.iliski] = (acc[m.iliski] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byMaritalStatus: data.reduce((acc, m) => {
      acc[m.medeni_durum || 'belirtilmemiş'] = (acc[m.medeni_durum || 'belirtilmemiş'] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byGender: data.reduce((acc, m) => {
      acc[m.cinsiyet || 'belirtilmemiş'] = (acc[m.cinsiyet || 'belirtilmemiş'] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byEducation: data.reduce((acc, m) => {
      acc[m.egitim_durumu || 'belirtilmemiş'] = (acc[m.egitim_durumu || 'belirtilmemiş'] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byEmployment: data.reduce((acc, m) => {
      acc[m.gelir_durumu || 'belirtilmemiş'] = (acc[m.gelir_durumu || 'belirtilmemiş'] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byOccupation: data.reduce((acc, m) => {
      if (m.meslek) {
        acc[m.meslek] = (acc[m.meslek] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>),
  }
}

/**
 * Check for duplicate aid recipients based on family members
 */
export async function checkDuplicateRecipients(tcKimlikNumbers: string[]): Promise<string[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('social_aid_applications')
    .select('basvuran_tc_kimlik_no, basvuran_ad, basvuran_soyad')
    .in('basvuran_tc_kimlik_no', tcKimlikNumbers)

  if (error) throw error
  if (!data || data.length === 0) return []

  return data
    .filter(app => app.durum !== 'reddedildi')
    .map(app => {
      const fullName = `${app.basvuran_ad || ''} ${app.basvuran_soyad || ''}`.trim()
      return `${app.basvuran_tc_kimlik_no}: ${fullName} - Yardım başvurusu mevcut`
    })
}

/**
 * Find beneficiaries with multiple family members receiving aid
 */
export async function findBeneficiariesWithMultipleAidRecipients(): Promise<any[]> {
  const supabase = getSupabaseClient()
  
  // Get family members that have received aid
  const { data: familyMembers, error: fmError } = await supabase
    .from('beneficiary_family_members')
    .select('beneficiary_id, ad, soyad, tc_kimlik_no')
    .order('created_at', { ascending: false })

  if (fmError) throw fmError

  // Count how many family members each beneficiary has
  const memberCountByBeneficiary = familyMembers?.reduce((acc, member) => {
    if (!member.beneficiary_id) return acc
    acc[member.beneficiary_id] = (acc[member.beneficiary_id] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Get beneficiary details
  const beneficiaryIds = Object.keys(memberCountByBeneficiary).map(Number)
  
  if (beneficiaryIds.length === 0) return []

  const { data: beneficiaries, error: bError } = await supabase
    .from('beneficiaries')
    .select('id, ad, soyad, tc_kimlik_no, telefon, adres')
    .in('id', beneficiaryIds)

  if (bError) throw bError

  // Combine and return
  return (beneficiaries || []).map(b => {
    const count = memberCountByBeneficiary[b.id] || 0
    return {
      id: b.id,
      ad: b.ad,
      soyad: b.soyad,
      tcKimlikNo: b.tc_kimlik_no,
      telefon: b.telefon,
      adres: b.adres,
      familyMemberCount: count,
      warning: count > 3 ? 'Birden fazla aile üyesi yardım alıyor' : undefined,
    }
  })
}


