import { act } from '@testing-library/react'
import { useScanQueueStore, initializeScanQueueStore } from '@/stores/scan-queue-store'
import type { QueuedScan } from '@/lib/db/offline-queue'

// Mock the offline-queue module
jest.mock('@/lib/db/offline-queue', () => ({
  isIndexedDBAvailable: jest.fn(() => true),
  getQueueStats: jest.fn(() =>
    Promise.resolve({
      total: 5,
      pending: 3,
      syncing: 1,
      failed: 1,
      oldestScanAt: Date.now() - 60000,
    })
  ),
  addScan: jest.fn((qrData: string, metadata?: QueuedScan['metadata']) =>
    Promise.resolve({
      id: 'mock-scan-id',
      qrData,
      scannedAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      metadata,
    })
  ),
  deleteScan: jest.fn(() => Promise.resolve()),
  deleteScans: jest.fn(() => Promise.resolve()),
  isDuplicateScan: jest.fn(() => Promise.resolve(false)),
  getPendingScans: jest.fn(() => Promise.resolve([])),
  getFailedScans: jest.fn(() => Promise.resolve([])),
  updateScanStatus: jest.fn(() => Promise.resolve()),
}))

// Get the mocked module
const offlineQueue = jest.requireMock('@/lib/db/offline-queue')

describe('ScanQueueStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    act(() => {
      useScanQueueStore.getState().reset()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const state = useScanQueueStore.getState()

      expect(state.queueCount).toBe(0)
      expect(state.pendingCount).toBe(0)
      expect(state.failedCount).toBe(0)
      expect(state.syncInProgress).toBe(false)
      expect(state.lastSyncAt).toBeNull()
      expect(state.lastSyncError).toBeNull()
      expect(state.isDbAvailable).toBe(false)
    })
  })

  describe('checkDbAvailability', () => {
    it('should set isDbAvailable to true when IndexedDB is available', () => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)

      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })

      expect(useScanQueueStore.getState().isDbAvailable).toBe(true)
    })

    it('should set isDbAvailable to false when IndexedDB is not available', () => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(false)

      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })

      expect(useScanQueueStore.getState().isDbAvailable).toBe(false)
    })
  })

  describe('refreshQueueStats', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should update queue counts from database', async () => {
      offlineQueue.getQueueStats.mockResolvedValue({
        total: 10,
        pending: 5,
        syncing: 2,
        failed: 3,
        oldestScanAt: Date.now(),
      })

      await act(async () => {
        await useScanQueueStore.getState().refreshQueueStats()
      })

      const state = useScanQueueStore.getState()
      expect(state.queueCount).toBe(10)
      expect(state.pendingCount).toBe(5)
      expect(state.failedCount).toBe(3)
    })

    it('should not refresh when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      await act(async () => {
        await useScanQueueStore.getState().refreshQueueStats()
      })

      expect(offlineQueue.getQueueStats).not.toHaveBeenCalled()
    })

    it('should handle errors silently', async () => {
      offlineQueue.getQueueStats.mockRejectedValue(new Error('DB Error'))

      await act(async () => {
        await useScanQueueStore.getState().refreshQueueStats()
      })

      // Should not throw and state should remain unchanged
      expect(useScanQueueStore.getState().queueCount).toBe(0)
    })
  })

  describe('setSyncInProgress', () => {
    it('should update syncInProgress state', () => {
      act(() => {
        useScanQueueStore.getState().setSyncInProgress(true)
      })

      expect(useScanQueueStore.getState().syncInProgress).toBe(true)

      act(() => {
        useScanQueueStore.getState().setSyncInProgress(false)
      })

      expect(useScanQueueStore.getState().syncInProgress).toBe(false)
    })
  })

  describe('setLastSyncAt', () => {
    it('should update lastSyncAt timestamp', () => {
      const timestamp = Date.now()

      act(() => {
        useScanQueueStore.getState().setLastSyncAt(timestamp)
      })

      expect(useScanQueueStore.getState().lastSyncAt).toBe(timestamp)
    })

    it('should allow setting to null', () => {
      act(() => {
        useScanQueueStore.getState().setLastSyncAt(Date.now())
        useScanQueueStore.getState().setLastSyncAt(null)
      })

      expect(useScanQueueStore.getState().lastSyncAt).toBeNull()
    })
  })

  describe('setLastSyncError', () => {
    it('should update lastSyncError message', () => {
      const errorMessage = 'Network error occurred'

      act(() => {
        useScanQueueStore.getState().setLastSyncError(errorMessage)
      })

      expect(useScanQueueStore.getState().lastSyncError).toBe(errorMessage)
    })

    it('should allow clearing the error', () => {
      act(() => {
        useScanQueueStore.getState().setLastSyncError('Some error')
        useScanQueueStore.getState().setLastSyncError(null)
      })

      expect(useScanQueueStore.getState().lastSyncError).toBeNull()
    })
  })

  describe('addScanToQueue', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should add a scan to the queue', async () => {
      const mockScan: QueuedScan = {
        id: 'test-scan-id',
        qrData: 'QR_DATA_123',
        scannedAt: Date.now(),
        status: 'pending',
        retryCount: 0,
      }
      offlineQueue.addScan.mockResolvedValue(mockScan)

      let result: QueuedScan | null = null
      await act(async () => {
        result = await useScanQueueStore.getState().addScanToQueue('QR_DATA_123')
      })

      expect(result).toEqual(mockScan)
      expect(offlineQueue.addScan).toHaveBeenCalledWith('QR_DATA_123', undefined)
    })

    it('should add a scan with metadata', async () => {
      const metadata = { kumbaraId: 'kumbara-123', userId: 'user-456' }
      const mockScan: QueuedScan = {
        id: 'test-scan-id',
        qrData: 'QR_DATA_123',
        scannedAt: Date.now(),
        status: 'pending',
        retryCount: 0,
        metadata,
      }
      offlineQueue.addScan.mockResolvedValue(mockScan)

      await act(async () => {
        await useScanQueueStore.getState().addScanToQueue('QR_DATA_123', metadata)
      })

      expect(offlineQueue.addScan).toHaveBeenCalledWith('QR_DATA_123', metadata)
    })

    it('should return null and set error when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      let result: QueuedScan | null = null
      await act(async () => {
        result = await useScanQueueStore.getState().addScanToQueue('QR_DATA')
      })

      expect(result).toBeNull()
      expect(useScanQueueStore.getState().lastSyncError).toBeTruthy()
    })

    it('should handle add errors', async () => {
      offlineQueue.addScan.mockRejectedValue(new Error('Add failed'))

      let result: QueuedScan | null = null
      await act(async () => {
        result = await useScanQueueStore.getState().addScanToQueue('QR_DATA')
      })

      expect(result).toBeNull()
      expect(useScanQueueStore.getState().lastSyncError).toBe('Add failed')
    })
  })

  describe('removeScanFromQueue', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should remove a scan by ID', async () => {
      await act(async () => {
        await useScanQueueStore.getState().removeScanFromQueue('scan-id')
      })

      expect(offlineQueue.deleteScan).toHaveBeenCalledWith('scan-id')
    })

    it('should not attempt removal when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      await act(async () => {
        await useScanQueueStore.getState().removeScanFromQueue('scan-id')
      })

      expect(offlineQueue.deleteScan).not.toHaveBeenCalled()
    })
  })

  describe('removeScansFromQueue', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should remove multiple scans by IDs', async () => {
      const ids = ['scan-1', 'scan-2', 'scan-3']

      await act(async () => {
        await useScanQueueStore.getState().removeScansFromQueue(ids)
      })

      expect(offlineQueue.deleteScans).toHaveBeenCalledWith(ids)
    })

    it('should not attempt removal when IDs array is empty', async () => {
      await act(async () => {
        await useScanQueueStore.getState().removeScansFromQueue([])
      })

      expect(offlineQueue.deleteScans).not.toHaveBeenCalled()
    })
  })

  describe('checkDuplicate', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should check for duplicate scans', async () => {
      offlineQueue.isDuplicateScan.mockResolvedValue(true)

      let isDuplicate = false
      await act(async () => {
        isDuplicate = await useScanQueueStore.getState().checkDuplicate('QR_DATA')
      })

      expect(isDuplicate).toBe(true)
      expect(offlineQueue.isDuplicateScan).toHaveBeenCalledWith('QR_DATA', undefined)
    })

    it('should check with custom time window', async () => {
      offlineQueue.isDuplicateScan.mockResolvedValue(false)

      await act(async () => {
        await useScanQueueStore.getState().checkDuplicate('QR_DATA', 60000)
      })

      expect(offlineQueue.isDuplicateScan).toHaveBeenCalledWith('QR_DATA', 60000)
    })

    it('should return false when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      let isDuplicate = true
      await act(async () => {
        isDuplicate = await useScanQueueStore.getState().checkDuplicate('QR_DATA')
      })

      expect(isDuplicate).toBe(false)
    })
  })

  describe('getPendingScans', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should return pending scans', async () => {
      const mockScans: QueuedScan[] = [
        { id: 'scan-1', qrData: 'QR1', scannedAt: Date.now(), status: 'pending', retryCount: 0 },
        { id: 'scan-2', qrData: 'QR2', scannedAt: Date.now(), status: 'pending', retryCount: 0 },
      ]
      offlineQueue.getPendingScans.mockResolvedValue(mockScans)

      let scans: QueuedScan[] = []
      await act(async () => {
        scans = await useScanQueueStore.getState().getPendingScans()
      })

      expect(scans).toEqual(mockScans)
    })

    it('should return empty array when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      let scans: QueuedScan[] = [{ id: 'dummy', qrData: '', scannedAt: 0, status: 'pending', retryCount: 0 }]
      await act(async () => {
        scans = await useScanQueueStore.getState().getPendingScans()
      })

      expect(scans).toEqual([])
    })
  })

  describe('getFailedScans', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should return failed scans', async () => {
      const mockScans: QueuedScan[] = [
        { id: 'scan-1', qrData: 'QR1', scannedAt: Date.now(), status: 'failed', retryCount: 2 },
      ]
      offlineQueue.getFailedScans.mockResolvedValue(mockScans)

      let scans: QueuedScan[] = []
      await act(async () => {
        scans = await useScanQueueStore.getState().getFailedScans()
      })

      expect(scans).toEqual(mockScans)
    })
  })

  describe('updateScanStatus', () => {
    beforeEach(() => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      act(() => {
        useScanQueueStore.getState().checkDbAvailability()
      })
    })

    it('should update scan status', async () => {
      await act(async () => {
        await useScanQueueStore.getState().updateScanStatus('scan-id', 'syncing')
      })

      expect(offlineQueue.updateScanStatus).toHaveBeenCalledWith('scan-id', 'syncing', undefined)
    })

    it('should update scan status with error', async () => {
      await act(async () => {
        await useScanQueueStore.getState().updateScanStatus('scan-id', 'failed', 'Network error')
      })

      expect(offlineQueue.updateScanStatus).toHaveBeenCalledWith('scan-id', 'failed', 'Network error')
    })

    it('should not update when database is not available', async () => {
      act(() => {
        useScanQueueStore.setState({ isDbAvailable: false })
      })

      await act(async () => {
        await useScanQueueStore.getState().updateScanStatus('scan-id', 'syncing')
      })

      expect(offlineQueue.updateScanStatus).not.toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Set some state
      act(() => {
        useScanQueueStore.setState({
          queueCount: 10,
          pendingCount: 5,
          failedCount: 3,
          syncInProgress: true,
          lastSyncAt: Date.now(),
          lastSyncError: 'Some error',
          isDbAvailable: true,
        })
      })

      // Reset
      act(() => {
        useScanQueueStore.getState().reset()
      })

      const state = useScanQueueStore.getState()
      expect(state.queueCount).toBe(0)
      expect(state.pendingCount).toBe(0)
      expect(state.failedCount).toBe(0)
      expect(state.syncInProgress).toBe(false)
      expect(state.lastSyncAt).toBeNull()
      expect(state.lastSyncError).toBeNull()
      expect(state.isDbAvailable).toBe(false)
    })
  })

  describe('initializeScanQueueStore', () => {
    it('should check database availability and refresh stats', async () => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(true)
      offlineQueue.getQueueStats.mockResolvedValue({
        total: 5,
        pending: 3,
        syncing: 1,
        failed: 1,
        oldestScanAt: Date.now(),
      })

      await act(async () => {
        await initializeScanQueueStore()
      })

      expect(offlineQueue.isIndexedDBAvailable).toHaveBeenCalled()
      expect(offlineQueue.getQueueStats).toHaveBeenCalled()
    })

    it('should not refresh stats when database is not available', async () => {
      offlineQueue.isIndexedDBAvailable.mockReturnValue(false)

      await act(async () => {
        await initializeScanQueueStore()
      })

      expect(offlineQueue.isIndexedDBAvailable).toHaveBeenCalled()
      expect(offlineQueue.getQueueStats).not.toHaveBeenCalled()
    })
  })
})
