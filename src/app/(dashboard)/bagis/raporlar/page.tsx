'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/shared/lazy-chart'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Download, FileText, Filter, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DONATION_PURPOSE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { fetchDashboardStats, fetchDonations } from '@/lib/supabase-service'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { DonationPurpose } from '@/types'
import { DonationTrendsChart } from '@/components/analytics/donation-trends-chart'
import { DonationSourceChart } from '@/components/analytics/donation-source-chart'
import { TopDonorsList } from '@/components/analytics/top-donors-list'

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [dateRange, setDateRange] = useState<string>('all')
  const [purpose, setPurpose] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 300)
    
    // Store handler reference to properly remove listener (performance fix)
    const handleResize = () => {
      setIsMounted(true)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const {
    data: donations,
    isLoading: donationsLoading,
    isError: donationsError,
    refetch: refetchDonations,
  } = useQuery({
    queryKey: ['donations-report', purpose, status],
    queryFn: () =>
      fetchDonations({
        limit: 1000,
        amac: purpose !== 'all' ? (purpose as DonationPurpose) : undefined,
      }),
  })

  const {
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  // Memoize data array to prevent recalculation on every render
  const allDonations = useMemo(() => donations?.data || [], [donations?.data])

  // Calculate statistics with useMemo
  const stats = useMemo(() => {
    const totalAmount = allDonations.reduce((sum, d) => sum + d.tutar, 0)
    const totalCount = allDonations.length
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0
    return { totalAmount, totalCount, avgAmount }
  }, [allDonations])

  const { totalAmount, totalCount, avgAmount } = stats

  // Purpose distribution - optimized with single-pass aggregation
  const purposeDistribution = useMemo(() => {
    // Single pass to build aggregations by purpose
    const purposeAggregations = new Map<string, { count: number; amount: number }>()
    
    for (const d of allDonations) {
      const existing = purposeAggregations.get(d.amac)
      if (existing) {
        existing.count += 1
        existing.amount += d.tutar
      } else {
        purposeAggregations.set(d.amac, { count: 1, amount: d.tutar })
      }
    }
    
    // Map to final format with labels
    return Object.entries(DONATION_PURPOSE_LABELS)
      .map(([key, label]) => {
        const agg = purposeAggregations.get(key)
        return { name: label, count: agg?.count || 0, amount: agg?.amount || 0 }
      })
      .filter((item) => item.count > 0)
  }, [allDonations])

  const handleExportExcel = async () => {
    try {
      // Lazy load ExcelJS sadece export butonuna tıklandığında
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Bağış Raporu')

      worksheet.columns = [
        { header: 'Makbuz No', key: 'makbuzNo', width: 15 },
        { header: 'Bağışçı', key: 'bagisci', width: 25 },
        { header: 'Telefon', key: 'telefon', width: 15 },
        { header: 'Tutar', key: 'tutar', width: 15 },
        { header: 'Amaç', key: 'amac', width: 20 },
        { header: 'Durum', key: 'durum', width: 12 },
        { header: 'Tarih', key: 'tarih', width: 12 },
        { header: 'Ödeme Yöntemi', key: 'odemeYontemi', width: 15 },
      ]

      allDonations.forEach((d) => {
        worksheet.addRow({
          makbuzNo: d.makbuzNo || '-',
          bagisci: `${d.bagisci.ad} ${d.bagisci.soyad}`,
          telefon: d.bagisci.telefon || '-',
          tutar: d.tutar,
          amac: DONATION_PURPOSE_LABELS[d.amac],
          durum: STATUS_LABELS[d.durum] || d.durum,
          tarih: formatDate(d.createdAt, 'dd/MM/yyyy'),
          odemeYontemi: d.odemeYontemi || '-',
        })
      })

      worksheet.getRow(1).font = { bold: true }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bagis-raporu-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Error handled silently in production
    }
  }

  if (donationsLoading || statsLoading) {
    return (
      <div className="animate-in space-y-6">
        <PageHeader
          title="Raporlar"
          description="Detaylı bağış ve finansal raporlar"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (donationsError || statsError) {
    return (
      <div className="animate-in space-y-6">
        <PageHeader
          title="Raporlar"
          description="Detaylı bağış ve finansal raporlar"
        />
        <QueryError
          title="Raporlar Yüklenemedi"
          message="Rapor verileri yüklenirken bir hata oluştu."
          onRetry={refetchDonations}
        />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  {Object.entries(DONATION_PURPOSE_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
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
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Toplam Bağış</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 rounded-xl p-3">
                <TrendingUp className="text-success h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Bağış Sayısı</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 rounded-xl p-3">
                <Calendar className="text-warning h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Ortalama Tutar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(avgAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-chart-4/10 rounded-xl p-3">
                <FileText className="text-chart-4 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Rapor Tarihi</p>
                <p className="text-lg font-bold">{formatDate(new Date())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Donation Trends Chart */}
        <DonationTrendsChart />

        {/* Purpose Distribution */}
        <Card className="hover-glow border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Amaç Dağılımı
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
              {isMounted && purposeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={purposeDistribution}>
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
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : 0
                        return [formatCurrency(numValue), 'Tutar'] as const
                      }}
                    />
                    <Bar
                      dataKey="amount"
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

        {/* Source Distribution */}
        <DonationSourceChart />

        {/* Top Donors */}
        <div className="lg:col-span-1">
          <TopDonorsList />
        </div>
      </div>
    </div>
  )
}
