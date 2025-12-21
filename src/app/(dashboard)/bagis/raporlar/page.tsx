'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, TrendingUp, Calendar, Filter } from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { fetchDonations, fetchDashboardStats } from '@/lib/mock-service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DONATION_PURPOSE_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { DonationPurpose, PaymentStatus } from '@/types'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const [dateRange, setDateRange] = useState<string>('all')
    const [purpose, setPurpose] = useState<string>('all')
    const [status, setStatus] = useState<string>('all')

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true)
        }, 300)
        window.addEventListener('resize', () => setIsMounted(true))
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', () => setIsMounted(true))
        }
    }, [])

    const { data: donations, isLoading: donationsLoading } = useQuery({
        queryKey: ['donations-report', purpose, status],
        queryFn: () => fetchDonations({
            pageSize: 1000,
            purpose: purpose !== 'all' ? purpose as DonationPurpose : undefined,
            status: status !== 'all' ? status as PaymentStatus : undefined
        })
    })

    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats
    })

    // Calculate statistics
    const allDonations = donations?.data || []
    const totalAmount = allDonations.reduce((sum, d) => sum + d.tutar, 0)
    const totalCount = allDonations.length
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0

    // Monthly donations data
    const monthlyData = dashboardStats?.monthlyDonations || []

    // Purpose distribution
    const purposeDistribution = Object.entries(DONATION_PURPOSE_LABELS).map(([key, label]) => {
        const count = allDonations.filter(d => d.amac === key).length
        const amount = allDonations
            .filter(d => d.amac === key)
            .reduce((sum, d) => sum + d.tutar, 0)
        return { name: label, count, amount }
    }).filter(item => item.count > 0)

    // Status distribution
    const statusDistribution = Object.entries(STATUS_LABELS).map(([key, label]) => ({
        name: label,
        count: allDonations.filter(d => d.durum === key).length,
        color: key === 'tamamlandi' ? 'hsl(var(--primary))' : 
               key === 'beklemede' ? 'hsl(var(--warning))' : 
               'hsl(var(--muted-foreground))'
    })).filter(item => item.count > 0)

    const handleExportExcel = () => {
        try {
            const exportData = allDonations.map(d => ({
                'Makbuz No': d.makbuzNo || '-',
                'Bağışçı': `${d.bagisci.ad} ${d.bagisci.soyad}`,
                'Telefon': d.bagisci.telefon || '-',
                'Tutar': d.tutar,
                'Amaç': DONATION_PURPOSE_LABELS[d.amac],
                'Durum': STATUS_LABELS[d.durum] || d.durum,
                'Tarih': formatDate(d.createdAt, 'dd/MM/yyyy'),
                'Ödeme Yöntemi': d.odemeYontemi || '-'
            }))
            
            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bağış Raporu')
            const fileName = `bagis-raporu-${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)
            
            // Log for testing purposes
            console.log('Excel export completed:', fileName, 'Records:', exportData.length)
        } catch (error) {
            console.error('Excel export failed:', error)
        }
    }

    const COLORS = [
        'hsl(var(--primary))',
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))'
    ]

    if (donationsLoading || statsLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Raporlar" description="Detaylı bağış ve finansal raporlar" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bağış Raporları"
                description="Detaylı bağış ve finansal raporlar"
                action={
                    <Button onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel İndir
                    </Button>
                }
            />

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtreler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tarih Aralığı</label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    <SelectItem value="this-month">Bu Ay</SelectItem>
                                    <SelectItem value="last-month">Geçen Ay</SelectItem>
                                    <SelectItem value="this-year">Bu Yıl</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amaç</label>
                            <Select value={purpose} onValueChange={setPurpose}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    {Object.entries(DONATION_PURPOSE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Durum</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Toplam Bağış</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-success/10">
                                <TrendingUp className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Bağış Sayısı</p>
                                <p className="text-2xl font-bold">{totalCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-warning/10">
                                <Calendar className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ortalama Tutar</p>
                                <p className="text-2xl font-bold">{formatCurrency(avgAmount)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-chart-4/10">
                                <FileText className="h-6 w-6 text-chart-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rapor Tarihi</p>
                                <p className="text-lg font-bold">{formatDate(new Date())}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Donations Chart */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Aylık Bağış Grafiği</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                            {isMounted && monthlyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
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
                                            fill="url(#colorDonations)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">Veri yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Purpose Distribution */}
                <Card className="hover-glow border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Amaç Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                            {isMounted && purposeDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <BarChart data={purposeDistribution}>
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
                                            formatter={(value: any) => [formatCurrency(value), 'Tutar']}
                                        />
                                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">Veri yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="hover-glow border-border/50 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Durum Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0, minHeight: 300, width: '100%', position: 'relative' }}>
                            {isMounted && statusDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={105}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {statusDistribution.map((entry, index) => (
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
                                            formatter={(value: any) => [value, 'Adet']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">Veri yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
