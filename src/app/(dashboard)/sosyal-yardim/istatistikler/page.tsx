'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    TrendingUp,
    Users,
    Wallet,
    Heart,
    AlertCircle
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts'

import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { fetchDashboardStats, fetchBeneficiaries, fetchApplications } from '@/lib/mock-service'
import { formatCurrency } from '@/lib/utils'
import { AID_TYPE_LABELS } from '@/lib/constants'

export default function StatisticsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats
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
        queryFn: () => fetchBeneficiaries({ pageSize: 1000 })
    })

    const { data: applications, isLoading: applicationsLoading } = useQuery({
        queryKey: ['applications'],
        queryFn: () => fetchApplications({ pageSize: 1000 })
    })

    const isLoading = statsLoading || beneficiariesLoading || applicationsLoading

    if (isLoading) {
        return <StatisticsSkeleton />
    }

    if (!stats || !beneficiaries || !applications) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Veriler yüklenemedi</h3>
                    <p className="text-muted-foreground">Lütfen sayfayı yenileyip tekrar deneyin.</p>
                </div>
                <Button onClick={() => window.location.reload()}>
                    Yeniden Dene
                </Button>
            </div>
        )
    }

    // Calculate statistics
    const totalBeneficiaries = beneficiaries?.total || 0
    const activeBeneficiaries = beneficiaries?.data?.filter(b => b.durum === 'aktif').length || 0
    const totalApplications = applications?.total || 0
    const pendingApplications = applications?.data?.filter(a => a.durum === 'beklemede').length || 0

    // Aid type distribution
    const aidTypeDistribution = Object.keys(AID_TYPE_LABELS).map(key => {
        const count = applications?.data?.filter(a => a.yardimTuru === key).length || 0
        const total = applications?.data?.length || 1
        return {
            name: AID_TYPE_LABELS[key as keyof typeof AID_TYPE_LABELS],
            value: Math.round((count / total) * 100),
            count,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        }
    }).filter(item => item.count > 0)

    return (
        <div className="space-y-6 animate-in">
            <PageHeader
                title="Sosyal Yardım İstatistikleri"
                description="Sosyal yardım dağılım ve etki analizleri"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aid Distribution Chart */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Yardım Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center" style={{ minWidth: 0, minHeight: 300, width: '100%' }}>
                            {isMounted && !statsLoading && stats?.aidDistribution && stats.aidDistribution.length > 0 ? (
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
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value: any) => [`%${value}`, 'Oran']}
                                    />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground">Veri yok</div>
                            )}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {stats.aidDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Aid Type Distribution */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Yardım Türü Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                            {isMounted && !applicationsLoading && aidTypeDistribution && aidTypeDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <BarChart data={aidTypeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
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
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value: any) => [value, 'Başvuru']}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">Veri yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Aid Chart */}
            <Card className="hover-glow border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Aylık Yardım Grafiği</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                        {isMounted && !statsLoading && stats?.monthlyDonations && stats.monthlyDonations.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <AreaChart data={stats.monthlyDonations}>
                                <defs>
                                    <linearGradient id="colorAid" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="month"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={11}
                                    fontWeight={500}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={11}
                                    fontWeight={500}
                                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value: any) => [formatCurrency(value), 'Tutar']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAid)"
                                />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">Veri yok</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Loading skeleton
function StatisticsSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[380px]" />
                <Skeleton className="h-[380px]" />
            </div>

            <Skeleton className="h-[380px]" />
        </div>
    )
}
