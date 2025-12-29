'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { InKindAid } from '@/types'
import { formatDate } from '@/lib/utils'
import { BIRIM_LABELS, YARDIM_TURU_LABELS } from '@/lib/constants'

interface InKindAidColumnsProps {
  onEdit?: (aid: InKindAid) => void
  onDelete?: (aid: InKindAid) => void
}

export function createInKindAidColumns({
  onEdit,
  onDelete,
}: InKindAidColumnsProps = {}): ColumnDef<InKindAid>[] {
  return [
    {
      accessorKey: 'beneficiary',
      header: 'İhtiyaç Sahibi',
      cell: ({ row }) => {
        const beneficiary = row.original.beneficiary
        return (
          <div>
            <p className="font-medium">
              {beneficiary
                ? `${beneficiary.ad} ${beneficiary.soyad}`
                : 'Bilinmiyor'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'yardimTuru',
      header: 'Yardım Türü',
      cell: ({ row }) => (
        <span>{YARDIM_TURU_LABELS[row.original.yardimTuru] || row.original.yardimTuru}</span>
      ),
    },
    {
      accessorKey: 'miktar',
      header: 'Miktar',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.miktar} {BIRIM_LABELS[row.original.birim] || row.original.birim}
        </span>
      ),
    },
    {
      accessorKey: 'dagitimTarihi',
      header: 'Dağıtım Tarihi',
      cell: ({ row }) => formatDate(row.original.dagitimTarihi, 'dd/MM/yyyy'),
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => {
        const aid = row.original

        if (!onEdit && !onDelete) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(aid)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(aid)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

