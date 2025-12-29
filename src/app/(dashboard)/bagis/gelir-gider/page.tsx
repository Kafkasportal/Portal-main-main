'use client'

import ExcelJS from 'exceljs'
import { ArrowDown, ArrowUp, Download, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FinancialDistributionChart } from '@/components/features/charts/financial-distribution-chart'
import { IncomeExpenseChart } from '@/components/features/charts/income-expense-chart'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useExpenseByCategory,
  useFinancialSummary,
  useIncomeByCategory,
  useIncomeExpenseReport,
} from '@/hooks/use-api'
import { formatCurrency } from '@/lib/utils'

export default function GelirGiderPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 300)
    window.addEventListener('resize', () => {
      setIsMounted(true)
    })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', () => {
        setIsMounted(true)
      })
    }
  }, [])

  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(
    startDate,
    endDate
  )
  const { data: report, isLoading: reportLoading } = useIncomeExpenseReport(
    startDate,
    endDate
  )
  const { data: incomeByCategory, isLoading: incomeLoading } =
    useIncomeByCategory(startDate, endDate)
  const { data: expenseByCategory, isLoading: expenseLoading } =
    useExpenseByCategory(startDate, endDate)

  const handleExportExcel = async () => {
    if (!report || report.length === 0) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Gelir-Gider Raporu')

    worksheet.columns = [
      { header: 'Tarih', key: 'tarih', width: 15 },
      { header: 'Gelir', key: 'gelir', width: 15 },
      { header: 'Gider', key: 'gider', width: 15 },
      { header: 'Net', key: 'net', width: 15 },
    ]

    report.forEach((item) => {
      worksheet.addRow({
        tarih: item.tarih.toISOString().split('T')[0],
        gelir: item.gelir,
        gider: item.gider,
        net: item.net,
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
    a.download = `gelir-gider-raporu-${startDate}-${endDate}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (summaryLoading || reportLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gelir-Gider Yönetimi"
          description="Dernek gelir ve giderlerini takip edin"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gelir-Gider Yönetimi"
          description="Dernek gelir ve giderlerini takip edin"
        />
        <div className="text-center text-muted-foreground">
          Veri yüklenemedi
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Gelir-Gider Yönetimi"
        description="Dernek gelir ve giderlerini takip edin"
        action={
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel&apos;e Aktar
          </Button>
        }
      />

      {/* Date Range Filter */}
      <div className="flex gap-4 rounded-lg border p-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Bitiş Tarihi</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Gelir"
          value={formatCurrency(summary.toplamGelir)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          label="Toplam Gider"
          value={formatCurrency(summary.toplamGider)}
          icon={TrendingDown}
          variant="destructive"
        />
        <StatCard
          label="Net Bakiye"
          value={formatCurrency(summary.netBakiye)}
          icon={summary.netBakiye >= 0 ? TrendingUp : TrendingDown}
          variant={summary.netBakiye >= 0 ? 'success' : 'destructive'}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Karşılaştırma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gelir:</span>
                <div className="flex items-center gap-1">
                  {summary.gelirArtis >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      summary.gelirArtis >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {summary.gelirArtis >= 0 ? '+' : ''}
                    {summary.gelirArtis.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gider:</span>
                <div className="flex items-center gap-1">
                  {summary.giderArtis >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      summary.giderArtis >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {summary.giderArtis >= 0 ? '+' : ''}
                    {summary.giderArtis.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {isMounted && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gelir-Gider Trendi</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart
                data={report || []}
                isLoading={reportLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gelir Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialDistributionChart
                data={incomeByCategory || []}
                isLoading={incomeLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gider Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialDistributionChart
                data={expenseByCategory || []}
                isLoading={expenseLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
