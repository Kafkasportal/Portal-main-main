/**
 * Supabase Service
 * Central service for all Supabase operations
 *
 * NOTE: This file is being refactored into modular services.
 * New services are in src/lib/services/
 * Backward compatibility is maintained via re-exports below.
 */

// ==================================================
// NOTE: Functions are defined in this file.
// Modular services in src/lib/services/ import from here.
// ==================================================
import type {
  AidatDurumu,
  Bagis,
  BasvuruDurumu,
  BeneficiaryDocument,
  CashSummary,
  CategorySummary,
  Cinsiyet,
  Currency,
  DocumentType,
  DonationPurpose,
  EgitimDurumu,
  FinancialSummary,
  IhtiyacDurumu,
  IhtiyacSahibi,
  IhtiyacSahibiKategori,
  IhtiyacSahibiTuru,
  IncomeExpenseReport,
  InKindAid,
  Kumbara,
  KumbaraStatus,
  MedeniHal,
  NotificationPreferences,
  PaginatedResponse,
  Payment,
  PaymentMethod,
  PaymentStatus,
  SosyalYardimBasvuru,
  User,
  Uye,
  UyeTuru,
  YardimTuru,
} from '@/types'
import type { Database } from '@/types/supabase'
import crypto from 'crypto'
import { getSupabaseClient } from './supabase/client'

type Tables = Database['public']['Tables']

function toPaginatedResponse<T>(
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

function mapMember(db: Tables['members']['Row']): Uye {
  return {
    id: db.id,
    tcKimlikNo: db.tc_kimlik_no,
    ad: db.ad,
    soyad: db.soyad,
    dogumTarihi: db.dogum_tarihi ? new Date(db.dogum_tarihi) : new Date(),
    cinsiyet: db.cinsiyet as Cinsiyet,
    telefon: db.telefon,
    email: db.email || undefined,
    adres: {
      il: db.il || '',
      ilce: db.ilce || '',
      mahalle: '',
      acikAdres: db.adres || '',
    },
    uyeTuru: (db.uye_turu === 'standart' ? 'aktif' : db.uye_turu) as UyeTuru,
    uyeNo: '',
    kayitTarihi: db.kayit_tarihi ? new Date(db.kayit_tarihi) : new Date(),
    aidatDurumu: (db.aidat_durumu === 'odendi'
      ? 'guncel'
      : db.aidat_durumu === 'gecikti'
        ? 'gecmis'
        : 'muaf') as AidatDurumu,
    kanGrubu: db.kan_grubu || undefined,
    meslek: db.meslek || undefined,
    aidat: {
      tutar: 0,
    },
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapDonation(db: Tables['donations']['Row']): Bagis {
  return {
    id: db.id,
    bagisci: {
      id: db.member_id || db.id,
      ad: db.bagisci_adi || '',
      soyad: '',
    },
    tutar: db.tutar,
    currency: db.currency as Currency,
    amac: db.amac as DonationPurpose,
    odemeYontemi: (db.odeme_yontemi === 'kredi_karti'
      ? 'kredi-karti'
      : db.odeme_yontemi) as PaymentMethod,
    durum: 'tamamlandi' as PaymentStatus,
    createdAt: new Date(db.tarih || db.created_at),
    updatedAt: new Date(db.created_at),
  }
}

function mapApplication(
  db: Tables['social_aid_applications']['Row'] & {
    beneficiaries?: Tables['beneficiaries']['Row']
  }
): SosyalYardimBasvuru {
  return {
    id: db.id,
    basvuranKisi: {
      ad: db.beneficiaries?.ad || '',
      soyad: db.beneficiaries?.soyad || '',
      tcKimlikNo: db.beneficiaries?.tc_kimlik_no || '',
      telefon: db.beneficiaries?.telefon || '',
      adres: db.beneficiaries?.adres || '',
    },
    yardimTuru: db.yardim_turu as YardimTuru,
    talepEdilenTutar: db.talep_edilen_tutar || undefined,
    gerekce: db.gerekce || '',
    belgeler: [],
    durum: (db.durum || 'beklemede') as BasvuruDurumu,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapKumbara(db: Tables['kumbaras']['Row']): Kumbara {
  return {
    id: db.id,
    kod: db.kod,
    ad: db.kod, // Use kod as ad if not exists in DB
    konum: db.konum || '',
    koordinat: undefined,
    qrKod: {
      kod: db.kod,
      tapilanTarih: db.created_at ? new Date(db.created_at) : undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sorumlu: { id: db.sorumlu_id, name: 'Sorumlu' } as any,
    toplamTutar: db.toplam_toplanan || 0,
    toplamaBaşarina: db.toplam_toplanan || 0,
    toplamaGecmisi: [],
    durum: (db.durum === 'toplandi' ? 'pasif' : db.durum) as KumbaraStatus,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

// Row type aliases for type safety
// BeneficiaryRow extends database row with additional fields that may exist
type BeneficiaryRow = Tables['beneficiaries']['Row'] & {
  relationship_type?: string | null
}

// Helper to map DB beneficiary to IhtiyacSahibi type
function mapBeneficiary(db: BeneficiaryRow): IhtiyacSahibi {
  return {
    id: db.id,
    ad: db.ad || '',
    soyad: db.soyad || '',
    tcKimlikNo: db.tc_kimlik_no || '',
    yabanciKimlikNo: '',
    tur: (db.relationship_type === 'İhtiyaç Sahibi Kişi'
      ? 'ihtiyac-sahibi-kisi'
      : 'bakmakla-yukumlu') as IhtiyacSahibiTuru,
    kategori: (db.kategori || 'ihtiyac-sahibi-aile') as IhtiyacSahibiKategori,
    dogumTarihi: db.dogum_tarihi ? new Date(db.dogum_tarihi) : new Date(),
    cinsiyet: (db.cinsiyet || 'belirtilmemis') as Cinsiyet,
    uyruk: 'Türkiye',
    cepTelefonu: db.telefon || '',
    cepTelefonuOperator: '',
    email: db.email || '',
    ulke: 'Türkiye',
    sehir: db.il || '',
    ilce: db.ilce || '',
    mahalle: '',
    adres: db.adres || '',
    dosyaNo: db.tc_kimlik_no || '',
    kayitTarihi: new Date(db.created_at),
    durum: (db.durum || 'aktif') as IhtiyacDurumu,
    ihtiyacDurumu: (db.ihtiyac_durumu || 'orta') as string,
    basvuruSayisi: 0,
    yardimSayisi: 0,
    rizaBeyaniDurumu: 'alindi',
    toplamYardimTutari: 0,
    aileHaneBilgileri: {
      medeniHal: (db.medeni_hal || 'belirtilmemis') as MedeniHal,
      ailedekiKisiSayisi: db.hane_buyuklugu || 1,
      cocukSayisi: 0,
      yetimSayisi: 0,
      calısanSayisi: 0,
      bakmaklaYukumluSayisi: 0,
    },
    ekonomikSosyalDurum: {
      meslek: db.meslek || '',
      aylikGelir: Number(db.aylik_gelir) || 0,
      egitimDurumu: (db.egitim_durumu || 'belirtilmemis') as EgitimDurumu,
    },
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  } as IhtiyacSahibi
}

// ============================================
// MEMBERS
// ============================================
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
}): Promise<PaginatedResponse<import('@/types').Uye>> {
  const supabase = getSupabaseClient()
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

  if (search) {
    query = query.or(
      `ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`
    )
  }

  if (uyeTuru && uyeTuru !== 'all') {
    const types = Array.isArray(uyeTuru) ? uyeTuru : [uyeTuru]
    const dbTypes = types.map((t) => (t === 'aktif' ? 'standart' : t))
    query = query.in('uye_turu', dbTypes)
  }

  if (aidatDurumu && aidatDurumu !== 'all') {
    const statuses = Array.isArray(aidatDurumu) ? aidatDurumu : [aidatDurumu]
    const dbStatuses = statuses.map((s) =>
      s === 'guncel' ? 'odendi' : s === 'gecmis' ? 'gecikti' : 'beklemede'
    )
    query = query.in('aidat_durumu', dbStatuses)
  }

  if (cinsiyet && cinsiyet !== 'all') {
    const genders = Array.isArray(cinsiyet) ? cinsiyet : [cinsiyet]
    query = query.in(
      'cinsiyet',
      genders.map((g) => g.toLowerCase())
    )
  }

  if (kanGrubu && kanGrubu !== 'all') {
    const groups = Array.isArray(kanGrubu) ? kanGrubu : [kanGrubu]
    query = query.in('kan_grubu', groups)
  }

  if (meslek && meslek !== 'all') {
    const professions = Array.isArray(meslek) ? meslek : [meslek]
    query = query.in('meslek', professions)
  }

  if (il && il !== 'all') {
    const cities = Array.isArray(il) ? il : [il]
    query = query.in('il', cities)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapMember), count, page, limit)
}

export async function fetchMember(id: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMember(member: Tables['members']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMember(
  id: number,
  member: Tables['members']['Update']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMember(id: number) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// DONATIONS
// ============================================
export async function fetchDonations(options?: {
  page?: number
  limit?: number
  search?: string
  amac?: string
  memberId?: number
}): Promise<PaginatedResponse<import('@/types').Bagis>> {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, search, amac, memberId } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('donations')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('tarih', { ascending: false })

  if (search) {
    query = query.ilike('bagisci_adi', `%${search}%`)
  }

  if (amac) {
    query = query.eq('amac', amac)
  }

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapDonation), count, page, limit)
}

export async function fetchDonation(id: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapDonation(data)
}

export async function createDonation(donation: Tables['donations']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// BENEFICIARIES
// ============================================
export async function fetchBeneficiaries(options?: {
  page?: number
  limit?: number
  search?: string
  durum?: string
  ihtiyacDurumu?: string
  kategori?: string
}): Promise<PaginatedResponse<IhtiyacSahibi>> {
  const supabase = getSupabaseClient()
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

  if (search) {
    query = query.or(
      `ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`
    )
  }

  if (durum && durum !== 'all') {
    query = query.eq('durum', durum)
  }

  if (ihtiyacDurumu && ihtiyacDurumu !== 'all') {
    query = query.eq('ihtiyac_durumu', ihtiyacDurumu)
  }

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

export async function fetchBeneficiaryById(id: number): Promise<IhtiyacSahibi> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapBeneficiary(data)
}

export async function createBeneficiary(
  beneficiary: Tables['beneficiaries']['Insert']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiary)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBeneficiary(
  id: number,
  beneficiary: Tables['beneficiaries']['Update']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .update({ ...beneficiary, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchDependentPersons(
  parentId: number
): Promise<IhtiyacSahibi[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('parent_id', parentId)
    .eq('relationship_type', 'Bakmakla Yükümlü Olunan Kişi')
    .order('ad', { ascending: true })

  if (error) throw error
  return (data || []).map(mapBeneficiary)
}
// ============================================
// KUMBARAS
// ============================================
export async function fetchKumbaras(options?: {
  page?: number
  limit?: number
  durum?: string
}): Promise<PaginatedResponse<Kumbara>> {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, durum } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('kumbaras')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (durum) {
    query = query.eq('durum', durum)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapKumbara), count, page, limit)
}
export async function fetchKumbaraByCode(kod: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('kumbaras')
    .select('*')
    .eq('kod', kod)
    .single()

  if (error) throw error
  return data
}

export async function createKumbara(kumbara: Tables['kumbaras']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('kumbaras')
    .insert(kumbara)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function collectKumbara(data: { id: number; tutar: number }) {
  const supabase = getSupabaseClient()
  const { id, tutar } = data

  // Get current kumbara
  const { data: current } = await supabase
    .from('kumbaras')
    .select('toplam_toplanan')
    .eq('id', id)
    .single()

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

// ============================================
// SOCIAL AID APPLICATIONS
// ============================================
export async function fetchApplications(options?: {
  page?: number
  limit?: number
  durum?: string
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
  const supabase = getSupabaseClient()
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

// Fetch single application by ID
export async function fetchApplicationById(
  id: number
): Promise<SosyalYardimBasvuru | null> {
  const supabase = getSupabaseClient()
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

  // Map to SosyalYardimBasvuru type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapApplication(data as any)
}

export async function updateApplicationStatus(
  id: number,
  durum: BasvuruDurumu,
  onaylananTutar?: number
) {
  const supabase = getSupabaseClient()
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

// ============================================
// PAYMENTS
// ============================================

function mapPayment(
  db: Tables['payments']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
  }
): Payment {
  return {
    id: db.id,
    applicationId: db.application_id || undefined,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? {
          ad: db.beneficiaries.ad,
          soyad: db.beneficiaries.soyad,
        }
      : undefined,
    tutar: db.tutar,
    odemeTarihi: new Date(db.odeme_tarihi),
    odemeYontemi: db.odeme_yontemi as Payment['odemeYontemi'],
    durum: db.durum as Payment['durum'],
    notlar: db.notlar || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.created_at),
  }
}

export async function fetchPayments(options?: {
  page?: number
  limit?: number
  durum?: string
  startDate?: string
  endDate?: string
  odemeYontemi?: string
}): Promise<PaginatedResponse<Payment>> {
  const supabase = getSupabaseClient()
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

  return toPaginatedResponse((data || []).map(mapPayment), count, page, limit)
}

export async function fetchPaymentById(id: number): Promise<Payment> {
  const supabase = getSupabaseClient()
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

  if (error) throw error
  return mapPayment(data)
}

export async function fetchPaymentsByDateRange(
  startDate: string,
  endDate: string
): Promise<Payment[]> {
  const supabase = getSupabaseClient()
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
    .order('odeme_tarihi', { ascending: false })

  if (error) throw error
  return (data || []).map(mapPayment)
}

export async function fetchDailyCashSummary(
  date: string
): Promise<CashSummary> {
  const supabase = getSupabaseClient()
  const startOfDay = `${date}T00:00:00`
  const endOfDay = `${date}T23:59:59`

  type PaymentRow = { tutar: number; odeme_yontemi: string; durum: string }

  const { data, error } = await supabase
    .from('payments')
    .select('tutar, odeme_yontemi, durum')
    .gte('odeme_tarihi', startOfDay)
    .lte('odeme_tarihi', endOfDay)
    .eq('durum', 'odendi')

  if (error) throw error

  const payments: PaymentRow[] = data || []
  const toplamTutar = payments.reduce((sum, p) => sum + (p.tutar || 0), 0)
  const nakitTutar = payments
    .filter((p) => p.odeme_yontemi === 'nakit')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)
  const havaleTutar = payments
    .filter((p) => p.odeme_yontemi === 'havale')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)
  const eldenTutar = payments
    .filter((p) => p.odeme_yontemi === 'elden')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)

  return {
    toplamTutar,
    nakitTutar,
    havaleTutar,
    eldenTutar,
    odemeSayisi: payments.length,
    tarih: new Date(date),
  }
}

export async function fetchMonthlyCashSummary(
  year: number,
  month: number
): Promise<CashSummary> {
  const supabase = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  type PaymentRow = { tutar: number; odeme_yontemi: string; durum: string }

  const { data, error } = await supabase
    .from('payments')
    .select('tutar, odeme_yontemi, durum')
    .gte('odeme_tarihi', startDate)
    .lte('odeme_tarihi', endDate)
    .eq('durum', 'odendi')

  if (error) throw error

  const payments: PaymentRow[] = data || []
  const toplamTutar = payments.reduce((sum, p) => sum + (p.tutar || 0), 0)
  const nakitTutar = payments
    .filter((p) => p.odeme_yontemi === 'nakit')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)
  const havaleTutar = payments
    .filter((p) => p.odeme_yontemi === 'havale')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)
  const eldenTutar = payments
    .filter((p) => p.odeme_yontemi === 'elden')
    .reduce((sum, p) => sum + (p.tutar || 0), 0)

  return {
    toplamTutar,
    nakitTutar,
    havaleTutar,
    eldenTutar,
    odemeSayisi: payments.length,
    tarih: new Date(year, month - 1, 1),
  }
}

export async function createPayment(
  payment: Tables['payments']['Insert']
): Promise<Payment> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .single()

  if (error) throw error
  return mapPayment(data)
}

export async function updatePayment(
  id: number,
  payment: Tables['payments']['Update']
): Promise<Payment> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('payments')
    .update(payment)
    .eq('id', id)
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .single()

  if (error) throw error
  return mapPayment(data)
}

export async function deletePayment(id: number): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('payments').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// FINANCIAL ANALYSIS
// ============================================

export async function fetchFinancialSummary(
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary> {
  const supabase = getSupabaseClient()

  // Date range defaults to current month
  const now = new Date()
  const start = startDate
    ? new Date(startDate)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endDate ? new Date(endDate) : now

  const startStr = start.toISOString().split('T')[0]
  const endStr = end.toISOString().split('T')[0]

  // Previous month for comparison
  const prevStart = new Date(start)
  prevStart.setMonth(prevStart.getMonth() - 1)
  const prevEnd = new Date(end)
  prevEnd.setMonth(prevEnd.getMonth() - 1)
  const prevStartStr = prevStart.toISOString().split('T')[0]
  const prevEndStr = prevEnd.toISOString().split('T')[0]

  // Fetch income (donations)
  const { data: donations } = await supabase
    .from('donations')
    .select('tutar')
    .gte('tarih', startStr)
    .lte('tarih', endStr)

  // Fetch expenses (payments)
  const { data: payments } = await supabase
    .from('payments')
    .select('tutar')
    .eq('durum', 'odendi')
    .gte('odeme_tarihi', startStr)
    .lte('odeme_tarihi', endStr)

  // Previous month data
  const { data: prevDonations } = await supabase
    .from('donations')
    .select('tutar')
    .gte('tarih', prevStartStr)
    .lte('tarih', prevEndStr)

  const { data: prevPayments } = await supabase
    .from('payments')
    .select('tutar')
    .eq('durum', 'odendi')
    .gte('odeme_tarihi', prevStartStr)
    .lte('odeme_tarihi', prevEndStr)

  const toplamGelir =
    donations?.reduce(
      (sum: number, d: { tutar?: number | null }) => sum + (d.tutar || 0),
      0
    ) || 0
  const toplamGider =
    payments?.reduce(
      (sum: number, p: { tutar?: number | null }) => sum + (p.tutar || 0),
      0
    ) || 0
  const netBakiye = toplamGelir - toplamGider

  const buAyGelir = toplamGelir
  const buAyGider = toplamGider

  const gecenAyGelir =
    prevDonations?.reduce(
      (sum: number, d: { tutar?: number | null }) => sum + (d.tutar || 0),
      0
    ) || 0
  const gecenAyGider =
    prevPayments?.reduce(
      (sum: number, p: { tutar?: number | null }) => sum + (p.tutar || 0),
      0
    ) || 0

  const gelirArtis =
    gecenAyGelir > 0 ? ((buAyGelir - gecenAyGelir) / gecenAyGelir) * 100 : 0
  const giderArtis =
    gecenAyGider > 0 ? ((buAyGider - gecenAyGider) / gecenAyGider) * 100 : 0

  return {
    toplamGelir,
    toplamGider,
    netBakiye,
    buAyGelir,
    buAyGider,
    gecenAyGelir,
    gecenAyGider,
    gelirArtis,
    giderArtis,
  }
}

export async function fetchIncomeExpenseReport(
  startDate: string,
  endDate: string
): Promise<IncomeExpenseReport[]> {
  const supabase = getSupabaseClient()

  // Fetch donations grouped by date
  const { data: donations } = await supabase
    .from('donations')
    .select('tutar, tarih')
    .gte('tarih', startDate)
    .lte('tarih', endDate)
    .order('tarih', { ascending: true })

  // Fetch payments grouped by date
  const { data: payments } = await supabase
    .from('payments')
    .select('tutar, odeme_tarihi')
    .eq('durum', 'odendi')
    .gte('odeme_tarihi', startDate)
    .lte('odeme_tarihi', endDate)
    .order('odeme_tarihi', { ascending: true })

  // Group by date
  const reportMap = new Map<string, { gelir: number; gider: number }>()

  donations?.forEach((d: { tutar?: number | null; tarih: string }) => {
    const date = d.tarih.split('T')[0]
    const current = reportMap.get(date) || { gelir: 0, gider: 0 }
    reportMap.set(date, {
      ...current,
      gelir: current.gelir + (d.tutar || 0),
    })
  })

  payments?.forEach((p: { tutar?: number | null; odeme_tarihi: string }) => {
    const date = p.odeme_tarihi.split('T')[0]
    const current = reportMap.get(date) || { gelir: 0, gider: 0 }
    reportMap.set(date, {
      ...current,
      gider: current.gider + (p.tutar || 0),
    })
  })

  return Array.from(reportMap.entries())
    .map(([date, { gelir, gider }]) => ({
      tarih: new Date(date),
      gelir,
      gider,
      net: gelir - gider,
    }))
    .sort((a, b) => a.tarih.getTime() - b.tarih.getTime())
}

export async function fetchIncomeByCategory(
  startDate?: string,
  endDate?: string
): Promise<CategorySummary[]> {
  const supabase = getSupabaseClient()

  const start =
    startDate ||
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  const end = endDate || new Date().toISOString().split('T')[0]

  const { data: donations } = await supabase
    .from('donations')
    .select('tutar, amac')
    .gte('tarih', start)
    .lte('tarih', end)

  if (!donations) return []

  const categoryMap = new Map<string, number>()
  let total = 0

  donations.forEach((d: { tutar?: number | null; amac?: string }) => {
    const category = d.amac || 'genel'
    const current = categoryMap.get(category) || 0
    categoryMap.set(category, current + (d.tutar || 0))
    total += d.tutar || 0
  })

  return Array.from(categoryMap.entries())
    .map(([kategori, tutar]) => ({
      kategori,
      tutar,
      yuzde: total > 0 ? (tutar / total) * 100 : 0,
    }))
    .sort((a, b) => b.tutar - a.tutar)
}

export async function fetchExpenseByCategory(
  startDate?: string,
  endDate?: string
): Promise<CategorySummary[]> {
  const supabase = getSupabaseClient()

  const start =
    startDate ||
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  const end = endDate || new Date().toISOString().split('T')[0]

  const { data: payments } = await supabase
    .from('payments')
    .select('tutar, application_id')
    .eq('durum', 'odendi')
    .gte('odeme_tarihi', start)
    .lte('odeme_tarihi', end)

  // Get applications to get yardim_turu
  const applicationIds =
    payments
      ?.map((p: { application_id?: number | null }) => p.application_id)
      .filter((id: unknown): id is number => id !== null) || []

  if (applicationIds.length === 0) return []

  const { data: applications } = await supabase
    .from('social_aid_applications')
    .select('id, yardim_turu')
    .in('id', applicationIds)

  if (!payments || !applications) return []

  const categoryMap = new Map<string, number>()
  const appMap = new Map<number, string>(
    applications.map((a: { id: number; yardim_turu: string }) => [
      a.id,
      a.yardim_turu,
    ])
  )
  let total = 0

  payments.forEach(
    (p: { tutar?: number | null; application_id?: number | null }) => {
      const appId = p.application_id || 0
      const category = appMap.get(appId) || 'diger'
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + (p.tutar || 0))
      total += p.tutar || 0
    }
  )

  return Array.from(categoryMap.entries())
    .map(([kategori, tutar]) => ({
      kategori,
      tutar,
      yuzde: total > 0 ? (tutar / total) * 100 : 0,
    }))
    .sort((a, b) => b.tutar - a.tutar)
}

// ============================================
// IN-KIND AIDS (Ayni Yardım)
// ============================================

type InKindAidRow = {
  id: number
  beneficiary_id: number
  yardim_turu: string
  miktar: number
  birim: string
  dagitim_tarihi: string
  notlar: string | null
  created_at: string
  updated_at: string
}

function mapInKindAid(
  db: InKindAidRow & {
    beneficiaries?: { ad: string; soyad: string } | null
  }
): InKindAid {
  return {
    id: db.id,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? {
          ad: db.beneficiaries.ad,
          soyad: db.beneficiaries.soyad,
        }
      : undefined,
    yardimTuru: db.yardim_turu as InKindAid['yardimTuru'],
    miktar: db.miktar,
    birim: db.birim as InKindAid['birim'],
    dagitimTarihi: new Date(db.dagitim_tarihi),
    notlar: db.notlar || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

export async function fetchInKindAids(options?: {
  page?: number
  limit?: number
  search?: string
  yardimTuru?: string
  startDate?: string
  endDate?: string
}): Promise<PaginatedResponse<InKindAid>> {
  const supabase = getSupabaseClient()
  const {
    page = 1,
    limit = 10,
    search,
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

  if (search) {
    query = query.or(
      `beneficiaries.ad.ilike.%${search}%,beneficiaries.soyad.ilike.%${search}%`
    )
  }

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

  return toPaginatedResponse((data || []).map(mapInKindAid), count, page, limit)
}

export async function fetchInKindAidById(id: number): Promise<InKindAid> {
  const supabase = getSupabaseClient()
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

  if (error) throw error
  return mapInKindAid(data)
}

export async function createInKindAid(data: {
  beneficiary_id: number
  yardim_turu: string
  miktar: number
  birim: string
  dagitim_tarihi?: string
  notlar?: string
}): Promise<InKindAid> {
  const supabase = getSupabaseClient()
  const { data: result, error } = await supabase
    .from('in_kind_aids')
    .insert({
      beneficiary_id: data.beneficiary_id,
      yardim_turu: data.yardim_turu,
      miktar: data.miktar,
      birim: data.birim,
      dagitim_tarihi:
        data.dagitim_tarihi || new Date().toISOString().split('T')[0],
      notlar: data.notlar || null,
    })
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .single()

  if (error) throw error
  return mapInKindAid(result)
}

export async function updateInKindAid(
  id: number,
  data: {
    yardim_turu?: string
    miktar?: number
    birim?: string
    dagitim_tarihi?: string
    notlar?: string
  }
): Promise<InKindAid> {
  const supabase = getSupabaseClient()
  const { data: result, error } = await supabase
    .from('in_kind_aids')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      `
      *,
      beneficiaries (ad, soyad)
    `
    )
    .single()

  if (error) throw error
  return mapInKindAid(result)
}

export async function deleteInKindAid(id: number): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('in_kind_aids').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function fetchDashboardStats() {
  const supabase = getSupabaseClient()

  // Try using RPC first (performance optimized)
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats')

    if (!error && data) {
      return data
    }

    // If RPC fails, fallback to manual aggregation
    console.warn('RPC get_dashboard_stats failed, using fallback method:', error)
  } catch (err) {
    console.warn('Error calling get_dashboard_stats RPC:', err)
  }

  // Fallback to manual aggregation
  return fetchDashboardStatsFallback()
}

// Fallback method if RPC is not available
async function fetchDashboardStatsFallback() {
  const supabase = getSupabaseClient()

  // Bu ayın başlangıcını hesapla
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalMembers },
    { count: totalBeneficiaries },
    { data: donations },
    { count: activeKumbaras },
    { count: pendingApplications },
    { data: applications },
    { data: monthlyPayments },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('tutar'),
    supabase
      .from('kumbaras')
      .select('*', { count: 'exact', head: true })
      .eq('durum', 'aktif'),
    supabase
      .from('social_aid_applications')
      .select('*', { count: 'exact', head: true })
      .eq('durum', 'beklemede'),
    supabase
      .from('social_aid_applications')
      .select('yardim_turu, onaylanan_tutar'),
    // Bu ay onaylanan yardımlar
    supabase
      .from('social_aid_applications')
      .select('onaylanan_tutar')
      .eq('durum', 'onaylandi')
      .gte('degerlendirme_tarihi', startOfMonth.toISOString()),
  ])

  const totalDonations =
    donations?.reduce(
      (sum: number, d: { tutar: number | null }) => sum + (d.tutar || 0),
      0
    ) || 0

  // Yardım dağılımı hesapla
  const aidDistributionMap = new Map<string, number>()
  applications?.forEach(
    (app: { yardim_turu: string | null; onaylanan_tutar: number | null }) => {
      if (app.onaylanan_tutar && app.yardim_turu) {
        const current = aidDistributionMap.get(app.yardim_turu) || 0
        aidDistributionMap.set(app.yardim_turu, current + app.onaylanan_tutar)
      }
    }
  )

  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
  ]
  const aidDistribution = Array.from(aidDistributionMap.entries()).map(
    ([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    })
  )

  // Bu ayki yardım tutarını hesapla
  const monthlyAid =
    monthlyPayments?.reduce(
      (sum: number, p: { onaylanan_tutar: number | null }) =>
        sum + (p.onaylanan_tutar || 0),
      0
    ) || 0

  return {
    activeMembers: totalMembers || 0,
    membersGrowth: 0, // Not calculated in fallback
    totalBeneficiaries: totalBeneficiaries || 0,
    totalDonations,
    activeKumbaras: activeKumbaras || 0,
    pendingApplications: pendingApplications || 0,
    monthlyAid,
    aidGrowth: 0, // Not calculated in fallback
    monthlyDonationTotal: 0, // Not calculated in fallback
    donationGrowth: 0, // Not calculated in fallback
    donationsTrend: 0, // Calculate from real data if needed
    monthlyDonations: [], // Calculate from real data if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentDonations: (donations || []).slice(0, 5).map(mapDonation as any),
    aidDistribution,
    recentApplications: [],
    recentMembers: [],
    beneficiaryCounts: {
      aktif: 0,
      pasif: 0,
      tamamlandi: 0,
    },
  }
}

// ============================================
// HOSPITAL REFERRALS
// ============================================

function mapHospital(
  db: Tables['hospitals']['Row']
): import('@/types').Hospital {
  return {
    id: db.id,
    name: db.name,
    address: db.address || undefined,
    phone: db.phone || undefined,
    email: db.email || undefined,
    specialties: db.specialties || [],
    isActive: db.is_active,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapReferral(
  db: Tables['referrals']['Row'] & {
    beneficiaries?: { ad: string; soyad: string } | null
    hospitals?: { name: string } | null
  }
): import('@/types').Referral {
  return {
    id: db.id,
    beneficiaryId: db.beneficiary_id,
    beneficiary: db.beneficiaries
      ? { ad: db.beneficiaries.ad, soyad: db.beneficiaries.soyad }
      : undefined,
    hospitalId: db.hospital_id,
    hospital: db.hospitals ? { name: db.hospitals.name } : undefined,
    reason: db.reason,
    referralDate: new Date(db.referral_date),
    status: db.status as import('@/types').ReferralStatus,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapAppointment(
  db: Tables['hospital_appointments']['Row']
): import('@/types').HospitalAppointment {
  return {
    id: db.id,
    referralId: db.referral_id,
    appointmentDate: new Date(db.appointment_date),
    location: db.location || undefined,
    status: db.status as import('@/types').AppointmentStatus,
    reminderSent: db.reminder_sent,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapTreatmentCost(
  db: Tables['treatment_costs']['Row']
): import('@/types').TreatmentCost {
  return {
    id: db.id,
    referralId: db.referral_id,
    description: db.description,
    amount: Number(db.amount),
    currency: db.currency as import('@/types').Currency,
    paymentStatus: db.payment_status as import('@/types').TreatmentCostStatus,
    paymentDate: db.payment_date ? new Date(db.payment_date) : undefined,
    paymentMethod:
      (db.payment_method as import('@/types').PaymentMethod) || undefined,
    incurredDate: new Date(db.incurred_date),
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

function mapTreatmentOutcome(
  db: Tables['treatment_outcomes']['Row']
): import('@/types').TreatmentOutcome {
  return {
    id: db.id,
    referralId: db.referral_id,
    appointmentId: db.appointment_id || undefined,
    diagnosis: db.diagnosis || undefined,
    treatmentReceived: db.treatment_received || undefined,
    outcomeNotes: db.outcome_notes || undefined,
    followUpNeeded: db.follow_up_needed,
    followUpDate: db.follow_up_date ? new Date(db.follow_up_date) : undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

export async function fetchHospitals(options?: {
  search?: string
  specialty?: string
}): Promise<import('@/types').Hospital[]> {
  const supabase = getSupabaseClient()
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

export async function createHospital(hospital: Tables['hospitals']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospital)
    .select()
    .single()
  if (error) throw error
  return mapHospital(data)
}

export async function updateHospital(
  id: string,
  hospital: Tables['hospitals']['Update']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('hospitals')
    .update(hospital)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapHospital(data)
}

export async function fetchReferrals(options?: {
  beneficiaryId?: string
  hospitalId?: string
  status?: string
}): Promise<import('@/types').Referral[]> {
  const supabase = getSupabaseClient()
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

export async function fetchReferral(id: string) {
  const supabase = getSupabaseClient()
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

export async function createReferral(referral: Tables['referrals']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('referrals')
    .insert(referral)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateReferral(
  id: string,
  referral: Tables['referrals']['Update']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('referrals')
    .update(referral)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchAppointments(
  referralId: string
): Promise<import('@/types').HospitalAppointment[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('hospital_appointments')
    .select('*')
    .eq('referral_id', referralId)
    .order('appointment_date', { ascending: true })
  if (error) throw error
  return (data || []).map(mapAppointment)
}

export async function createAppointment(
  appointment: Tables['hospital_appointments']['Insert']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('hospital_appointments')
    .insert(appointment)
    .select()
    .single()
  if (error) throw error
  return mapAppointment(data)
}

export async function fetchTreatmentCosts(
  referralId: string
): Promise<import('@/types').TreatmentCost[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('treatment_costs')
    .select('*')
    .eq('referral_id', referralId)
    .order('incurred_date', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTreatmentCost)
}

export async function createTreatmentCost(
  cost: Tables['treatment_costs']['Insert']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('treatment_costs')
    .insert(cost)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentCost(data)
}

export async function fetchTreatmentOutcomes(
  referralId: string
): Promise<import('@/types').TreatmentOutcome[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapTreatmentOutcome)
}

export async function createTreatmentOutcome(
  outcome: Tables['treatment_outcomes']['Insert']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .insert(outcome)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentOutcome(data)
}

export async function updateTreatmentOutcome(
  id: string,
  outcome: Tables['treatment_outcomes']['Update']
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .update(outcome)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTreatmentOutcome(data)
}

// ============================================
// STORAGE & DOCUMENTS

/**
 * Upload file to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  beneficiaryId: string,
  documentType: DocumentType,
  onProgress?: (progress: number) => void
): Promise<BeneficiaryDocument> {
  const supabase = getSupabaseClient()

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  // Use crypto for secure random string
  const randomStr = crypto.randomBytes(8).toString('hex')
  const fileName = `${Date.now()}-${randomStr}.${fileExt}`
  const filePath = `${beneficiaryId}/${fileName}`

  // Simulate progress since Supabase doesn't provide native progress
  if (onProgress) {
    onProgress(10)
  }

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  if (onProgress) {
    onProgress(70)
  }

  // Save metadata to database
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .insert({
      beneficiary_id: beneficiaryId,
      file_name: file.name,
      file_path: uploadData.path,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType,
    })
    .select()
    .single()

  if (docError) throw docError

  if (onProgress) {
    onProgress(100)
  }

  return {
    id: docData.id,
    beneficiaryId: docData.beneficiary_id,
    fileName: docData.file_name,
    filePath: docData.file_path,
    fileType: docData.file_type,
    fileSize: docData.file_size,
    documentType: docData.document_type as DocumentType,
    createdAt: new Date(docData.created_at),
  }
}

/**
 * Fetch documents for a beneficiary
 */
export async function fetchDocuments(
  beneficiaryId: string
): Promise<BeneficiaryDocument[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(
    (doc: {
      id: string
      beneficiary_id: string
      file_name: string
      file_path: string
      file_type: string
      file_size: number
      document_type: string
      created_at: string
    }) => ({
      id: doc.id,
      beneficiaryId: doc.beneficiary_id,
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      documentType: doc.document_type as DocumentType,
      createdAt: new Date(doc.created_at),
    })
  )
}

/**
 * Get signed URL for file download
 */
export async function getDocumentUrl(filePath: string): Promise<string> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  if (error) throw error
  return data.signedUrl
}

/**
 * Delete document
 */
export async function deleteDocument(
  id: string,
  filePath: string
): Promise<void> {
  const supabase = getSupabaseClient()

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([filePath])

  if (storageError) throw storageError

  // Delete metadata
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (dbError) throw dbError
}

/**
 * Download document
 */
export async function downloadDocument(
  filePath: string,
  fileName: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath)

  if (error) throw error

  // Create download link
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============================================
// USERS
// ============================================

function mapUser(db: Tables['users']['Row']): User {
  // Map Supabase roles to our UserRole type
  let role: User['role'] = 'gorevli'
  if (db.role === 'admin') {
    role = 'admin'
  } else if (db.role === 'moderator') {
    role = 'muhasebe'
  } else if (db.role === 'user') {
    role = 'gorevli'
  }

  return {
    id: db.id,
    name: db.name,
    email: db.email,
    phone: undefined, // Not in DB schema, can be added later
    role,
    avatar: db.avatar_url || undefined,
    isActive: true, // Default to true, can be added to schema later
    lastLogin: undefined, // Can be added to schema later
    permissions: [], // Can be added to schema later
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  }
}

export async function fetchUsers(options?: {
  page?: number
  limit?: number
  search?: string
  role?: string
}): Promise<PaginatedResponse<User>> {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, search, role } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  const { data, error, count } = await query

  if (error) throw error

  return toPaginatedResponse((data || []).map(mapUser), count, page, limit)
}

export async function fetchUser(id: string): Promise<User> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapUser(data)
}

export async function fetchCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (error) {
    // User might not exist in users table yet
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return mapUser(data)
}

export async function createUser(userData: {
  email: string
  password: string
  name: string
  role?: 'admin' | 'moderator' | 'user'
}): Promise<User> {
  const supabase = getSupabaseClient()

  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Kullanıcı oluşturulamadı')

  // Then create user profile in users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
    })
    .select()
    .single()

  if (error) {
    // If user creation fails, try to delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw error
  }

  return mapUser(data)
}

export async function updateUser(
  id: string,
  userData: Tables['users']['Update']
): Promise<User> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapUser(data)
}

export async function updateUserProfile(
  id: string,
  profileData: {
    name?: string
    email?: string
    phone?: string
  }
): Promise<User> {
  const supabase = getSupabaseClient()

  // Update users table
  const updateData: Tables['users']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (profileData.name) updateData.name = profileData.name
  if (profileData.email) updateData.email = profileData.email

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // If email changed, update auth user email
  if (profileData.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: profileData.email,
    })
    if (authError) {
      console.error('Auth email update error:', authError)
      // Don't throw, profile update succeeded
    }
  }

  return mapUser(data)
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = getSupabaseClient()

  // First verify current password by trying to sign in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) throw new Error('Kullanıcı bulunamadı')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    throw new Error('Mevcut şifre hatalı')
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) throw updateError
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseClient()

  // Delete from users table (cascade will handle auth.users)
  const { error } = await supabase.from('users').delete().eq('id', id)

  if (error) throw error

  // Also delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) {
    console.error('Auth user deletion error:', authError)
    // Don't throw, user record deleted
  }
}

export async function updateNotificationPreferences(
  _userId: string,
  preferences: NotificationPreferences
): Promise<void> {
  const supabase = getSupabaseClient()

  // Store preferences in user metadata or a separate table
  // For now, we'll use Supabase's user metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      notification_preferences: preferences,
    },
  })

  if (error) throw error
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      email: true,
      push: false,
      sms: false,
    }
  }

  const preferences = user.user_metadata?.notification_preferences

  return (
    preferences || {
      email: true,
      push: false,
      sms: false,
    }
  )
}
