'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
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
    // Capture exception to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'app-error',
      },
      extra: {
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        {/* Error Icon */}
        <div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Bir Hata Oluştu</h2>
          <p className="text-muted-foreground">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya
            dönün.
          </p>
          {error.digest && (
            <p className="text-muted-foreground font-mono text-xs">
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
