// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

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
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'development',

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

      // Filter out browser extension errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase()

        // Skip common browser extension errors
        if (
          message.includes('extension') ||
          message.includes('chrome-extension') ||
          message.includes('moz-extension')
        ) {
          return null
        }

        // Skip ResizeObserver errors (common browser quirk)
        if (message.includes('resizeobserver')) {
          return null
        }

        // Skip network errors that may be caused by user connectivity issues
        if (
          message.includes('failed to fetch') &&
          message.includes('network')
        ) {
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
      }

      // Strip passwords from request data
      if (event.request?.data) {
        const data = event.request.data
        if (typeof data === 'object' && data !== null) {
          const sensitiveKeys = ['password', 'token', 'secret', 'api_key']
          for (const key of sensitiveKeys) {
            if (key in data) {
              ;(data as Record<string, unknown>)[key] = '[FILTERED]'
            }
          }
        }
      }

      return event
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
