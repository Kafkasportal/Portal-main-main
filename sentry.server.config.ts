// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Helper: Check if error should be filtered (server-specific)
function shouldFilterServerError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()

  // Skip connection reset errors (common in serverless environments)
  if (
    message.includes('econnreset') ||
    message.includes('socket hang up')
  ) {
    return true
  }

  // Skip timeout errors that may be caused by slow client connections
  return message.includes('timeout') && message.includes('client')
}

// Helper: Strip sensitive headers (server-specific)
function stripServerHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const filtered = { ...headers }
  const sensitiveKeys = [
    'Authorization',
    'authorization',
    'Cookie',
    'cookie',
    'x-supabase-auth',
    'x-api-key',
  ]
  sensitiveKeys.forEach((key) => delete filtered[key])
  return filtered
}

// Helper: Strip sensitive data from request body (server-specific)
function stripServerSensitiveData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'access_token',
    'refresh_token',
    'service_role_key',
  ]
  const result = { ...data }

  for (const key of sensitiveKeys) {
    if (key in result) {
      ;(result as Record<string, unknown>)[key] = '[FILTERED]'
    }
  }

  return result
}

// Helper: Process and sanitize event for server runtime
function sanitizeServerEvent(event: Sentry.Event): Sentry.Event {
  // Strip sensitive data from error contexts
  if (event.request?.headers) {
    event.request.headers = stripServerHeaders(event.request.headers)
  }

  // Strip passwords from request data
  if (event.request?.data) {
    event.request.data = stripServerSensitiveData(event.request.data)
  }

  return event
}

// Gracefully skip initialization if DSN is not configured
if (!SENTRY_DSN) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[Sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Server-side error tracking is disabled.'
    )
  }
} else {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Release tracking - associates errors with specific deployments
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'development',

    // Environment configuration
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    // Capture 100% of transactions for full tracing (required for MCP monitoring)
    tracesSampleRate: 1.0,

    // Setting this option to true will send default PII like user IP address
    // Enabled for MCP monitoring to track user context
    sendDefaultPii: true,

    // Enable debug mode in development for troubleshooting
    debug: process.env.NODE_ENV === 'development',

    // Filter and sanitize error events before sending to Sentry
    beforeSend(event, hint) {
      const error = hint.originalException

      // Filter out known non-critical errors
      if (shouldFilterServerError(error)) {
        return null
      }

      // Sanitize event data
      return sanitizeServerEvent(event) as Sentry.ErrorEvent
    },

    // Set sample rate for errors (1.0 means capture all errors)
    // This is separate from tracesSampleRate which is for performance monitoring
    sampleRate: 1.0,
  })
}
