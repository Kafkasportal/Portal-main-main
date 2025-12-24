'use client'

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from '@/components/shared/lazy-chart'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowRight,
  Clock,
  FileText,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { StatCard } from '@/components/shared/stat-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BASVURU_DURUMU_LABELS, STATUS_VARIANTS } from '@/lib/constants'
import {
  fetchApplications,
  fetchBeneficiaries,
  fetchDashboardStats,
  fetchMembers,
} from '@/lib/supabase-service'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { SosyalYardimBasvuru } from '@/types'

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false)
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  // Son başvurular
  const { data: applicationsData } = useQuery({
    queryKey: ['dashboard-applications'],
    queryFn: async () => {
      const result = await fetchApplications({
        page: 1,
        limit: 5,
        durum: 'beklemede',
      })
      // Map raw DB data to expected format
      const mappedData: SosyalYardimBasvuru[] = (result.data || []).map(
        (app: Record<string, unknown>) => ({
          id: app.id as string,
          basvuranKisi: {
            ad:
              ((app.beneficiaries as Record<string, unknown>).ad as string) ||
              '',
            soyad:
              ((app.beneficiaries as Record<string, unknown>)
                .soyad as string) || '',
            tcKimlikNo: '',
            telefon:
              ((app.beneficiaries as Record<string, unknown>)
                .telefon as string) || '',
            adres: '',
          },
          yardimTuru: app.yardim_turu as string,
          talepEdilenTutar: app.talep_edilen_tutar as number,
          gerekce: (app.aciklama as string) || '',
          belgeler: [],
          durum: app.durum as
            | 'beklemede'
            | 'inceleniyor'
            | 'onaylandi'
            | 'reddedildi'
            | 'odendi',
          createdAt: new Date(app.created_at as string),
          updatedAt: new Date(app.updated_at as string),
        })
      )
      return { ...result, data: mappedData }
    },
  })

  // Son üyeler
  const { data: membersData } = useQuery({
    queryKey: ['dashboard-members'],
    queryFn: async () => {
      const result = await fetchMembers({ page: 1, limit: 5 })
      // Map raw DB data to expected format
      type MappedMember = {
        id: string
        ad: string
        soyad: string
        uyeNo: string
        uyeTuru: string
        createdAt: Date
      }
      const mappedData: MappedMember[] = (result.data || []).map(
        (m: Record<string, unknown>) => ({
          id: m.id as string,
          ad: (m.ad as string) || '',
          soyad: (m.soyad as string) || '',
          uyeNo: (m.uye_no as string) || '',
          uyeTuru: (m.uye_turu as string) || 'aktif',
          createdAt: new Date(m.created_at as string),
        })
      )
      return { ...result, data: mappedData }
    },
  })

  // İhtiyaç sahipleri
  const { data: beneficiariesData } = useQuery({
    queryKey: ['dashboard-beneficiaries'],
    queryFn: () => fetchBeneficiaries({ page: 1, pageSize: 100 }),
  })

  useEffect(() => {
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
      <div className="gold-accent">
        <PageHeader
          title="Genel Bakış"
          description="Dernek istatistikleri ve son aktiviteler"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stagger-item">
          <StatCard
            label="Aktif Üye"
            value={stats.activeMembers.toLocaleString('tr-TR')}
            icon={Users}
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
            label="Bu Ay Ödenen Yardım"
            value={formatCurrency(stats.monthlyAid)}
            icon={Wallet}
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
              className="hover:bg-accent"
            >
              <Link href="/sosyal-yardim/istatistikler">
                Detaylar <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-[300px] min-h-[300px] w-full items-center justify-center"
              style={{
                minWidth: 0,
                minHeight: 300,
                width: '100%',
                position: 'relative',
              }}
            >
              {isMounted &&
              !isLoading &&
              stats?.aidDistribution &&
              stats.aidDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <PieChart>
                    <Pie
                      data={stats.aidDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.aidDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : 0
                        return [`%${numValue}`, 'Oran'] as const
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Veri yok</div>
              )}
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {stats.aidDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground text-sm font-medium">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            İhtiyaç Sahipleri Özeti
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
            <Link href="/sosyal-yardim/ihtiyac-sahipleri">
              Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              className="hover:bg-accent"
            >
              <Link href="/sosyal-yardim/basvurular">
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
                    className="bg-muted/40 hover:bg-muted/60 border-border/30 flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:shadow-md"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-orange-500/20">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-red-500/20 text-sm font-semibold text-orange-600">
                          {getInitials(
                            `${application.basvuranKisi.ad} ${application.basvuranKisi.soyad}`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {application.basvuranKisi.ad}{' '}
                          {application.basvuranKisi.soyad}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        className="text-xs"
                      >
                        {BASVURU_DURUMU_LABELS[application.durum]}
                      </Badge>
                      <span className="text-primary text-sm font-semibold">
                        {formatCurrency(application.talepEdilenTutar || 0)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              Son Kayıt Olan Üyeler
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-accent"
            >
              <Link href="/uyeler/liste">
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
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-sm font-semibold text-emerald-600">
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {member.uyeTuru === 'aktif'
                          ? 'Aktif'
                          : member.uyeTuru === 'genc'
                            ? 'Genç'
                            : member.uyeTuru === 'onursal'
                              ? 'Onursal'
                              : 'Destekci'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
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

      <Skeleton className="h-[380px]" />

      <Skeleton className="h-[180px]" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  )
}
