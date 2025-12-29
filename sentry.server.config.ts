// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

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
      if (error instanceof Error) {
        const message = error.message.toLowerCase()

        // Skip connection reset errors (common in serverless environments)
        if (
          message.includes('econnreset') ||
          message.includes('socket hang up')
        ) {
          return null
        }

        // Skip timeout errors that may be caused by slow client connections
        if (message.includes('timeout') && message.includes('client')) {
          return null
        }
      }

      // Strip sensitive data from error contexts
      if (event.request?.headers) {
        // Remove Authorization header to prevent token leakage
        delete event.request.headers['Authorization']
        delete event.request.headers['authorization']
        // Remove cookies to prevent session token exposure
        delete event.request.headers['Cookie']
        delete event.request.headers['cookie']
        // Remove other sensitive headers
        delete event.request.headers['x-supabase-auth']
        delete event.request.headers['x-api-key']
      }

      // Strip sensitive data from request body
      if (event.request?.data) {
        const data = event.request.data
        if (typeof data === 'object' && data !== null) {
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
          for (const key of sensitiveKeys) {
            if (key in data) {
              ;(data as Record<string, unknown>)[key] = '[FILTERED]'
            }
          }
        }
      }

      return event
    },

    // Set sample rate for errors (1.0 means capture all errors)
    // This is separate from tracesSampleRate which is for performance monitoring
    sampleRate: 1.0,
  })
}
