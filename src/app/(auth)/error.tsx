'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
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
    // Capture exception to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'auth-error',
      },
      extra: {
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="from-primary/5 via-background to-secondary/5 flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <div className="w-full max-w-md">
        <div className="bg-card space-y-6 rounded-lg border p-8 text-center shadow-lg">
          {/* Error Icon */}
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Giriş Hatası</h2>
            <p className="text-muted-foreground text-sm">
              Oturum açma işlemi sırasında bir sorun oluştu. Lütfen tekrar
              deneyin.
            </p>
            {error.digest && (
              <p className="text-muted-foreground bg-muted inline-block rounded px-2 py-1 font-mono text-xs">
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
