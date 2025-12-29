'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useHospitals } from '@/hooks/use-api'
import { HospitalForm } from '@/components/features/hospitals/hospital-form'
import type { Hospital } from '@/types'

export const hospitalColumns: ColumnDef<Hospital>[] = [
  {
    accessorKey: 'name',
    header: 'Hastane Adı',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          {row.original.address || '-'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'specialties',
    header: 'Uzmanlık Alanları',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-[300px]">
        {row.original.specialties.map((spec, i) => (
          <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0 h-4">
            {spec}
          </Badge>
        ))}
        {row.original.specialties.length === 0 && '-'}
      </div>
    ),
  },
  {
    accessorKey: 'contact',
    header: 'İletişim',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 text-xs">
        {row.original.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.original.phone}
          </span>
        )}
        {row.original.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {row.original.email}
          </span>
        )}
        {!row.original.phone && !row.original.email && '-'}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Durum',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'success' : 'secondary'} className="gap-1">
        {row.original.isActive ? (
          <>
            <CheckCircle2 className="h-3 w-3" /> Aktif
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3" /> Pasif
          </>
        )}
      </Badge>
    ),
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

export default function HospitalsPage() {
  const { data: hospitals, isLoading } = useHospitals()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hastane Rehberi"
        description="Anlaşmalı hastaneleri ve uzmanlık alanlarını yönetin"
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Hastane
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Hastane Kaydı</DialogTitle>
                <DialogDescription>
                  Sisteme yeni bir anlaşmalı hastane ekleyin.
                </DialogDescription>
              </DialogHeader>
              <HospitalForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={hospitalColumns}
        data={hospitals || []}
        isLoading={isLoading}
        searchPlaceholder="Hastane adı ile ara..."
        searchColumn="name"
      />
    </div>
  )
}
