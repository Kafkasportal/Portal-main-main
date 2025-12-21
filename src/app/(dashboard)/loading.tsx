import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                ))}
            </div>

            {/* Content Area Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-lg border bg-card p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}
