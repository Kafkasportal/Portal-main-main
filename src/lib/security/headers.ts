/**
 * Security Headers Utility
 * Provides helper functions for managing security headers across the application.
 */

export interface SecurityHeadersConfig {
  enableHSTS?: boolean
  hstsMaxAge?: number
  cspDirectives?: Record<string, string[]>
}

/**
 * Gets the default security headers configuration
 */
export const getDefaultSecurityHeaders = () => ({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), vr=()',
})

/**
 * Gets the HSTS (Strict-Transport-Security) header value
 * In production, sets a 2-year max-age; in development, 1 hour
 */
export const getHSTSHeader = (isProduction: boolean = false) => {
  return isProduction
    ? 'max-age=63072000; includeSubdomains; preload'
    : 'max-age=3600'
}

/**
 * Builds a Content-Security-Policy header value
 * @param overrides - Directive overrides for specific use cases
 */
export const buildCSP = (
  overrides?: Record<string, string[]>
): string => {
  const defaultDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://vercel.live',
      'https://challenges.cloudflare.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https:', 'ws:', 'wss:'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  }

  const directives = {
    ...defaultDirectives,
    ...overrides,
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Validates CSP policy string
 */
export const validateCSP = (policy: string): boolean => {
  if (!policy || policy.length === 0) return false
  if (policy.length > 4096) return false
  // Basic validation - should contain directive and source
  return /^[\w-]+ /.test(policy)
}

/**
 * Types for security headers responses
 */
export type SecurityHeaders = Record<string, string>

/**
 * Merges custom security headers with defaults
 */
export const mergeSecurityHeaders = (
  custom?: Record<string, string>
): SecurityHeaders => {
  return {
    ...getDefaultSecurityHeaders(),
    ...custom,
  }
}
