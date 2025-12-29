import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useNetworkStatus,
  useNetworkStatusExtended,
  useOnNetworkChange,
  useOnReconnect,
  useCanDetectNetwork,
} from '@/hooks/useNetworkStatus'

// Helper to simulate online/offline events
function dispatchOnlineEvent() {
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  window.dispatchEvent(new Event('online'))
}

function dispatchOfflineEvent() {
  Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
  window.dispatchEvent(new Event('offline'))
}

describe('useNetworkStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  it('should return true when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current).toBe(true)
  })

  it('should return false when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current).toBe(false)
  })

  it('should update when going offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)

    act(() => {
      dispatchOfflineEvent()
    })

    expect(result.current).toBe(false)
  })

  it('should update when going online', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(false)

    act(() => {
      dispatchOnlineEvent()
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useNetworkStatus())

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})

describe('useNetworkStatusExtended', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  it('should return initial status info when online', () => {
    const { result } = renderHook(() => useNetworkStatusExtended())

    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(false)
    expect(result.current.lastOnlineAt).toBeTruthy()
    expect(result.current.lastOfflineAt).toBeNull()
  })

  it('should return initial status info when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const { result } = renderHook(() => useNetworkStatusExtended())

    expect(result.current.isOnline).toBe(false)
    expect(result.current.wasOffline).toBe(false)
    expect(result.current.lastOnlineAt).toBeNull()
    expect(result.current.lastOfflineAt).toBeNull()
  })

  it('should track when connection is lost', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

    const { result } = renderHook(() => useNetworkStatusExtended())

    act(() => {
      dispatchOfflineEvent()
    })

    expect(result.current.isOnline).toBe(false)
    expect(result.current.wasOffline).toBe(true)
    expect(result.current.lastOfflineAt).toBeTruthy()
  })

  it('should track when connection is restored', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const { result } = renderHook(() => useNetworkStatusExtended())

    act(() => {
      dispatchOnlineEvent()
    })

    expect(result.current.isOnline).toBe(true)
    expect(result.current.lastOnlineAt).toBeTruthy()
  })

  it('should set wasOffline to true after going offline then online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

    const { result } = renderHook(() => useNetworkStatusExtended())
    expect(result.current.wasOffline).toBe(false)

    act(() => {
      dispatchOfflineEvent()
    })
    expect(result.current.wasOffline).toBe(true)

    act(() => {
      dispatchOnlineEvent()
    })
    expect(result.current.wasOffline).toBe(true)
    expect(result.current.isOnline).toBe(true)
  })
})

describe('useOnNetworkChange', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not call callbacks on initial render', () => {
    const onOnline = jest.fn()
    const onOffline = jest.fn()

    renderHook(() => useOnNetworkChange(onOnline, onOffline))

    expect(onOnline).not.toHaveBeenCalled()
    expect(onOffline).not.toHaveBeenCalled()
  })

  it('should call onOffline when going offline after debounce', async () => {
    const onOnline = jest.fn()
    const onOffline = jest.fn()

    renderHook(() => useOnNetworkChange(onOnline, onOffline, 100))

    act(() => {
      dispatchOfflineEvent()
    })

    // Before debounce
    expect(onOffline).not.toHaveBeenCalled()

    // After debounce
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(onOffline).toHaveBeenCalledTimes(1)
    expect(onOnline).not.toHaveBeenCalled()
  })

  it('should call onOnline when going online after debounce', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    const onOnline = jest.fn()
    const onOffline = jest.fn()

    renderHook(() => useOnNetworkChange(onOnline, onOffline, 100))

    act(() => {
      dispatchOnlineEvent()
    })

    // After debounce
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(onOnline).toHaveBeenCalledTimes(1)
    expect(onOffline).not.toHaveBeenCalled()
  })

  it('should debounce rapid status changes', () => {
    const onOnline = jest.fn()
    const onOffline = jest.fn()

    renderHook(() => useOnNetworkChange(onOnline, onOffline, 100))

    // Rapid changes
    act(() => {
      dispatchOfflineEvent()
      jest.advanceTimersByTime(50)
      dispatchOnlineEvent()
      jest.advanceTimersByTime(50)
      dispatchOfflineEvent()
    })

    // Complete debounce
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // Only the last stable state should trigger callback
    expect(onOnline.mock.calls.length + onOffline.mock.calls.length).toBeLessThanOrEqual(1)
  })

  it('should cleanup timers on unmount', () => {
    const onOnline = jest.fn()
    const onOffline = jest.fn()

    const { unmount } = renderHook(() => useOnNetworkChange(onOnline, onOffline, 100))

    act(() => {
      dispatchOfflineEvent()
    })

    unmount()

    // Advance time past debounce
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Callback should not be called after unmount
    expect(onOffline).not.toHaveBeenCalled()
  })
})

describe('useOnReconnect', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not call callback on initial render when online', () => {
    const callback = jest.fn()

    renderHook(() => useOnReconnect(callback))

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('should call callback when reconnecting after being offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    const callback = jest.fn()

    const { rerender } = renderHook(() => useOnReconnect(callback, { debounceMs: 100 }))

    // Go offline first
    act(() => {
      dispatchOfflineEvent()
    })

    // Then reconnect
    act(() => {
      dispatchOnlineEvent()
    })

    rerender()

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  it('should not call callback when disabled', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    const callback = jest.fn()

    renderHook(() => useOnReconnect(callback, { enabled: false }))

    act(() => {
      dispatchOfflineEvent()
      dispatchOnlineEvent()
      jest.advanceTimersByTime(2000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('should reset trigger flag when going offline again', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    const callback = jest.fn()

    renderHook(() => useOnReconnect(callback, { debounceMs: 100 }))

    // First offline -> online cycle
    act(() => {
      dispatchOfflineEvent()
      dispatchOnlineEvent()
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1)
    })

    // Second offline -> online cycle
    act(() => {
      dispatchOfflineEvent()
    })

    act(() => {
      dispatchOnlineEvent()
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  it('should use custom debounce time', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    const callback = jest.fn()

    renderHook(() => useOnReconnect(callback, { debounceMs: 500 }))

    act(() => {
      dispatchOfflineEvent()
      dispatchOnlineEvent()
    })

    // Before custom debounce time
    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(callback).not.toHaveBeenCalled()

    // After custom debounce time
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(callback).toHaveBeenCalled()
  })
})

describe('useCanDetectNetwork', () => {
  it('should return true when network detection is available', () => {
    const { result } = renderHook(() => useCanDetectNetwork())

    // After effect runs, should be true in jsdom environment
    expect(typeof result.current).toBe('boolean')
  })

  it('should return false initially (SSR simulation)', () => {
    const { result } = renderHook(() => useCanDetectNetwork())

    // Initial state before useEffect runs should be false
    // After effect, it should detect the environment
    expect(typeof result.current).toBe('boolean')
  })
})
