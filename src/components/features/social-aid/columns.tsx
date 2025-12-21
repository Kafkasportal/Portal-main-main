'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_VARIANTS, AID_TYPE_LABELS } from '@/lib/constants'
import type { SosyalYardimBasvuru } from '@/types'

export const applicationColumns: ColumnDef<SosyalYardimBasvuru>[] = [
    {
        accessorKey: 'basvuranKisi.ad',
        header: 'Başvuran',
        cell: ({ row }) => (
            <div>
                <p className="font-medium">
                    {row.original.basvuranKisi.ad} {row.original.basvuranKisi.soyad}
                </p>
                <p className="text-xs text-muted-foreground">
                    {row.original.basvuranKisi.tcKimlikNo}
                </p>
            </div>
        )
    },
    {
        accessorKey: 'yardimTuru',
        header: 'Yardım Türü',
        cell: ({ row }) => (
            <Badge variant="outline">
                {AID_TYPE_LABELS[row.original.yardimTuru]}
            </Badge>
        )
    },
    {
        accessorKey: 'talepEdilenTutar',
        header: 'Talep Edilen',
        cell: ({ row }) => (
            <span className="font-mono">
                {row.original.talepEdilenTutar
                    ? formatCurrency(row.original.talepEdilenTutar)
                    : '-'}
            </span>
        )
    },
    {
        accessorKey: 'durum',
        header: 'Durum',
        cell: ({ row }) => {
            const durum = row.original.durum
            return (
                <Badge variant={STATUS_VARIANTS[durum] as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}>
                    {durum.charAt(0).toUpperCase() + durum.slice(1)}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Tarih',
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {formatDate(row.original.createdAt)}
            </span>
        )
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Detayları Gör
                    </DropdownMenuItem>
                    {row.original.durum === 'beklemede' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-success">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Onayla
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reddet
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
]
