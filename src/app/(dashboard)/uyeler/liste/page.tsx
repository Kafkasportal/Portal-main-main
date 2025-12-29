'use client'

import { useMemo, useState } from 'react'
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMembers } from '@/hooks/use-api'
import { MEMBER_TYPE_LABELS } from '@/lib/constants'
import { formatDate, formatPhoneNumber, getInitials } from '@/lib/utils'
import type { Uye } from '@/types'

const MEMBER_FILTERS = [
  {
    column: 'uyeTuru',
    title: 'Üye Türü',
    options: [
      { label: 'Aktif Üye', value: 'aktif' },
      { label: 'Onursal Üye', value: 'onursal' },
      { label: 'Genç Üye', value: 'genc' },
      { label: 'Destekçi', value: 'destekci' },
    ],
  },
  {
    column: 'aidatDurumu',
    title: 'Aidat Durumu',
    options: [
      { label: 'Güncel', value: 'guncel' },
      { label: 'Gecikmiş', value: 'gecmis' },
      { label: 'Muaf', value: 'muaf' },
    ],
  },
  {
    column: 'cinsiyet',
    title: 'Cinsiyet',
    options: [
      { label: 'Erkek', value: 'erkek' },
      { label: 'Kadın', value: 'kadin' },
    ],
  },
  {
    column: 'kanGrubu',
    title: 'Kan Grubu',
    options: [
      { label: 'A Rh+', value: 'A+' },
      { label: 'A Rh-', value: 'A-' },
      { label: 'B Rh+', value: 'B+' },
      { label: 'B Rh-', value: 'B-' },
      { label: 'AB Rh+', value: 'AB+' },
      { label: 'AB Rh-', value: 'AB-' },
      { label: '0 Rh+', value: '0+' },
      { label: '0 Rh-', value: '0-' },
    ],
  },
  {
    column: 'il',
    title: 'Şehir',
    options: [
      { label: 'İstanbul', value: 'İstanbul' },
      { label: 'Ankara', value: 'Ankara' },
      { label: 'İzmir', value: 'İzmir' },
      { label: 'Bursa', value: 'Bursa' },
      { label: 'Antalya', value: 'Antalya' },
    ],
  },
]

const memberColumns: ColumnDef<Uye>[] = [
  {
    accessorKey: 'uyeNo',
    header: 'Üye No',
    cell: ({ row }) => (
      <code className="bg-muted rounded px-2 py-1 font-mono text-xs">
        {row.original.uyeNo}
      </code>
    ),
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
          <p className="font-medium">
            {row.original.ad} {row.original.soyad}
          </p>
          <p className="text-muted-foreground text-xs">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'telefon',
    header: 'Telefon',
    cell: ({ row }) => (
      <span className="text-sm">{formatPhoneNumber(row.original.telefon)}</span>
    ),
  },
  {
    accessorKey: 'uyeTuru',
    header: 'Üye Türü',
    cell: ({ row }) => (
      <Badge variant="outline">
        {MEMBER_TYPE_LABELS[row.original.uyeTuru]}
      </Badge>
    ),
  },
  {
    accessorKey: 'aidatDurumu',
    header: 'Aidat Durumu',
    cell: ({ row }) => {
      const durum = row.original.aidatDurumu
      const variants = {
        guncel: 'success',
        gecmis: 'destructive',
        muaf: 'secondary',
      } as const
      const labels = {
        guncel: 'Güncel',
        gecmis: 'Gecikmiş',
        muaf: 'Muaf',
      }
      return <Badge variant={variants[durum]}>{labels[durum]}</Badge>
    },
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
      <span className="text-muted-foreground text-sm">
        {formatDate(row.original.kayitTarihi)}
      </span>
    ),
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
          <DropdownMenuItem asChild>
            <Link href={`/uyeler/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Detay
            </Link>
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
    ),
  },
]

export default function MembersListPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Extract filters for API call
  // Memoize filters to prevent unnecessary query key invalidation on every render
  const filters = useMemo(() => ({
    search: columnFilters.find((f) => f.id === 'ad')?.value as string,
    uyeTuru: columnFilters.find((f) => f.id === 'uyeTuru')?.value as string[],
    aidatDurumu: columnFilters.find((f) => f.id === 'aidatDurumu')?.value as string[],
    cinsiyet: columnFilters.find((f) => f.id === 'cinsiyet')?.value as string[],
    kanGrubu: columnFilters.find((f) => f.id === 'kanGrubu')?.value as string[],
    il: columnFilters.find((f) => f.id === 'il')?.value as string[],
  }), [columnFilters])

  const queryParams = useMemo(() => ({
    limit: 100,
    ...filters,
  }), [filters])

  const { data, isLoading, isError, refetch } = useMembers(queryParams)

  if (isError) {
    return (
      <div className="animate-in space-y-6">
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
        filters={MEMBER_FILTERS}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
      />
    </div>
  )
}
