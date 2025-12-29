/**
 * CSRF Protection Middleware for API Routes
 * Validates CSRF tokens for state-changing requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFProtection, isSafeMethod } from './index'

/**
 * CSRF validation middleware for API routes
 * Usage: Apply to all API routes that handle state-changing operations
 *
 * Example:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const csrfCheck = await validateCSRFMiddleware(request)
 *   if (csrfCheck.error) {
 *     return NextResponse.json(
 *       { error: csrfCheck.error },
 *       { status: 403 }
 *     )
 *   }
 *   // Handle the request
 * }
 * ```
 */
export async function validateCSRFMiddleware(
  request: NextRequest
): Promise<{
  isValid: boolean
  error?: string
}> {
  const method = request.method
  const headers = request.headers

  // Safe methods don't need CSRF protection
  if (isSafeMethod(method)) {
    return { isValid: true }
  }

  // Get cookie string
  const cookieString = request.headers.get('cookie') || ''

  // Validate CSRF
  const result = validateCSRFProtection(method, headers, cookieString)

  return result
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 *
 * Usage:
 * ```typescript
 * async function handler(request: NextRequest) {
 *   // Your route logic
 * }
 *
 * export const POST = withCSRFProtection(handler)
 * ```
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    try {
      // Validate CSRF
      const csrfCheck = await validateCSRFMiddleware(request)

      if (!csrfCheck.isValid) {
        console.warn(`CSRF validation failed: ${csrfCheck.error}`)
        return NextResponse.json(
          { error: csrfCheck.error || 'CSRF validation failed' },
          { status: 403 }
        )
      }

      // Call the actual handler
      return await handler(request)
    } catch (error) {
      console.error('CSRF middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Express-style middleware for API routes
 * Returns a function that can be used in API routes
 */
export function createCSRFMiddleware() {
  return async (request: NextRequest) => {
    const method = request.method

    // Safe methods don't need CSRF protection
    if (isSafeMethod(method)) {
      return { isValid: true, proceed: true }
    }

    // Validate CSRF
    const csrfCheck = await validateCSRFMiddleware(request)

    if (!csrfCheck.isValid) {
      return {
        isValid: false,
        proceed: false,
        error: csrfCheck.error,
      }
    }

    return { isValid: true, proceed: true }
  }
}
