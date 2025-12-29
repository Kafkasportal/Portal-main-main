'use client'

import { useEffect, useState } from 'react'

/**
 * Hook for managing CSRF tokens on the client side
 * Handles fetching, storing, and providing tokens for requests
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches a new CSRF token from the server
   */
  const fetchToken = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/csrf/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
      }

      const data = await response.json()
      setToken(data.token)
      return data.token
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('CSRF token fetch error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Initialize token on mount
   */
  useEffect(() => {
    const initializeToken = async () => {
      // Check if token already exists in cookie
      const existingToken = getCookie('csrf-token')
      if (existingToken) {
        setToken(existingToken)
      } else {
        await fetchToken()
      }
    }

    initializeToken()
  }, [])

  /**
   * Gets the current token or fetches a new one
   */
  const getToken = async (): Promise<string | null> => {
    if (token) {
      return token
    }
    return fetchToken()
  }

  /**
   * Refreshes the CSRF token
   */
  const refreshToken = async (): Promise<string | null> => {
    return fetchToken()
  }

  return {
    token,
    isLoading,
    error,
    getToken,
    refreshToken,
  }
}

/**
 * Gets a cookie by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const nameEQ = name + '='
  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    let trimmed = cookie.trim()
    if (trimmed.startsWith(nameEQ)) {
      return decodeURIComponent(trimmed.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * Sets up CSRF token header for fetch requests
 * Usage: Add to every fetch request that modifies data
 */
export function getCSRFHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {}
  }

  return {
    'X-CSRF-Token': token,
  }
}

/**
 * Helper to make authenticated fetch requests with CSRF protection
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {},
  csrfToken: string | null
): Promise<Response> {
  const headers = {
    ...options.headers,
    ...getCSRFHeaders(csrfToken),
  } as Record<string, string>

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}
