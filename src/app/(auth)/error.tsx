'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Auth Error]', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
            <div className="w-full max-w-md">
                <div className="rounded-lg border bg-card p-8 space-y-6 text-center shadow-lg">
                    {/* Error Icon */}
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Giriş Hatası</h2>
                        <p className="text-sm text-muted-foreground">
                            Oturum açma işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">
                                {error.digest}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={reset} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tekrar Dene
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <a href="mailto:destek@kafkasder.org">
                                <Mail className="mr-2 h-4 w-4" />
                                Destek Al
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
