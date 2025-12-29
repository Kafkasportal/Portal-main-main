/**
 * Integration tests for Sentry user context utility
 *
 * Tests cover:
 * - setSentryUser() called with correct data after authentication
 * - setSentryUserFromAuth() for raw Supabase auth data
 * - clearSentryUser() called on logout (setUser(null))
 * - Username construction from user metadata
 * - Handling of null/undefined user data
 */

import * as Sentry from '@sentry/nextjs'
import {
  setSentryUser,
  setSentryUserFromAuth,
  clearSentryUser,
  type SentryUserContext,
} from '../src/lib/sentry/user-context'
import type { User } from '@/types'

// Mock @sentry/nextjs
jest.mock('@sentry/nextjs', () => ({
  setUser: jest.fn(),
}))

describe('Sentry User Context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('setSentryUser', () => {
    it('should set user context with full user data', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      } as unknown as User

      setSentryUser(user)

      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        username: 'Test User',
        role: 'admin',
      } as SentryUserContext)
    })

    it('should set user context with minimal user data', () => {
      const user: User = {
        id: 'user-456',
      } as unknown as User

      setSentryUser(user)

      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-456',
        email: undefined,
        username: undefined,
        role: undefined,
      } as SentryUserContext)
    })

    it('should handle user with empty name', () => {
      const user: User = {
        id: 'user-789',
        email: 'test@example.com',
        name: '',
        role: 'user',
      } as unknown as User

      setSentryUser(user)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-789',
        email: 'test@example.com',
        username: undefined,
        role: 'user',
      } as SentryUserContext)
    })

    it('should call clearSentryUser when user is null', () => {
      setSentryUser(null)

      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })

    it('should handle user with empty email', () => {
      const user: User = {
        id: 'user-empty-email',
        email: '',
        name: 'Test',
        role: 'user',
      } as unknown as User

      setSentryUser(user)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-empty-email',
        email: undefined, // Empty string should become undefined
        username: 'Test',
        role: 'user',
      } as SentryUserContext)
    })

    it('should handle user with empty role', () => {
      const user: User = {
        id: 'user-no-role',
        email: 'test@example.com',
        name: 'Test',
        role: '',
      } as unknown as User

      setSentryUser(user)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-no-role',
        email: 'test@example.com',
        username: 'Test',
        role: undefined,
      } as SentryUserContext)
    })
  })

  describe('setSentryUserFromAuth', () => {
    it('should set user context from Supabase auth data with full metadata', () => {
      const authData = {
        id: 'auth-user-123',
        email: 'supabase@example.com',
        ad: 'John',
        soyad: 'Doe',
        role: 'manager',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'auth-user-123',
        email: 'supabase@example.com',
        username: 'John Doe',
        role: 'manager',
      } as SentryUserContext)
    })

    it('should set user context with only id', () => {
      const authData = {
        id: 'auth-minimal',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'auth-minimal',
        email: undefined,
        username: undefined,
        role: undefined,
      } as SentryUserContext)
    })

    it('should handle null email from Supabase', () => {
      const authData = {
        id: 'auth-null-email',
        email: null,
        ad: 'Test',
        role: 'user',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'auth-null-email',
        email: undefined,
        username: 'Test',
        role: 'user',
      } as SentryUserContext)
    })

    it('should construct username from ad only', () => {
      const authData = {
        id: 'auth-ad-only',
        ad: 'John',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'John',
        })
      )
    })

    it('should construct username from soyad only', () => {
      const authData = {
        id: 'auth-soyad-only',
        soyad: 'Doe',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Doe',
        })
      )
    })

    it('should handle empty ad and soyad', () => {
      const authData = {
        id: 'auth-empty-names',
        ad: '',
        soyad: '',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: undefined,
        })
      )
    })

    it('should trim whitespace from username', () => {
      const authData = {
        id: 'auth-whitespace',
        ad: '  John  ',
        soyad: '  Doe  ',
      }

      setSentryUserFromAuth(authData)

      // filter(Boolean) removes empty strings, join(' ') adds space, trim() handles edges
      expect(Sentry.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'John   Doe', // Trimmed on edges but inner spaces preserved from filter join
        })
      )
    })
  })

  describe('clearSentryUser', () => {
    it('should call setUser with null to clear context', () => {
      clearSentryUser()

      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })

    it('should clear user context on consecutive calls', () => {
      clearSentryUser()
      clearSentryUser()

      expect(Sentry.setUser).toHaveBeenCalledTimes(2)
      expect(Sentry.setUser).toHaveBeenNthCalledWith(1, null)
      expect(Sentry.setUser).toHaveBeenNthCalledWith(2, null)
    })
  })

  describe('user context flow integration', () => {
    it('should handle complete auth lifecycle: login -> logout', () => {
      // User logs in
      const authData = {
        id: 'lifecycle-user',
        email: 'lifecycle@example.com',
        ad: 'Life',
        soyad: 'Cycle',
        role: 'user',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenLastCalledWith({
        id: 'lifecycle-user',
        email: 'lifecycle@example.com',
        username: 'Life Cycle',
        role: 'user',
      } as SentryUserContext)

      // User logs out
      clearSentryUser()

      expect(Sentry.setUser).toHaveBeenLastCalledWith(null)
      expect(Sentry.setUser).toHaveBeenCalledTimes(2)
    })

    it('should handle session refresh with updated user data', () => {
      // Initial login
      setSentryUserFromAuth({
        id: 'refresh-user',
        email: 'old@example.com',
        role: 'user',
      })

      expect(Sentry.setUser).toHaveBeenLastCalledWith(
        expect.objectContaining({
          email: 'old@example.com',
          role: 'user',
        })
      )

      // Session refresh with updated role
      setSentryUserFromAuth({
        id: 'refresh-user',
        email: 'old@example.com',
        role: 'admin',
      })

      expect(Sentry.setUser).toHaveBeenLastCalledWith(
        expect.objectContaining({
          email: 'old@example.com',
          role: 'admin',
        })
      )

      expect(Sentry.setUser).toHaveBeenCalledTimes(2)
    })

    it('should handle rapid auth state changes', () => {
      // Rapid login/logout sequence (e.g., token refresh edge cases)
      setSentryUserFromAuth({ id: 'rapid-1' })
      clearSentryUser()
      setSentryUserFromAuth({ id: 'rapid-2' })
      setSentryUserFromAuth({ id: 'rapid-3' })
      clearSentryUser()

      expect(Sentry.setUser).toHaveBeenCalledTimes(5)
      expect(Sentry.setUser).toHaveBeenLastCalledWith(null)
    })
  })

  describe('edge cases and error handling', () => {
    it('should not throw with undefined optional fields', () => {
      const authData = {
        id: 'safe-user',
        email: undefined,
        ad: undefined,
        soyad: undefined,
        role: undefined,
      }

      expect(() => setSentryUserFromAuth(authData)).not.toThrow()

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'safe-user',
        email: undefined,
        username: undefined,
        role: undefined,
      } as SentryUserContext)
    })

    it('should handle special characters in user data', () => {
      const authData = {
        id: 'special-chars',
        email: 'test+special@example.com',
        ad: "O'Brien",
        soyad: 'Van Der Berg',
        role: 'super-admin',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'special-chars',
        email: 'test+special@example.com',
        username: "O'Brien Van Der Berg",
        role: 'super-admin',
      } as SentryUserContext)
    })

    it('should handle unicode characters in names', () => {
      const authData = {
        id: 'unicode-user',
        email: 'unicode@example.com',
        ad: '日本語',
        soyad: 'ユーザー',
        role: 'user',
      }

      setSentryUserFromAuth(authData)

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'unicode-user',
        email: 'unicode@example.com',
        username: '日本語 ユーザー',
        role: 'user',
      } as SentryUserContext)
    })

    it('should handle very long user data', () => {
      const longString = 'a'.repeat(1000)
      const authData = {
        id: `long-id-${longString}`,
        email: `long${longString}@example.com`,
        ad: longString,
        soyad: longString,
        role: longString,
      }

      expect(() => setSentryUserFromAuth(authData)).not.toThrow()
      expect(Sentry.setUser).toHaveBeenCalledTimes(1)
    })
  })
})
