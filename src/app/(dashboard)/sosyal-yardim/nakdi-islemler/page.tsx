'use client'

import ExcelJS from 'exceljs'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { PaymentForm } from '@/components/features/social-aid/payment-form'
import { ReceiptDialog } from '@/components/features/social-aid/receipt-dialog'
import { createPaymentColumns } from '@/components/features/social-aid/payment-columns'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeletePayment, usePayments } from '@/hooks/use-api'
import { formatDate } from '@/lib/utils'
import type { Payment } from '@/types'

export default function NakdiIslemlerPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  )
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: paymentsData, isLoading } = usePayments({
    page: 1,
    limit: 100,
    durum: statusFilter !== 'all' ? statusFilter : undefined,
    odemeYontemi:
      paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const payments = paymentsData?.data || []

  const { mutate: deletePayment } = useDeletePayment()

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setShowPaymentForm(true)
  }

  const handleDelete = (payment: Payment) => {
    setDeletingPayment(payment)
  }

  const confirmDelete = () => {
    if (deletingPayment) {
      deletePayment(deletingPayment.id, {
        onSuccess: () => {
          setDeletingPayment(null)
        },
      })
    }
  }

  const handleExportExcel = async () => {
    if (!payments.length) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Nakdi İşlemler')

    worksheet.columns = [
      { header: 'İhtiyaç Sahibi', key: 'beneficiary', width: 25 },
      { header: 'Tutar', key: 'tutar', width: 15 },
      { header: 'Ödeme Yöntemi', key: 'odemeYontemi', width: 15 },
      { header: 'Ödeme Tarihi', key: 'odemeTarihi', width: 15 },
      { header: 'Durum', key: 'durum', width: 12 },
      { header: 'Makbuz No', key: 'makbuzNo', width: 15 },
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
        makbuzNo: payment.makbuzNo || '-',
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
    a.download = `nakdi-islemler-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = createPaymentColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewReceipt: (payment) => setSelectedPaymentId(payment.id),
  })

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Nakdi Yardım İşlemleri"
        description="Nakdi yardım süreçlerini ve ödemeleri takip edin"
        action={
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ödeme
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Durum</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="odendi">Ödendi</SelectItem>
              <SelectItem value="iptal">İptal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">
            Ödeme Yöntemi
          </label>
          <Select
            value={paymentMethodFilter}
            onValueChange={setPaymentMethodFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="nakit">Nakit</SelectItem>
              <SelectItem value="havale">Havale</SelectItem>
              <SelectItem value="elden">Elden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Başlangıç Tarihi</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Bitiş Tarihi</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel&apos;e Aktar
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        searchPlaceholder="İhtiyaç sahibi ile ara..."
      />

      {/* Payment Form Dialog */}
      <Dialog
        open={showPaymentForm}
        onOpenChange={(open) => {
          setShowPaymentForm(open)
          if (!open) {
            setEditingPayment(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Ödeme Düzenle' : 'Yeni Ödeme'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? 'Ödeme bilgilerini güncelleyin'
                : 'Nakdi yardım ödemesi kaydedin'}
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            editingPayment={editingPayment}
            onSuccess={() => {
              setShowPaymentForm(false)
              setEditingPayment(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPayment}
        onOpenChange={(open) => {
          if (!open) setDeletingPayment(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ödemeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
