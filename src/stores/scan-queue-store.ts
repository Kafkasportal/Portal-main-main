import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import * as offlineQueue from '@/lib/db/offline-queue'
import type { QueuedScan, ScanStatus } from '@/lib/db/offline-queue'

/**
 * Queue statistics interface
 */
export interface QueueStats {
  total: number
  pending: number
  syncing: number
  failed: number
  oldestScanAt: number | null
}

/**
 * Scan queue state interface
 */
interface ScanQueueState {
  /** Total number of scans in the queue */
  queueCount: number
  /** Number of pending scans waiting to sync */
  pendingCount: number
  /** Number of failed scans */
  failedCount: number
  /** Whether a sync operation is in progress */
  syncInProgress: boolean
  /** Timestamp of the last successful sync (Unix ms) */
  lastSyncAt: number | null
  /** Last sync error message */
  lastSyncError: string | null
  /** Whether the IndexedDB is available */
  isDbAvailable: boolean

  // Actions
  /** Update the queue count from IndexedDB */
  refreshQueueStats: () => Promise<void>
  /** Set sync in progress state */
  setSyncInProgress: (inProgress: boolean) => void
  /** Update last sync timestamp */
  setLastSyncAt: (timestamp: number | null) => void
  /** Set last sync error */
  setLastSyncError: (error: string | null) => void
  /** Check and set IndexedDB availability */
  checkDbAvailability: () => void
  /** Add a scan to the queue and refresh stats */
  addScanToQueue: (
    qrData: string,
    metadata?: QueuedScan['metadata']
  ) => Promise<QueuedScan | null>
  /** Remove a scan from the queue and refresh stats */
  removeScanFromQueue: (id: string) => Promise<void>
  /** Remove multiple scans from the queue and refresh stats */
  removeScansFromQueue: (ids: string[]) => Promise<void>
  /** Check if a scan is a duplicate */
  checkDuplicate: (qrData: string, timeWindowMs?: number) => Promise<boolean>
  /** Get all pending scans */
  getPendingScans: () => Promise<QueuedScan[]>
  /** Get all failed scans */
  getFailedScans: () => Promise<QueuedScan[]>
  /** Update a scan's status */
  updateScanStatus: (
    id: string,
    status: ScanStatus,
    error?: string
  ) => Promise<void>
  /** Reset the store to initial state */
  reset: () => void
}

const initialState = {
  queueCount: 0,
  pendingCount: 0,
  failedCount: 0,
  syncInProgress: false,
  lastSyncAt: null,
  lastSyncError: null,
  isDbAvailable: false,
}

export const useScanQueueStore = create<ScanQueueState>()(
  persist(
    (set, get) => ({
      ...initialState,

      refreshQueueStats: async () => {
        if (!get().isDbAvailable) return

        try {
          const stats = await offlineQueue.getQueueStats()
          set({
            queueCount: stats.total,
            pendingCount: stats.pending,
            failedCount: stats.failed,
          })
        } catch {
          // Silently handle errors - DB might not be available yet
        }
      },

      setSyncInProgress: (inProgress: boolean) => {
        set({ syncInProgress: inProgress })
      },

      setLastSyncAt: (timestamp: number | null) => {
        set({ lastSyncAt: timestamp })
      },

      setLastSyncError: (error: string | null) => {
        set({ lastSyncError: error })
      },

      checkDbAvailability: () => {
        const isAvailable = offlineQueue.isIndexedDBAvailable()
        set({ isDbAvailable: isAvailable })
      },

      addScanToQueue: async (
        qrData: string,
        metadata?: QueuedScan['metadata']
      ) => {
        if (!get().isDbAvailable) {
          set({
            lastSyncError:
              'Çevrimdışı depolama kullanılamıyor. Tarayıcınız gizli modda olabilir.',
          })
          return null
        }

        try {
          const scan = await offlineQueue.addScan(qrData, metadata)
          await get().refreshQueueStats()
          return scan
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Tarama kuyruğa eklenemedi'
          set({ lastSyncError: message })
          return null
        }
      },

      removeScanFromQueue: async (id: string) => {
        if (!get().isDbAvailable) return

        try {
          await offlineQueue.deleteScan(id)
          await get().refreshQueueStats()
        } catch {
          // Silently handle - scan may not exist
        }
      },

      removeScansFromQueue: async (ids: string[]) => {
        if (!get().isDbAvailable || ids.length === 0) return

        try {
          await offlineQueue.deleteScans(ids)
          await get().refreshQueueStats()
        } catch {
          // Silently handle errors
        }
      },

      checkDuplicate: async (
        qrData: string,
        timeWindowMs?: number
      ): Promise<boolean> => {
        if (!get().isDbAvailable) return false

        try {
          return await offlineQueue.isDuplicateScan(qrData, timeWindowMs)
        } catch {
          return false
        }
      },

      getPendingScans: async (): Promise<QueuedScan[]> => {
        if (!get().isDbAvailable) return []

        try {
          return await offlineQueue.getPendingScans()
        } catch {
          return []
        }
      },

      getFailedScans: async (): Promise<QueuedScan[]> => {
        if (!get().isDbAvailable) return []

        try {
          return await offlineQueue.getFailedScans()
        } catch {
          return []
        }
      },

      updateScanStatus: async (
        id: string,
        status: ScanStatus,
        error?: string
      ) => {
        if (!get().isDbAvailable) return

        try {
          await offlineQueue.updateScanStatus(id, status, error)
          await get().refreshQueueStats()
        } catch {
          // Silently handle errors
        }
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'scan-queue-state',
      // Only persist UI-related state, not transient sync state
      partialize: (state) => ({
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
)

/**
 * Initialize the scan queue store
 * Call this on app startup to check DB availability and load queue stats
 */
export async function initializeScanQueueStore(): Promise<void> {
  useScanQueueStore.getState().checkDbAvailability()

  if (useScanQueueStore.getState().isDbAvailable) {
    await useScanQueueStore.getState().refreshQueueStats()
  }
}
