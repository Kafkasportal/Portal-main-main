import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useScanSync } from '../useScanSync'
import * as offlineQueue from '@/lib/db/offline-queue'
import * as supabaseService from '@/lib/supabase-service'
import { useScanQueueStore } from '@/stores/scan-queue-store'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import React from 'react'

// Mock dependencies
vi.mock('@/lib/db/offline-queue')
vi.mock('@/lib/supabase-service')
vi.mock('@/hooks/useNetworkStatus')
vi.mock('@/stores/scan-queue-store')
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    }
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('useScanSync', () => {
    const mockStore = {
        pendingCount: 0,
        failedCount: 0,
        syncInProgress: false,
        lastSyncAt: null,
        lastSyncError: null,
        isDbAvailable: true,
        setSyncInProgress: vi.fn(),
        setLastSyncAt: vi.fn(),
        setLastSyncError: vi.fn(),
        refreshQueueStats: vi.fn(),
        updateScanStatus: vi.fn(),
        removeScansFromQueue: vi.fn(),
        getPendingScans: vi.fn(),
        getFailedScans: vi.fn(),
        checkDbAvailability: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useScanQueueStore).mockReturnValue(mockStore as any)
        vi.mocked(useScanQueueStore).getState = vi.fn().mockReturnValue(mockStore)
        vi.mocked(useNetworkStatus).mockReturnValue(true) // Online by default
    })

    it('should initialize correctly', () => {
        const { result } = renderHook(() => useScanSync(), { wrapper: createWrapper() })
        expect(result.current.isOnline).toBe(true)
        expect(result.current.isDbAvailable).toBe(true)
    })

    it('should sync pending scans successfully', async () => {
        const mockScans = [{ id: 's1', qrData: 'test-qr', retryCount: 0 }]
        mockStore.getPendingScans.mockResolvedValue(mockScans)
        vi.mocked(supabaseService.fetchKumbaraByCode).mockResolvedValue({ id: 1 } as any)
        vi.mocked(supabaseService.collectKumbara).mockResolvedValue({} as any)

        const { result } = renderHook(() => useScanSync(), { wrapper: createWrapper() })

        await result.current.syncNow()

        expect(mockStore.setSyncInProgress).toHaveBeenCalledWith(true)
        expect(supabaseService.fetchKumbaraByCode).toHaveBeenCalledWith('test-qr')
        expect(supabaseService.collectKumbara).toHaveBeenCalled()
        expect(mockStore.removeScansFromQueue).toHaveBeenCalledWith(['s1'])
        expect(mockStore.setLastSyncAt).toHaveBeenCalled()
    })

    it('should handle failed sync and update status', async () => {
        const mockScans = [{ id: 's1', qrData: 'invalid-qr', retryCount: 0 }]
        mockStore.getPendingScans.mockResolvedValue(mockScans)
        vi.mocked(supabaseService.fetchKumbaraByCode).mockRejectedValue(new Error('Bulunamadı'))

        const { result } = renderHook(() => useScanSync(), { wrapper: createWrapper() })

        await result.current.syncNow()

        expect(mockStore.updateScanStatus).toHaveBeenCalledWith('s1', 'failed', 'Bulunamadı')
        expect(mockStore.removeScansFromQueue).not.toHaveBeenCalled()
    })

    it('should not sync when offline', async () => {
        vi.mocked(useNetworkStatus).mockReturnValue(false) // Hook mock

        // Mock global navigator
        vi.stubGlobal('navigator', { onLine: false })

        const mockScans = [{ id: 's1', qrData: 'test-qr', retryCount: 0 }]
        mockStore.getPendingScans.mockResolvedValue(mockScans)

        const { result } = renderHook(() => useScanSync(), { wrapper: createWrapper() })

        const batchResult = await result.current.syncNow()

        // When offline, processBatch detects it and returns failed results without updating DB
        expect(batchResult.failed).toBe(1)
        expect(batchResult.results[0].error).toBe('Bağlantı kesildi')

        // Restore
        vi.unstubAllGlobals()
    })
})
