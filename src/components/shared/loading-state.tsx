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
    lg: 'size-12'
}

export function LoadingState({
    message = 'Yükleniyor...',
    fullPage = false,
    className,
    size = 'md'
}: LoadingStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3',
                fullPage ? 'min-h-[50vh]' : 'py-12',
                className
            )}
        >
            <Spinner className={sizeClasses[size]} />
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
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
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-72 bg-muted animate-pulse rounded" />
            </div>
            
            {/* Content skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
            
            {/* Table skeleton */}
            <div className="space-y-2">
                <div className="h-10 bg-muted animate-pulse rounded" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
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
                <div key={i} className="p-6 bg-card border rounded-lg space-y-3">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
            ))}
        </div>
    )
}
