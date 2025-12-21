'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet'
import { donationColumns } from '@/components/features/donations/columns'
import { DonationForm } from '@/components/features/donations/donation-form'
import { fetchDonations } from '@/lib/mock-service'
import type { Bagis } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_VARIANTS, DONATION_PURPOSE_LABELS } from '@/lib/constants'

export default function DonationsListPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['donations'],
        queryFn: () => fetchDonations({ pageSize: 1000 }) // Get more for export
    })

    const handleExportExcel = () => {
        try {
            const donationsData = data?.data || []
            
            // Map donations to Excel format
            const exportData = donationsData.map((item: Bagis) => ({
                'Makbuz No': item.makbuzNo || '-',
                'Bağışçı Ad': item.bagisci.ad,
                'Bağışçı Soyad': item.bagisci.soyad,
                'Telefon': item.bagisci.telefon || '-',
                'Tutar': item.tutar,
                'Para Birimi': item.paraBirimi || 'TRY',
                'Amaç': DONATION_PURPOSE_LABELS[item.amac] || item.amac,
                'Durum': item.durum === 'tamamlandi' ? 'Tamamlandı' : 
                        item.durum === 'beklemede' ? 'Beklemede' : 
                        item.durum === 'iptal' ? 'İptal' : item.durum,
                'Tarih': formatDate(item.tarih),
                'Açıklama': item.aciklama || '-'
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Bağışlar')
            const fileName = `bagis-listesi-${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(wb, fileName)
            
            // Log for testing purposes
            console.log('Excel export completed:', fileName, 'Records:', exportData.length)
        } catch (error) {
            console.error('Excel export failed:', error)
        }
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
                        <Button onClick={() => setIsSheetOpen(true)}>
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
                            { label: 'İptal', value: 'iptal' }
                        ]
                    },
                    {
                        column: 'amac',
                        title: 'Amaç',
                        options: [
                            { label: 'Genel', value: 'genel' },
                            { label: 'Eğitim', value: 'egitim' },
                            { label: 'Sağlık', value: 'saglik' },
                            { label: 'İnsani Yardım', value: 'insani-yardim' }
                        ]
                    }
                ]}
            />

            {/* New Donation Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Yeni Bağış Ekle</SheetTitle>
                    </SheetHeader>
                    <DonationForm onSuccess={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
