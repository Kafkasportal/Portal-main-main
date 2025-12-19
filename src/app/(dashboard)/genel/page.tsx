'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
    TrendingUp,
    Users,
    AlertCircle,
    Wallet,
    ArrowRight,
    Heart
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
    Cell
} from 'recharts'

import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDashboardStats } from '@/lib/mock-service'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { STATUS_VARIANTS } from '@/lib/constants'

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats
    })

    if (isLoading || !stats) {
        return <DashboardSkeleton />
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="gold-accent">
                <PageHeader
                    title="Genel Bakış"
                    description="Dernek istatistikleri ve son aktiviteler"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stagger-item">
                    <StatCard
                        label="Toplam Bağış"
                        value={formatCurrency(stats.totalDonations)}
                        icon={TrendingUp}
                        trend={stats.donationsTrend}
                        trendLabel="son aya göre"
                    />
                </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Donations Chart */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold">Aylık Bağış Grafiği</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                            <Link href="/bagis/raporlar">
                                Detaylar <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyDonations}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
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
                                        formatter={(value: number) => [formatCurrency(value), 'Tutar']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Aid Distribution Chart */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold">Yardım Dağılımı</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                            <Link href="/sosyal-yardim/istatistikler">
                                Detaylar <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
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
                                        formatter={(value: number) => [`%${value}`, 'Oran']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
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
            </div>

            {/* Recent Donations */}
            <Card className="hover-glow border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Heart className="h-4 w-4 text-primary-foreground" />
                        </div>
                        Son Bağışlar
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                        <Link href="/bagis/liste">
                            Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.recentDonations.map((donation, index) => (
                            <div
                                key={donation.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-all duration-200 hover:shadow-md border border-border/30"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                                            {getInitials(`${donation.bagisci.ad} ${donation.bagisci.soyad}`)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {donation.bagisci.ad} {donation.bagisci.soyad}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {formatDate(donation.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={STATUS_VARIANTS[donation.durum] as any} className="shadow-sm">
                                        {donation.durum.charAt(0).toUpperCase() + donation.durum.slice(1)}
                                    </Badge>
                                    <span className="font-bold font-mono text-primary">
                                        {formatCurrency(donation.tutar, donation.currency)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Loading skeleton
function DashboardSkeleton() {
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

            <Skeleton className="h-[300px]" />
        </div>
    )
}
