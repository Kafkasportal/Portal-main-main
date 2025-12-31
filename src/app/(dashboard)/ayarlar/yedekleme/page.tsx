'use client'

import { useState, useEffect } from 'react'
import { Download, Database, Upload, Trash2, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Backup, BackupType } from '@/types'
import {
  createFullBackup,
  createDataOnlyBackup,
  restoreFromBackup,
  getBackupHistory,
  deleteBackupFromHistory,
  type BackupMetadata,
} from '@/lib/services/backup.service'

const BACKUP_TYPE_LABELS = {
  full: 'Tam Yedek',
  'data-only': 'Sadece Veri',
  'schema-only': 'Sadece Şema',
} as const

const BACKUP_STATUS_LABELS = {
  pending: 'Beklemede',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
} as const

const BACKUP_STATUS_VARIANTS = {
  pending: 'warning',
  completed: 'success',
  failed: 'destructive',
} as const

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [deletingBackup, setDeletingBackup] = useState<BackupMetadata | null>(null)

  // Load backup history on mount
  useEffect(() => {
    const history = getBackupHistory()
    setBackups(history)
  }, [])

  const handleCreateBackup = async (type: BackupType) => {
    setIsCreating(true)
    try {
      let metadata: BackupMetadata

      if (type === 'full') {
        metadata = await createFullBackup()
        toast.success('Tam yedekleme oluşturuldu', {
          description: `${metadata.fileName} indirildi. Toplam ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)} kayıt yedeklendi.`,
        })
      } else if (type === 'data-only') {
        metadata = await createDataOnlyBackup()
        toast.success('Veri yedeği oluşturuldu', {
          description: `${metadata.fileName} indirildi.`,
        })
      } else {
        toast.info('Şema yedeği', {
          description: 'Şema yedeği için migration dosyalarını kullanabilirsiniz.',
        })
        return
      }

      // Update backups list
      setBackups((prev) => [metadata, ...prev])
    } catch (error) {
      toast.error('Yedekleme oluşturulurken hata oluştu')
      console.error('Backup creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBackup = (backup: BackupMetadata) => {
    setDeletingBackup(backup)
  }

  const confirmDelete = () => {
    if (deletingBackup) {
      deleteBackupFromHistory(deletingBackup.id)
      setBackups(backups.filter((b) => b.id !== deletingBackup.id))
      toast.success('Yedekleme geçmişten silindi')
      setDeletingBackup(null)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    try {
      await restoreFromBackup(file)
      toast.success('Veritabanı başarıyla geri yüklendi', {
        description: 'Sayfayı yenileyerek değişiklikleri görebilirsiniz.',
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Geri yükleme sırasında hata oluştu'
      )
    } finally {
      setIsRestoring(false)
      event.target.value = '' // Reset file input
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Yedekleme"
        description="Sistem verilerini yedekleyin ve geri yükleyin"
      />

      {/* Create Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Yedekleme Oluştur
          </CardTitle>
          <CardDescription>
            Veritabanı yedeğini oluşturun. Yedekleme türünü seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => handleCreateBackup('full')}
              disabled={isCreating}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Tam Yedek</div>
                <div className="text-muted-foreground text-xs">
                  Tüm veriler ve şema
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => handleCreateBackup('data-only')}
              disabled={isCreating}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Sadece Veri</div>
                <div className="text-muted-foreground text-xs">
                  Sadece veri içeriği
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => handleCreateBackup('schema-only')}
              disabled={isCreating}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Sadece Şema</div>
                <div className="text-muted-foreground text-xs">
                  Sadece tablo yapıları
                </div>
              </div>
            </Button>
          </div>
          {isCreating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              Yedekleme oluşturuluyor...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Yedekleme Geçmişi</CardTitle>
          <CardDescription>
            Oluşturulan yedeklemelerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz yedekleme oluşturulmadı
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dosya Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Boyut</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-mono text-sm">
                      {backup.fileName}
                    </TableCell>
                    <TableCell>
                      {BACKUP_TYPE_LABELS[backup.type]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          BACKUP_STATUS_VARIANTS[backup.status] as
                            | 'default'
                            | 'secondary'
                            | 'destructive'
                            | 'outline'
                            | 'success'
                            | 'warning'
                        }
                      >
                        {BACKUP_STATUS_LABELS[backup.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.fileSize)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(backup.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBackup(backup)}
                          title="Geçmişten sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Geri Yükleme
          </CardTitle>
          <CardDescription>
            Yedekleme dosyasından veritabanını geri yükleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Yedekleme dosyasını seçin (.json)
                </p>
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="backup-file-input"
                    disabled={isRestoring}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById('backup-file-input')?.click()
                    }
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Geri Yükleniyor...
                      </>
                    ) : (
                      'Dosya Seç'
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mt-4 text-xs">
                Uyarı: Geri yükleme mevcut verilerle çakışan kayıtları güncelleyecektir.
                İşlem öncesi yedekleme almanız önerilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingBackup}
        onOpenChange={(open) => !open && setDeletingBackup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yedeklemeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingBackup && (
                <>
                  <strong>{deletingBackup.fileName}</strong> yedeklemesini
                  silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
