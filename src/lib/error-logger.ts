/**
 * Error Logging Service
 * Centralizes error logging for the application
 * Can be extended to integrate with external services like Sentry, LogRocket, etc.
 */

interface ErrorContext {
  componentStack?: string
  [key: string]: unknown
}

class ErrorLogger {
  private isProduction = process.env.NODE_ENV === 'production'
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log an error to the appropriate tracking service
   */
  logError(error: Error, context?: ErrorContext): void {
    // Always log to console in development
    if (this.isDevelopment) {
      console.error('Error Logger:', error)
      if (context) {
        console.error('Error Context:', context)
      }
    }

    // In production, you can integrate with external error tracking services
    if (this.isProduction) {
      // TODO: Integrate with Sentry
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: { react: context }
      //   })
      // }

      // TODO: Integrate with LogRocket
      // if (typeof window !== 'undefined' && window.LogRocket) {
      //   window.LogRocket.captureException(error, {
      //     extra: context
      //   })
      // }

      // For now, log to console even in production for debugging
      console.error('Production Error:', error, context)
    }

    // Store error in localStorage for debugging (optional)
    this.storeErrorLocally(error, context)
  }

  /**
   * Log a warning message
   */
  logWarning(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn('Warning:', message, context)
    }
  }

  /**
   * Store errors locally for debugging purposes
   */
  private storeErrorLocally(error: Error, context?: ErrorContext): void {
    try {
      if (typeof window === 'undefined') return

      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context,
      }

      // Get existing errors
      const existingErrors = this.getStoredErrors()

      // Keep only last 10 errors to avoid filling localStorage
      const updatedErrors = [errorLog, ...existingErrors].slice(0, 10)

      localStorage.setItem('app_error_logs', JSON.stringify(updatedErrors))
    } catch (storageError) {
      // Silently fail if localStorage is not available
      console.error('Failed to store error locally:', storageError)
    }
  }

  /**
   * Retrieve stored errors from localStorage
   */
  getStoredErrors(): Array<{
    timestamp: string
    message: string
    stack?: string
    context?: ErrorContext
  }> {
    try {
      if (typeof window === 'undefined') return []

      const stored = localStorage.getItem('app_error_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Clear stored errors from localStorage
   */
  clearStoredErrors(): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem('app_error_logs')
    } catch (error) {
      console.error('Failed to clear error logs:', error)
    }
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()
