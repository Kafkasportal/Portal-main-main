/**
 * Storage & Documents Service
 * Dosya yükleme, indirme ve döküman yönetimi
 */

import type { BeneficiaryDocument, DocumentType } from '@/types'
import crypto from 'crypto'
import { getClient } from './base.service'

/**
 * Dosya yükler ve metadata kaydeder
 *
 * @param file - Yüklenecek dosya
 * @param beneficiaryId - İhtiyaç sahibi ID
 * @param documentType - Döküman tipi
 * @param onProgress - İlerleme callback (0-100)
 * @returns Yüklenen döküman metadatası
 */
export async function uploadDocument(
  file: File,
  beneficiaryId: string,
  documentType: DocumentType,
  onProgress?: (progress: number) => void
): Promise<BeneficiaryDocument> {
  const supabase = getClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const randomStr = crypto.randomBytes(8).toString('hex')
  const fileName = `${Date.now()}-${randomStr}.${fileExt}`
  const filePath = `${beneficiaryId}/${fileName}`

  // Progress: Start
  if (onProgress) {
    onProgress(10)
  }

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  // Progress: Upload complete
  if (onProgress) {
    onProgress(70)
  }

  // Save metadata to database
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .insert({
      beneficiary_id: beneficiaryId,
      file_name: file.name,
      file_path: uploadData.path,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType,
    })
    .select()
    .single()

  if (docError) throw docError

  // Progress: Complete
  if (onProgress) {
    onProgress(100)
  }

  return {
    id: docData.id,
    beneficiaryId: docData.beneficiary_id,
    fileName: docData.file_name,
    filePath: docData.file_path,
    fileType: docData.file_type,
    fileSize: docData.file_size,
    documentType: docData.document_type as DocumentType,
    createdAt: new Date(docData.created_at),
  }
}

/**
 * İhtiyaç sahibine ait dökümanları getirir
 *
 * @param beneficiaryId - İhtiyaç sahibi ID
 * @returns Döküman listesi
 */
export async function fetchDocuments(
  beneficiaryId: string
): Promise<BeneficiaryDocument[]> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((doc: {
    id: string
    beneficiary_id: string
    file_name: string
    file_path: string
    file_type: string
    file_size: number
    document_type: string
    created_at: string
  }) => ({
    id: doc.id,
    beneficiaryId: doc.beneficiary_id,
    fileName: doc.file_name,
    filePath: doc.file_path,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    documentType: doc.document_type as DocumentType,
    createdAt: new Date(doc.created_at),
  }))
}

/**
 * Döküman için signed URL oluşturur (1 saat geçerli)
 *
 * @param filePath - Dosya yolu
 * @returns Signed URL
 */
export async function getDocumentUrl(filePath: string): Promise<string> {
  const supabase = getClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600) // 1 hour

  if (error) throw error

  return data.signedUrl
}

/**
 * Dökümanı siler (storage + database)
 *
 * @param documentId - Döküman ID
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = getClient()

  // Get file path
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single()

  if (fetchError) throw fetchError

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.file_path])

  if (storageError) throw storageError

  // Delete from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (dbError) throw dbError
}

/**
 * Dökümanı indirir (browser'a download tetikler)
 *
 * @param filePath - Dosya yolu
 * @param fileName - Dosya adı
 */
export async function downloadDocument(
  filePath: string,
  fileName: string
): Promise<void> {
  const supabase = getClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath)

  if (error) throw error

  // Create download link
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
