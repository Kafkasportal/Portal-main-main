'use client'

import ExcelJS from 'exceljs'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { donationColumns } from '@/components/features/donations/columns'
import { DonationForm } from '@/components/features/donations/donation-form'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDonations } from '@/hooks/use-api'
import { DONATION_PURPOSE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Bagis } from '@/types'

export default function DonationsListPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useDonations({ limit: 1000 })

  const handleExportExcel = async () => {
    try {
      const donationsData = data?.data || []

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Bağışlar')

      worksheet.columns = [
        { header: 'Makbuz No', key: 'makbuzNo', width: 15 },
        { header: 'Bağışçı Ad', key: 'ad', width: 15 },
        { header: 'Bağışçı Soyad', key: 'soyad', width: 15 },
        { header: 'Telefon', key: 'telefon', width: 15 },
        { header: 'Tutar', key: 'tutar', width: 12 },
        { header: 'Para Birimi', key: 'paraBirimi', width: 10 },
        { header: 'Amaç', key: 'amac', width: 20 },
        { header: 'Durum', key: 'durum', width: 12 },
        { header: 'Tarih', key: 'tarih', width: 12 },
        { header: 'Açıklama', key: 'aciklama', width: 25 },
      ]

      donationsData.forEach((item: Bagis) => {
        worksheet.addRow({
          makbuzNo: item.makbuzNo || '-',
          ad: item.bagisci.ad,
          soyad: item.bagisci.soyad,
          telefon: item.bagisci.telefon || '-',
          tutar: item.tutar,
          paraBirimi: item.currency || 'TRY',
          amac: DONATION_PURPOSE_LABELS[item.amac] || item.amac,
          durum:
            item.durum === 'tamamlandi'
              ? 'Tamamlandı'
              : item.durum === 'beklemede'
                ? 'Beklemede'
                : item.durum === 'iptal'
                  ? 'İptal'
                  : item.durum,
          tarih: formatDate(new Date(item.createdAt)),
          aciklama: item.aciklama || '-',
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
      a.download = `bagis-listesi-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Error handled silently in production
    }
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bağış Listesi"
          description="Tüm bağışları görüntüleyin ve yönetin"
        />
        <QueryError
          title="Bağışlar Yüklenemedi"
          message="Bağış listesi yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bağış Listesi"
        description="Tüm bağışları görüntüleyin ve yönetin"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Excel İndir
            </Button>
            <Button
              onClick={() => {
                setIsSheetOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Bağış
            </Button>
          </div>
        }
      />

      <DataTable
        columns={donationColumns}
        data={data?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Bağışçı adı veya makbuz no ile ara..."
        searchColumn="bagisci"
        filters={[
          {
            column: 'durum',
            title: 'Durum',
            options: [
              { label: 'Tamamlandı', value: 'tamamlandi' },
              { label: 'Beklemede', value: 'beklemede' },
              { label: 'İptal', value: 'iptal' },
            ],
          },
          {
            column: 'amac',
            title: 'Amaç',
            options: [
              { label: 'Genel', value: 'genel' },
              { label: 'Eğitim', value: 'egitim' },
              { label: 'Sağlık', value: 'saglik' },
              { label: 'İnsani Yardım', value: 'insani-yardim' },
            ],
          },
        ]}
      />

      {/* New Donation Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Yeni Bağış Ekle</SheetTitle>
          </SheetHeader>
          <DonationForm
            onSuccess={() => {
              setIsSheetOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
