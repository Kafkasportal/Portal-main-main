import { getSupabaseClient } from './supabase/client'
import type { Database } from '@/types/supabase'
import type { IhtiyacSahibi, PaginatedResponse, IhtiyacSahibiTuru, IhtiyacSahibiKategori, Cinsiyet, IhtiyacDurumu, MedeniHal, EgitimDurumu } from '@/types'

type Tables = Database['public']['Tables']

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
    tur: (db.relationship_type === 'İhtiyaç Sahibi Kişi' ? 'ihtiyac-sahibi-kisi' : 'bakmakla-yukumlu') as IhtiyacSahibiTuru,
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
      bakmaklaYukumluSayisi: 0
    },
    ekonomikSosyalDurum: {
      meslek: db.meslek || '',
      aylikGelir: Number(db.aylik_gelir) || 0,
      egitimDurumu: (db.egitim_durumu || 'belirtilmemis') as EgitimDurumu
    },
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at)
  } as IhtiyacSahibi
}

// ============================================
// MEMBERS
// ============================================
export async function fetchMembers(options?: {
  page?: number
  limit?: number
  search?: string
}) {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, search } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data, count, page, limit }
}

export async function fetchMember(id: string) {
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

export async function updateMember(id: string, member: Tables['members']['Update']) {
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

export async function deleteMember(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

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
}) {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, search, amac } = options || {}
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

  const { data, error, count } = await query

  if (error) throw error
  return { data, count, page, limit }
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
  pageSize?: number
  search?: string
  durum?: string
  ihtiyacDurumu?: string
}): Promise<PaginatedResponse<IhtiyacSahibi>> {
  const supabase = getSupabaseClient()
  const { page = 1, pageSize = 10, search, durum, ihtiyacDurumu } = options || {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('beneficiaries')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`ad.ilike.%${search}%,soyad.ilike.%${search}%,tc_kimlik_no.ilike.%${search}%`)
  }

  if (durum && durum !== 'all') {
    query = query.eq('durum', durum)
  }

  if (ihtiyacDurumu && ihtiyacDurumu !== 'all') {
    query = query.eq('ihtiyac_durumu', ihtiyacDurumu)
  }

  const { data, error, count } = await query

  if (error) throw error

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data || []).map(mapBeneficiary),
    total,
    page,
    pageSize,
    totalPages
  }
}

export async function fetchBeneficiaryById(id: string): Promise<IhtiyacSahibi> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapBeneficiary(data)
}

export async function createBeneficiary(beneficiary: Tables['beneficiaries']['Insert']) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiary)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBeneficiary(id: string, beneficiary: Tables['beneficiaries']['Update']) {
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

export async function fetchDependentPersons(parentId: string): Promise<IhtiyacSahibi[]> {
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
}) {
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
  return { data, count, page, limit }
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

export async function collectKumbara(id: string, tutar: number) {
  const supabase = getSupabaseClient()

  // Get current kumbara
  const { data: current } = await supabase
    .from('kumbaras')
    .select('toplam_toplanan')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('kumbaras')
    .update({
      durum: 'toplandi',
      son_toplama_tarihi: new Date().toISOString(),
      toplam_toplanan: (current?.toplam_toplanan || 0) + tutar,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// SOCIAL AID APPLICATIONS
// ============================================
export async function fetchApplications(options?: {
  page?: number
  limit?: number
  durum?: string
}) {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, durum } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('social_aid_applications')
    .select(`
      *,
      beneficiaries (ad, soyad, telefon)
    `, { count: 'exact' })
    .range(from, to)
    .order('basvuru_tarihi', { ascending: false })

  if (durum) {
    query = query.eq('durum', durum)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data, count, page, limit }
}

// Fetch single application by ID
export async function fetchApplicationById(id: string): Promise<import('@/types').SosyalYardimBasvuru | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('social_aid_applications')
    .select(`
      *,
      beneficiaries (ad, soyad, telefon, tc_kimlik_no, adres)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  if (!data) return null

  // Map to SosyalYardimBasvuru type
  return {
    id: data.id,
    basvuranKisi: {
      ad: data.beneficiaries?.ad || '',
      soyad: data.beneficiaries?.soyad || '',
      tcKimlikNo: data.beneficiaries?.tc_kimlik_no || '',
      telefon: data.beneficiaries?.telefon || '',
      adres: data.beneficiaries?.adres || ''
    },
    yardimTuru: data.yardim_turu as import('@/types').YardimTuru,
    talepEdilenTutar: data.talep_edilen_tutar || undefined,
    gerekce: data.aciklama || '',
    belgeler: [],
    durum: data.durum as import('@/types').BasvuruDurumu,
    degerlendirmeNotu: data.red_sebebi || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateApplicationStatus(
  id: string,
  durum: Tables['social_aid_applications']['Row']['durum'],
  onaylananTutar?: number
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('social_aid_applications')
    .update({
      durum,
      onaylanan_tutar: onaylananTutar,
      degerlendirme_tarihi: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
export async function fetchPayments(options?: {
  page?: number
  limit?: number
  durum?: string
}) {
  const supabase = getSupabaseClient()
  const { page = 1, limit = 10, durum } = options || {}
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('payments')
    .select(`
      *,
      beneficiaries (ad, soyad)
    `, { count: 'exact' })
    .range(from, to)
    .order('odeme_tarihi', { ascending: false })

  if (durum) {
    query = query.eq('durum', durum)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data, count, page, limit }
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function fetchDashboardStats() {
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
    { data: monthlyPayments }
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('tutar'),
    supabase.from('kumbaras').select('*', { count: 'exact', head: true }).eq('durum', 'aktif'),
    supabase.from('social_aid_applications').select('*', { count: 'exact', head: true }).eq('durum', 'beklemede'),
    supabase.from('social_aid_applications').select('yardim_turu, onaylanan_tutar'),
    // Bu ay onaylanan yardımlar
    supabase.from('social_aid_applications')
      .select('onaylanan_tutar')
      .eq('durum', 'onaylandi')
      .gte('degerlendirme_tarihi', startOfMonth.toISOString())
  ])

  const totalDonations = donations?.reduce((sum: number, d: { tutar: number | null }) => sum + (d.tutar || 0), 0) || 0

  // Yardım dağılımı hesapla
  const aidDistributionMap = new Map<string, number>()
  applications?.forEach((app: { yardim_turu: string | null; onaylanan_tutar: number | null }) => {
    if (app.onaylanan_tutar && app.yardim_turu) {
      const current = aidDistributionMap.get(app.yardim_turu) || 0
      aidDistributionMap.set(app.yardim_turu, current + app.onaylanan_tutar)
    }
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const aidDistribution = Array.from(aidDistributionMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }))

  // Bu ayki yardım tutarını hesapla
  const monthlyAid = monthlyPayments?.reduce(
    (sum: number, p: { onaylanan_tutar: number | null }) => sum + (p.onaylanan_tutar || 0),
    0
  ) || 0

  return {
    activeMembers: totalMembers || 0,
    totalBeneficiaries: totalBeneficiaries || 0,
    totalDonations,
    activeKumbaras: activeKumbaras || 0,
    pendingApplications: pendingApplications || 0,
    monthlyAid,
    aidDistribution: aidDistribution.length > 0 ? aidDistribution : [
      { name: 'Gıda', value: 400, color: '#3b82f6' },
      { name: 'Eğitim', value: 300, color: '#10b981' },
      { name: 'Sağlık', value: 200, color: '#f59e0b' },
      { name: 'Barınma', value: 100, color: '#ef4444' }
    ]
  }
}
