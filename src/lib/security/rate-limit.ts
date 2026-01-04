/**
 * Rate Limiting Middleware
 * Provides protection against brute force and DDoS attacks
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (production should use Redis/Upstash)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds (default: 60s)
  maxRequests?: number // Max requests per window (default: 10)
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: Date
}

/**
 * Rate limiting function
 * @param identifier - Unique identifier for rate limiting (e.g., IP address, user ID)
 * @param options - Rate limit configuration options
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 10,
    skipSuccessfulRequests = false,
  } = options

  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier)
  
  if (!entry || now >= entry.resetTime) {
    // Reset or new entry
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(identifier, entry)
  }
  
  // Check if limit exceeded
  const remaining = maxRequests - entry.count
  const success = entry.count < maxRequests
  
  // Increment count (if not skipping successful requests)
  if (success && !skipSuccessfulRequests) {
    entry.count++
    rateLimitStore.set(identifier, entry)
  }
  
  return {
    success,
    limit: maxRequests,
    remaining: Math.max(0, remaining),
    resetTime: new Date(entry.resetTime),
  }
}

/**
 * Rate limiting for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  SIGNUP: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  
  // API endpoints
  API: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  WRITE_API: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 write requests per minute
  
  // File uploads
  UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
  
  // General
  DEFAULT: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
} as const

/**
 * Get rate limit options based on path
 */
export function getRateLimitForPath(path: string): RateLimitOptions {
  if (path.includes('/auth') || path.includes('/login') || path.includes('/signup')) {
    return RATE_LIMITS.LOGIN
  }
  
  if (path.includes('/upload') || path.includes('/documents')) {
    return RATE_LIMITS.UPLOAD
  }
  
  if (path.includes('/api/')) {
    // Check if it's a write operation
    const isWrite = /(POST|PUT|DELETE|PATCH)/i.test(path)
    return isWrite ? RATE_LIMITS.WRITE_API : RATE_LIMITS.API
  }
  
  return RATE_LIMITS.DEFAULT
}

/**
 * Reset rate limit for a specific identifier (useful for testing or admin reset)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Get current rate limit status for an identifier
 */
export function getRateLimitStatus(
  identifier: string
): RateLimitResult | null {
  const entry = rateLimitStore.get(identifier)
  if (!entry) return null
  
  const now = Date.now()
  const isExpired = now >= entry.resetTime
  
  return {
    success: !isExpired && entry.count < RATE_LIMITS.DEFAULT.maxRequests,
    limit: RATE_LIMITS.DEFAULT.maxRequests,
    remaining: isExpired ? RATE_LIMITS.DEFAULT.maxRequests : Math.max(0, RATE_LIMITS.DEFAULT.maxRequests - entry.count),
    resetTime: new Date(entry.resetTime),
  }
}

