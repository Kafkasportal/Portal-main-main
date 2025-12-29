import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses including:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Manages browser features and APIs
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 */
export async function middleware(request: NextRequest) {
  // Update session (Supabase auth middleware)
  let response = await updateSession(request)

  // Security Headers
  const securityHeaders = {
    // Prevents clickjacking attacks by disallowing framing
    'X-Frame-Options': 'DENY',

    // Prevents MIME type sniffing - browser should respect Content-Type
    'X-Content-Type-Options': 'nosniff',

    // Controls how much referrer information is shared
    // 'strict-origin-when-cross-origin' balances privacy and functionality
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Disables dangerous browser features and APIs
    'Permissions-Policy':
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), vr=()',

    // Enforce HTTPS and prevent downgrade attacks
    // max-age: 63072000 (2 years), includeSubdomains, preload
    'Strict-Transport-Security':
      process.env.NODE_ENV === 'production'
        ? 'max-age=63072000; includeSubdomains; preload'
        : 'max-age=3600',

    // Additional security headers
    'X-XSS-Protection': '1; mode=block',
    'X-Permitted-Cross-Domain-Policies': 'none',
  }

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Set Content-Security-Policy (CSP) header for additional XSS protection
  // This policy allows self-hosted resources and blocks unsafe inline scripts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live https://challenges.cloudflare.com", // Required for Next.js and monitoring
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https: ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - monitoring (Sentry monitoring route)
     */
    '/((?!_next/static|_next/image|favicon.ico|monitoring).*)',
  ],
}
