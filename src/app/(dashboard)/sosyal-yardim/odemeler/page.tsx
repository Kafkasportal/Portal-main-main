'use client'

import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

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
        app.durum === 'onaylandi' || app.durum === 'tamamlandi'
    ) || []

    const handleExportExcel = () => {
        const exportData = paymentsData.map(item => ({
            'Ad Soyad': `${item.basvuranKisi.ad} ${item.basvuranKisi.soyad}`,
            'TC Kimlik': item.basvuranKisi.tcKimlikNo,
            'Yardım Türü': item.yardimTuru,
            'Ödenen Tutar': item.odemeBilgileri?.tutar,
            'IBAN': item.odemeBilgileri?.iban,
            'Banka': item.odemeBilgileri?.bankaAdi,
            'Ödeme Tarihi': item.odemeBilgileri?.odemeTarihi ? formatDate(item.odemeBilgileri.odemeTarihi) : '-',
            'Durum': item.odemeBilgileri?.durum === 'odendi' ? 'Ödendi' : 'Bekliyor'
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Ödemeler")
        XLSX.writeFile(wb, "odeme-listesi.xlsx")
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ödeme Takibi"
                description="Yapılan ve bekleyen sosyal yardım ödemeleri"
                action={
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel'e Aktar
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
