'use client'

import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useDashboardStats, useApplications, useDonations } from '@/hooks/use-api'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard Page - Yeni Tasarım
 *
 * Animasyonlu, modern dashboard tasarımı.
 * Gerçek Supabase verilerinizle çalışır.
 */
export default function DashboardPageNewDesign() {
  const router = useRouter()

  // Gerçek verileri çek
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: applicationsData, isLoading: appsLoading } = useApplications({
    page: 1,
    limit: 6,
    durum: 'beklemede',
  })
  const { data: donationsData, isLoading: donationsLoading } = useDonations({
    page: 1,
    limit: 12,
  })

  // Loading state
  if (statsLoading || appsLoading || donationsLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  // Dashboard istatistiklerini dönüştür
  const stats = [
    {
      id: 'total-members',
      label: 'Toplam Üye',
      value: statsData?.totalMembers || 0,
      change: statsData?.memberChange || 0,
      trend: (statsData?.memberChange || 0) >= 0 ? 'up' : 'down',
      description: 'Bu ay',
    },
    {
      id: 'monthly-donations',
      label: 'Aylık Bağış',
      value: statsData?.monthlyDonations || 0,
      currency: 'TRY' as const,
      change: statsData?.donationChange || 0,
      trend: (statsData?.donationChange || 0) >= 0 ? 'up' : 'down',
      description: 'Geçen aya göre',
    },
    {
      id: 'active-applications',
      label: 'Aktif Başvuru',
      value: statsData?.activeApplications || 0,
      change: statsData?.applicationChange || 0,
      trend: (statsData?.applicationChange || 0) >= 0 ? 'up' : 'down',
      description: 'İncelenmesi gereken',
    },
  ]

  // Finansal trend verisini oluştur (son 12 ay)
  const financialTrend = donationsData?.monthlyTrend || []

  // Bekleyen başvuruları dönüştür
  const pendingApplications = (applicationsData?.items || []).map((app: any) => ({
    id: app.id,
    applicantName: app.basvuran_ad && app.basvuran_soyad
      ? `${app.basvuran_ad} ${app.basvuran_soyad}`
      : 'İsimsiz',
    applicationType: app.yardim_turu || 'nakdi',
    requestedAmount: app.talep_edilen_tutar || 0,
    currency: 'TRY' as const,
    applicationDate: app.basvuru_tarihi || new Date().toISOString(),
    status: app.durum || 'beklemede',
    priority: app.oncelik || 'orta',
    note: app.notlar,
  }))

  // Hızlı erişim eylemleri
  const quickActions = [
    {
      id: 'new-donation',
      label: 'Yeni Bağış',
      icon: 'Heart',
      route: '/bagis/yeni',
      description: 'Bağış kaydı oluştur',
    },
    {
      id: 'new-member',
      label: 'Yeni Üye',
      icon: 'UserPlus',
      route: '/uyeler/yeni',
      description: 'Üye kaydı ekle',
    },
    {
      id: 'new-application',
      label: 'Yeni Başvuru',
      icon: 'FileText',
      route: '/sosyal-yardim/basvurular/yeni',
      description: 'Yardım başvurusu al',
    },
    {
      id: 'view-reports',
      label: 'Raporlar',
      icon: 'BarChart3',
      route: '/raporlar',
      description: 'Finansal raporları görüntüle',
    },
  ]

  return (
    <Dashboard
      stats={stats}
      financialTrend={financialTrend}
      pendingApplications={pendingApplications}
      quickActions={quickActions}
      onStatClick={(statId) => {
        // İstatistik detayına git
        if (statId === 'total-members') router.push('/uyeler')
        if (statId === 'monthly-donations') router.push('/bagis')
        if (statId === 'active-applications') router.push('/sosyal-yardim/basvurular')
      }}
      onApplicationClick={(appId) => {
        // Başvuru detayına git
        router.push(`/sosyal-yardim/basvurular/${appId}`)
      }}
      onQuickActionClick={(actionId) => {
        // Hızlı erişim route'una git
        const action = quickActions.find((a) => a.id === actionId)
        if (action) router.push(action.route)
      }}
      onCommandPaletteOpen={() => {
        // Komut paletini aç (mevcut implementasyonunuz varsa)
        console.log('Command palette açıldı')
      }}
    />
  )
}
