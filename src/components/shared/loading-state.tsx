'use client'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

interface LoadingStateProps {
  /** Yükleme mesajı */
  message?: string
  /** Tam sayfa yükleme mi? */
  fullPage?: boolean
  /** Ek CSS sınıfları */
  className?: string
  /** Spinner boyutu */
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12',
}

export function LoadingState({
  message = 'Yükleniyor...',
  fullPage = false,
  className,
  size = 'md',
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-[50vh]' : 'py-12',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Spinner className={sizeClasses[size]} aria-hidden="true" />
      {message && (
        <p className="text-muted-foreground text-sm" aria-hidden="true">
          {message}
        </p>
      )}
    </div>
  )
}

/** Sayfa yüklenirken gösterilecek iskelet */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted h-4 w-72 animate-pulse rounded" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        <div className="bg-muted h-10 animate-pulse rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}

/** Kart yüklenirken gösterilecek iskelet */
export function CardLoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-lg border p-6">
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}
