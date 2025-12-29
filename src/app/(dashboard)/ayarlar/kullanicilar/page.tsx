'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUsers, useDeleteUser } from '@/hooks/use-api'
import { createUserColumns } from '@/components/features/settings/user-columns'
import { UserForm } from '@/components/features/settings/user-form'
import type { User } from '@/types'

const USER_FILTERS = [
  {
    column: 'role',
    title: 'Rol',
    options: [
      { label: 'Yönetici', value: 'admin' },
      { label: 'Muhasebe', value: 'moderator' },
      { label: 'Görevli', value: 'user' },
    ],
  },
]

export default function UsersPage() {
  const { data, isLoading, error, refetch } = useUsers({
    page: 1,
    limit: 100, // Get all users for client-side filtering
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const deleteMutation = useDeleteUser()

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
  }

  const confirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id, {
        onSuccess: () => {
          setDeletingUser(null)
        },
      })
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingUser(null)
  }

  const columns = createUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  if (error) {
    return (
      <QueryError
        title="Kullanıcılar Yüklenemedi"
        message="Kullanıcı listesi yüklenirken bir hata oluştu."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Kullanıcılar"
        description="Panel kullanıcılarını ve yetkilerini yönetin"
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.totalPages || 0}
        isLoading={isLoading}
        searchPlaceholder="Kullanıcı ara (isim, e-posta)..."
        searchColumn="name"
        filters={USER_FILTERS}
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        user={editingUser}
      />

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser && (
                <>
                  <strong>{deletingUser.name}</strong> kullanıcısını silmek
                  istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
