'use client'

import { File, Image as ImageIcon, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        return `Dosya boyutu en fazla ${maxSize}MB olabilir`
      }

      // Check file type
      const acceptedTypes = accept.split(',').map((t) => t.trim())
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) return fileExt === type
        return file.type.startsWith(type.replace('*', ''))
      })

      if (!isAccepted) {
        return 'Desteklenmeyen dosya formatı'
      }

      return null
    },
    [maxSize, accept]
  )

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      setSelectedFile(file)
      onFileSelect(file)

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    },
    [onFileSelect, validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [disabled, handleFile]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
  }, [])

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8" />
    if (selectedFile.type.startsWith('image/'))
      return <ImageIcon className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-border hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer'
        )}
      >
        {selectedFile ? (
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-20 w-20 rounded object-cover"
              />
            ) : (
              <div className="text-muted-foreground">{getFileIcon()}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{selectedFile.name}</p>
              <p className="text-muted-foreground text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2">
            <div className="text-muted-foreground">{getFileIcon()}</div>
            <div className="text-center">
              <p className="font-medium">
                Dosya yüklemek için tıklayın veya sürükleyin
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Maksimum {maxSize}MB • {accept}
              </p>
            </div>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  )
}
