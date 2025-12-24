'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('[Dashboard Error]', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Error Icon */}
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Sayfa Yüklenemedi</h2>
                    <p className="text-sm text-muted-foreground">
                        Bu sayfayı yüklerken bir sorun oluştu. Lütfen tekrar deneyin.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            Hata: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => { router.back(); }}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Geri Dön
                    </Button>
                    <Button variant="outline" size="sm" onClick={reset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Dene
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/genel">
                            <Home className="mr-2 h-4 w-4" />
                            Ana Sayfa
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
