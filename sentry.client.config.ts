// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Helper: Check if error should be filtered
function shouldFilterError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  const filterPatterns = [
    'extension',
    'chrome-extension',
    'moz-extension',
    'resizeobserver',
  ]

  // Skip network errors that may be caused by user connectivity issues
  if (message.includes('failed to fetch') && message.includes('network')) {
    return true
  }

  return filterPatterns.some((pattern) => message.includes(pattern))
}

// Helper: Strip sensitive headers
function stripSensitiveHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const filtered = { ...headers }
  const sensitiveKeys = ['Authorization', 'authorization', 'Cookie', 'cookie']
  sensitiveKeys.forEach((key) => delete filtered[key])
  return filtered
}

// Helper: Strip sensitive data from request body
function stripSensitiveData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'api_key']
  const result = { ...data }

  for (const key of sensitiveKeys) {
    if (key in result) {
      ;(result as Record<string, unknown>)[key] = '[FILTERED]'
    }
  }

  return result
}

// Helper: Process and sanitize event
function sanitizeEvent(event: Sentry.Event): Sentry.Event {
  // Strip sensitive data from error contexts
  if (event.request?.headers) {
    event.request.headers = stripSensitiveHeaders(event.request.headers)
  }

  // Strip passwords from request data
  if (event.request?.data) {
    event.request.data = stripSensitiveData(event.request.data)
  }

  return event
}

// Gracefully skip initialization if DSN is not configured
if (!SENTRY_DSN) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[Sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Error tracking is disabled.'
    )
  }
} else {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Release tracking - associates errors with specific deployments
    // This enables: regression detection, commit association, deploy notifications
    release:
      process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      'development',

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

    // Filter out known non-critical errors before sending to Sentry
    beforeSend(event, hint) {
      const error = hint.originalException

      // Filter out browser extension errors and other non-critical issues
      if (shouldFilterError(error)) {
        return null
      }

      // Sanitize event data
      return sanitizeEvent(event) as Sentry.ErrorEvent
    },

    // Configure integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
    ],

    // Set sample rate for errors (1.0 means capture all errors)
    // This is separate from tracesSampleRate which is for performance monitoring
    sampleRate: 1.0,
  })
}
