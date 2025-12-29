/**
 * CSRF Protection Utilities
 * Implements CSRF token generation, validation, and management
 * Uses both synchronizer token pattern and double-submit cookie pattern
 */

import crypto from 'crypto'

/**
 * CSRF Token Configuration
 */
export const CSRF_CONFIG = {
  TOKEN_HEADER: 'X-CSRF-Token',
  TOKEN_COOKIE: 'csrf-token',
  SAFE_METHODS: ['GET', 'HEAD', 'OPTIONS'],
  TOKEN_EXPIRY_MS: 1000 * 60 * 60, // 1 hour
  TOKEN_LENGTH: 32, // bytes
} as const

/**
 * Generates a cryptographically secure CSRF token
 * @returns A hex string token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex')
}

/**
 * Validates CSRF token against both the request header and cookie
 * Uses synchronizer token pattern
 * @param tokenFromRequest - Token from request header
 * @param tokenFromStorage - Token from cookie/session
 * @returns true if tokens match
 */
export function validateCSRFToken(
  tokenFromRequest: string | null | undefined,
  tokenFromStorage: string | null | undefined
): boolean {
  if (!tokenFromRequest || !tokenFromStorage) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(tokenFromRequest, tokenFromStorage)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Checks if a request method is safe (doesn't require CSRF protection)
 */
export function isSafeMethod(method: string): boolean {
  return CSRF_CONFIG.SAFE_METHODS.includes(method.toUpperCase())
}

/**
 * Gets the CSRF token from request headers
 */
export function getTokenFromRequest(headers: Headers): string | null {
  const token = headers.get(CSRF_CONFIG.TOKEN_HEADER)
  return token || headers.get('x-csrf-token') || null
}

/**
 * Gets the CSRF token from cookies
 */
export function getTokenFromCookies(cookies: string): string | null {
  const cookieArray = cookies.split('; ')
  for (const cookie of cookieArray) {
    const [name, value] = cookie.split('=')
    if (name === CSRF_CONFIG.TOKEN_COOKIE) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Creates a CSRF token cookie with secure settings
 */
export function createCSRFCookie(token: string, isProduction: boolean = false) {
  return {
    name: CSRF_CONFIG.TOKEN_COOKIE,
    value: token,
    options: {
      httpOnly: false, // Must be accessible to JavaScript for double-submit
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict' as const, // Prevent cross-site cookie sending
      maxAge: CSRF_CONFIG.TOKEN_EXPIRY_MS / 1000, // in seconds
      path: '/',
    },
  }
}

/**
 * Validates CSRF for state-changing requests (POST, PUT, DELETE, PATCH)
 * @param method - HTTP method
 * @param headers - Request headers
 * @param cookies - Cookie string from request
 * @param storedToken - Token from session/database (if using server-side storage)
 */
export function validateCSRFProtection(
  method: string,
  headers: Headers,
  cookies: string,
  storedToken?: string
): {
  isValid: boolean
  error?: string
} {
  // Safe methods don't need CSRF protection
  if (isSafeMethod(method)) {
    return { isValid: true }
  }

  // Get token from request header
  const headerToken = getTokenFromRequest(headers)

  // Get token from cookies
  const cookieToken = getTokenFromCookies(cookies)

  // If no token is provided
  if (!headerToken && !cookieToken) {
    return {
      isValid: false,
      error: 'CSRF token missing from request',
    }
  }

  // For double-submit cookie pattern: header token should match cookie token
  if (headerToken && cookieToken) {
    if (!validateCSRFToken(headerToken, cookieToken)) {
      return {
        isValid: false,
        error: 'CSRF token mismatch',
      }
    }
  }

  // For synchronizer token pattern: validate against stored token
  if (storedToken && headerToken) {
    if (!validateCSRFToken(headerToken, storedToken)) {
      return {
        isValid: false,
        error: 'CSRF token invalid',
      }
    }
  }

  return { isValid: true }
}

/**
 * Extracts CSRF token from form data
 * Useful for server-side form submission handling
 */
export function getCSRFTokenFromFormData(formData: FormData): string | null {
  return (formData.get('csrf_token') as string) || null
}

/**
 * Creates a hidden input field for form-based CSRF protection
 */
export function createCSRFFormField(token: string): string {
  return `<input type="hidden" name="csrf_token" value="${escapeHtml(token)}" />`
}

/**
 * Escapes HTML special characters to prevent XSS in CSRF field
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Refreshes CSRF token (call periodically or after sensitive operations)
 */
export function refreshCSRFToken(): string {
  return generateCSRFToken()
}

/**
 * Checks if a CSRF token has expired
 */
export function isCSRFTokenExpired(
  tokenTimestamp: number,
  currentTime: number = Date.now()
): boolean {
  return currentTime - tokenTimestamp > CSRF_CONFIG.TOKEN_EXPIRY_MS
}
