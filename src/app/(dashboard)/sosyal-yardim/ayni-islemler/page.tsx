'use client'

import ExcelJS from 'exceljs'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { InKindAidForm } from '@/components/features/social-aid/in-kind-aid-form'
import { createInKindAidColumns } from '@/components/features/social-aid/in-kind-aid-columns'
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
import {
  useDeleteInKindAid,
  useInKindAids,
} from '@/hooks/use-api'
import { formatDate } from '@/lib/utils'
import { BIRIM_LABELS, YARDIM_TURU_LABELS } from '@/lib/constants'
import type { InKindAid } from '@/types'

export default function AyniIslemlerPage() {
  const [showAidForm, setShowAidForm] = useState(false)
  const [editingAid, setEditingAid] = useState<InKindAid | null>(null)
  const [deletingAid, setDeletingAid] = useState<InKindAid | null>(null)
  const [yardimTuruFilter, setYardimTuruFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: aidsData, isLoading } = useInKindAids({
    page: 1,
    limit: 100,
    yardimTuru: yardimTuruFilter !== 'all' ? yardimTuruFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const aids = aidsData?.data || []

  const { mutate: deleteAid } = useDeleteInKindAid()

  const handleEdit = (aid: InKindAid) => {
    setEditingAid(aid)
    setShowAidForm(true)
  }

  const handleDelete = (aid: InKindAid) => {
    setDeletingAid(aid)
  }

  const confirmDelete = () => {
    if (deletingAid) {
      deleteAid(deletingAid.id, {
        onSuccess: () => {
          setDeletingAid(null)
        },
      })
    }
  }

  const handleUpdate = () => {
    setShowAidForm(false)
    setEditingAid(null)
  }

  const handleExportExcel = async () => {
    if (!aids.length) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Ayni Yardımlar')

    worksheet.columns = [
      { header: 'İhtiyaç Sahibi', key: 'beneficiary', width: 25 },
      { header: 'Yardım Türü', key: 'yardimTuru', width: 15 },
      { header: 'Miktar', key: 'miktar', width: 15 },
      { header: 'Birim', key: 'birim', width: 12 },
      { header: 'Dağıtım Tarihi', key: 'dagitimTarihi', width: 15 },
    ]

    aids.forEach((aid) => {
      worksheet.addRow({
        beneficiary: aid.beneficiary
          ? `${aid.beneficiary.ad} ${aid.beneficiary.soyad}`
          : 'Bilinmiyor',
        yardimTuru: YARDIM_TURU_LABELS[aid.yardimTuru] || aid.yardimTuru,
        miktar: aid.miktar,
        birim: BIRIM_LABELS[aid.birim] || aid.birim,
        dagitimTarihi: formatDate(aid.dagitimTarihi, 'dd/MM/yyyy'),
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
    a.download = `ayni-yardimlar-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = createInKindAidColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Ayni Yardım İşlemleri"
        description="Gıda, giyim ve diğer ayni yardım süreçlerini yönetin"
        action={
          <Button onClick={() => setShowAidForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ayni Yardım
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Yardım Türü</label>
          <Select value={yardimTuruFilter} onValueChange={setYardimTuruFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="gida">Gıda</SelectItem>
              <SelectItem value="giyim">Giyim</SelectItem>
              <SelectItem value="yakacak">Yakacak</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
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

      {/* Aids Table */}
      <DataTable
        columns={columns}
        data={aids}
        isLoading={isLoading}
        searchPlaceholder="İhtiyaç sahibi ile ara..."
      />

      {/* Aid Form Dialog */}
      <Dialog
        open={showAidForm}
        onOpenChange={(open) => {
          setShowAidForm(open)
          if (!open) {
            setEditingAid(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAid ? 'Ayni Yardım Düzenle' : 'Yeni Ayni Yardım'}
            </DialogTitle>
            <DialogDescription>
              {editingAid
                ? 'Ayni yardım bilgilerini güncelleyin'
                : 'Ayni yardım kaydı oluşturun'}
            </DialogDescription>
          </DialogHeader>
          <InKindAidForm
            editingAid={editingAid}
            onSuccess={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAid}
        onOpenChange={(open) => {
          if (!open) setDeletingAid(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ayni Yardımı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ayni yardım kaydını silmek istediğinizden emin misiniz? Bu
              işlem geri alınamaz.
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
    </div>
  )
}
