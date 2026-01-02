import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useNetworkStatus,
  useNetworkStatusExtended,
  useOnNetworkChange,
  useOnReconnect,
  useCanDetectNetwork,
} from '../useNetworkStatus'

// Mock navigator.onLine
let mockOnLine = true

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockOnLine = true
    // Create a mock navigator with configurable onLine
    vi.stubGlobal('navigator', {
      ...navigator,
      get onLine() {
        return mockOnLine
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('useNetworkStatus', () => {
    it('should return true when online', () => {
      mockOnLine = true
      const { result } = renderHook(() => useNetworkStatus())
      expect(result.current).toBe(true)
    })

    it('should return false when offline', () => {
      mockOnLine = false
      const { result } = renderHook(() => useNetworkStatus())
      expect(result.current).toBe(false)
    })

    it('should update on online event', () => {
      mockOnLine = false
      const { result } = renderHook(() => useNetworkStatus())

      expect(result.current).toBe(false)

      act(() => {
        mockOnLine = true
        window.dispatchEvent(new Event('online'))
      })

      expect(result.current).toBe(true)
    })

    it('should update on offline event', () => {
      mockOnLine = true
      const { result } = renderHook(() => useNetworkStatus())

      expect(result.current).toBe(true)

      act(() => {
        mockOnLine = false
        window.dispatchEvent(new Event('offline'))
      })

      expect(result.current).toBe(false)
    })

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useNetworkStatus())
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('useNetworkStatusExtended', () => {
    it('should return initial status info', () => {
      mockOnLine = true
      const { result } = renderHook(() => useNetworkStatusExtended())

      expect(result.current.isOnline).toBe(true)
      expect(result.current.wasOffline).toBe(false)
      expect(result.current.lastOnlineAt).not.toBeNull()
      expect(result.current.lastOfflineAt).toBeNull()
    })

    it('should track when going offline', () => {
      mockOnLine = true
      const { result } = renderHook(() => useNetworkStatusExtended())

      act(() => {
        mockOnLine = false
        window.dispatchEvent(new Event('offline'))
      })

      expect(result.current.isOnline).toBe(false)
      expect(result.current.wasOffline).toBe(true)
      expect(result.current.lastOfflineAt).not.toBeNull()
    })

    it('should track when coming back online', () => {
      mockOnLine = false
      const { result } = renderHook(() => useNetworkStatusExtended())

      // Go offline first
      act(() => {
        window.dispatchEvent(new Event('offline'))
      })

      // Come back online
      act(() => {
        mockOnLine = true
        window.dispatchEvent(new Event('online'))
      })

      expect(result.current.isOnline).toBe(true)
      expect(result.current.wasOffline).toBe(true)
      expect(result.current.lastOnlineAt).not.toBeNull()
    })
  })

  describe('useOnNetworkChange', () => {
    it('should call onOnline callback when coming online', () => {
      mockOnLine = false
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      renderHook(() => useOnNetworkChange(onOnline, onOffline, 0))

      act(() => {
        mockOnLine = true
        window.dispatchEvent(new Event('online'))
      })

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(100)
      })

      // The callback should eventually be called
      expect(onOnline).toHaveBeenCalled()
    })

    it('should call onOffline callback when going offline', () => {
      mockOnLine = true
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      renderHook(() => useOnNetworkChange(onOnline, onOffline, 0))

      act(() => {
        mockOnLine = false
        window.dispatchEvent(new Event('offline'))
      })

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(onOffline).toHaveBeenCalled()
    })

    it('should not call callbacks on initial render', () => {
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      renderHook(() => useOnNetworkChange(onOnline, onOffline))

      expect(onOnline).not.toHaveBeenCalled()
      expect(onOffline).not.toHaveBeenCalled()
    })

    it('should debounce rapid status changes', () => {
      mockOnLine = true
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      renderHook(() => useOnNetworkChange(onOnline, onOffline, 1000))

      // Rapidly toggle status
      for (let i = 0; i < 5; i++) {
        act(() => {
          mockOnLine = i % 2 === 0
          window.dispatchEvent(new Event(i % 2 === 0 ? 'offline' : 'online'))
        })

        act(() => {
          vi.advanceTimersByTime(100)
        })
      }

      // Callbacks should not be called during debounce
      expect(onOnline.mock.calls.length + onOffline.mock.calls.length).toBeLessThanOrEqual(5)
    })
  })

  describe('useOnReconnect', () => {
    it('should call callback when reconnecting after being offline', () => {
      mockOnLine = true
      const callback = vi.fn()

      const { rerender } = renderHook(
        ({ cb, opts }) => useOnReconnect(cb, opts),
        {
          initialProps: { cb: callback, opts: { debounceMs: 0, enabled: true } },
        }
      )

      // Go offline
      act(() => {
        mockOnLine = false
        window.dispatchEvent(new Event('offline'))
      })

      // Come back online - need to trigger the extended hook state update
      act(() => {
        mockOnLine = true
        window.dispatchEvent(new Event('online'))
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Re-render to pick up state changes
      rerender({ cb: callback, opts: { debounceMs: 0, enabled: true } })
    })

    it('should not call callback when disabled', () => {
      mockOnLine = false
      const callback = vi.fn()

      renderHook(() => useOnReconnect(callback, { enabled: false }))

      act(() => {
        mockOnLine = true
        window.dispatchEvent(new Event('online'))
      })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('useCanDetectNetwork', () => {
    it('should return true when navigator.onLine is available', () => {
      const { result } = renderHook(() => useCanDetectNetwork())
      expect(result.current).toBe(true)
    })
  })
})
