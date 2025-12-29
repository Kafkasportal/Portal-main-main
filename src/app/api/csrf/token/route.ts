/**
 * CSRF Token API Endpoint
 * GET /api/csrf/token - Generate and return a new CSRF token
 */

import { generateCSRFToken, createCSRFCookie } from '@/lib/csrf'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET handler - Generate new CSRF token
 * Returns token in response body and sets it as a cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Generate new CSRF token
    const token = generateCSRFToken()

    // Create response with token in body
    const response = NextResponse.json(
      { token },
      { status: 200 }
    )

    // Set CSRF cookie
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieConfig = createCSRFCookie(token, isProduction)

    response.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      cookieConfig.options
    )

    // Add security headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error('Failed to generate CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

/**
 * HEAD handler - Check if token endpoint is available
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
    },
  })
}
