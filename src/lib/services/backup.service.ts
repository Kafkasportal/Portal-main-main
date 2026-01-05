/**
 * Backup Service
 * Handles database backup and restore operations
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export interface BackupData {
  version: string
  timestamp: string
  tables: {
    members?: Database['public']['Tables']['members']['Row'][]
    beneficiaries?: Database['public']['Tables']['beneficiaries']['Row'][]
    donations?: Database['public']['Tables']['donations']['Row'][]
    social_aid_applications?: Database['public']['Tables']['social_aid_applications']['Row'][]
    payments?: Database['public']['Tables']['payments']['Row'][]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inKindAids?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kumbaras?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documents?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hospitals?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    referrals?: any[]
  }
}

export interface BackupMetadata {
  id: string
  fileName: string
  type: 'full' | 'data-only' | 'schema-only'
  status: 'pending' | 'completed' | 'failed'
  fileSize: number
  createdAt: string
  recordCounts: Record<string, number>
}

/**
 * Create a full database backup
 */
export async function createFullBackup(): Promise<BackupMetadata> {
  const supabase = getSupabaseClient()
  const timestamp = new Date().toISOString()
  const fileName = `backup_full_${timestamp.replace(/[:.]/g, '-')}.json`

  try {
    // Fetch all data from main tables
    const [
      { data: members },
      { data: beneficiaries },
      { data: donations },
      { data: applications },
      { data: payments },
      { data: inKindAids },
      { data: kumbaras },
      { data: documents },
      { data: hospitals },
      { data: referrals },
    ] = await Promise.all([
      supabase.from('members').select('*'),
      supabase.from('beneficiaries').select('*'),
      supabase.from('donations').select('*'),
      supabase.from('social_aid_applications').select('*'),
      supabase.from('payments').select('*'),
      // Use any cast if these tables are not in the generated types yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('in_kind_aids') as any).select('*'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('kumbaras') as any).select('*'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('documents') as any).select('*'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('hospitals') as any).select('*'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('referrals') as any).select('*'),
    ])

    const backupData: BackupData = {
      version: '1.0',
      timestamp,
      tables: {
        members: members || [],
        beneficiaries: beneficiaries || [],
        donations: donations || [],
        social_aid_applications: applications || [],
        payments: payments || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        in_kind_aids: (inKindAids as any[]) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kumbaras: (kumbaras as any[]) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documents: (documents as any[]) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hospitals: (hospitals as any[]) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        referrals: (referrals as any[]) || [],
      },
    }

    // Convert to JSON and calculate size
    const jsonString = JSON.stringify(backupData, null, 2)
    const fileSize = new Blob([jsonString]).size

    // Create download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    const metadata: BackupMetadata = {
      id: crypto.randomUUID(),
      fileName,
      type: 'full',
      status: 'completed',
      fileSize,
      createdAt: timestamp,
      recordCounts: {
        members: members?.length || 0,
        beneficiaries: beneficiaries?.length || 0,
        donations: donations?.length || 0,
        applications: applications?.length || 0,
        payments: payments?.length || 0,
        in_kind_aids: inKindAids?.length || 0,
        kumbaras: kumbaras?.length || 0,
        documents: documents?.length || 0,
        hospitals: hospitals?.length || 0,
        referrals: referrals?.length || 0,
      },
    }

    // Store metadata in localStorage for history
    const history = getBackupHistory()
    history.unshift(metadata)
    localStorage.setItem('backup_history', JSON.stringify(history.slice(0, 20)))

    return metadata
  } catch (error) {
    console.error('Backup creation error:', error)
    throw new Error('Yedekleme oluşturulurken hata oluştu')
  }
}

/**
 * Create a data-only backup (without schema)
 */
export async function createDataOnlyBackup(): Promise<BackupMetadata> {
  // For now, data-only is same as full since we're only exporting data
  return createFullBackup()
}

/**
 * Restore database from backup file
 */
export async function restoreFromBackup(file: File): Promise<void> {
  try {
    const content = await file.text()
    const backupData: BackupData = JSON.parse(content)

    // Validate backup format
    if (!backupData.version || !backupData.tables) {
      throw new Error('Geçersiz yedekleme dosyası formatı')
    }

    const supabase = getSupabaseClient()

    // Note: This is a simplified restore. In production, you might want to:
    // 1. Ask for confirmation before deleting existing data
    // 2. Create a backup before restore
    // 3. Use transactions for atomic restore
    // 4. Handle foreign key constraints properly

    // Restore each table
    const tables = Object.entries(backupData.tables)

    for (const [tableName, records] of tables) {
      if (!records || records.length === 0) continue

      // Insert records (upsert to handle conflicts)
      const { error } = await supabase.from(tableName).upsert(records, {
        onConflict: 'id',
      })

      if (error) {
        console.error(`Error restoring ${tableName}:`, error)
        throw new Error(`${tableName} tablosu geri yüklenirken hata oluştu: ${error.message}`)
      }
    }
  } catch (error) {
    console.error('Restore error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Geri yükleme sırasında hata oluştu')
  }
}

/**
 * Get backup history from localStorage
 */
export function getBackupHistory(): BackupMetadata[] {
  try {
    const history = localStorage.getItem('backup_history')
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

/**
 * Delete backup from history
 */
export function deleteBackupFromHistory(backupId: string): void {
  const history = getBackupHistory()
  const filtered = history.filter((b) => b.id !== backupId)
  localStorage.setItem('backup_history', JSON.stringify(filtered))
}

/**
 * Clear all backup history
 */
export function clearBackupHistory(): void {
  localStorage.removeItem('backup_history')
}

/**
 * Export specific table data
 */
export async function exportTableData(
  tableName: string,
  fileName?: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from(tableName).select('*')

  if (error) {
    throw new Error(`${tableName} verileri alınırken hata oluştu: ${error.message}`)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const finalFileName = fileName || `${tableName}_${timestamp}.json`

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = finalFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
