import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock dependencies before importing the hook
jest.mock('@/lib/db/offline-queue', () => ({
  getScan: jest.fn(),
  resetScanToPending: jest.fn(),
}))

jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => true),
  useOnReconnect: jest.fn(),
}))

jest.mock('@/stores/scan-queue-store', () => ({
  useScanQueueStore: Object.assign(jest.fn(), {
    getState: jest.fn(() => ({
      checkDbAvailability: jest.fn(),
      isDbAvailable: true,
      refreshQueueStats: jest.fn(() => Promise.resolve()),
    })),
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('@/hooks/use-api', () => ({
  queryKeys: {
    kumbaras: { all: ['kumbaras'] },
    donations: { all: ['donations'] },
    dashboard: { stats: ['dashboard', 'stats'] },
  },
}))

// Import after mocks
import { useScanSync, useScanSyncStatus } from '@/hooks/useScanSync'
import type { QueuedScan } from '@/lib/db/offline-queue'
import { toast } from 'sonner'

// Get mocked modules
const offlineQueue = jest.requireMock('@/lib/db/offline-queue')
const networkStatusModule = jest.requireMock('@/hooks/useNetworkStatus')
const storeModule = jest.requireMock('@/stores/scan-queue-store')

// Helper to create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

// Create a mock scan for testing
function createMockScan(overrides: Partial<QueuedScan> = {}): QueuedScan {
  return {
    id: 'scan-test-123',
    qrData: 'QR_DATA_TEST',
    scannedAt: Date.now(),
    status: 'pending',
    retryCount: 0,
    ...overrides,
  }
}

describe('useScanSync', () => {
  let mockStoreState: {
    pendingCount: number
    failedCount: number
    syncInProgress: boolean
    lastSyncAt: number | null
    lastSyncError: string | null
    isDbAvailable: boolean
    setSyncInProgress: jest.Mock
    setLastSyncAt: jest.Mock
    setLastSyncError: jest.Mock
    refreshQueueStats: jest.Mock
    updateScanStatus: jest.Mock
    removeScansFromQueue: jest.Mock
    getPendingScans: jest.Mock
    getFailedScans: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Reset mock store state
    mockStoreState = {
      pendingCount: 0,
      failedCount: 0,
      syncInProgress: false,
      lastSyncAt: null,
      lastSyncError: null,
      isDbAvailable: true,
      setSyncInProgress: jest.fn(),
      setLastSyncAt: jest.fn(),
      setLastSyncError: jest.fn(),
      refreshQueueStats: jest.fn(() => Promise.resolve()),
      updateScanStatus: jest.fn(() => Promise.resolve()),
      removeScansFromQueue: jest.fn(() => Promise.resolve()),
      getPendingScans: jest.fn(() => Promise.resolve([])),
      getFailedScans: jest.fn(() => Promise.resolve([])),
    }

    storeModule.useScanQueueStore.mockImplementation(() => mockStoreState)
    storeModule.useScanQueueStore.getState.mockReturnValue({
      checkDbAvailability: jest.fn(),
      isDbAvailable: true,
      refreshQueueStats: jest.fn(() => Promise.resolve()),
    })

    networkStatusModule.useNetworkStatus.mockReturnValue(true)
    networkStatusModule.useOnReconnect.mockImplementation(() => {})

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initial State', () => {
    it('should return correct initial state when online', () => {
      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isOnline).toBe(true)
      expect(result.current.isSyncing).toBe(false)
      expect(result.current.pendingCount).toBe(0)
      expect(result.current.failedCount).toBe(0)
      expect(result.current.lastSyncAt).toBeNull()
      expect(result.current.lastSyncError).toBeNull()
      expect(result.current.isDbAvailable).toBe(true)
    })

    it('should return correct initial state when offline', () => {
      networkStatusModule.useNetworkStatus.mockReturnValue(false)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isOnline).toBe(false)
    })

    it('should reflect pending and failed counts from store', () => {
      mockStoreState.pendingCount = 5
      mockStoreState.failedCount = 2

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      expect(result.current.pendingCount).toBe(5)
      expect(result.current.failedCount).toBe(2)
    })

    it('should reflect database availability from store', () => {
      mockStoreState.isDbAvailable = false

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isDbAvailable).toBe(false)
    })
  })

  describe('syncNow', () => {
    it('should sync pending scans successfully', async () => {
      const mockScans = [
        createMockScan({ id: 'scan-1', qrData: 'QR1' }),
        createMockScan({ id: 'scan-2', qrData: 'QR2' }),
      ]
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      let syncResult: Awaited<ReturnType<typeof result.current.syncNow>>

      await act(async () => {
        const promise = result.current.syncNow()
        // Advance timers for the simulated network delay
        jest.advanceTimersByTime(600)
        syncResult = await promise
      })

      expect(mockStoreState.setSyncInProgress).toHaveBeenCalledWith(true)
      expect(mockStoreState.setSyncInProgress).toHaveBeenCalledWith(false)
      expect(syncResult!.total).toBe(2)
      expect(syncResult!.successful).toBe(2)
      expect(syncResult!.failed).toBe(0)
    })

    it('should return empty result when no pending scans', async () => {
      mockStoreState.getPendingScans.mockResolvedValue([])

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      let syncResult: Awaited<ReturnType<typeof result.current.syncNow>>

      await act(async () => {
        syncResult = await result.current.syncNow()
      })

      expect(syncResult!.total).toBe(0)
      expect(syncResult!.successful).toBe(0)
      expect(syncResult!.failed).toBe(0)
    })

    it('should throw error when database is not available', async () => {
      mockStoreState.isDbAvailable = false

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.syncNow()
        })
      ).rejects.toThrow('Çevrimdışı depolama kullanılamıyor')
    })

    it('should update lastSyncAt on successful sync', async () => {
      const mockScans = [createMockScan()]
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncNow()
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.setLastSyncAt).toHaveBeenCalledWith(
        expect.any(Number)
      )
    })

    it('should remove successful scans from queue', async () => {
      const mockScans = [
        createMockScan({ id: 'scan-1' }),
        createMockScan({ id: 'scan-2' }),
      ]
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncNow()
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.removeScansFromQueue).toHaveBeenCalledWith([
        'scan-1',
        'scan-2',
      ])
    })

    it('should handle sync failure when offline', async () => {
      const mockScans = [createMockScan()]
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      // Simulate going offline mid-sync
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      })

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      let syncResult: Awaited<ReturnType<typeof result.current.syncNow>>

      await act(async () => {
        const promise = result.current.syncNow()
        jest.advanceTimersByTime(600)
        syncResult = await promise
      })

      expect(syncResult!.failed).toBe(1)
      expect(syncResult!.results[0].success).toBe(false)
      expect(syncResult!.results[0].error).toBeTruthy()
    })

    it('should refresh queue stats after sync', async () => {
      mockStoreState.getPendingScans.mockResolvedValue([])

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.syncNow()
      })

      expect(mockStoreState.refreshQueueStats).toHaveBeenCalled()
    })

    it('should show success toast when all scans sync successfully', async () => {
      const mockScans = [createMockScan(), createMockScan()]
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncNow()
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('2')
      )
    })
  })

  describe('retryFailed', () => {
    it('should retry failed scans with retry count less than max', async () => {
      const mockScans = [
        createMockScan({ id: 'scan-1', status: 'failed', retryCount: 1 }),
        createMockScan({ id: 'scan-2', status: 'failed', retryCount: 2 }),
      ]
      mockStoreState.getFailedScans.mockResolvedValue(mockScans)
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)
      offlineQueue.resetScanToPending.mockResolvedValue({})

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.retryFailed()
        // Advance for backoff delay + network delay
        jest.advanceTimersByTime(5000)
        await promise
      })

      expect(offlineQueue.resetScanToPending).toHaveBeenCalledWith('scan-1')
      expect(offlineQueue.resetScanToPending).toHaveBeenCalledWith('scan-2')
    })

    it('should skip scans that exceeded max retries', async () => {
      const mockScans = [
        createMockScan({ id: 'scan-1', status: 'failed', retryCount: 3 }),
        createMockScan({ id: 'scan-2', status: 'failed', retryCount: 5 }),
      ]
      mockStoreState.getFailedScans.mockResolvedValue(mockScans)

      const { result } = renderHook(() => useScanSync({ maxRetries: 3 }), {
        wrapper: createWrapper(),
      })

      let retryResult: Awaited<ReturnType<typeof result.current.retryFailed>>

      await act(async () => {
        retryResult = await result.current.retryFailed()
      })

      expect(retryResult!.total).toBe(0)
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('2')
      )
    })

    it('should return empty result when no failed scans', async () => {
      mockStoreState.getFailedScans.mockResolvedValue([])

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      let retryResult: Awaited<ReturnType<typeof result.current.retryFailed>>

      await act(async () => {
        retryResult = await result.current.retryFailed()
      })

      expect(retryResult!.total).toBe(0)
    })

    it('should apply exponential backoff delay', async () => {
      const mockScans = [
        createMockScan({ id: 'scan-1', status: 'failed', retryCount: 2 }),
      ]
      mockStoreState.getFailedScans.mockResolvedValue(mockScans)
      mockStoreState.getPendingScans.mockResolvedValue([])
      offlineQueue.resetScanToPending.mockResolvedValue({})

      const { result } = renderHook(
        () => useScanSync({ baseRetryDelay: 1000 }),
        {
          wrapper: createWrapper(),
        }
      )

      // Start retry but don't resolve yet
      let promiseResolved = false
      act(() => {
        result.current.retryFailed().then(() => {
          promiseResolved = true
        })
      })

      // Advance less than backoff time - should not be resolved
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      // Need more time due to exponential backoff (base * 2^retryCount)
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(promiseResolved).toBe(true)
      })
    })

    it('should throw error when database is not available', async () => {
      mockStoreState.isDbAvailable = false

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.retryFailed()
        })
      ).rejects.toThrow('Çevrimdışı depolama kullanılamıyor')
    })
  })

  describe('syncScan', () => {
    it('should sync a single scan successfully', async () => {
      const mockScan = createMockScan({ id: 'scan-123' })
      offlineQueue.getScan.mockResolvedValue(mockScan)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      let syncResult: Awaited<ReturnType<typeof result.current.syncScan>>

      await act(async () => {
        const promise = result.current.syncScan('scan-123')
        jest.advanceTimersByTime(600)
        syncResult = await promise
      })

      expect(syncResult!.success).toBe(true)
      expect(syncResult!.scanId).toBe('scan-123')
    })

    it('should throw error when scan is not found', async () => {
      offlineQueue.getScan.mockResolvedValue(undefined)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.syncScan('non-existent-scan')
        })
      ).rejects.toThrow('Tarama bulunamadı')
    })

    it('should remove scan from queue on success', async () => {
      const mockScan = createMockScan({ id: 'scan-123' })
      offlineQueue.getScan.mockResolvedValue(mockScan)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncScan('scan-123')
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.removeScansFromQueue).toHaveBeenCalledWith([
        'scan-123',
      ])
    })

    it('should update lastSyncAt on successful single sync', async () => {
      const mockScan = createMockScan({ id: 'scan-123' })
      offlineQueue.getScan.mockResolvedValue(mockScan)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncScan('scan-123')
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.setLastSyncAt).toHaveBeenCalledWith(
        expect.any(Number)
      )
    })

    it('should throw error when database is not available', async () => {
      mockStoreState.isDbAvailable = false

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.syncScan('scan-123')
        })
      ).rejects.toThrow('Çevrimdışı depolama kullanılamıyor')
    })

    it('should refresh queue stats after sync', async () => {
      const mockScan = createMockScan({ id: 'scan-123' })
      offlineQueue.getScan.mockResolvedValue(mockScan)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncScan('scan-123')
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.refreshQueueStats).toHaveBeenCalled()
    })

    it('should show success toast on successful sync', async () => {
      const mockScan = createMockScan({ id: 'scan-123' })
      offlineQueue.getScan.mockResolvedValue(mockScan)

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncScan('scan-123')
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(toast.success).toHaveBeenCalledWith('Tarama senkronize edildi')
    })
  })

  describe('Auto-sync on reconnect', () => {
    it('should register reconnect callback when autoSync is enabled', () => {
      renderHook(() => useScanSync({ autoSync: true }), {
        wrapper: createWrapper(),
      })

      expect(networkStatusModule.useOnReconnect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ enabled: true })
      )
    })

    it('should not register reconnect callback when autoSync is disabled', () => {
      renderHook(() => useScanSync({ autoSync: false }), {
        wrapper: createWrapper(),
      })

      expect(networkStatusModule.useOnReconnect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ enabled: false })
      )
    })

    it('should use custom debounce delay for auto-sync', () => {
      renderHook(() => useScanSync({ autoSyncDebounce: 5000 }), {
        wrapper: createWrapper(),
      })

      expect(networkStatusModule.useOnReconnect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ debounceMs: 5000 })
      )
    })
  })

  describe('Options', () => {
    it('should use default options when none provided', () => {
      renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      expect(networkStatusModule.useOnReconnect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          debounceMs: 2000,
          enabled: true,
        })
      )
    })

    it('should merge custom options with defaults', () => {
      renderHook(
        () =>
          useScanSync({
            autoSyncDebounce: 3000,
            maxRetries: 5,
          }),
        {
          wrapper: createWrapper(),
        }
      )

      expect(networkStatusModule.useOnReconnect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ debounceMs: 3000 })
      )
    })
  })

  describe('Concurrency control', () => {
    it('should process scans in batches according to maxConcurrent', async () => {
      const mockScans = Array.from({ length: 6 }, (_, i) =>
        createMockScan({ id: `scan-${i}`, qrData: `QR${i}` })
      )
      mockStoreState.getPendingScans.mockResolvedValue(mockScans)

      const { result } = renderHook(
        () => useScanSync({ maxConcurrent: 2 }),
        {
          wrapper: createWrapper(),
        }
      )

      await act(async () => {
        const promise = result.current.syncNow()
        // Multiple batches need multiple timer advances
        jest.advanceTimersByTime(3000)
        await promise
      })

      // Should have processed all 6 scans
      expect(mockStoreState.updateScanStatus).toHaveBeenCalledTimes(6)
    })
  })

  describe('Error handling', () => {
    it('should set lastSyncError on sync failure', async () => {
      mockStoreState.getPendingScans.mockRejectedValue(
        new Error('Database error')
      )

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.syncNow()
        } catch {
          // Expected to throw
        }
      })

      expect(mockStoreState.setLastSyncError).toHaveBeenCalledWith(
        'Database error'
      )
    })

    it('should show error toast on sync failure', async () => {
      mockStoreState.getPendingScans.mockRejectedValue(
        new Error('Network failure')
      )

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.syncNow()
        } catch {
          // Expected to throw
        }
      })

      expect(toast.error).toHaveBeenCalledWith('Network failure')
    })

    it('should mark scan as failed when sync fails', async () => {
      const mockScan = createMockScan({ id: 'scan-fail' })
      mockStoreState.getPendingScans.mockResolvedValue([mockScan])

      // Simulate offline to cause failure
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      })

      const { result } = renderHook(() => useScanSync(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const promise = result.current.syncNow()
        jest.advanceTimersByTime(600)
        await promise
      })

      expect(mockStoreState.updateScanStatus).toHaveBeenCalledWith(
        'scan-fail',
        'failed',
        expect.any(String)
      )
    })
  })
})

describe('useScanSyncStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const mockStoreState = {
      pendingCount: 3,
      failedCount: 1,
      syncInProgress: true,
      lastSyncAt: 1234567890,
      lastSyncError: 'Last error',
      isDbAvailable: true,
    }

    storeModule.useScanQueueStore.mockReturnValue(mockStoreState)
    networkStatusModule.useNetworkStatus.mockReturnValue(true)
  })

  it('should return current sync status from store', () => {
    const { result } = renderHook(() => useScanSyncStatus())

    expect(result.current.pendingCount).toBe(3)
    expect(result.current.failedCount).toBe(1)
    expect(result.current.isSyncing).toBe(true)
    expect(result.current.lastSyncAt).toBe(1234567890)
    expect(result.current.lastSyncError).toBe('Last error')
    expect(result.current.isDbAvailable).toBe(true)
  })

  it('should return isOnline status from network hook', () => {
    networkStatusModule.useNetworkStatus.mockReturnValue(false)

    const { result } = renderHook(() => useScanSyncStatus())

    expect(result.current.isOnline).toBe(false)
  })

  it('should update when store values change', () => {
    const mockStoreState = {
      pendingCount: 0,
      failedCount: 0,
      syncInProgress: false,
      lastSyncAt: null,
      lastSyncError: null,
      isDbAvailable: true,
    }

    storeModule.useScanQueueStore.mockReturnValue(mockStoreState)

    const { result, rerender } = renderHook(() => useScanSyncStatus())

    expect(result.current.pendingCount).toBe(0)
    expect(result.current.isSyncing).toBe(false)

    // Update mock store
    mockStoreState.pendingCount = 5
    mockStoreState.syncInProgress = true
    storeModule.useScanQueueStore.mockReturnValue({ ...mockStoreState })

    rerender()

    expect(result.current.pendingCount).toBe(5)
    expect(result.current.isSyncing).toBe(true)
  })
})
