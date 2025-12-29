/**
 * Dashboard Service
 * Dashboard istatistikleri ve özet raporlar
 * Cross-domain aggregation - multiple table queries
 */

import { getClient } from './base.service'

/**
 * Dashboard istatistiklerini getirir
 * TODO: RPC fonksiyonu oluşturulduğunda optimize edilecek
 *
 * @returns Dashboard stats objesi
 */
export async function fetchDashboardStats() {
  // TODO: Apply migrations to Supabase to enable RPC for better performance
  // When RPC is available, call: supabase.rpc('get_dashboard_stats')
  return fetchDashboardStatsFallback()
}

/**
 * Fallback method - Standard queries ile stats hesaplar
 * RPC kullanılamadığında bu metod çalışır
 */
async function fetchDashboardStatsFallback() {
  const supabase = getClient()

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
    donations?.reduce((sum, d) => sum + (d.tutar || 0), 0) || 0

  // Bu ayki yardım toplamı
  const monthlyAid =
    monthlyPayments?.reduce((sum, p) => sum + (p.onaylanan_tutar || 0), 0) || 0

  // Yardım dağılımı (kategori bazlı)
  const aidDistribution = applications?.reduce(
    (acc, app) => {
      const type = app.yardim_turu || 'Diğer'
      const existing = acc.find((item) => item.name === type)
      if (existing) {
        existing.value += app.onaylanan_tutar || 0
        existing.count += 1
      } else {
        acc.push({
          name: type,
          value: app.onaylanan_tutar || 0,
          count: 1,
          color: '#6b7280',
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; count: number; color: string }>
  )

  return {
    activeMembers: totalMembers || 0,
    membersGrowth: 0, // TODO: Calculate from historical data
    totalBeneficiaries: totalBeneficiaries || 0,
    totalDonations,
    activeKumbaras: activeKumbaras || 0,
    pendingApplications: pendingApplications || 0,
    monthlyAid,
    aidGrowth: 0, // TODO: Calculate month-over-month
    monthlyDonationTotal: 0, // TODO: Calculate from donations
    donationGrowth: 0, // TODO: Calculate month-over-month
    donationsTrend: 0,
    monthlyDonations: [],
    recentDonations: [],
    aidDistribution: aidDistribution || [],
    recentApplications: [],
    recentMembers: [],
    beneficiaryCounts: {
      aktif: 0, // TODO: Count by status
      pasif: 0,
      tamamlandi: 0,
    },
  }
}
