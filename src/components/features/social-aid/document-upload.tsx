'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { DocumentType } from '@/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import * as service from '@/lib/supabase-service'

interface DocumentUploadProps {
  applicationId?: string
  beneficiaryId?: string
  onSuccess?: (document: unknown) => void
  maxFiles?: number
  allowedTypes?: string[]
}

export function DocumentUpload({
  beneficiaryId,
  onSuccess,
  maxFiles = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!beneficiaryId) {
        throw new Error('Beneficiary ID is required')
      }

      const documentType = getDocumentType(file.name)

      return service.uploadDocument(file, beneficiaryId, documentType, (progress) => {
        setUploadProgress(progress)
      })
    },
    onSuccess: (document) => {
      toast.success('Belge başarıyla yüklendi')
      onSuccess?.(document)
      void queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error) => {
      toast.error('Belge yüklenirken bir hata oluştu', {
        description: error.message,
      })
    },
  })

  const getDocumentType = (filename: string): DocumentType => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, DocumentType> = {
      pdf: 'diger',
      jpg: 'diger',
      jpeg: 'diger',
      png: 'diger',
      doc: 'diger',
      docx: 'diger',
    }
    return typeMap[ext || ''] || 'diger'
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])

      // Validate file count
      if (files.length + selectedFiles.length > maxFiles) {
        toast.error(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`)
        return
      }

      // Validate file types
      const invalidFiles = selectedFiles.filter(
        (file) => !allowedTypes.includes(file.type)
      )
      if (invalidFiles.length > 0) {
        toast.error('Geçersiz dosya türü', {
          description: 'Sadece JPG, PNG ve PDF dosyaları yükleyebilirsiniz',
        })
        return
      }

      // Validate file size (max 10MB)
      const oversizedFiles = selectedFiles.filter((file) => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error('Dosya boyutu çok büyük', {
          description: 'Maksimum dosya boyutu 10MB',
        })
        return
      }

      setFiles((prev) => [...prev, ...selectedFiles])
    },
    [files.length, maxFiles, allowedTypes]
  )

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMutation.mutateAsync(files[i])
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      toast.success('Tüm belgeler başarıyla yüklendi')
      setFiles([])
    } catch {
      toast.error('Belgeler yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-dashed">
            <input
              type="file"
              id="document-upload"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="document-upload"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-8 transition-colors ${
                uploading
                  ? 'border-muted bg-muted/50 cursor-not-allowed'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
              }`}
            >
              <Upload
                className={`mb-3 h-10 w-10 ${
                  uploading ? 'text-muted-foreground' : 'text-primary'
                }`}
              />
              <p className="text-sm font-medium">
                {uploading ? 'Yükleniyor...' : 'Belgeleri buraya sürükleyin'}
              </p>
              <p className="text-muted-foreground text-xs">
                veya dosya seçmek için tıklayın
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                JPG, PNG veya PDF • Maksimum {maxFiles} dosya • Her biri max 10MB
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Seçilen Dosyalar</p>
                <p className="text-muted-foreground text-xs">
                  {files.length}/{maxFiles}
                </p>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3"
                  >
                    <FileText className="text-primary h-8 w-8 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Yükleniyor...</span>
                    <span className="font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Upload Button */}
              {!uploading && (
                <Button
                  onClick={handleUpload}
                  disabled={files.length === 0}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Yükle ({files.length} dosya)
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
