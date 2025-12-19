'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SosyalYardimBasvuru } from '@/types'

// We'll reuse the SocialAidApplication type but focus on payment details
export const paymentColumns: ColumnDef<SosyalYardimBasvuru>[] = [
    {
        accessorKey: 'basvuranKisi',
        header: 'Hak Sahibi',
        cell: ({ row }) => (
            <div>
                <p className="font-medium">
                    {row.original.basvuranKisi.ad} {row.original.basvuranKisi.soyad}
                </p>
                <p className="text-xs text-muted-foreground">
                    IBAN: {row.original.odemeBilgileri?.iban || '-'}
                </p>
            </div>
        )
    },
    {
        accessorKey: 'yardimTuru',
        header: 'Yardım Türü',
        cell: ({ row }) => (
            <span className="capitalize">{row.original.yardimTuru}</span>
        )
    },
    {
        accessorKey: 'odemeBilgileri.tutar',
        header: 'Ödenen Tutar',
        cell: ({ row }) => (
            <span className="font-mono font-semibold">
                {row.original.odemeBilgileri?.tutar
                    ? formatCurrency(row.original.odemeBilgileri.tutar)
                    : '-'}
            </span>
        )
    },
    {
        accessorKey: 'odemeBilgileri.odemeTarihi',
        header: 'Ödeme Tarihi',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.odemeBilgileri?.odemeTarihi
                    ? formatDate(row.original.odemeBilgileri.odemeTarihi)
                    : '-'}
            </span>
        )
    },
    {
        accessorKey: 'odemeBilgileri.durum',
        header: 'Durum',
        cell: ({ row }) => {
            const isPaid = row.original.odemeBilgileri?.durum === 'odendi'
            return (
                <Badge variant={isPaid ? 'success' : 'outline'}>
                    {isPaid ? (
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Ödendi
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Bekliyor
                        </div>
                    )}
                </Badge>
            )
        }
    }
]
