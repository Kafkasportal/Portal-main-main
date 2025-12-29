/**
 * Sentry User Context Utility
 *
 * Provides functions to set and clear user context in Sentry error tracking.
 * This allows errors to be associated with specific users for easier debugging.
 *
 * @see https://docs.sentry.io/platforms/javascript/enriching-events/identify-user/
 */

import * as Sentry from '@sentry/nextjs'
import type { User } from '@/types'

/**
 * User context data to be sent to Sentry
 * Contains non-sensitive user identifiers for error attribution
 */
export interface SentryUserContext {
  id: string
  email?: string
  username?: string
  role?: string
}

/**
 * Sets the user context in Sentry for error attribution.
 * Call this after successful authentication to associate errors with the user.
 *
 * @param user - The authenticated user from Zustand store or Supabase auth
 *
 * @example
 * ```typescript
 * import { setSentryUser } from '@/lib/sentry/user-context'
 *
 * // After successful login
 * if (user) {
 *   setSentryUser(user)
 * }
 * ```
 */
export function setSentryUser(user: User | null): void {
  if (!user) {
    // If user is null, clear the context
    clearSentryUser()
    return
  }

  // Construct the username from ad (first name) and soyad (last name) if available
  const username = [user.name].filter(Boolean).join(' ').trim() || undefined

  const sentryUserContext: SentryUserContext = {
    id: user.id,
    email: user.email || undefined,
    username,
    role: user.role || undefined,
  }

  Sentry.setUser(sentryUserContext)
}

/**
 * Alternative function to set user context from raw Supabase auth data.
 * Useful when you have direct access to Supabase session but not the User type.
 *
 * @param userData - Raw user data from Supabase auth session
 *
 * @example
 * ```typescript
 * import { setSentryUserFromAuth } from '@/lib/sentry/user-context'
 *
 * const { data: { session } } = await supabase.auth.getSession()
 * if (session?.user) {
 *   setSentryUserFromAuth({
 *     id: session.user.id,
 *     email: session.user.email,
 *     ad: session.user.user_metadata?.ad,
 *     soyad: session.user.user_metadata?.soyad,
 *     role: session.user.user_metadata?.role,
 *   })
 * }
 * ```
 */
export function setSentryUserFromAuth(userData: {
  id: string
  email?: string | null
  ad?: string
  soyad?: string
  role?: string
}): void {
  // Construct the username from ad and soyad if available
  const username = [userData.ad, userData.soyad].filter(Boolean).join(' ').trim() || undefined

  const sentryUserContext: SentryUserContext = {
    id: userData.id,
    email: userData.email || undefined,
    username,
    role: userData.role || undefined,
  }

  Sentry.setUser(sentryUserContext)
}

/**
 * Clears the user context from Sentry.
 * Call this on user logout to prevent errors from being attributed to the wrong user.
 *
 * @example
 * ```typescript
 * import { clearSentryUser } from '@/lib/sentry/user-context'
 *
 * // On logout
 * await supabase.auth.signOut()
 * clearSentryUser()
 * ```
 */
export function clearSentryUser(): void {
  Sentry.setUser(null)
}
