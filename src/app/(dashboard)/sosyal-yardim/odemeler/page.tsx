'use client'

import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import ExcelJS from 'exceljs'

import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { paymentColumns } from '@/components/features/social-aid/payment-columns'
import { fetchApplications } from '@/lib/mock-service'
import { formatDate } from '@/lib/utils'

export default function PaymentsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['applications', 'payments'],
        queryFn: () => fetchApplications({ pageSize: 100 }) // Get more for export
    })

    // Filter only approved/completed applications for payments view
    const paymentsData = data?.data.filter(app =>
        app.durum === 'onaylandi' || app.durum === 'odendi'
    ) || []

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Ödemeler')
        
        // Header row
        worksheet.columns = [
            { header: 'Ad Soyad', key: 'adSoyad', width: 25 },
            { header: 'TC Kimlik', key: 'tcKimlik', width: 15 },
            { header: 'Yardım Türü', key: 'yardimTuru', width: 15 },
            { header: 'Ödenen Tutar', key: 'tutar', width: 15 },
            { header: 'IBAN', key: 'iban', width: 30 },
            { header: 'Banka', key: 'banka', width: 20 },
            { header: 'Ödeme Tarihi', key: 'odemeTarihi', width: 15 },
            { header: 'Durum', key: 'durum', width: 12 }
        ]
        
        // Add data rows
        paymentsData.forEach(item => {
            worksheet.addRow({
                adSoyad: `${item.basvuranKisi.ad} ${item.basvuranKisi.soyad}`,
                tcKimlik: item.basvuranKisi.tcKimlikNo,
                yardimTuru: item.yardimTuru,
                tutar: item.odemeBilgileri?.tutar,
                iban: item.odemeBilgileri?.iban,
                banka: item.odemeBilgileri?.bankaAdi,
                odemeTarihi: item.odemeBilgileri?.odemeTarihi ? formatDate(item.odemeBilgileri.odemeTarihi) : '-',
                durum: item.odemeBilgileri?.durum === 'odendi' ? 'Ödendi' : 'Bekliyor'
            })
        })
        
        // Style header row
        worksheet.getRow(1).font = { bold: true }
        
        // Generate and download
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'odeme-listesi.xlsx'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ödeme Takibi"
                description="Yapılan ve bekleyen sosyal yardım ödemeleri"
                action={
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel&apos;e Aktar
                    </Button>
                }
            />

            <DataTable
                columns={paymentColumns}
                data={paymentsData}
                isLoading={isLoading}
                searchPlaceholder="İsim ile ara..."
                searchColumn="basvuranKisi"
            />
        </div>
    )
}
