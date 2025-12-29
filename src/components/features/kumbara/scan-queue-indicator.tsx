'use client'

import { memo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudOff,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react'

import { useScanQueueStore } from '@/stores/scan-queue-store'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

type IndicatorSize = 'compact' | 'default' | 'large'
type IndicatorVariant = 'default' | 'minimal' | 'detailed'

interface ScanQueueIndicatorProps {
  /** Size variant for the indicator */
  size?: IndicatorSize
  /** Display variant */
  variant?: IndicatorVariant
  /** Additional CSS classes */
  className?: string
  /** Whether to show the last sync time */
  showLastSync?: boolean
  /** Whether to show detailed queue breakdown */
  showDetails?: boolean
}

const sizeStyles: Record<IndicatorSize, { card: string; icon: string; text: string }> = {
  compact: {
    card: 'p-2',
    icon: 'size-4',
    text: 'text-xs',
  },
  default: {
    card: 'p-3',
    icon: 'size-5',
    text: 'text-sm',
  },
  large: {
    card: 'p-4',
    icon: 'size-6',
    text: 'text-base',
  },
}

/**
 * Formats a timestamp into a relative time string in Turkish
 */
function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Hiç'

  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'Az önce'
  if (minutes < 60) return `${minutes} dk önce`
  if (hours < 24) return `${hours} saat önce`
  return new Date(timestamp).toLocaleDateString('tr-TR')
}

/**
 * Scan Queue Indicator Component
 *
 * Displays the current state of the offline scan queue including:
 * - Number of pending scans
 * - Number of failed scans
 * - Online/offline status
 * - Sync in progress indicator
 * - Last sync timestamp
 *
 * @example
 * ```tsx
 * // Compact badge-like indicator
 * <ScanQueueIndicator size="compact" variant="minimal" />
 *
 * // Full detailed card
 * <ScanQueueIndicator variant="detailed" showLastSync showDetails />
 * ```
 */
export const ScanQueueIndicator = memo(function ScanQueueIndicator({
  size = 'default',
  variant = 'default',
  className,
  showLastSync = false,
  showDetails = false,
}: ScanQueueIndicatorProps) {
  const isOnline = useNetworkStatus()
  const {
    queueCount,
    pendingCount,
    failedCount,
    syncInProgress,
    lastSyncAt,
    isDbAvailable,
    checkDbAvailability,
    refreshQueueStats,
  } = useScanQueueStore()

  // Initialize and refresh stats on mount
  useEffect(() => {
    checkDbAvailability()
  }, [checkDbAvailability])

  useEffect(() => {
    if (isDbAvailable) {
      void refreshQueueStats()
    }
  }, [isDbAvailable, refreshQueueStats])

  const styles = sizeStyles[size]
  const hasPending = pendingCount > 0
  const hasFailed = failedCount > 0
  const hasQueue = queueCount > 0

  // Minimal variant - just a badge
  if (variant === 'minimal') {
    return (
      <MinimalIndicator
        isOnline={isOnline}
        pendingCount={pendingCount}
        failedCount={failedCount}
        syncInProgress={syncInProgress}
        isDbAvailable={isDbAvailable}
        size={size}
        className={className}
      />
    )
  }

  // Determine overall status for card styling
  const getStatusColor = () => {
    if (!isDbAvailable) return 'bg-muted border-muted-foreground/20'
    if (!isOnline) return 'bg-warning/5 border-warning/20'
    if (hasFailed) return 'bg-destructive/5 border-destructive/20'
    if (syncInProgress) return 'bg-info/5 border-info/20'
    if (hasPending) return 'bg-primary/5 border-primary/20'
    return 'bg-success/5 border-success/20'
  }

  return (
    <Card
      role="status"
      aria-label="Tarama kuyruğu durumu"
      aria-live="polite"
      className={cn(
        'transition-all duration-200',
        getStatusColor(),
        className
      )}
    >
      <CardContent className={cn(styles.card, 'space-y-2')}>
        {/* Header row with status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <QueueStatusIcon
              isOnline={isOnline}
              isDbAvailable={isDbAvailable}
              syncInProgress={syncInProgress}
              hasFailed={hasFailed}
              hasPending={hasPending}
              iconClass={styles.icon}
            />
            <span className={cn('font-medium', styles.text)}>
              {getStatusText({
                isOnline,
                isDbAvailable,
                syncInProgress,
                pendingCount,
                failedCount,
              })}
            </span>
          </div>

          {/* Network status badge */}
          <Badge
            variant={isOnline ? 'outline-success' : 'outline-warning'}
            size="sm"
          >
            {isOnline ? (
              <>
                <Wifi className="size-3" />
                Çevrimiçi
              </>
            ) : (
              <>
                <WifiOff className="size-3" />
                Çevrimdışı
              </>
            )}
          </Badge>
        </div>

        {/* Queue counts - shown in detailed variant or when showDetails is true */}
        {(variant === 'detailed' || showDetails) && hasQueue && (
          <div className="flex items-center gap-4 text-sm">
            {pendingCount > 0 && (
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="text-primary size-4" />
                <span>
                  <strong className="text-foreground">{pendingCount}</strong> bekliyor
                </span>
              </div>
            )}
            {failedCount > 0 && (
              <div className="text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="text-destructive size-4" />
                <span>
                  <strong className="text-foreground">{failedCount}</strong> başarısız
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last sync time */}
        {showLastSync && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="size-3" />
            <span>Son senkronizasyon: {formatRelativeTime(lastSyncAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

/**
 * Minimal badge-like indicator for compact display
 */
const MinimalIndicator = memo(function MinimalIndicator({
  isOnline,
  pendingCount,
  failedCount,
  syncInProgress,
  isDbAvailable,
  size,
  className,
}: {
  isOnline: boolean
  pendingCount: number
  failedCount: number
  syncInProgress: boolean
  isDbAvailable: boolean
  size: IndicatorSize
  className?: string
}) {
  const totalPending = pendingCount + failedCount

  // Don't show if no pending items and online
  if (totalPending === 0 && isOnline && isDbAvailable) {
    return null
  }

  const getBadgeVariant = () => {
    if (!isDbAvailable) return 'secondary' as const
    if (!isOnline) return 'outline-warning' as const
    if (failedCount > 0) return 'outline-destructive' as const
    if (syncInProgress) return 'outline-info' as const
    if (pendingCount > 0) return 'outline' as const
    return 'outline-success' as const
  }

  const getBadgeSize = () => {
    if (size === 'compact') return 'sm' as const
    if (size === 'large') return 'lg' as const
    return 'default' as const
  }

  return (
    <Badge
      variant={getBadgeVariant()}
      size={getBadgeSize()}
      className={cn('gap-1.5', className)}
      role="status"
      aria-label={`${totalPending} tarama bekliyor`}
    >
      {syncInProgress ? (
        <Loader2 className="size-3 animate-spin" />
      ) : !isOnline ? (
        <CloudOff className="size-3" />
      ) : failedCount > 0 ? (
        <AlertTriangle className="size-3" />
      ) : (
        <Clock className="size-3" />
      )}
      <span>{totalPending}</span>
    </Badge>
  )
})

/**
 * Status icon component
 */
const QueueStatusIcon = memo(function QueueStatusIcon({
  isOnline,
  isDbAvailable,
  syncInProgress,
  hasFailed,
  hasPending,
  iconClass,
}: {
  isOnline: boolean
  isDbAvailable: boolean
  syncInProgress: boolean
  hasFailed: boolean
  hasPending: boolean
  iconClass: string
}) {
  if (!isDbAvailable) {
    return <CloudOff className={cn(iconClass, 'text-muted-foreground')} />
  }

  if (syncInProgress) {
    return <Loader2 className={cn(iconClass, 'text-info animate-spin')} />
  }

  if (!isOnline) {
    return <WifiOff className={cn(iconClass, 'text-warning')} />
  }

  if (hasFailed) {
    return <AlertTriangle className={cn(iconClass, 'text-destructive')} />
  }

  if (hasPending) {
    return <Clock className={cn(iconClass, 'text-primary')} />
  }

  return <CheckCircle2 className={cn(iconClass, 'text-success')} />
})

/**
 * Get status text based on current state
 */
function getStatusText({
  isOnline,
  isDbAvailable,
  syncInProgress,
  pendingCount,
  failedCount,
}: {
  isOnline: boolean
  isDbAvailable: boolean
  syncInProgress: boolean
  pendingCount: number
  failedCount: number
}): string {
  if (!isDbAvailable) {
    return 'Çevrimdışı depolama kullanılamıyor'
  }

  if (syncInProgress) {
    return 'Senkronize ediliyor...'
  }

  if (!isOnline) {
    const total = pendingCount + failedCount
    if (total > 0) {
      return `${total} tarama bekliyor (çevrimdışı)`
    }
    return 'Çevrimdışı mod'
  }

  if (failedCount > 0 && pendingCount > 0) {
    return `${pendingCount} bekliyor, ${failedCount} başarısız`
  }

  if (failedCount > 0) {
    return `${failedCount} tarama başarısız`
  }

  if (pendingCount > 0) {
    return `${pendingCount} tarama bekliyor`
  }

  return 'Tüm taramalar senkronize'
}

/**
 * Hook for accessing queue indicator state
 * Useful for custom indicator implementations
 */
export function useScanQueueIndicatorState() {
  const isOnline = useNetworkStatus()
  const {
    queueCount,
    pendingCount,
    failedCount,
    syncInProgress,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
  } = useScanQueueStore()

  return {
    isOnline,
    queueCount,
    pendingCount,
    failedCount,
    syncInProgress,
    lastSyncAt,
    lastSyncError,
    isDbAvailable,
    statusText: getStatusText({
      isOnline,
      isDbAvailable,
      syncInProgress,
      pendingCount,
      failedCount,
    }),
    formatRelativeTime,
  }
}
