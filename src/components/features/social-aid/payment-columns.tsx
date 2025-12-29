'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle, Clock, MoreHorizontal, Pencil, Receipt, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payment } from '@/types'

interface PaymentColumnsProps {
  onEdit?: (payment: Payment) => void
  onDelete?: (payment: Payment) => void
  onViewReceipt?: (payment: Payment) => void
}

export function createPaymentColumns({
  onEdit,
  onDelete,
  onViewReceipt,
}: PaymentColumnsProps = {}): ColumnDef<Payment>[] {
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
            {row.original.makbuzNo && (
              <p className="text-muted-foreground text-xs">
                Makbuz: {row.original.makbuzNo}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'tutar',
      header: 'Tutar',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {formatCurrency(row.original.tutar)}
        </span>
      ),
    },
    {
      accessorKey: 'odemeYontemi',
      header: 'Ödeme Yöntemi',
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.odemeYontemi === 'nakit'
            ? 'Nakit'
            : row.original.odemeYontemi === 'havale'
              ? 'Havale'
              : 'Elden'}
        </span>
      ),
    },
    {
      accessorKey: 'odemeTarihi',
      header: 'Ödeme Tarihi',
      cell: ({ row }) => formatDate(row.original.odemeTarihi, 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'durum',
      header: 'Durum',
      cell: ({ row }) => {
        const isPaid = row.original.durum === 'odendi'
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
                {row.original.durum === 'beklemede' ? 'Bekliyor' : 'İptal'}
              </div>
            )}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => {
        const payment = row.original

        if (!onEdit && !onDelete && !onViewReceipt) {
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
              {onViewReceipt && (
                <DropdownMenuItem
                  onClick={() => onViewReceipt(payment)}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Makbuz Görüntüle
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(payment)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(payment)}
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

// Legacy export for backward compatibility
export const paymentColumns: ColumnDef<Payment>[] = createPaymentColumns()
