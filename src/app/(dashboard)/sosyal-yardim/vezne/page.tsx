'use client'

import ExcelJS from 'exceljs'
import { Download, Plus, Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PaymentForm } from '@/components/features/social-aid/payment-form'
import { ReceiptDialog } from '@/components/features/social-aid/receipt-dialog'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDailyCashSummary,
  usePayments,
} from '@/hooks/use-api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payment } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

// Payment columns for the table
const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'beneficiary',
    header: 'İhtiyaç Sahibi',
    cell: ({ row }) => {
      const beneficiary = row.original.beneficiary
      return (
        <div>
          <p className="font-medium">
            {beneficiary
              ? `${beneficiary.ad} ${beneficiary.soyad}`
              : 'Bilinmiyor'}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'tutar',
    header: 'Tutar',
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
        {formatCurrency(row.original.tutar)}
      </span>
    ),
  },
  {
    accessorKey: 'odemeYontemi',
    header: 'Ödeme Yöntemi',
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.odemeYontemi === 'nakit'
          ? 'Nakit'
          : row.original.odemeYontemi === 'havale'
            ? 'Havale'
            : 'Elden'}
      </span>
    ),
  },
  {
    accessorKey: 'odemeTarihi',
    header: 'Ödeme Tarihi',
    cell: ({ row }) => formatDate(row.original.odemeTarihi, 'dd/MM/yyyy'),
  },
  {
    accessorKey: 'durum',
    header: 'Durum',
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.durum === 'odendi'
          ? 'Ödendi'
          : row.original.durum === 'beklemede'
            ? 'Beklemede'
            : 'İptal'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'İşlemler',
    cell: ({ row }) => {
      const payment = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // This will be handled by parent component
            const event = new CustomEvent('openReceipt', {
              detail: { paymentId: payment.id },
            })
            window.dispatchEvent(event)
          }}
        >
          <Receipt className="h-4 w-4" />
        </Button>
      )
    },
  },
]

export default function VeznePage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  )
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const today = new Date().toISOString().split('T')[0]

  const { data: dailySummary, isLoading: summaryLoading } =
    useDailyCashSummary(today)
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page: 1,
    limit: 50,
    startDate: dateFilter,
    endDate: dateFilter,
  })

  const payments = paymentsData?.data || []

  const handleExportExcel = async () => {
    if (!payments.length) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Vezne Ödemeleri')

    worksheet.columns = [
      { header: 'İhtiyaç Sahibi', key: 'beneficiary', width: 25 },
      { header: 'Tutar', key: 'tutar', width: 15 },
      { header: 'Ödeme Yöntemi', key: 'odemeYontemi', width: 15 },
      { header: 'Ödeme Tarihi', key: 'odemeTarihi', width: 15 },
      { header: 'Durum', key: 'durum', width: 12 },
    ]

    payments.forEach((payment) => {
      worksheet.addRow({
        beneficiary: payment.beneficiary
          ? `${payment.beneficiary.ad} ${payment.beneficiary.soyad}`
          : 'Bilinmiyor',
        tutar: payment.tutar,
        odemeYontemi:
          payment.odemeYontemi === 'nakit'
            ? 'Nakit'
            : payment.odemeYontemi === 'havale'
              ? 'Havale'
              : 'Elden',
        odemeTarihi: formatDate(payment.odemeTarihi, 'dd/MM/yyyy'),
        durum:
          payment.durum === 'odendi'
            ? 'Ödendi'
            : payment.durum === 'beklemede'
              ? 'Beklemede'
              : 'İptal',
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
    a.download = `vezne-odemeleri-${dateFilter}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Listen for receipt dialog events
  useEffect(() => {
    const handleOpenReceipt = (event: CustomEvent) => {
      setSelectedPaymentId(event.detail.paymentId)
    }

    window.addEventListener('openReceipt', handleOpenReceipt as EventListener)
    return () => {
      window.removeEventListener(
        'openReceipt',
        handleOpenReceipt as EventListener
      )
    }
  }, [])

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Nakdi Yardım Veznesi"
        description="Nakdi yardım ödemelerini ve vezne işlemlerini yönetin"
        action={
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ödeme
          </Button>
        }
      />

      {/* Daily Summary Cards */}
      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : dailySummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Toplam Ödeme"
            value={formatCurrency(dailySummary.toplamTutar)}
            icon={Download}
          />
          <StatCard
            label="Nakit"
            value={formatCurrency(dailySummary.nakitTutar)}
            icon={Download}
          />
          <StatCard
            label="Havale"
            value={formatCurrency(dailySummary.havaleTutar)}
            icon={Download}
          />
          <StatCard
            label="Ödeme Sayısı"
            value={dailySummary.odemeSayisi.toString()}
            icon={Download}
          />
        </div>
      ) : null}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ödeme Geçmişi</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel&apos;e Aktar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={payments}
            isLoading={paymentsLoading}
            searchPlaceholder="İhtiyaç sahibi ile ara..."
          />
        </CardContent>
      </Card>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Ödeme</DialogTitle>
            <DialogDescription>
              Nakdi yardım ödemesi kaydedin
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSuccess={() => {
              setShowPaymentForm(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      {selectedPaymentId && (
        <ReceiptDialog
          open={!!selectedPaymentId}
          onOpenChange={(open) => {
            if (!open) setSelectedPaymentId(null)
          }}
          paymentId={selectedPaymentId}
        />
      )}
    </div>
  )
}
