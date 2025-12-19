'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Download } from 'lucide-react'

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

export default function DonationsListPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['donations'],
        queryFn: () => fetchDonations({ pageSize: 50 })
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bağış Listesi"
                description="Tüm bağışları görüntüleyin ve yönetin"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline">
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
