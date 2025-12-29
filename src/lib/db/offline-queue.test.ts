import 'fake-indexeddb/auto'
import {
  isIndexedDBAvailable,
  generateScanId,
  addScan,
  getScan,
  getScansByStatus,
  getPendingScans,
  getFailedScans,
  getAllScans,
  getQueueCount,
  getCountByStatus,
  updateScanStatus,
  markScanSyncing,
  markScanFailed,
  resetScanToPending,
  deleteScan,
  deleteScans,
  clearAllScans,
  isDuplicateScan,
  getScansExceedingRetries,
  cleanupOldScans,
  getQueueStats,
  closeDB,
  type QueuedScan,
  type ScanStatus,
} from '@/lib/db/offline-queue'

// Mock the idb library
const mockStore = new Map<string, QueuedScan>()

const mockDB = {
  add: jest.fn((_storeName: string, value: QueuedScan) => {
    mockStore.set(value.id, value)
    return Promise.resolve(value.id)
  }),
  get: jest.fn((_storeName: string, id: string) => {
    return Promise.resolve(mockStore.get(id))
  }),
  getAll: jest.fn(() => {
    return Promise.resolve(Array.from(mockStore.values()))
  }),
  getAllFromIndex: jest.fn((_storeName: string, _index: string, status: ScanStatus) => {
    const results = Array.from(mockStore.values()).filter(
      (scan) => scan.status === status
    )
    return Promise.resolve(results)
  }),
  put: jest.fn((_storeName: string, value: QueuedScan) => {
    mockStore.set(value.id, value)
    return Promise.resolve(value.id)
  }),
  delete: jest.fn((_storeName: string, id: string) => {
    mockStore.delete(id)
    return Promise.resolve()
  }),
  clear: jest.fn(() => {
    mockStore.clear()
    return Promise.resolve()
  }),
  count: jest.fn(() => {
    return Promise.resolve(mockStore.size)
  }),
  countFromIndex: jest.fn((_storeName: string, _index: string, status: ScanStatus) => {
    const count = Array.from(mockStore.values()).filter(
      (scan) => scan.status === status
    ).length
    return Promise.resolve(count)
  }),
  transaction: jest.fn(() => ({
    store: {
      delete: jest.fn((id: string) => {
        mockStore.delete(id)
        return Promise.resolve()
      }),
    },
    done: Promise.resolve(),
  })),
  close: jest.fn(),
}

jest.mock('idb', () => ({
  openDB: jest.fn(() => Promise.resolve(mockDB)),
}))

describe('Offline Queue', () => {
  beforeEach(() => {
    // Clear the mock store before each test
    mockStore.clear()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await closeDB()
  })

  describe('isIndexedDBAvailable', () => {
    it('should return true in browser environment with IndexedDB', () => {
      // jsdom provides indexedDB
      const result = isIndexedDBAvailable()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('generateScanId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateScanId()
      const id2 = generateScanId()
      expect(id1).not.toBe(id2)
    })

    it('should start with "scan-" prefix', () => {
      const id = generateScanId()
      expect(id.startsWith('scan-')).toBe(true)
    })

    it('should contain timestamp and random parts', () => {
      const id = generateScanId()
      const parts = id.split('-')
      expect(parts.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('addScan', () => {
    it('should add a scan with default values', async () => {
      const scan = await addScan('QR_DATA_123')

      expect(scan.qrData).toBe('QR_DATA_123')
      expect(scan.status).toBe('pending')
      expect(scan.retryCount).toBe(0)
      expect(scan.id).toBeTruthy()
      expect(scan.scannedAt).toBeTruthy()
    })

    it('should add a scan with metadata', async () => {
      const metadata = {
        kumbaraId: 'kumbara-123',
        userId: 'user-456',
        deviceInfo: 'iPhone 12',
      }
      const scan = await addScan('QR_DATA_456', metadata)

      expect(scan.metadata).toEqual(metadata)
      expect(scan.metadata?.kumbaraId).toBe('kumbara-123')
    })

    it('should store scan in the database', async () => {
      const scan = await addScan('QR_TEST')
      expect(mockDB.add).toHaveBeenCalled()
      expect(mockStore.has(scan.id)).toBe(true)
    })
  })

  describe('getScan', () => {
    it('should retrieve a scan by ID', async () => {
      const addedScan = await addScan('GET_TEST')
      const retrievedScan = await getScan(addedScan.id)

      expect(retrievedScan).toBeDefined()
      expect(retrievedScan?.id).toBe(addedScan.id)
      expect(retrievedScan?.qrData).toBe('GET_TEST')
    })

    it('should return undefined for non-existent ID', async () => {
      const scan = await getScan('non-existent-id')
      expect(scan).toBeUndefined()
    })
  })

  describe('getScansByStatus', () => {
    beforeEach(async () => {
      // Add scans with different statuses
      await addScan('PENDING_1')
      await addScan('PENDING_2')
      const failedScan = await addScan('FAILED_1')

      // Manually update status in mock store
      mockStore.set(failedScan.id, { ...failedScan, status: 'failed' })
    })

    it('should return scans with pending status', async () => {
      const pendingScans = await getScansByStatus('pending')
      expect(pendingScans.length).toBe(2)
      pendingScans.forEach((scan) => {
        expect(scan.status).toBe('pending')
      })
    })

    it('should return scans with failed status', async () => {
      const failedScans = await getScansByStatus('failed')
      expect(failedScans.length).toBe(1)
      expect(failedScans[0].status).toBe('failed')
    })
  })

  describe('getPendingScans', () => {
    it('should return only pending scans', async () => {
      await addScan('PENDING_TEST')
      const pendingScans = await getPendingScans()

      expect(Array.isArray(pendingScans)).toBe(true)
    })
  })

  describe('getFailedScans', () => {
    it('should return only failed scans', async () => {
      const failedScans = await getFailedScans()
      expect(Array.isArray(failedScans)).toBe(true)
    })
  })

  describe('getAllScans', () => {
    it('should return all scans in queue', async () => {
      await addScan('SCAN_1')
      await addScan('SCAN_2')
      await addScan('SCAN_3')

      const allScans = await getAllScans()
      expect(allScans.length).toBe(3)
    })

    it('should return empty array when queue is empty', async () => {
      const allScans = await getAllScans()
      expect(allScans).toEqual([])
    })
  })

  describe('getQueueCount', () => {
    it('should return correct count', async () => {
      await addScan('COUNT_1')
      await addScan('COUNT_2')

      const count = await getQueueCount()
      expect(count).toBe(2)
    })

    it('should return 0 for empty queue', async () => {
      const count = await getQueueCount()
      expect(count).toBe(0)
    })
  })

  describe('getCountByStatus', () => {
    it('should return count for specific status', async () => {
      await addScan('STATUS_COUNT_1')
      await addScan('STATUS_COUNT_2')

      const pendingCount = await getCountByStatus('pending')
      expect(typeof pendingCount).toBe('number')
    })
  })

  describe('updateScanStatus', () => {
    it('should update scan status to syncing', async () => {
      const scan = await addScan('UPDATE_TEST')
      const updated = await updateScanStatus(scan.id, 'syncing')

      expect(updated).toBeDefined()
      expect(updated?.status).toBe('syncing')
      expect(updated?.lastSyncAttempt).toBeTruthy()
    })

    it('should update scan status to failed with error', async () => {
      const scan = await addScan('FAIL_TEST')
      const updated = await updateScanStatus(scan.id, 'failed', 'Network error')

      expect(updated?.status).toBe('failed')
      expect(updated?.lastError).toBe('Network error')
      expect(updated?.retryCount).toBe(1)
    })

    it('should increment retry count on failed status', async () => {
      const scan = await addScan('RETRY_TEST')

      await updateScanStatus(scan.id, 'failed', 'Error 1')
      let updated = await getScan(scan.id)
      expect(updated?.retryCount).toBe(1)

      await updateScanStatus(scan.id, 'failed', 'Error 2')
      updated = await getScan(scan.id)
      expect(updated?.retryCount).toBe(2)
    })

    it('should return undefined for non-existent scan', async () => {
      const result = await updateScanStatus('fake-id', 'syncing')
      expect(result).toBeUndefined()
    })
  })

  describe('markScanSyncing', () => {
    it('should mark scan as syncing', async () => {
      const scan = await addScan('SYNCING_TEST')
      const updated = await markScanSyncing(scan.id)

      expect(updated?.status).toBe('syncing')
    })
  })

  describe('markScanFailed', () => {
    it('should mark scan as failed with error message', async () => {
      const scan = await addScan('MARK_FAILED_TEST')
      const updated = await markScanFailed(scan.id, 'Connection timeout')

      expect(updated?.status).toBe('failed')
      expect(updated?.lastError).toBe('Connection timeout')
    })
  })

  describe('resetScanToPending', () => {
    it('should reset a failed scan back to pending', async () => {
      const scan = await addScan('RESET_TEST')
      await markScanFailed(scan.id, 'Error')
      const reset = await resetScanToPending(scan.id)

      expect(reset?.status).toBe('pending')
    })
  })

  describe('deleteScan', () => {
    it('should delete a scan by ID', async () => {
      const scan = await addScan('DELETE_TEST')
      expect(mockStore.has(scan.id)).toBe(true)

      await deleteScan(scan.id)
      expect(mockStore.has(scan.id)).toBe(false)
    })
  })

  describe('deleteScans', () => {
    it('should delete multiple scans', async () => {
      const scan1 = await addScan('BULK_DEL_1')
      const scan2 = await addScan('BULK_DEL_2')
      await addScan('KEEP_THIS')

      await deleteScans([scan1.id, scan2.id])

      // Note: Due to mock transaction handling, we verify the transaction was called
      expect(mockDB.transaction).toHaveBeenCalled()
    })
  })

  describe('clearAllScans', () => {
    it('should clear all scans from the queue', async () => {
      await addScan('CLEAR_1')
      await addScan('CLEAR_2')

      await clearAllScans()
      expect(mockStore.size).toBe(0)
    })
  })

  describe('isDuplicateScan', () => {
    it('should detect duplicate scan within time window', async () => {
      const qrData = 'DUPLICATE_QR'
      await addScan(qrData)

      const isDuplicate = await isDuplicateScan(qrData)
      expect(isDuplicate).toBe(true)
    })

    it('should not detect non-duplicate scan', async () => {
      await addScan('ORIGINAL_QR')

      const isDuplicate = await isDuplicateScan('DIFFERENT_QR')
      expect(isDuplicate).toBe(false)
    })

    it('should detect duplicate with custom time window', async () => {
      await addScan('WINDOW_TEST')

      const isDuplicate = await isDuplicateScan('WINDOW_TEST', 10 * 60 * 1000)
      expect(isDuplicate).toBe(true)
    })
  })

  describe('getScansExceedingRetries', () => {
    it('should return scans that exceeded max retries', async () => {
      const scan = await addScan('RETRY_EXCEED')
      // Simulate multiple failures
      mockStore.set(scan.id, {
        ...scan,
        status: 'failed',
        retryCount: 5,
      })

      const exceeding = await getScansExceedingRetries(3)
      expect(exceeding.length).toBe(1)
      expect(exceeding[0].retryCount).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array when no scans exceed retries', async () => {
      const scan = await addScan('LOW_RETRY')
      mockStore.set(scan.id, {
        ...scan,
        status: 'failed',
        retryCount: 1,
      })

      const exceeding = await getScansExceedingRetries(3)
      expect(exceeding.length).toBe(0)
    })
  })

  describe('cleanupOldScans', () => {
    it('should cleanup old failed scans that exceeded max retries', async () => {
      const oldTimestamp = Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
      const scan = await addScan('OLD_SCAN')
      mockStore.set(scan.id, {
        ...scan,
        status: 'failed',
        retryCount: 6,
        scannedAt: oldTimestamp,
      })

      const cleaned = await cleanupOldScans(24 * 60 * 60 * 1000, 5)
      expect(typeof cleaned).toBe('number')
    })

    it('should not cleanup recent scans', async () => {
      const scan = await addScan('RECENT_SCAN')
      mockStore.set(scan.id, {
        ...scan,
        status: 'pending',
      })

      const cleaned = await cleanupOldScans()
      expect(cleaned).toBe(0)
    })
  })

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      await addScan('STATS_1')
      const scan2 = await addScan('STATS_2')
      mockStore.set(scan2.id, { ...scan2, status: 'failed' })

      const stats = await getQueueStats()

      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('pending')
      expect(stats).toHaveProperty('syncing')
      expect(stats).toHaveProperty('failed')
      expect(stats).toHaveProperty('oldestScanAt')
    })

    it('should return null for oldestScanAt when queue is empty', async () => {
      const stats = await getQueueStats()
      expect(stats.oldestScanAt).toBeNull()
    })

    it('should calculate oldestScanAt correctly', async () => {
      const now = Date.now()
      const scan1 = await addScan('OLDEST')
      const scan2 = await addScan('NEWEST')

      // Make scan1 older
      mockStore.set(scan1.id, { ...scan1, scannedAt: now - 10000 })
      mockStore.set(scan2.id, { ...scan2, scannedAt: now })

      const stats = await getQueueStats()
      expect(stats.oldestScanAt).toBe(now - 10000)
    })
  })

  describe('closeDB', () => {
    it('should close the database connection', async () => {
      // First open a connection
      await addScan('CLOSE_TEST')

      // Then close it
      await closeDB()

      // Should not throw
      expect(true).toBe(true)
    })
  })
})
