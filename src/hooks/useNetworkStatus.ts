'use client'

import { useEffect, useState, useRef } from 'react'

export interface NetworkStatusInfo {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineAt: number | null
  lastOfflineAt: number | null
}

/**
 * Hook for detecting network connectivity status
 * Uses browser native navigator.onLine API with online/offline event listeners
 *
 * @returns boolean - true if online, false if offline
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') {
      return true // Assume online during SSR
    }
    return navigator.onLine
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Extended hook for network status with additional context
 * Tracks when connection was lost/restored for sync triggers
 *
 * @returns NetworkStatusInfo - detailed network status information
 */
export function useNetworkStatusExtended(): NetworkStatusInfo {
  const [statusInfo, setStatusInfo] = useState<NetworkStatusInfo>(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    return {
      isOnline,
      wasOffline: false,
      lastOnlineAt: isOnline ? Date.now() : null,
      lastOfflineAt: null,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setStatusInfo((prev) => ({
        isOnline: true,
        wasOffline: !prev.isOnline || prev.wasOffline,
        lastOnlineAt: Date.now(),
        lastOfflineAt: prev.lastOfflineAt,
      }))
    }

    const handleOffline = () => {
      setStatusInfo((prev) => ({
        isOnline: false,
        wasOffline: true,
        lastOnlineAt: prev.lastOnlineAt,
        lastOfflineAt: Date.now(),
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return statusInfo
}

/**
 * Hook that calls a callback when network status changes
 * Includes debouncing to handle rapid connection flapping
 *
 * @param onOnline - Callback when connection is restored
 * @param onOffline - Callback when connection is lost
 * @param debounceMs - Debounce delay in milliseconds (default: 1000ms)
 */
export function useOnNetworkChange(
  onOnline?: () => void,
  onOffline?: () => void,
  debounceMs: number = 1000
): void {
  const isOnline = useNetworkStatus()
  const isFirstRender = useRef(true)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastStatusRef = useRef<boolean>(isOnline)

  // Stable callback refs - update in effect to avoid render-time mutation
  const onOnlineRef = useRef(onOnline)
  const onOfflineRef = useRef(onOffline)

  // Update refs in a separate effect
  useEffect(() => {
    onOnlineRef.current = onOnline
    onOfflineRef.current = onOffline
  })

  useEffect(() => {
    // Skip first render to avoid triggering callbacks on mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      lastStatusRef.current = isOnline
      return
    }

    // Only trigger if status actually changed
    if (lastStatusRef.current === isOnline) {
      return
    }

    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce the callback to handle connection flapping
    debounceTimerRef.current = setTimeout(() => {
      // Verify status hasn't changed back during debounce period
      const currentOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

      if (currentOnline !== lastStatusRef.current) {
        lastStatusRef.current = currentOnline

        if (currentOnline && onOnlineRef.current) {
          onOnlineRef.current()
        } else if (!currentOnline && onOfflineRef.current) {
          onOfflineRef.current()
        }
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isOnline, debounceMs])
}

/**
 * Hook that triggers a callback when connection is restored after being offline
 * Useful for auto-sync triggers
 *
 * @param callback - Function to call when connection is restored
 * @param options - Configuration options
 * @param options.debounceMs - Debounce delay in milliseconds (default: 1000ms)
 * @param options.enabled - Whether the callback should be enabled (default: true)
 */
export function useOnReconnect(
  callback: () => void,
  options: { debounceMs?: number; enabled?: boolean } = {}
): void {
  const { debounceMs = 1000, enabled = true } = options
  const { isOnline, wasOffline } = useNetworkStatusExtended()
  const callbackRef = useRef(callback)
  const hasTriggeredRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Keep callback ref updated in effect to avoid render-time mutation
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!enabled) {
      hasTriggeredRef.current = false
      return
    }

    // Trigger callback when:
    // 1. Currently online
    // 2. Was offline at some point
    // 3. Haven't triggered yet for this offline->online cycle
    if (isOnline && wasOffline && !hasTriggeredRef.current) {
      // Clear any pending timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Debounce to handle connection flapping
      debounceTimerRef.current = setTimeout(() => {
        // Double-check we're still online after debounce
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          hasTriggeredRef.current = true
          callbackRef.current()
        }
      }, debounceMs)
    }

    // Reset trigger flag when we go offline
    if (!isOnline) {
      hasTriggeredRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isOnline, wasOffline, enabled, debounceMs])
}

/**
 * Utility hook to check if running in an environment where network APIs are available
 * Returns false during SSR or in environments without network detection support
 */
export function useCanDetectNetwork(): boolean {
  // Use lazy initialization to avoid effect-based setState
  const [canDetect] = useState(() => {
    if (typeof window === 'undefined') return false
    return typeof navigator !== 'undefined' && 'onLine' in navigator
  })

  return canDetect
}
