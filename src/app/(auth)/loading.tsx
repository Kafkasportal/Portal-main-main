import { Skeleton } from '@/components/ui/skeleton'

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="w-full max-w-md p-8 space-y-6">
                {/* Logo Skeleton */}
                <div className="flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                </div>

                {/* Title Skeleton */}
                <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-40 mx-auto" />
                    <Skeleton className="h-4 w-56 mx-auto" />
                </div>

                {/* Form Card Skeleton */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                    </div>

                    {/* Submit Button */}
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Demo Info Skeleton */}
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        </div>
    )
}
