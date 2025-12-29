'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  Hospital as HospitalIcon,
  User as UserIcon,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Stethoscope,
} from 'lucide-react'
import Link from 'next/link'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useReferrals } from '@/hooks/use-api'
import { ReferralForm } from '@/components/features/referrals/referral-form'
import { formatDate } from '@/lib/utils'
import type { Referral } from '@/types'

const REFERRAL_STATUS_LABELS: Record<string, string> = {
  referred: 'Sevk Edildi',
  scheduled: 'Randevu Alındı',
  treated: 'Tedavi Tamamlandı',
  'follow-up': 'Kontrol / Takip',
  cancelled: 'İptal Edildi',
}

type BadgeVariant =
  | 'info'
  | 'warning'
  | 'success'
  | 'secondary'
  | 'destructive'
  | 'default'
  | 'outline'

const REFERRAL_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  referred: 'info',
  scheduled: 'warning',
  treated: 'success',
  'follow-up': 'secondary',
  cancelled: 'destructive',
}

export const referralColumns: ColumnDef<Referral>[] = [
  {
    accessorKey: 'beneficiary',
    header: 'Hasta / Faydalanıcı',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {row.original.beneficiary?.ad} {row.original.beneficiary?.soyad}
        </span>
        <span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
          <UserIcon className="h-3 w-3" />
          Faydalanıcı
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'hospital',
    header: 'Hastane',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="text-muted-foreground h-4 w-4" />
        <span className="text-sm">{row.original.hospital?.name || '-'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Sevk Nedeni',
    cell: ({ row }) => (
      <span
        className="block max-w-50 truncate text-sm"
        title={row.original.reason}
      >
        {row.original.reason}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => (
      <Badge variant={REFERRAL_STATUS_VARIANTS[row.original.status]}>
        {REFERRAL_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: 'referralDate',
    header: 'Sevk Tarihi',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="text-muted-foreground h-4 w-4" />
        {formatDate(row.original.referralDate)}
      </div>
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
            <Link href={`/sosyal-yardim/hastane-sevk/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> Detaylar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" /> Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export default function HastaneSevkPage() {
  const { data: referrals, isLoading } = useReferrals()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hastane Sevk İşlemleri"
        description="Sağlık yardımları ve hastane sevk süreçlerini yönetin"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/sosyal-yardim/hastane-sevk/hastaneler">
                <HospitalIcon className="mr-2 h-4 w-4" />
                Hastane Rehberi
              </Link>
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Sevk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yeni Sevk Kaydı</DialogTitle>
                  <DialogDescription>
                    Hastayı bir sağlık kuruluşuna sevk edin.
                  </DialogDescription>
                </DialogHeader>
                <ReferralForm onSuccess={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500 p-2">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Toplam Sevk
              </p>
              <p className="text-2xl font-bold">{referrals?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500 p-2">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Bekleyen Randevular
              </p>
              <p className="text-2xl font-bold">
                {referrals?.filter((r) => r.status === 'scheduled').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500 p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Tamamlanan Tedaviler
              </p>
              <p className="text-2xl font-bold">
                {referrals?.filter(
                  (r) => r.status === 'treated' || r.status === 'follow-up'
                ).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={referralColumns}
        data={referrals || []}
        isLoading={isLoading}
        searchPlaceholder="Hasta adı ile ara..."
        searchColumn="beneficiary"
      />
    </div>
  )
}

import { Card } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
