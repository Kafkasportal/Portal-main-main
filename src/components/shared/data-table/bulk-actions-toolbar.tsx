'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  requiresConfirm?: boolean
  confirmMessage?: string
}

interface BulkActionsToolbarProps {
  selectedCount: number
  onBulkDelete?: (ids: string[]) => Promise<void>
  onStatusUpdate?: (ids: string[], status: string) => Promise<void>
  onBulkAction?: (action: string, ids: string[]) => Promise<void>
  statusOptions?: { label: string; value: string }[]
  customActions?: BulkAction[]
  selectedIds: string[]
  disabled?: boolean
}

/**
 * Bulk Actions Toolbar Component
 * Displays actions for selected rows in DataTable
 */
export function BulkActionsToolbar({
  selectedCount,
  onBulkDelete,
  onStatusUpdate,
  onBulkAction,
  statusOptions = [],
  customActions = [],
  selectedIds,
  disabled = false,
}: BulkActionsToolbarProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return

    setIsLoading(true)
    try {
      await onBulkDelete(selectedIds)
      toast.success('Başarıyla silindi', {
        description: `${selectedIds.length} öğe silindi.`,
      })
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Bulk delete failed:', error)
      toast.error('Silme başarısız', {
        description: 'Lütfen tekrar deneyiniz.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !onStatusUpdate) return

    setIsLoading(true)
    try {
      await onStatusUpdate(selectedIds, selectedStatus)
      toast.success('Başarıyla güncellendi', {
        description: `${selectedIds.length} öğenin durumu değiştirildi.`,
      })
      setSelectedStatus('')
    } catch (error) {
      console.error('Status update failed:', error)
      toast.error('Güncelleme başarısız', {
        description: 'Lütfen tekrar deneyiniz.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomAction = async (action: BulkAction) => {
    if (!onBulkAction) return

    setIsLoading(true)
    try {
      await onBulkAction(action.id, selectedIds)
      toast.success('İşlem tamamlandı', {
        description: `${selectedIds.length} öğeye işlem uygulandı.`,
      })
    } catch (error) {
      console.error('Custom action failed:', error)
      toast.error('İşlem başarısız', {
        description: 'Lütfen tekrar deneyiniz.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950 sm:flex-row sm:items-center sm:justify-between">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} öğe seçildi
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Status Update */}
          {statusOptions.length > 0 && onStatusUpdate && (
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Durumu değiştir..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStatusUpdate}
                disabled={
                  disabled || isLoading || !selectedStatus || selectedCount === 0
                }
                className="whitespace-nowrap gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Uygula
              </Button>
            </div>
          )}

          {/* Custom Actions */}
          {customActions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={action.variant || 'outline'}
              onClick={() => handleCustomAction(action)}
              disabled={disabled || isLoading || selectedCount === 0}
              className="whitespace-nowrap gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* Delete Button */}
          {onBulkDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={disabled || isLoading || selectedCount === 0}
              className="whitespace-nowrap gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silmeyi Onayla</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount} öğeyi silmek istediğinizden emin misiniz? Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">
                Uyarı: Bu işlem tüm seçili öğeleri kalıcı olarak silecektir.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={isLoading}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
