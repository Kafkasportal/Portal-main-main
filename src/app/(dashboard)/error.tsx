'use client'

import * as Sentry from '@sentry/nextjs'
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
    // Capture exception to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'dashboard-error',
      },
      extra: {
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        {/* Error Icon */}
        <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Sayfa Yüklenemedi</h2>
          <p className="text-muted-foreground text-sm">
            Bu sayfayı yüklerken bir sorun oluştu. Lütfen tekrar deneyin.
          </p>
          {error.digest && (
            <p className="text-muted-foreground bg-muted rounded px-2 py-1 font-mono text-xs">
              Hata: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.back()
            }}
          >
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
