'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Global Error Handler for Next.js App Router
 * This component catches React rendering errors at the root level.
 * It must be a Client Component and define its own <html> and <body> tags.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
        errorType: 'react-rendering',
      },
      extra: {
        digest: error.digest,
        componentStack: (error as Error & { componentStack?: string }).componentStack,
      },
    })
  }, [error])

  return (
    <html lang="tr">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Kritik Bir Hata Oluştu
              </h1>
              <p className="text-gray-600">
                Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı
                yenileyin veya daha sonra tekrar deneyin.
              </p>
              {error.digest && (
                <p className="font-mono text-xs text-gray-400">
                  Hata Referansı: {error.digest}
                </p>
              )}
            </div>

            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
