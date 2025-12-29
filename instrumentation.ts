// Next.js instrumentation hook for Sentry initialization
// This file is automatically loaded by Next.js 13.4+ when the server starts.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

/**
 * The register function is called once when a new Next.js server instance
 * is bootstrapped. This is the recommended way to initialize Sentry for
 * Server Components in Next.js 13.4+.
 *
 * The function dynamically imports the appropriate Sentry configuration
 * based on the runtime environment (Node.js server or Edge runtime).
 */
export async function register() {
  // Initialize Sentry for server-side error tracking
  // This is the recommended way to initialize Sentry for Server Components in Next.js 13.4+
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * The onRequestError function is called when an error is thrown during
 * the processing of a request. This allows Sentry to capture errors that
 * occur during server-side rendering or API route handling.
 *
 * Note: This is available in Next.js 14.1+ and provides additional error
 * context beyond what the Sentry SDK captures automatically.
 */
export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string }
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering'
    revalidateReason: 'on-demand' | 'stale' | undefined
    renderType: 'dynamic' | 'dynamic-resume' | undefined
  }
) {
  // Only import Sentry if DSN is configured to avoid errors
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  // Dynamically import Sentry to ensure it's available
  const Sentry = await import('@sentry/nextjs')

  // Add request context to the error
  Sentry.withScope((scope) => {
    // Add request information
    scope.setTag('router.kind', context.routerKind)
    scope.setTag('router.type', context.routeType)
    scope.setTag('router.path', context.routePath)

    if (context.renderSource) {
      scope.setTag('render.source', context.renderSource)
    }

    if (context.renderType) {
      scope.setTag('render.type', context.renderType)
    }

    if (context.revalidateReason) {
      scope.setTag('revalidate.reason', context.revalidateReason)
    }

    // Add request details (with sensitive data stripped)
    scope.setContext('request', {
      path: request.path,
      method: request.method,
      // Note: headers are not included here to avoid PII
      // Sentry's beforeSend hook handles header sanitization
    })

    // Capture the error
    Sentry.captureException(error)
  })
}
