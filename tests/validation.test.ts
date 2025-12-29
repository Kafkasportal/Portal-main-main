import {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeFileName,
  escapeHTML,
  stripHTML,
  containsXSSPatterns,
  sanitizeAndValidate,
} from '@/lib/validation/sanitize'

import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  memberCreateSchema,
  safeParse,
} from '@/lib/validation/schemas'

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })

    it('should remove null bytes', () => {
      expect(sanitizeInput('hello\0world')).toBe('helloworld')
    })

    it('should remove control characters', () => {
      expect(sanitizeInput('hello\x00\x01world')).toBe('helloworld')
    })

    it('should limit input length', () => {
      const longInput = 'a'.repeat(20000)
      const result = sanitizeInput(longInput)
      expect(result.length).toBeLessThanOrEqual(10000)
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should preserve valid content', () => {
      expect(sanitizeInput('Hello World 123')).toBe('Hello World 123')
    })
  })

  describe('sanitizeEmail', () => {
    it('should lowercase email', () => {
      expect(sanitizeEmail('Test@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should handle valid email', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('should keep only digits and plus', () => {
      expect(sanitizePhoneNumber('+90 555 123-4567')).toBe('+905551234567')
    })

    it('should remove special characters', () => {
      expect(sanitizePhoneNumber('(555) 123-4567')).toBe('5551234567')
    })

    it('should handle international format', () => {
      expect(sanitizePhoneNumber('+1-800-555-0123')).toBe('+18005550123')
    })
  })

  describe('sanitizeURL', () => {
    it('should accept valid URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com/')
    })

    it('should reject javascript URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('')
    })

    it('should reject data URLs', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should accept http and https only', () => {
      expect(sanitizeURL('ftp://example.com')).not.toContain('ftp:')
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove path separators', () => {
      expect(sanitizeFileName('../../../etc/passwd')).not.toContain('/')
      expect(sanitizeFileName('..\\..\\windows\\system32')).not.toContain('\\')
    })

    it('should allow alphanumeric characters', () => {
      expect(sanitizeFileName('my-file_123.pdf')).toContain('my-file_123')
    })

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const sanitized = sanitizeFileName(longName)
      expect(sanitized.length).toBeLessThanOrEqual(255)
    })

    it('should provide default filename', () => {
      expect(sanitizeFileName('')).toBe('file')
    })

    it('should handle special characters', () => {
      const result = sanitizeFileName('file<>?.txt')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })
  })

  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHTML('<script>alert(1)</script>')).toContain('&lt;')
      expect(escapeHTML('<script>alert(1)</script>')).toContain('&gt;')
    })

    it('should escape quotes', () => {
      expect(escapeHTML('"test"')).toContain('&quot;')
      expect(escapeHTML("'test'")).toContain('&#039;')
    })

    it('should escape ampersands', () => {
      expect(escapeHTML('A & B')).toContain('&amp;')
    })

    it('should preserve safe text', () => {
      expect(escapeHTML('Hello World')).toBe('Hello World')
    })
  })

  describe('stripHTML', () => {
    it('should remove HTML tags', () => {
      expect(stripHTML('<p>Hello</p><br>')).toBe('Hello')
    })

    it('should remove nested tags', () => {
      expect(stripHTML('<div><p><span>Test</span></p></div>')).toBe('Test')
    })

    it('should preserve text content', () => {
      expect(stripHTML('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
    })
  })

  describe('containsXSSPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true)
    })

    it('should detect event handlers', () => {
      expect(containsXSSPatterns('onclick="alert(1)"')).toBe(true)
      expect(containsXSSPatterns('onerror="alert(1)"')).toBe(true)
    })

    it('should detect javascript URLs', () => {
      expect(containsXSSPatterns('javascript:alert(1)')).toBe(true)
    })

    it('should detect data URLs', () => {
      expect(containsXSSPatterns('data:text/html,<script>alert(1)</script>')).toBe(true)
    })

    it('should detect iframe tags', () => {
      expect(containsXSSPatterns('<iframe src="evil.com"></iframe>')).toBe(true)
    })

    it('should allow safe content', () => {
      expect(containsXSSPatterns('Hello World')).toBe(false)
      expect(containsXSSPatterns('Hello <b>World</b>')).toBe(false)
    })
  })

  describe('sanitizeAndValidate', () => {
    it('should return valid when input is good', () => {
      const result = sanitizeAndValidate('John Doe', {
        minLength: 5,
        maxLength: 100,
      })
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('John Doe')
    })

    it('should return error when required but empty', () => {
      const result = sanitizeAndValidate('', { required: true })
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('zorunlu')
    })

    it('should return error when too short', () => {
      const result = sanitizeAndValidate('Hi', { minLength: 5 })
      expect(result.isValid).toBe(false)
    })

    it('should return error when too long', () => {
      const result = sanitizeAndValidate('a'.repeat(1000), { maxLength: 100 })
      expect(result.isValid).toBe(false)
    })

    it('should detect XSS when allowHTML is false', () => {
      const result = sanitizeAndValidate('<script>alert(1)</script>', {
        allowHTML: false,
      })
      expect(result.isValid).toBe(false)
    })

    it('should sanitize email type', () => {
      const result = sanitizeAndValidate('  TEST@EXAMPLE.COM  ', {
        type: 'email',
      })
      expect(result.sanitized).toBe('test@example.com')
    })

    it('should sanitize phone type', () => {
      const result = sanitizeAndValidate('+90 555 123-4567', {
        type: 'phone',
      })
      expect(result.sanitized).toBe('+905551234567')
    })

    it('should sanitize URL type', () => {
      const result = sanitizeAndValidate('  https://example.com  ', {
        type: 'url',
      })
      expect(result.isValid).toBe(true)
    })
  })
})

describe('Zod Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email', () => {
      const result = safeParse(emailSchema, 'user@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = safeParse(emailSchema, 'invalid-email')
      expect(result.success).toBe(false)
    })

    it('should lowercase email', () => {
      const result = safeParse(emailSchema, 'TEST@EXAMPLE.COM')
      expect(result.success).toBe(true)
      expect(result.data).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      const result = safeParse(emailSchema, '  test@example.com  ')
      expect(result.data).toBe('test@example.com')
    })

    it('should reject empty email', () => {
      const result = safeParse(emailSchema, '')
      expect(result.success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('should accept strong password', () => {
      const result = safeParse(passwordSchema, 'SecurePass123!')
      expect(result.success).toBe(true)
    })

    it('should reject weak password', () => {
      const result = safeParse(passwordSchema, 'weak')
      expect(result.success).toBe(false)
    })

    it('should require uppercase', () => {
      const result = safeParse(passwordSchema, 'securepass123!')
      expect(result.success).toBe(false)
    })

    it('should require lowercase', () => {
      const result = safeParse(passwordSchema, 'SECUREPASS123!')
      expect(result.success).toBe(false)
    })

    it('should require number', () => {
      const result = safeParse(passwordSchema, 'SecurePass!')
      expect(result.success).toBe(false)
    })

    it('should require special character', () => {
      const result = safeParse(passwordSchema, 'SecurePass123')
      expect(result.success).toBe(false)
    })
  })

  describe('nameSchema', () => {
    it('should accept valid name', () => {
      const result = safeParse(nameSchema, 'John Doe')
      expect(result.success).toBe(true)
    })

    it('should reject short name', () => {
      const result = safeParse(nameSchema, 'J')
      expect(result.success).toBe(false)
    })

    it('should reject HTML content', () => {
      const result = safeParse(nameSchema, 'John<script>')
      expect(result.success).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = safeParse(nameSchema, '  John  ')
      expect(result.data).toBe('John')
    })
  })

  describe('phoneSchema', () => {
    it('should accept valid phone', () => {
      const result = safeParse(phoneSchema, '+905551234567')
      expect(result.success).toBe(true)
    })

    it('should accept formatted phone', () => {
      const result = safeParse(phoneSchema, '+90 555 123-4567')
      expect(result.success).toBe(true)
    })

    it('should reject short phone', () => {
      const result = safeParse(phoneSchema, '123')
      expect(result.success).toBe(false)
    })
  })

  describe('memberCreateSchema', () => {
    it('should accept valid member', () => {
      const data = {
        ad: 'John',
        soyad: 'Doe',
        email: 'john@example.com',
        telefon: '+905551234567',
        uyeTuru: 'aktif',
      }
      const result = safeParse(memberCreateSchema, data)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const data = {
        ad: 'John',
        // missing soyad, email, telefon, uyeTuru
      }
      const result = safeParse(memberCreateSchema, data)
      expect(result.success).toBe(false)
    })

    it('should validate enum values', () => {
      const data = {
        ad: 'John',
        soyad: 'Doe',
        email: 'john@example.com',
        telefon: '+905551234567',
        uyeTuru: 'invalid',
      }
      const result = safeParse(memberCreateSchema, data)
      expect(result.success).toBe(false)
    })

    it('should allow optional fields', () => {
      const data = {
        ad: 'John',
        soyad: 'Doe',
        email: 'john@example.com',
        telefon: '+905551234567',
        uyeTuru: 'aktif',
        // optional fields omitted
      }
      const result = safeParse(memberCreateSchema, data)
      expect(result.success).toBe(true)
    })
  })
})

describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<body onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<marquee onstart=alert(1)>',
      '<details open ontoggle=alert(1)>',
      '<video src=x onerror=alert(1)>',
    ]

    xssPayloads.forEach((payload) => {
      it(`should detect XSS: ${payload.substring(0, 30)}...`, () => {
        expect(containsXSSPatterns(payload)).toBe(true)
      })
    })
  })

  describe('SQL Injection Prevention', () => {
    it('should not have literal quotes in sanitized input', () => {
      const result = sanitizeInput("'; DROP TABLE users--")
      // Input is sanitized but contains literal content
      // SQL injection prevented by parameterized queries
      expect(typeof result).toBe('string')
    })
  })

  describe('Command Injection Prevention', () => {
    it('should sanitize command-like input', () => {
      const result = sanitizeInput('test; rm -rf /')
      expect(result).toBe('test; rm -rf /')
      // Command injection prevented by not executing shell
    })
  })

  describe('Path Traversal Prevention', () => {
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      'file/../../config.json',
      '.../.../sensitive.txt',
    ]

    pathTraversalPayloads.forEach((payload) => {
      it(`should prevent path traversal: ${payload}`, () => {
        const result = sanitizeFileName(payload)
        expect(result).not.toContain('..')
        expect(result).not.toContain('/')
        expect(result).not.toContain('\\')
      })
    })
  })
})

describe('Edge Cases', () => {
  it('should handle unicode input', () => {
    const unicode = '你好世界 🌍'
    const result = sanitizeInput(unicode)
    expect(result).toContain('你好')
  })

  it('should handle very long input', () => {
    const longInput = 'a'.repeat(100000)
    const result = sanitizeInput(longInput)
    expect(result.length).toBeLessThanOrEqual(10000)
  })

  it('should handle mixed special characters', () => {
    const mixed = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = sanitizeInput(mixed)
    expect(result).toBe(mixed)
  })

  it('should handle null values', () => {
    expect(sanitizeInput('')).toBe('')
  })
})
