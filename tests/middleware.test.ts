import { buildCSP, getDefaultSecurityHeaders, getHSTSHeader, validateCSP } from '@/lib/security/headers'

describe('Security Headers', () => {
  describe('getDefaultSecurityHeaders', () => {
    it('should return all default security headers', () => {
      const headers = getDefaultSecurityHeaders()

      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['X-XSS-Protection']).toBe('1; mode=block')
      expect(headers['X-Permitted-Cross-Domain-Policies']).toBe('none')
      expect(headers['Permissions-Policy']).toContain('accelerometer=()')
    })

    it('should have Permissions-Policy with all required disabled features', () => {
      const headers = getDefaultSecurityHeaders()
      const policy = headers['Permissions-Policy']

      expect(policy).toContain('accelerometer=()')
      expect(policy).toContain('camera=()')
      expect(policy).toContain('geolocation=()')
      expect(policy).toContain('gyroscope=()')
      expect(policy).toContain('magnetometer=()')
      expect(policy).toContain('microphone=()')
      expect(policy).toContain('payment=()')
      expect(policy).toContain('usb=()')
      expect(policy).toContain('vr=()')
    })
  })

  describe('getHSTSHeader', () => {
    it('should return production HSTS header', () => {
      const hsts = getHSTSHeader(true)
      expect(hsts).toBe('max-age=63072000; includeSubdomains; preload')
    })

    it('should return development HSTS header', () => {
      const hsts = getHSTSHeader(false)
      expect(hsts).toBe('max-age=3600')
    })
  })

  describe('buildCSP', () => {
    it('should build default CSP policy', () => {
      const csp = buildCSP()

      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'self'")
      expect(csp).toContain("style-src 'self'")
      expect(csp).toContain("frame-ancestors 'none'")
    })

    it('should allow CSP directive overrides', () => {
      const csp = buildCSP({
        'img-src': ["'self'", 'https://cdn.example.com'],
      })

      expect(csp).toContain("img-src 'self' https://cdn.example.com")
    })

    it('should include required script sources', () => {
      const csp = buildCSP()

      expect(csp).toContain('https://cdn.jsdelivr.net')
      expect(csp).toContain('https://vercel.live')
      expect(csp).toContain('https://challenges.cloudflare.com')
    })

    it('should include required style sources', () => {
      const csp = buildCSP()

      expect(csp).toContain('https://fonts.googleapis.com')
      expect(csp).toContain('https://cdn.jsdelivr.net')
    })

    it('should include font sources', () => {
      const csp = buildCSP()

      expect(csp).toContain('https://fonts.gstatic.com')
    })
  })

  describe('validateCSP', () => {
    it('should validate valid CSP policy', () => {
      const validCSP = "default-src 'self'; script-src 'unsafe-inline'"
      expect(validateCSP(validCSP)).toBe(true)
    })

    it('should reject empty CSP', () => {
      expect(validateCSP('')).toBe(false)
    })

    it('should reject CSP longer than 4096 characters', () => {
      const longCSP = 'a'.repeat(5000)
      expect(validateCSP(longCSP)).toBe(false)
    })

    it('should reject CSP without directive', () => {
      expect(validateCSP('invalid')).toBe(false)
    })
  })

  describe('CSP Security Properties', () => {
    it('should prevent frame embedding', () => {
      const headers = getDefaultSecurityHeaders()
      expect(headers['X-Frame-Options']).toBe('DENY')
    })

    it('should prevent MIME sniffing', () => {
      const headers = getDefaultSecurityHeaders()
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
    })

    it('should enforce HTTPS', () => {
      const hsts = getHSTSHeader(true)
      expect(hsts).toContain('max-age=')
      expect(hsts).toContain('preload')
    })

    it('should disable dangerous APIs', () => {
      const headers = getDefaultSecurityHeaders()
      const policy = headers['Permissions-Policy']

      // Verify dangerous APIs are disabled
      const dangerousAPIs = ['camera', 'microphone', 'geolocation', 'usb']
      dangerousAPIs.forEach((api) => {
        expect(policy).toContain(`${api}=()`)
      })
    })

    it('should allow cross-origin navigation with origin info', () => {
      const headers = getDefaultSecurityHeaders()
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    })
  })
})
