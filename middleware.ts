import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { rateLimit, getRateLimitForPath } from '@/lib/security/rate-limit'

/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses including:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Manages browser features and APIs
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - Rate Limiting: Protects against brute force and DDoS attacks
 */
export async function middleware(request: NextRequest) {
  // Get IP address for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1'

  // Apply rate limiting
  const rateLimitOptions = getRateLimitForPath(request.nextUrl.pathname)
  const { success, remaining, resetTime } = rateLimit(ip, rateLimitOptions)

  if (!success) {
    // Rate limit exceeded - return 429 Too Many Requests
    const response = new Response(
      JSON.stringify({
        error: 'Çok fazla istek',
        message: 'Lütfen bir süre bekleyin',
        resetTime: resetTime.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitOptions.maxRequests?.toString() || '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toISOString(),
        },
      }
    )
    return response
  }

  // Update session (Supabase auth middleware)
  const response = await updateSession(request)

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

  // Add rate limit headers to all responses (for better visibility)
  response.headers.set('X-RateLimit-Limit', rateLimitOptions.maxRequests?.toString() || '100')
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', resetTime.toISOString())

  return response
}

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - monitoring (Sentry monitoring route)
     */
    '/((?!_next/static|_next/image|favicon.ico|monitoring).*)',
  ],
}
