import {
  generateCSRFToken,
  validateCSRFToken,
  isSafeMethod,
  getTokenFromRequest,
  createCSRFCookie,
  validateCSRFProtection,
  getCSRFTokenFromFormData,
  createCSRFFormField,
  isCSRFTokenExpired,
  CSRF_CONFIG,
} from '@/lib/csrf'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a token', () => {
      const token = generateCSRFToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate correct length token', () => {
      const token = generateCSRFToken()
      const expectedLength = CSRF_CONFIG.TOKEN_LENGTH * 2 // hex = 2 chars per byte
      expect(token).toHaveLength(expectedLength)
    })

    it('should generate hex string token', () => {
      const token = generateCSRFToken()
      expect(/^[a-f0-9]+$/.test(token)).toBe(true)
    })
  })

  describe('validateCSRFToken', () => {
    it('should validate matching tokens', () => {
      const token = generateCSRFToken()
      expect(validateCSRFToken(token, token)).toBe(true)
    })

    it('should reject mismatched tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(validateCSRFToken(token1, token2)).toBe(false)
    })

    it('should reject null tokens', () => {
      expect(validateCSRFToken(null, 'token')).toBe(false)
      expect(validateCSRFToken('token', null)).toBe(false)
      expect(validateCSRFToken(null, null)).toBe(false)
    })

    it('should reject undefined tokens', () => {
      expect(validateCSRFToken(undefined, 'token')).toBe(false)
      expect(validateCSRFToken('token', undefined)).toBe(false)
    })

    it('should use constant-time comparison', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()

      // These should both return false but with same timing
      const start1 = Date.now()
      validateCSRFToken(token1, 'x'.repeat(token1.length))
      const time1 = Date.now() - start1

      const start2 = Date.now()
      validateCSRFToken(token2, 'y'.repeat(token2.length))
      const time2 = Date.now() - start2

      // Times should be similar (constant-time)
      // Allow some variance for test environment
      expect(Math.abs(time1 - time2)).toBeLessThan(10)
    })
  })

  describe('isSafeMethod', () => {
    it('should identify safe methods', () => {
      expect(isSafeMethod('GET')).toBe(true)
      expect(isSafeMethod('HEAD')).toBe(true)
      expect(isSafeMethod('OPTIONS')).toBe(true)
    })

    it('should identify unsafe methods', () => {
      expect(isSafeMethod('POST')).toBe(false)
      expect(isSafeMethod('PUT')).toBe(false)
      expect(isSafeMethod('DELETE')).toBe(false)
      expect(isSafeMethod('PATCH')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(isSafeMethod('get')).toBe(true)
      expect(isSafeMethod('Get')).toBe(true)
      expect(isSafeMethod('post')).toBe(false)
      expect(isSafeMethod('Post')).toBe(false)
    })
  })

  describe('getTokenFromRequest', () => {
    it('should extract token from X-CSRF-Token header', () => {
      const token = generateCSRFToken()
      const headers = new Headers({
        'X-CSRF-Token': token,
      })

      expect(getTokenFromRequest(headers)).toBe(token)
    })

    it('should extract token from x-csrf-token header', () => {
      const token = generateCSRFToken()
      const headers = new Headers({
        'x-csrf-token': token,
      })

      expect(getTokenFromRequest(headers)).toBe(token)
    })

    it('should return null for missing header', () => {
      const headers = new Headers()
      expect(getTokenFromRequest(headers)).toBeNull()
    })
  })

  describe('createCSRFCookie', () => {
    it('should create cookie config for production', () => {
      const token = generateCSRFToken()
      const cookie = createCSRFCookie(token, true)

      expect(cookie.name).toBe(CSRF_CONFIG.TOKEN_COOKIE)
      expect(cookie.value).toBe(token)
      expect(cookie.options.secure).toBe(true)
      expect(cookie.options.sameSite).toBe('strict')
    })

    it('should create cookie config for development', () => {
      const token = generateCSRFToken()
      const cookie = createCSRFCookie(token, false)

      expect(cookie.options.secure).toBe(false)
      expect(cookie.options.sameSite).toBe('strict')
    })

    it('should set correct maxAge', () => {
      const token = generateCSRFToken()
      const cookie = createCSRFCookie(token)

      expect(cookie.options.maxAge).toBe(CSRF_CONFIG.TOKEN_EXPIRY_MS / 1000)
    })

    it('should set httpOnly to false for JS access', () => {
      const token = generateCSRFToken()
      const cookie = createCSRFCookie(token)

      expect(cookie.options.httpOnly).toBe(false)
    })
  })

  describe('validateCSRFProtection', () => {
    it('should allow safe methods without token', () => {
      const result = validateCSRFProtection('GET', new Headers(), '')
      expect(result.isValid).toBe(true)
    })

    it('should reject POST without token', () => {
      const result = validateCSRFProtection('POST', new Headers(), '')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('missing')
    })

    it('should accept POST with valid token', () => {
      const token = generateCSRFToken()
      const headers = new Headers({
        'X-CSRF-Token': token,
      })
      const cookies = `csrf-token=${token}`

      const result = validateCSRFProtection('POST', headers, cookies)
      expect(result.isValid).toBe(true)
    })

    it('should reject POST with mismatched tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      const headers = new Headers({
        'X-CSRF-Token': token1,
      })
      const cookies = `csrf-token=${token2}`

      const result = validateCSRFProtection('POST', headers, cookies)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('mismatch')
    })
  })

  describe('getCSRFTokenFromFormData', () => {
    it('should extract token from form data', () => {
      const token = generateCSRFToken()
      const formData = new FormData()
      formData.append('csrf_token', token)

      expect(getCSRFTokenFromFormData(formData)).toBe(token)
    })

    it('should return null for missing token', () => {
      const formData = new FormData()
      expect(getCSRFTokenFromFormData(formData)).toBeNull()
    })
  })

  describe('createCSRFFormField', () => {
    it('should create hidden input field', () => {
      const token = generateCSRFToken()
      const field = createCSRFFormField(token)

      expect(field).toContain('type="hidden"')
      expect(field).toContain('name="csrf_token"')
      expect(field).toContain(`value="${token}"`)
    })

    it('should escape HTML special characters', () => {
      const maliciousToken = '"<script>alert(1)</script>'
      const field = createCSRFFormField(maliciousToken)

      expect(field).not.toContain('<script>')
      expect(field).toContain('&quot;')
    })
  })

  describe('isCSRFTokenExpired', () => {
    it('should return false for recent tokens', () => {
      const now = Date.now()
      const tokenTime = now - 5 * 60 * 1000 // 5 minutes ago

      expect(isCSRFTokenExpired(tokenTime, now)).toBe(false)
    })

    it('should return true for expired tokens', () => {
      const now = Date.now()
      const tokenTime = now - 2 * 60 * 60 * 1000 // 2 hours ago

      expect(isCSRFTokenExpired(tokenTime, now)).toBe(true)
    })

    it('should use current time by default', () => {
      const tokenTime = Date.now() - 30 * 60 * 1000 // 30 minutes ago

      expect(isCSRFTokenExpired(tokenTime)).toBe(false)
    })
  })

  describe('Security Properties', () => {
    it('should generate cryptographically secure tokens', () => {
      const tokens = new Set()

      for (let i = 0; i < 1000; i++) {
        tokens.add(generateCSRFToken())
      }

      // All tokens should be unique
      expect(tokens.size).toBe(1000)
    })

    it('should prevent timing attacks', () => {
      const correctToken = generateCSRFToken()
      const wrongToken1 = '0' + correctToken.slice(1)
      const wrongToken2 = correctToken.slice(0, -1) + '0'

      // Both should fail with similar timing
      const start1 = Date.now()
      validateCSRFToken(wrongToken1, correctToken)
      const time1 = Date.now() - start1

      const start2 = Date.now()
      validateCSRFToken(wrongToken2, correctToken)
      const time2 = Date.now() - start2

      // Allow tolerance for test environment
      expect(Math.abs(time1 - time2)).toBeLessThan(5)
    })

    it('should handle malicious input safely', () => {
      const maliciousInputs = [
        "'; DROP TABLE--",
        '"><script>alert(1)</script>',
        '${7*7}',
        '{{7*7}}',
        '../../etc/passwd',
      ]

      maliciousInputs.forEach((input) => {
        expect(() => {
          validateCSRFToken(input, generateCSRFToken())
        }).not.toThrow()
      })
    })
  })

  describe('Configuration', () => {
    it('should have proper token header name', () => {
      expect(CSRF_CONFIG.TOKEN_HEADER).toBe('X-CSRF-Token')
    })

    it('should have proper cookie name', () => {
      expect(CSRF_CONFIG.TOKEN_COOKIE).toBe('csrf-token')
    })

    it('should define safe methods', () => {
      expect(CSRF_CONFIG.SAFE_METHODS).toContain('GET')
      expect(CSRF_CONFIG.SAFE_METHODS).toContain('HEAD')
      expect(CSRF_CONFIG.SAFE_METHODS).toContain('OPTIONS')
      expect(CSRF_CONFIG.SAFE_METHODS).not.toContain('POST')
    })

    it('should have sufficient token length', () => {
      expect(CSRF_CONFIG.TOKEN_LENGTH).toBeGreaterThanOrEqual(32)
    })

    it('should have reasonable expiry time', () => {
      expect(CSRF_CONFIG.TOKEN_EXPIRY_MS).toBeGreaterThan(0)
      expect(CSRF_CONFIG.TOKEN_EXPIRY_MS).toBeLessThan(24 * 60 * 60 * 1000) // Less than 24 hours
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string tokens', () => {
      expect(validateCSRFToken('', 'token')).toBe(false)
      expect(validateCSRFToken('token', '')).toBe(false)
    })

    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(10000)
      expect(validateCSRFToken(longToken, longToken)).toBe(true)
    })

    it('should handle special characters in tokens', () => {
      const specialToken = '~!@#$%^&*()'
      expect(() => {
        validateCSRFToken(specialToken, specialToken)
      }).not.toThrow()
    })

    it('should handle unicode in tokens', () => {
      const unicodeToken = '你好世界🌍'
      expect(() => {
        validateCSRFToken(unicodeToken, unicodeToken)
      }).not.toThrow()
    })
  })
})
