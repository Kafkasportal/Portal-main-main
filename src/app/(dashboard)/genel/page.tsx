'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
    Users,
    AlertCircle,
    Wallet,
    ArrowRight,
    FileText,
    UserPlus,
    UserCheck,
    UserX,
    Clock
} from 'lucide-react'
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from '@/components/shared/lazy-chart'

import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { QueryError } from '@/components/shared/query-error'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { fetchDashboardStats, fetchBeneficiaries, fetchApplications, fetchMembers } from '@/lib/supabase-service'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { STATUS_VARIANTS, BASVURU_DURUMU_LABELS } from '@/lib/constants'
import type { SosyalYardimBasvuru } from '@/types'

export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { data: stats, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats
    })

    // Son başvurular
    const { data: applicationsData } = useQuery({
        queryKey: ['dashboard-applications'],
        queryFn: async () => {
            const result = await fetchApplications({ page: 1, limit: 5, durum: 'beklemede' })
            // Map raw DB data to expected format
            const mappedData: SosyalYardimBasvuru[] = (result.data || []).map((app: Record<string, unknown>) => ({
                id: app.id as string,
                basvuranKisi: {
                    ad: (app.beneficiaries as Record<string, unknown>)?.ad as string || '',
                    soyad: (app.beneficiaries as Record<string, unknown>)?.soyad as string || '',
                    tcKimlikNo: '',
                    telefon: (app.beneficiaries as Record<string, unknown>)?.telefon as string || '',
                    adres: ''
                },
                yardimTuru: app.yardim_turu as string,
                talepEdilenTutar: app.talep_edilen_tutar as number,
                gerekce: app.aciklama as string || '',
                belgeler: [],
                durum: app.durum as 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi' | 'odendi',
                createdAt: new Date(app.created_at as string),
                updatedAt: new Date(app.updated_at as string)
            }))
            return { ...result, data: mappedData }
        }
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
            const mappedData: MappedMember[] = (result.data || []).map((m: Record<string, unknown>) => ({
                id: m.id as string,
                ad: m.ad as string || '',
                soyad: m.soyad as string || '',
                uyeNo: m.uye_no as string || '',
                uyeTuru: m.uye_turu as string || 'aktif',
                createdAt: new Date(m.created_at as string)
            }))
            return { ...result, data: mappedData }
        }
    })

    // İhtiyaç sahipleri
    const { data: beneficiariesData } = useQuery({
        queryKey: ['dashboard-beneficiaries'],
        queryFn: () => fetchBeneficiaries({ page: 1, pageSize: 100 })
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
        <div className="space-y-6 animate-in">
            <div className="gold-accent">
                <PageHeader
                    title="Genel Bakış"
                    description="Dernek istatistikleri ve son aktiviteler"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <CardTitle className="text-lg font-semibold">Yardım Dağılımı</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                            <Link href="/sosyal-yardim/istatistikler">
                                Detaylar <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                            {isMounted && !isLoading && stats?.aidDistribution && stats.aidDistribution.length > 0 ? (
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
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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

            {/* İhtiyaç Sahipleri Özeti */}
            <Card className="hover-glow border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {beneficiariesData?.data.filter(b => b.durum === 'aktif').length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Aktif</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                                <UserX className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-600">
                                    {beneficiariesData?.data.filter(b => b.durum === 'pasif').length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Pasif</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">
                                    {beneficiariesData?.data.filter(b => b.durum === 'tamamlandi').length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Tamamlandı</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alt Kartlar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Son Başvurular */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                            Bekleyen Başvurular
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
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
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-all duration-200 hover:shadow-md border border-border/30"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 ring-2 ring-orange-500/20">
                                                <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600 text-sm font-semibold">
                                                    {getInitials(`${application.basvuranKisi.ad} ${application.basvuranKisi.soyad}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {application.basvuranKisi.ad} {application.basvuranKisi.soyad}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(application.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={STATUS_VARIANTS[application.durum] as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"} className="text-xs">
                                                {BASVURU_DURUMU_LABELS[application.durum]}
                                            </Badge>
                                            <span className="font-semibold text-sm text-primary">
                                                {formatCurrency(application.talepEdilenTutar || 0)}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>Bekleyen başvuru yok</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Son Kayıt Olan Üyeler */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <UserPlus className="h-4 w-4 text-white" />
                            </div>
                            Son Kayıt Olan Üyeler
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
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
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-all duration-200 hover:shadow-md border border-border/30"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 ring-2 ring-emerald-500/20">
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 text-sm font-semibold">
                                                    {getInitials(`${member.ad} ${member.soyad}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {member.ad} {member.soyad}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.uyeNo}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {member.uyeTuru === 'aktif' ? 'Aktif' : member.uyeTuru === 'genc' ? 'Genç' : member.uyeTuru === 'onursal' ? 'Onursal' : 'Destekci'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(member.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
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
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>

            <Skeleton className="h-[380px]" />

            <Skeleton className="h-[180px]" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[350px]" />
            </div>
        </div>
    )
}
