'use client'

import { memo, useCallback } from 'react'
import { Button, type buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CloudOff,
  Loader2,
  RefreshCw,
  RotateCcw,
  Upload,
  WifiOff,
} from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { useScanSync, type BatchSyncResult } from '@/hooks/useScanSync'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useScanQueueStore } from '@/stores/scan-queue-store'

type ButtonSize = VariantProps<typeof buttonVariants>['size']
type ButtonVariant = VariantProps<typeof buttonVariants>['variant']

/**
 * Type of sync operation
 */
export type SyncMode = 'sync' | 'retry' | 'auto'

interface ManualSyncButtonProps {
  /** Size variant for the button */
  size?: ButtonSize
  /** Button variant style */
  variant?: ButtonVariant
  /** Additional CSS classes */
  className?: string
  /** Sync mode: 'sync' for pending, 'retry' for failed, 'auto' picks based on queue state */
  mode?: SyncMode
  /** Whether to show the count in the button */
  showCount?: boolean
  /** Whether to show icon only (no text) */
  iconOnly?: boolean
  /** Custom label text (overrides default) */
  label?: string
  /** Callback when sync completes */
  onSyncComplete?: (result: BatchSyncResult) => void
  /** Callback when sync fails */
  onSyncError?: (error: Error) => void
}

/**
 * Get button text based on mode and state
 */
function getButtonText({
  mode,
  pendingCount,
  failedCount,
  showCount,
  customLabel,
}: {
  mode: SyncMode
  pendingCount: number
  failedCount: number
  showCount: boolean
  customLabel?: string
}): string {
  if (customLabel) return customLabel

  const effectiveMode = mode === 'auto' ? (failedCount > 0 ? 'retry' : 'sync') : mode
  const count = effectiveMode === 'retry' ? failedCount : pendingCount

  if (effectiveMode === 'retry') {
    return showCount && count > 0 ? `Yeniden Dene (${count})` : 'Yeniden Dene'
  }

  return showCount && count > 0 ? `Senkronize Et (${count})` : 'Senkronize Et'
}

/**
 * Get appropriate icon based on state
 */
function getSyncIcon({
  mode,
  isSyncing,
  isOnline,
  isDbAvailable,
  failedCount,
}: {
  mode: SyncMode
  isSyncing: boolean
  isOnline: boolean
  isDbAvailable: boolean
  failedCount: number
}) {
  if (isSyncing) {
    return <Loader2 className="size-4 animate-spin" />
  }

  if (!isDbAvailable) {
    return <CloudOff className="size-4" />
  }

  if (!isOnline) {
    return <WifiOff className="size-4" />
  }

  const effectiveMode = mode === 'auto' ? (failedCount > 0 ? 'retry' : 'sync') : mode

  if (effectiveMode === 'retry') {
    return <RotateCcw className="size-4" />
  }

  return <Upload className="size-4" />
}

/**
 * Get tooltip text based on state
 */
function getTooltipText({
  isOnline,
  isDbAvailable,
  pendingCount,
  failedCount,
}: {
  isOnline: boolean
  isDbAvailable: boolean
  pendingCount: number
  failedCount: number
}): string {
  if (!isDbAvailable) {
    return 'Çevrimdışı depolama kullanılamıyor'
  }

  if (!isOnline) {
    return 'Senkronizasyon için internet bağlantısı gerekli'
  }

  if (pendingCount === 0 && failedCount === 0) {
    return 'Senkronize edilecek tarama yok'
  }

  return ''
}

/**
 * Manual Sync Button Component
 *
 * A button that triggers manual synchronization of the offline scan queue.
 * Supports syncing pending scans, retrying failed scans, or auto-detecting
 * which operation to perform based on queue state.
 *
 * @example
 * ```tsx
 * // Basic usage - sync pending scans
 * <ManualSyncButton />
 *
 * // Retry failed scans with count
 * <ManualSyncButton mode="retry" showCount />
 *
 * // Icon-only compact button
 * <ManualSyncButton size="icon" iconOnly />
 *
 * // With callbacks
 * <ManualSyncButton
 *   onSyncComplete={(result) => console.log('Synced:', result.successful)}
 *   onSyncError={(error) => console.error('Failed:', error)}
 * />
 * ```
 */
export const ManualSyncButton = memo(function ManualSyncButton({
  size = 'default',
  variant = 'default',
  className,
  mode = 'sync',
  showCount = false,
  iconOnly = false,
  label,
  onSyncComplete,
  onSyncError,
}: ManualSyncButtonProps) {
  const isOnline = useNetworkStatus()
  const { pendingCount, failedCount, isDbAvailable } = useScanQueueStore()
  const { isSyncing, syncNow, retryFailed } = useScanSync()

  // Determine effective mode based on queue state
  const effectiveMode = mode === 'auto' ? (failedCount > 0 ? 'retry' : 'sync') : mode

  // Determine if button should be disabled
  const isDisabled =
    !isDbAvailable ||
    !isOnline ||
    isSyncing ||
    (effectiveMode === 'sync' && pendingCount === 0) ||
    (effectiveMode === 'retry' && failedCount === 0)

  // Handle sync action
  const handleSync = useCallback(async () => {
    try {
      let result: BatchSyncResult

      if (effectiveMode === 'retry') {
        result = await retryFailed()
      } else {
        result = await syncNow()
      }

      onSyncComplete?.(result)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Senkronizasyon hatası')
      onSyncError?.(err)
    }
  }, [effectiveMode, syncNow, retryFailed, onSyncComplete, onSyncError])

  const tooltipText = getTooltipText({
    isOnline,
    isDbAvailable,
    pendingCount,
    failedCount,
  })

  const buttonText = getButtonText({
    mode,
    pendingCount,
    failedCount,
    showCount,
    customLabel: label,
  })

  const icon = getSyncIcon({
    mode,
    isSyncing,
    isOnline,
    isDbAvailable,
    failedCount,
  })

  // Icon-only variant
  if (iconOnly) {
    return (
      <Button
        size={size?.toString().includes('icon') ? size : 'icon'}
        variant={variant}
        className={className}
        disabled={isDisabled}
        onClick={handleSync}
        title={tooltipText || buttonText}
        aria-label={buttonText}
      >
        {icon}
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={cn('gap-2', className)}
      disabled={isDisabled}
      loading={isSyncing}
      onClick={handleSync}
      title={tooltipText}
    >
      {!isSyncing && icon}
      {buttonText}
    </Button>
  )
})

/**
 * Sync All Button - Convenience wrapper for syncing all pending scans
 */
export const SyncAllButton = memo(function SyncAllButton(
  props: Omit<ManualSyncButtonProps, 'mode'>
) {
  return <ManualSyncButton {...props} mode="sync" />
})

/**
 * Retry Failed Button - Convenience wrapper for retrying failed scans
 */
export const RetryFailedButton = memo(function RetryFailedButton(
  props: Omit<ManualSyncButtonProps, 'mode'>
) {
  return <ManualSyncButton {...props} mode="retry" />
})

/**
 * Smart Sync Button - Auto-detects whether to sync or retry
 */
export const SmartSyncButton = memo(function SmartSyncButton(
  props: Omit<ManualSyncButtonProps, 'mode'>
) {
  return <ManualSyncButton {...props} mode="auto" />
})

/**
 * Compact Sync Status Button
 *
 * A more compact button that shows sync status with an icon badge.
 * Good for toolbar or header placement.
 */
export const CompactSyncButton = memo(function CompactSyncButton({
  className,
  onSyncComplete,
  onSyncError,
}: Pick<ManualSyncButtonProps, 'className' | 'onSyncComplete' | 'onSyncError'>) {
  const isOnline = useNetworkStatus()
  const { pendingCount, failedCount, isDbAvailable, syncInProgress } =
    useScanQueueStore()
  const { syncNow, retryFailed } = useScanSync()

  const totalPending = pendingCount + failedCount

  // Handle sync action
  const handleSync = useCallback(async () => {
    try {
      let result: BatchSyncResult

      if (failedCount > 0 && pendingCount === 0) {
        result = await retryFailed()
      } else {
        result = await syncNow()
      }

      onSyncComplete?.(result)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Senkronizasyon hatası')
      onSyncError?.(err)
    }
  }, [failedCount, pendingCount, syncNow, retryFailed, onSyncComplete, onSyncError])

  const isDisabled = !isDbAvailable || !isOnline || syncInProgress || totalPending === 0

  // Don't render if nothing to sync and online
  if (totalPending === 0 && isOnline && isDbAvailable) {
    return null
  }

  const getVariant = (): ButtonVariant => {
    if (!isDbAvailable) return 'secondary'
    if (!isOnline) return 'warning'
    if (failedCount > 0) return 'destructive'
    if (syncInProgress) return 'secondary'
    return 'outline'
  }

  const getIcon = () => {
    if (syncInProgress) {
      return <Loader2 className="size-4 animate-spin" />
    }
    if (!isDbAvailable) {
      return <CloudOff className="size-4" />
    }
    if (!isOnline) {
      return <WifiOff className="size-4" />
    }
    if (failedCount > 0) {
      return <AlertTriangle className="size-4" />
    }
    return <RefreshCw className="size-4" />
  }

  return (
    <Button
      size="sm"
      variant={getVariant()}
      className={cn('gap-1.5', className)}
      disabled={isDisabled}
      onClick={handleSync}
      aria-label={`${totalPending} tarama bekliyor`}
    >
      {getIcon()}
      <span className="font-medium">{totalPending}</span>
    </Button>
  )
})

/**
 * Hook for accessing sync button state
 * Useful for custom sync button implementations
 */
export function useSyncButtonState() {
  const isOnline = useNetworkStatus()
  const {
    pendingCount,
    failedCount,
    isDbAvailable,
    syncInProgress,
    lastSyncAt,
    lastSyncError,
  } = useScanQueueStore()
  const { syncNow, retryFailed, syncScan } = useScanSync()

  const totalPending = pendingCount + failedCount
  const canSync = isDbAvailable && isOnline && !syncInProgress && totalPending > 0

  return {
    isOnline,
    isDbAvailable,
    isSyncing: syncInProgress,
    pendingCount,
    failedCount,
    totalPending,
    canSync,
    lastSyncAt,
    lastSyncError,
    syncNow,
    retryFailed,
    syncScan,
  }
}
