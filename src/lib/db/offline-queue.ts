import { openDB, DBSchema, IDBPDatabase } from 'idb'

/**
 * Status of a queued scan item
 */
export type ScanStatus = 'pending' | 'syncing' | 'failed'

/**
 * A queued scan item stored in IndexedDB
 */
export interface QueuedScan {
  /** Unique identifier for the scan */
  id: string
  /** The QR code data that was scanned */
  qrData: string
  /** Timestamp when the scan was captured (Unix ms) */
  scannedAt: number
  /** Current sync status */
  status: ScanStatus
  /** Number of sync retry attempts */
  retryCount: number
  /** Last error message if failed */
  lastError?: string
  /** Timestamp of last sync attempt (Unix ms) */
  lastSyncAttempt?: number
  /** Additional metadata for the scan */
  metadata?: {
    /** Kumbara ID if available */
    kumbaraId?: string
    /** User ID who performed the scan */
    userId?: string
    /** Device info */
    deviceInfo?: string
  }
}

/**
 * IndexedDB schema definition for the offline scan queue
 */
interface ScanQueueDB extends DBSchema {
  'scan-queue': {
    key: string
    value: QueuedScan
    indexes: {
      'by-status': ScanStatus
      'by-scanned-at': number
    }
  }
}

const DB_NAME = 'piggy-bank-queue'
const DB_VERSION = 1
const STORE_NAME = 'scan-queue'

/** Singleton database instance */
let dbInstance: IDBPDatabase<ScanQueueDB> | null = null

/**
 * Check if IndexedDB is available in the current environment
 * Returns false in SSR or private browsing modes that don't support IndexedDB
 */
export function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof indexedDB === 'undefined') return false

  try {
    // Test if we can actually open a database
    // Some browsers in private mode throw when accessing indexedDB
    const testRequest = indexedDB.open('__idb_test__')
    testRequest.onerror = () => {
      // Delete test database on error
      indexedDB.deleteDatabase('__idb_test__')
    }
    testRequest.onsuccess = () => {
      testRequest.result.close()
      indexedDB.deleteDatabase('__idb_test__')
    }
    return true
  } catch {
    return false
  }
}

/**
 * Initialize and return the IndexedDB database instance
 * Uses singleton pattern to reuse connection
 */
export async function getDB(): Promise<IDBPDatabase<ScanQueueDB>> {
  if (dbInstance) return dbInstance

  if (!isIndexedDBAvailable()) {
    throw new Error(
      'IndexedDB is not available. This may be due to private browsing mode.'
    )
  }

  dbInstance = await openDB<ScanQueueDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the scan-queue object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        // Create index for querying by status (pending, syncing, failed)
        store.createIndex('by-status', 'status')
        // Create index for ordering by scan time
        store.createIndex('by-scanned-at', 'scannedAt')
      }
    },
    blocked() {
      // Called if there are older versions of the database open
      // Close all other tabs or pages with this database open
      dbInstance = null
    },
    blocking() {
      // Called if this connection is blocking a future version
      dbInstance?.close()
      dbInstance = null
    },
    terminated() {
      // Called if the browser terminates the connection
      dbInstance = null
    },
  })

  return dbInstance
}

/**
 * Close the database connection
 * Useful for cleanup or testing
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * Generate a unique ID for a queued scan
 */
export function generateScanId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `scan-${timestamp}-${randomPart}`
}

/**
 * Add a new scan to the offline queue
 * @param qrData - The QR code data that was scanned
 * @param metadata - Optional metadata about the scan
 * @returns The created QueuedScan item
 */
export async function addScan(
  qrData: string,
  metadata?: QueuedScan['metadata']
): Promise<QueuedScan> {
  const db = await getDB()

  const scan: QueuedScan = {
    id: generateScanId(),
    qrData,
    scannedAt: Date.now(),
    status: 'pending',
    retryCount: 0,
    metadata,
  }

  await db.add(STORE_NAME, scan)
  return scan
}

/**
 * Get a single scan by its ID
 * @param id - The scan ID
 * @returns The QueuedScan if found, undefined otherwise
 */
export async function getScan(id: string): Promise<QueuedScan | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

/**
 * Get all scans with a specific status
 * @param status - The status to filter by
 * @returns Array of matching QueuedScan items
 */
export async function getScansByStatus(
  status: ScanStatus
): Promise<QueuedScan[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'by-status', status)
}

/**
 * Get all pending scans (ready to be synced)
 * @returns Array of pending QueuedScan items
 */
export async function getPendingScans(): Promise<QueuedScan[]> {
  return getScansByStatus('pending')
}

/**
 * Get all failed scans (for retry)
 * @returns Array of failed QueuedScan items
 */
export async function getFailedScans(): Promise<QueuedScan[]> {
  return getScansByStatus('failed')
}

/**
 * Get all scans in the queue
 * @returns Array of all QueuedScan items
 */
export async function getAllScans(): Promise<QueuedScan[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Get the total count of scans in the queue
 * @returns Total number of scans
 */
export async function getQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

/**
 * Get count of scans by status
 * @param status - The status to count
 * @returns Number of scans with the specified status
 */
export async function getCountByStatus(status: ScanStatus): Promise<number> {
  const db = await getDB()
  return db.countFromIndex(STORE_NAME, 'by-status', status)
}

/**
 * Update a scan's status
 * @param id - The scan ID
 * @param status - The new status
 * @param error - Optional error message (for failed status)
 * @returns The updated QueuedScan if found
 */
export async function updateScanStatus(
  id: string,
  status: ScanStatus,
  error?: string
): Promise<QueuedScan | undefined> {
  const db = await getDB()
  const scan = await db.get(STORE_NAME, id)

  if (!scan) return undefined

  const updatedScan: QueuedScan = {
    ...scan,
    status,
    lastSyncAttempt: Date.now(),
    lastError: error,
    retryCount: status === 'failed' ? scan.retryCount + 1 : scan.retryCount,
  }

  await db.put(STORE_NAME, updatedScan)
  return updatedScan
}

/**
 * Mark a scan as syncing (in-progress)
 * @param id - The scan ID
 * @returns The updated QueuedScan if found
 */
export async function markScanSyncing(
  id: string
): Promise<QueuedScan | undefined> {
  return updateScanStatus(id, 'syncing')
}

/**
 * Mark a scan as failed
 * @param id - The scan ID
 * @param error - The error message
 * @returns The updated QueuedScan if found
 */
export async function markScanFailed(
  id: string,
  error: string
): Promise<QueuedScan | undefined> {
  return updateScanStatus(id, 'failed', error)
}

/**
 * Reset a failed scan to pending for retry
 * @param id - The scan ID
 * @returns The updated QueuedScan if found
 */
export async function resetScanToPending(
  id: string
): Promise<QueuedScan | undefined> {
  return updateScanStatus(id, 'pending')
}

/**
 * Delete a scan from the queue (after successful sync)
 * @param id - The scan ID to delete
 */
export async function deleteScan(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/**
 * Delete multiple scans by their IDs
 * @param ids - Array of scan IDs to delete
 */
export async function deleteScans(ids: string[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')

  // Complete all operations within the same transaction
  await Promise.all([
    ...ids.map((id) => tx.store.delete(id)),
    tx.done,
  ])
}

/**
 * Clear all scans from the queue
 * Use with caution - typically only for testing or user-initiated reset
 */
export async function clearAllScans(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/**
 * Check if a scan with the same QR data exists within a time window
 * Used for duplicate detection
 * @param qrData - The QR code data to check
 * @param timeWindowMs - Time window in milliseconds (default: 5 minutes)
 * @returns True if a duplicate exists
 */
export async function isDuplicateScan(
  qrData: string,
  timeWindowMs: number = 5 * 60 * 1000
): Promise<boolean> {
  const db = await getDB()
  const allScans = await db.getAll(STORE_NAME)
  const now = Date.now()

  return allScans.some(
    (scan) =>
      scan.qrData === qrData && now - scan.scannedAt < timeWindowMs
  )
}

/**
 * Get scans that have exceeded the maximum retry count
 * @param maxRetries - Maximum retry count (default: 3)
 * @returns Array of scans that exceeded max retries
 */
export async function getScansExceedingRetries(
  maxRetries: number = 3
): Promise<QueuedScan[]> {
  const failedScans = await getFailedScans()
  return failedScans.filter((scan) => scan.retryCount >= maxRetries)
}

/**
 * Clean up old synced or permanently failed scans
 * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @param maxRetries - Maximum retries before permanent failure (default: 5)
 */
export async function cleanupOldScans(
  maxAgeMs: number = 24 * 60 * 60 * 1000,
  maxRetries: number = 5
): Promise<number> {
  const db = await getDB()
  const allScans = await db.getAll(STORE_NAME)
  const now = Date.now()

  const idsToDelete = allScans
    .filter(
      (scan) =>
        // Delete old failed scans that exceeded max retries
        (scan.status === 'failed' &&
          scan.retryCount >= maxRetries &&
          now - scan.scannedAt > maxAgeMs) ||
        // Delete very old pending scans (data is likely stale)
        (scan.status === 'pending' && now - scan.scannedAt > maxAgeMs * 7)
    )
    .map((scan) => scan.id)

  if (idsToDelete.length > 0) {
    await deleteScans(idsToDelete)
  }

  return idsToDelete.length
}

/**
 * Get queue statistics
 * @returns Statistics about the current queue state
 */
export async function getQueueStats(): Promise<{
  total: number
  pending: number
  syncing: number
  failed: number
  oldestScanAt: number | null
}> {
  const [total, pending, syncing, failed, allScans] = await Promise.all([
    getQueueCount(),
    getCountByStatus('pending'),
    getCountByStatus('syncing'),
    getCountByStatus('failed'),
    getAllScans(),
  ])

  const oldestScanAt =
    allScans.length > 0
      ? Math.min(...allScans.map((s) => s.scannedAt))
      : null

  return {
    total,
    pending,
    syncing,
    failed,
    oldestScanAt,
  }
}
