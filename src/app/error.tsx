'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Error Icon */}
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Bir Hata Oluştu</h2>
                    <p className="text-muted-foreground">
                        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground font-mono">
                            Hata Kodu: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Dene
                    </Button>
                    <Button asChild>
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
