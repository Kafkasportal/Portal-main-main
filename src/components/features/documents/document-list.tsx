'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Download, File, Image as ImageIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
} from '@/lib/supabase-service'
import type { BeneficiaryDocument } from '@/types'

interface DocumentListProps {
  beneficiaryId: string
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  kimlik: 'Kimlik Belgesi',
  ikamet: 'İkamet Belgesi',
  saglik: 'Sağlık Raporu',
  gelir: 'Gelir Belgesi',
  diger: 'Diğer',
}

export function DocumentList({ beneficiaryId }: DocumentListProps) {
  const queryClient = useQueryClient()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', beneficiaryId],
    queryFn: () => fetchDocuments(beneficiaryId),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
      deleteDocument(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', beneficiaryId] })
      toast.success('Belge silindi')
    },
    onError: () => {
      toast.error('Belge silinirken hata oluştu')
    },
  })

  const handleDownload = async (doc: BeneficiaryDocument) => {
    try {
      await downloadDocument(doc.filePath, doc.fileName)
      toast.success('Belge indiriliyor')
    } catch {
      toast.error('Belge indirilirken hata oluştu')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Yükleniyor...
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Henüz belge yüklenmemiş
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground">
                {getFileIcon(doc.fileType)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.fileName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">
                    {DOCUMENT_TYPE_LABELS[doc.documentType]}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(doc.createdAt, 'dd.MM.yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc)}
                  title="İndir"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    deleteMutation.mutate({
                      id: doc.id,
                      filePath: doc.filePath,
                    })
                  }
                  disabled={deleteMutation.isPending}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
