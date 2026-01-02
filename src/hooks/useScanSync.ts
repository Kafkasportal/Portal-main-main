'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as offlineQueue from '@/lib/db/offline-queue'
import type { QueuedScan } from '@/lib/db/offline-queue'
import { collectKumbara, fetchKumbaraByCode } from '@/lib/supabase-service'
import { useScanQueueStore } from '@/stores/scan-queue-store'
import { useNetworkStatus, useOnReconnect } from '@/hooks/useNetworkStatus'
import { queryKeys } from '@/hooks/use-api'

/**
 * Configuration options for the sync hook
 */
export interface ScanSyncOptions {
  /** Enable auto-sync when connection is restored (default: true) */
  autoSync?: boolean
  /** Maximum retries for failed scans before giving up (default: 3) */
  maxRetries?: number
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseRetryDelay?: number
  /** Maximum concurrent sync operations (default: 3) */
  maxConcurrent?: number
  /** Debounce delay in ms for auto-sync trigger (default: 2000) */
  autoSyncDebounce?: number
}

/**
 * Result of a single scan sync attempt
 */
export interface SyncResult {
  scanId: string
  success: boolean
  error?: string
}

/**
 * Result of a batch sync operation
 */
export interface BatchSyncResult {
  total: number
  successful: number
  failed: number
  results: SyncResult[]
}

/**
 * State returned by the useScanSync hook
 */
export interface ScanSyncState {
  /** Whether a sync is currently in progress */
  isSyncing: boolean
  /** Whether the device is online */
  isOnline: boolean
  /** Number of pending scans in queue */
  pendingCount: number
  /** Number of failed scans */
  failedCount: number
  /** Timestamp of last successful sync */
  lastSyncAt: number | null
  /** Last sync error message */
  lastSyncError: string | null
  /** Trigger a manual sync of all pending scans */
  syncNow: () => Promise<BatchSyncResult>
  /** Retry all failed scans */
  retryFailed: () => Promise<BatchSyncResult>
  /** Sync a single scan by ID */
  syncScan: (scanId: string) => Promise<SyncResult>
  /** Whether the database is available */
  isDbAvailable: boolean
}

/**
 * Default sync options
 */
const DEFAULT_OPTIONS: Required<ScanSyncOptions> = {
  autoSync: true,
  maxRetries: 3,
  baseRetryDelay: 1000,
  maxConcurrent: 3,
  autoSyncDebounce: 2000,
}

/**
 * Calculate exponential backoff delay
 * @param retryCount - Number of retries so far
 * @param baseDelay - Base delay in milliseconds
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(retryCount: number, baseDelay: number): number {
  // Exponential backoff with jitter: base * 2^retry + random(0-500ms)
  const exponentialDelay = baseDelay * Math.pow(2, retryCount)
  const jitter = Math.random() * 500
  return Math.min(exponentialDelay + jitter, 30000) // Cap at 30 seconds
}

/**
 * Abortable delay function
 * @param ms - Milliseconds to delay
 * @param signal - AbortSignal to cancel the delay
 * @returns Promise that resolves after delay or rejects if aborted
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'))
      return
    }

    const timeoutId = setTimeout(() => {
      resolve()
    }, ms)

    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      reject(new Error('Aborted'))
    })
  })
}

/**
 * Submit a scan to the server
 * Fetches the kumbara by code and marks it as collected
 */
async function submitScanToServer(scan: QueuedScan): Promise<void> {
  // Check if navigator is offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Bağlantı yok')
  }

  try {
    // 1. Find the kumbara by QR code
    // This might throw if not found, handled in catch block
    const kumbara = await fetchKumbaraByCode(scan.qrData)

    if (!kumbara) {
      throw new Error(`"${scan.qrData}" kodlu kumbara bulunamadı`)
    }

    // 2. Submit collection
    // Note: Offline scans currently don't capture amount, so we submit 0.
    // The physical money counting happens at the center.
    await collectKumbara({
      id: kumbara.id,
      tutar: 0,
    })
  } catch (error) {
    // Enhance error message
    if (error instanceof Error) {
      // Handle Supabase "Row not found" error
      if (error.message.includes('JSON object requested, multiple (or no) rows returned')) {
        throw new Error(`"${scan.qrData}" kodlu kumbara sistemde bulunamadı`)
      }
      throw error
    }
    throw new Error('Senkronizasyon sırasında bilinmeyen bir hata oluştu')
  }
}

/**
 * Hook for managing offline scan synchronization
 *
 * Features:
 * - Automatic sync when connection is restored
 * - Manual sync trigger
 * - Exponential backoff for failed retries
 * - Individual scan status tracking
 * - Duplicate detection
 *
 * @param options - Configuration options
 * @returns Sync state and control functions
 *
 * @example
 * ```tsx
 * function ScanPage() {
 *   const {
 *     isSyncing,
 *     pendingCount,
 *     syncNow,
 *     retryFailed,
 *   } = useScanSync({ autoSync: true });
 *
 *   return (
 *     <div>
 *       <span>Bekleyen: {pendingCount}</span>
 *       <button onClick={syncNow} disabled={isSyncing}>
 *         Senkronize Et
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useScanSync(options: ScanSyncOptions = {}): ScanSyncState {
  const {
    autoSync,
    maxRetries,
    baseRetryDelay,
    maxConcurrent,
    autoSyncDebounce,
  } = { ...DEFAULT_OPTIONS, ...options }

  const queryClient = useQueryClient()
  const isOnline = useNetworkStatus()
  const isSyncingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get store state and actions
  const {
    pendingCount,
    failedCount,
    syncInProgress,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
    setSyncInProgress,
    setLastSyncAt,
    setLastSyncError,
    refreshQueueStats,
    updateScanStatus,
    removeScansFromQueue,
    getPendingScans,
    getFailedScans,
  } = useScanQueueStore()

  /**
   * Sync a single scan
   */
  const syncSingleScan = useCallback(
    async (scan: QueuedScan): Promise<SyncResult> => {
      const result: SyncResult = {
        scanId: scan.id,
        success: false,
      }

      try {
        // Mark as syncing
        await updateScanStatus(scan.id, 'syncing')

        // Attempt to submit to server
        await submitScanToServer(scan)

        // Success - remove from queue
        result.success = true
      } catch (err) {
        // Failed - mark as failed with error
        const errorMessage =
          err instanceof Error ? err.message : 'Bilinmeyen hata oluştu'
        result.error = errorMessage

        // Check if we should retry or mark as permanently failed
        if (scan.retryCount >= maxRetries) {
          result.error = `Maksimum yeniden deneme sayısına ulaşıldı: ${errorMessage}`
        }

        await updateScanStatus(scan.id, 'failed', result.error)
      }

      return result
    },
    [updateScanStatus, maxRetries]
  )

  /**
   * Process a batch of scans with concurrency control
   */
  const processBatch = useCallback(
    async (scans: QueuedScan[]): Promise<BatchSyncResult> => {
      const results: SyncResult[] = []
      let successful = 0
      let failed = 0

      // Process in batches to control concurrency
      for (let i = 0; i < scans.length; i += maxConcurrent) {
        const batch = scans.slice(i, i + maxConcurrent)

        // Check if still online before each batch
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          // Mark remaining scans as still pending (they weren't attempted)
          const remaining = scans.slice(i)
          for (const scan of remaining) {
            results.push({
              scanId: scan.id,
              success: false,
              error: 'Bağlantı kesildi',
            })
            failed++
          }
          break
        }

        // Process batch concurrently
        const batchResults = await Promise.all(
          batch.map((scan) => syncSingleScan(scan))
        )

        // Collect results
        for (const result of batchResults) {
          results.push(result)
          if (result.success) {
            successful++
          } else {
            failed++
          }
        }

        // Small delay between batches to avoid overwhelming the server
        if (i + maxConcurrent < scans.length) {
          try {
            await delay(100, abortControllerRef.current?.signal)
          } catch {
            // Aborted, stop processing
            break
          }
        }
      }

      // Remove successful scans from queue
      const successfulIds = results
        .filter((r) => r.success)
        .map((r) => r.scanId)

      if (successfulIds.length > 0) {
        await removeScansFromQueue(successfulIds)
      }

      return {
        total: scans.length,
        successful,
        failed,
        results,
      }
    },
    [maxConcurrent, syncSingleScan, removeScansFromQueue]
  )

  /**
   * Main sync mutation - syncs all pending scans
   */
  const syncMutation = useMutation({
    mutationFn: async (): Promise<BatchSyncResult> => {
      if (!isDbAvailable) {
        throw new Error('Çevrimdışı depolama kullanılamıyor')
      }

      if (isSyncingRef.current) {
        return { total: 0, successful: 0, failed: 0, results: [] }
      }

      isSyncingRef.current = true
      setSyncInProgress(true)
      setLastSyncError(null)

      try {
        const pendingScans = await getPendingScans()

        if (pendingScans.length === 0) {
          return { total: 0, successful: 0, failed: 0, results: [] }
        }

        const result = await processBatch(pendingScans)

        // Update last sync time on success
        if (result.successful > 0) {
          setLastSyncAt(Date.now())
        }

        return result
      } finally {
        isSyncingRef.current = false
        setSyncInProgress(false)
        await refreshQueueStats()
      }
    },
    onSuccess: (result) => {
      if (result.total === 0) {
        return // No scans to sync, don't show toast
      }

      // Invalidate related queries on successful sync
      void queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })

      if (result.failed === 0) {
        toast.success(`${result.successful} tarama başarıyla senkronize edildi`)
      } else if (result.successful > 0) {
        toast.warning(
          `${result.successful} tarama senkronize edildi, ${result.failed} başarısız`
        )
      } else {
        toast.error('Tüm taramalar senkronize edilemedi')
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Senkronizasyon hatası'
      setLastSyncError(message)
      toast.error(message)
    },
  })

  /**
   * Retry failed scans mutation
   */
  const retryMutation = useMutation({
    mutationFn: async (): Promise<BatchSyncResult> => {
      if (!isDbAvailable) {
        throw new Error('Çevrimdışı depolama kullanılamıyor')
      }

      if (isSyncingRef.current) {
        return { total: 0, successful: 0, failed: 0, results: [] }
      }

      isSyncingRef.current = true
      setSyncInProgress(true)
      setLastSyncError(null)

      try {
        const failedScans = await getFailedScans()

        // Filter out scans that exceeded max retries
        const retriableScans = failedScans.filter(
          (scan) => scan.retryCount < maxRetries
        )

        if (retriableScans.length === 0) {
          if (failedScans.length > 0) {
            toast.info(
              `${failedScans.length} tarama maksimum deneme sayısına ulaştı`
            )
          }
          return { total: 0, successful: 0, failed: 0, results: [] }
        }

        // Reset status to pending before retry
        for (const scan of retriableScans) {
          await offlineQueue.resetScanToPending(scan.id)
        }

        // Apply backoff delay based on retry count
        const maxRetryCount = Math.max(
          ...retriableScans.map((s) => s.retryCount)
        )
        const backoffDelay = calculateBackoffDelay(maxRetryCount, baseRetryDelay)

        // Wait for backoff delay
        try {
          await delay(backoffDelay, abortControllerRef.current?.signal)
        } catch {
          // Aborted, exit retry
          return { total: 0, successful: 0, failed: 0, results: [] }
        }

        // Refresh pending scans and process
        const updatedPendingScans = await getPendingScans()
        const result = await processBatch(updatedPendingScans)

        if (result.successful > 0) {
          setLastSyncAt(Date.now())
        }

        return result
      } finally {
        isSyncingRef.current = false
        setSyncInProgress(false)
        await refreshQueueStats()
      }
    },
    onSuccess: (result) => {
      if (result.total === 0) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })

      if (result.failed === 0) {
        toast.success(`${result.successful} tarama yeniden denendi ve başarılı`)
      } else if (result.successful > 0) {
        toast.warning(
          `${result.successful} başarılı, ${result.failed} hala başarısız`
        )
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Yeniden deneme hatası'
      setLastSyncError(message)
      toast.error(message)
    },
  })

  /**
   * Single scan sync mutation
   */
  const singleSyncMutation = useMutation({
    mutationFn: async (scanId: string): Promise<SyncResult> => {
      if (!isDbAvailable) {
        throw new Error('Çevrimdışı depolama kullanılamıyor')
      }

      const scan = await offlineQueue.getScan(scanId)
      if (!scan) {
        throw new Error('Tarama bulunamadı')
      }

      const result = await syncSingleScan(scan)

      if (result.success) {
        await removeScansFromQueue([scanId])
        setLastSyncAt(Date.now())
      }

      await refreshQueueStats()
      return result
    },
    onSuccess: (result) => {
      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.kumbaras.all })
        void queryClient.invalidateQueries({ queryKey: queryKeys.donations.all })
        toast.success('Tarama senkronize edildi')
      } else {
        toast.error(result.error || 'Tarama senkronize edilemedi')
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Senkronizasyon hatası'
      toast.error(message)
    },
  })

  /**
   * Auto-sync when connection is restored
   */
  useOnReconnect(
    async () => {
      if (!autoSync || !isDbAvailable || isSyncingRef.current) {
        return
      }

      // Check if there are pending scans
      const pendingScans = await getPendingScans()
      if (pendingScans.length === 0) {
        return
      }

      toast.info('Bağlantı yeniden kuruldu, senkronize ediliyor...')

      // Trigger sync
      syncMutation.mutate()
    },
    { debounceMs: autoSyncDebounce, enabled: autoSync && isDbAvailable }
  )

  /**
   * Initialize store on mount and cleanup on unmount
   */
  useEffect(() => {
    // Initialize abort controller
    abortControllerRef.current = new AbortController()

    const store = useScanQueueStore.getState()
    store.checkDbAvailability()
    if (store.isDbAvailable) {
      void store.refreshQueueStats()
    }

    // Cleanup: abort any pending delays
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    isSyncing: syncInProgress || syncMutation.isPending || retryMutation.isPending,
    isOnline,
    pendingCount,
    failedCount,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
    syncNow: () => syncMutation.mutateAsync(),
    retryFailed: () => retryMutation.mutateAsync(),
    syncScan: (scanId: string) => singleSyncMutation.mutateAsync(scanId),
  }
}

/**
 * Hook for accessing sync state without auto-sync functionality
 * Useful for components that only need to display sync status
 */
export function useScanSyncStatus(): Pick<
  ScanSyncState,
  | 'isSyncing'
  | 'isOnline'
  | 'pendingCount'
  | 'failedCount'
  | 'lastSyncAt'
  | 'lastSyncError'
  | 'isDbAvailable'
> {
  const isOnline = useNetworkStatus()
  const {
    pendingCount,
    failedCount,
    syncInProgress,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
  } = useScanQueueStore()

  return {
    isSyncing: syncInProgress,
    isOnline,
    pendingCount,
    failedCount,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
  }
}
