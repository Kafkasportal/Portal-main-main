'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { User } from '@/types'
import { formatDate, getInitials } from '@/lib/utils'

const ROLE_LABELS = {
  admin: 'Yönetici',
  muhasebe: 'Muhasebe',
  gorevli: 'Görevli',
  uye: 'Üye',
} as const

const ROLE_VARIANTS = {
  admin: 'destructive',
  muhasebe: 'default',
  gorevli: 'secondary',
  uye: 'outline',
} as const

interface UserColumnsProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function createUserColumns({
  onEdit,
  onDelete,
}: UserColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-auto"
        >
          Ad Soyad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-auto"
        >
          E-posta
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge
            variant={
              ROLE_VARIANTS[role] as
                | 'default'
                | 'secondary'
                | 'destructive'
                | 'outline'
            }
          >
            {ROLE_LABELS[role]}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id)
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Durum',
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'lastLogin',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-auto"
        >
          Son Giriş
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin
        return (
          <span className="text-muted-foreground text-sm">
            {lastLogin ? formatDate(lastLogin) : 'Hiç giriş yapılmadı'}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-auto"
        >
          Oluşturulma
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">İşlemler</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

