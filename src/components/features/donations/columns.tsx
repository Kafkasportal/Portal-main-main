'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Bagis } from '@/types'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { STATUS_VARIANTS, DONATION_PURPOSE_LABELS } from '@/lib/constants'

export const donationColumns: ColumnDef<Bagis>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Tümünü seç"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Satırı seç"
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'makbuzNo',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation()
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }}
                className="-ml-4 h-auto"
            >
                Makbuz No
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {row.original.makbuzNo || '-'}
            </code>
        )
    },
    {
        accessorKey: 'bagisci',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation()
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }}
                className="-ml-4 h-auto"
            >
                Bağışçı
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const bagisci = row.original.bagisci
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(`${bagisci.ad} ${bagisci.soyad}`)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{bagisci.ad} {bagisci.soyad}</p>
                        <p className="text-xs text-muted-foreground">{bagisci.telefon}</p>
                    </div>
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const nameA = `${rowA.original.bagisci.ad} ${rowA.original.bagisci.soyad}`.toLowerCase()
            const nameB = `${rowB.original.bagisci.ad} ${rowB.original.bagisci.soyad}`.toLowerCase()
            return nameA.localeCompare(nameB)
        }
    },
    {
        accessorKey: 'tutar',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="-ml-4"
            >
                Tutar
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-mono font-semibold">
                {formatCurrency(row.original.tutar, row.original.currency)}
            </span>
        )
    },
    {
        accessorKey: 'amac',
        header: 'Amaç',
        cell: ({ row }) => (
            <span className="text-sm">
                {DONATION_PURPOSE_LABELS[row.original.amac]}
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
        },
        filterFn: (row, id, value) => {
            return value === row.getValue(id)
        }
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="-ml-4"
            >
                Tarih
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {formatDate(row.original.createdAt)}
            </span>
        )
    },
    {
        id: 'actions',
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">İşlemler</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Detay
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Makbuzu İndir
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
]
