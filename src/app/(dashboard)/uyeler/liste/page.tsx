'use client'

import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { QueryError } from '@/components/shared/query-error'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { fetchMembers } from '@/lib/supabase-service'
import { formatDate, getInitials, formatPhoneNumber } from '@/lib/utils'
import { MEMBER_TYPE_LABELS } from '@/lib/constants'
import type { Uye } from '@/types'

const memberColumns: ColumnDef<Uye>[] = [
    {
        accessorKey: 'uyeNo',
        header: 'Üye No',
        cell: ({ row }) => (
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {row.original.uyeNo}
            </code>
        )
    },
    {
        accessorKey: 'ad',
        header: 'Ad Soyad',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(`${row.original.ad} ${row.original.soyad}`)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{row.original.ad} {row.original.soyad}</p>
                    <p className="text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'telefon',
        header: 'Telefon',
        cell: ({ row }) => (
            <span className="text-sm">{formatPhoneNumber(row.original.telefon)}</span>
        )
    },
    {
        accessorKey: 'uyeTuru',
        header: 'Üye Türü',
        cell: ({ row }) => (
            <Badge variant="outline">
                {MEMBER_TYPE_LABELS[row.original.uyeTuru]}
            </Badge>
        )
    },
    {
        accessorKey: 'aidatDurumu',
        header: 'Aidat Durumu',
        cell: ({ row }) => {
            const durum = row.original.aidatDurumu
            const variants = {
                guncel: 'success',
                gecmis: 'destructive',
                muaf: 'secondary'
            } as const
            const labels = {
                guncel: 'Güncel',
                gecmis: 'Gecikmiş',
                muaf: 'Muaf'
            }
            return (
                <Badge variant={variants[durum]}>
                    {labels[durum]}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'kayitTarihi',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="-ml-4"
            >
                Kayıt Tarihi
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {formatDate(row.original.kayitTarihi)}
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

export default function MembersListPage() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['members'],
        queryFn: () => fetchMembers({ limit: 1000 }) // Get all for client-side pagination
    })

    if (isError) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Üye Listesi"
                    description="Dernek üyelerini görüntüleyin ve yönetin"
                />
                <QueryError
                    title="Üyeler Yüklenemedi"
                    message="Üye listesi yüklenirken bir hata oluştu."
                    onRetry={refetch}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Üye Listesi"
                description="Dernek üyelerini görüntüleyin ve yönetin"
                action={
                    <Button asChild>
                        <Link href="/uyeler/yeni">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Üye
                        </Link>
                    </Button>
                }
            />

            <DataTable
                columns={memberColumns}
                data={data?.data || []}
                isLoading={isLoading}
                searchPlaceholder="Ad, soyad veya üye no ile ara..."
                searchColumn="ad"
                filters={[
                    {
                        column: 'uyeTuru',
                        title: 'Üye Türü',
                        options: [
                            { label: 'Aktif Üye', value: 'aktif' },
                            { label: 'Onursal Üye', value: 'onursal' },
                            { label: 'Genç Üye', value: 'genc' },
                            { label: 'Destekçi', value: 'destekci' }
                        ]
                    },
                    {
                        column: 'aidatDurumu',
                        title: 'Aidat Durumu',
                        options: [
                            { label: 'Güncel', value: 'guncel' },
                            { label: 'Gecikmiş', value: 'gecmis' },
                            { label: 'Muaf', value: 'muaf' }
                        ]
                    }
                ]}
            />
        </div>
    )
}
