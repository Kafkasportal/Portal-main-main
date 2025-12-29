'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { errorLogger } from '@/lib/error-logger'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Component
 * React hatalarını yakalayıp kullanıcıya friendly bir hata mesajı gösterir
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Log to error tracking service
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary',
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-100 items-center justify-center p-6">
          <Card className="border-destructive/50 w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-destructive h-5 w-5" />
                <CardTitle>Bir Hata Oluştu</CardTitle>
              </div>
              <CardDescription>
                Uygulama beklenmeyen bir hatayla karşılaştı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="text-destructive font-mono text-sm">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
                        Stack Trace
                      </summary>
                      <pre className="text-muted-foreground mt-2 max-h-48 overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Dene
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ana Sayfaya Dön
                </Button>
              </div>

              {/* Help text */}
              <p className="text-muted-foreground text-xs">
                Bu hata devam ederse, lütfen sistem yöneticisiyle iletişime
                geçin.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Smaller error boundary for individual components
 */
export function ComponentErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Bu bileşen yüklenemedi
              </span>
            </div>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  )
}
