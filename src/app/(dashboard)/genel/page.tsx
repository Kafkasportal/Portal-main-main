'use client'

import {
  AlertCircle,
  ArrowRight,
  Clock,
  FileText,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AidDistributionChart } from '@/components/features/charts/aid-distribution-chart'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { StatCard } from '@/components/shared/stat-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useApplications,
  useBeneficiaries,
  useDashboardStats,
  useMembers,
} from '@/hooks/use-api'
import { BASVURU_DURUMU_LABELS, STATUS_VARIANTS } from '@/lib/constants'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false)

  const { data: stats, isLoading, isError, refetch } = useDashboardStats()

  // Son başvurular
  const { data: applicationsData } = useApplications({
    page: 1,
    limit: 5,
    durum: 'beklemede',
  })

  // Son üyeler
  const { data: membersData } = useMembers({ page: 1, limit: 5 })

  // İhtiyaç sahipleri
  const { data: beneficiariesData } = useBeneficiaries({ page: 1, limit: 100 })

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Delay to ensure container dimensions are calculated
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 300)

    // Also trigger on window resize
    const handleResize = () => {
      setIsMounted(true)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isLoading || !stats) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Genel Bakış"
          description="Dernek istatistikleri ve son aktiviteler"
        />
        <QueryError
          title="Dashboard Yüklenemedi"
          message="İstatistikler yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="Dernek istatistikleri ve son aktiviteler"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stagger-item">
          <StatCard
            label="Aktif Üye"
            value={stats.activeMembers.toLocaleString('tr-TR')}
            icon={Users}
            trend={stats.membersGrowth}
            trendUnit=""
            trendLabel="yeni üye"
          />
        </div>
        <div className="stagger-item">
          <StatCard
            label="Bekleyen Başvuru"
            value={stats.pendingApplications}
            icon={AlertCircle}
            variant="warning"
          />
        </div>
        <div className="stagger-item">
          <StatCard
            label="Bu Ay Toplanan Bağış"
            value={formatCurrency(stats.monthlyDonationTotal || 0)}
            icon={Wallet}
            variant="success"
            trend={stats.donationGrowth}
          />
        </div>
        <div className="stagger-item">
          <StatCard
            label="Bu Ay Ödenen Yardım"
            value={formatCurrency(stats.monthlyAid)}
            icon={Wallet}
            trend={stats.aidGrowth}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Aid Distribution Chart */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              Yardım Dağılımı
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-accent transition-colors"
            >
              <Link
                href="/sosyal-yardim/istatistikler"
                aria-label="Yardım dağılımı detaylarını görüntüle"
              >
                Detaylar <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-75 min-h-75 w-full items-center justify-center"
              style={{
                minWidth: 300,
                minHeight: 300,
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
              role="img"
              aria-label="Yardım dağılımı grafiği"
            >
              {isMounted &&
              !isLoading &&
              stats?.aidDistribution &&
              stats.aidDistribution.length > 0 ? (
                <AidDistributionChart data={stats.aidDistribution} />
              ) : (
                <div
                  className="text-muted-foreground flex h-full items-center justify-center"
                  role="status"
                  aria-live="polite"
                >
                  Veri yok
                </div>
              )}
            </div>
            {/* Legend */}
            <div
              className="mt-4 flex flex-wrap justify-center gap-4"
              role="list"
              aria-label="Yardım dağılımı kategorileri"
            >
              {stats.aidDistribution.map((item: { name: string; value: number; color: string }, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                  role="listitem"
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* İhtiyaç Sahipleri Özeti */}
      <Card className="hover-glow border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            İhtiyaç Sahipleri Özeti
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-accent transition-colors"
          >
            <Link
              href="/sosyal-yardim/ihtiyac-sahipleri"
              aria-label="Tüm ihtiyaç sahiplerini görüntüle"
            >
              Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {beneficiariesData?.data.filter((b) => b.durum === 'aktif')
                    .length || 0}
                </p>
                <p className="text-muted-foreground text-sm">Aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-500/20 bg-gray-500/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500/20">
                <UserX className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {beneficiariesData?.data.filter((b) => b.durum === 'pasif')
                    .length || 0}
                </p>
                <p className="text-muted-foreground text-sm">Pasif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {beneficiariesData?.data.filter(
                    (b) => b.durum === 'tamamlandi'
                  ).length || 0}
                </p>
                <p className="text-muted-foreground text-sm">Tamamlandı</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alt Kartlar Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Son Başvurular */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-red-500">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Bekleyen Başvurular
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-accent transition-colors"
            >
              <Link
                href="/sosyal-yardim/basvurular"
                aria-label="Tüm başvuruları görüntüle"
              >
                Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicationsData?.data && applicationsData.data.length > 0 ? (
                applicationsData.data.slice(0, 5).map((application, index) => (
                  <Link
                    key={application.id}
                    href={`/sosyal-yardim/basvurular/${application.id}`}
                    className="bg-muted/40 hover:bg-muted/60 border-border/30 hover:border-primary/30 focus:ring-primary/20 flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:shadow-md focus:ring-2 focus:outline-none"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    aria-label={`${application.basvuranKisi.ad} ${application.basvuranKisi.soyad} başvurusunu görüntüle`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-orange-500/20">
                        <AvatarFallback className="bg-linear-to-br from-orange-500/20 to-red-500/20 text-sm font-semibold text-orange-600">
                          {getInitials(
                            `${application.basvuranKisi.ad} ${application.basvuranKisi.soyad}`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {application.basvuranKisi.ad}{' '}
                          {application.basvuranKisi.soyad}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant={
                          STATUS_VARIANTS[application.durum] as
                            | 'default'
                            | 'secondary'
                            | 'destructive'
                            | 'outline'
                            | 'success'
                            | 'warning'
                        }
                        className="text-xs whitespace-nowrap"
                      >
                        {BASVURU_DURUMU_LABELS[application.durum]}
                      </Badge>
                      <span className="text-primary text-sm font-semibold whitespace-nowrap">
                        {formatCurrency(application.talepEdilenTutar || 0)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div
                  className="text-muted-foreground py-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <FileText
                    className="mx-auto mb-3 h-12 w-12 opacity-30"
                    aria-hidden="true"
                  />
                  <p>Bekleyen başvuru yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Son Kayıt Olan Üyeler */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-500">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              Son Kayıt Olan Üyeler
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-accent transition-colors"
            >
              <Link href="/uyeler/liste" aria-label="Tüm üyeleri görüntüle">
                Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membersData?.data && membersData.data.length > 0 ? (
                membersData.data.slice(0, 5).map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-muted/40 hover:bg-muted/60 border-border/30 flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:shadow-md"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-emerald-500/20">
                        <AvatarFallback className="bg-linear-to-br from-emerald-500/20 to-teal-500/20 text-sm font-semibold text-emerald-600">
                          {getInitials(`${member.ad} ${member.soyad}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.ad} {member.soyad}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {member.uyeNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {member.uyeTuru === 'aktif'
                          ? 'Aktif'
                          : member.uyeTuru === 'genc'
                            ? 'Genç'
                            : member.uyeTuru === 'onursal'
                              ? 'Onursal'
                              : 'Destekci'}
                      </Badge>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="text-muted-foreground py-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <Users
                    className="mx-auto mb-3 h-12 w-12 opacity-30"
                    aria-hidden="true"
                  />
                  <p>Henüz üye kaydı yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <Skeleton className="h-95" />

      <Skeleton className="h-45" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-87.5" />
        <Skeleton className="h-87.5" />
      </div>
    </div>
  )
}
