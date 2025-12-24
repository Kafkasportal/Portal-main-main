'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/shared/lazy-chart'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Heart, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchApplications,
  fetchBeneficiaries,
  fetchDashboardStats,
} from '@/lib/supabase-service'
// formatCurrency removed - not used after removing monthly chart
import { AID_TYPE_LABELS } from '@/lib/constants'

export default function StatisticsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
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

  const { data: beneficiaries, isLoading: beneficiariesLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => fetchBeneficiaries({ limit: 1000 }),
  })

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => fetchApplications({ limit: 1000 }),
  })

  const isLoading = statsLoading || beneficiariesLoading || applicationsLoading

  if (isLoading) {
    return <StatisticsSkeleton />
  }

  if (!stats || !beneficiaries || !applications) {
    return (
      <div className="flex h-100 flex-col items-center justify-center space-y-4">
        <div className="bg-destructive/10 text-destructive rounded-full p-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Veriler yüklenemedi</h3>
          <p className="text-muted-foreground">
            Lütfen sayfayı yenileyip tekrar deneyin.
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.reload()
          }}
        >
          Yeniden Dene
        </Button>
      </div>
    )
  }

  // Calculate statistics
  const totalBeneficiaries = beneficiaries?.total || 0
  const activeBeneficiaries =
    beneficiaries?.data?.filter((b) => b.durum === 'aktif').length || 0
  const totalApplications = applications?.total || 0
  const pendingApplications =
    (applications?.data || []).filter((a) => a.durum === 'beklemede').length ||
    0

  // Aid type colors - deterministic based on index
  const aidTypeColors = [
    'hsl(220, 70%, 50%)',
    'hsl(160, 70%, 50%)',
    'hsl(280, 70%, 50%)',
    'hsl(40, 70%, 50%)',
    'hsl(340, 70%, 50%)',
    'hsl(100, 70%, 50%)',
  ]

  // Aid type distribution
  const aidTypeDistribution = Object.keys(AID_TYPE_LABELS)
    .map((key, index) => {
      const appData = applications?.data || []
      const count = appData.filter((a) => a.yardimTuru === key).length || 0
      const total = appData.length || 1
      return {
        name: AID_TYPE_LABELS[key as keyof typeof AID_TYPE_LABELS],
        value: Math.round((count / total) * 100),
        count,
        color: aidTypeColors[index % aidTypeColors.length],
      }
    })
    .filter((item) => item.count > 0)

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Sosyal Yardım İstatistikleri"
        description="Sosyal yardım dağılım ve etki analizleri"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam İhtiyaç Sahibi"
          value={totalBeneficiaries.toLocaleString('tr-TR')}
          icon={Users}
        />
        <StatCard
          label="Aktif İhtiyaç Sahibi"
          value={activeBeneficiaries.toLocaleString('tr-TR')}
          icon={Heart}
          variant="success"
        />
        <StatCard
          label="Toplam Başvuru"
          value={totalApplications.toLocaleString('tr-TR')}
          icon={TrendingUp}
        />
        <StatCard
          label="Bekleyen Başvuru"
          value={pendingApplications.toLocaleString('tr-TR')}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Aid Distribution Chart */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Yardım Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-75 min-h-75 w-full items-center justify-center"
              style={{ minWidth: 0, minHeight: 300, width: '100%' }}
            >
              {isMounted &&
              !statsLoading &&
              stats?.aidDistribution &&
              stats.aidDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
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
                      formatter={(value) => [`%${value}`, 'Oran']}
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

        {/* Aid Type Distribution */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Yardım Türü Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-75 min-h-75 w-full"
              style={{
                minWidth: 0,
                minHeight: 300,
                width: '100%',
                position: 'relative',
              }}
            >
              {isMounted &&
              !applicationsLoading &&
              aidTypeDistribution &&
              aidTypeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={aidTypeDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [value, 'Başvuru']}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  Veri yok
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
function StatisticsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-95" />
        <Skeleton className="h-95" />
      </div>

      <Skeleton className="h-95" />
    </div>
  )
}
