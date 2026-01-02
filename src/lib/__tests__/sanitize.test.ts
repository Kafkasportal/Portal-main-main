import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  escapeHTML,
  stripHTML,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeFileName,
  sanitizeJSON,
  containsXSSPatterns,
  validateInputLength,
  sanitizeAndValidate,
} from '../validation/sanitize'

describe('sanitize', () => {
  describe('escapeHTML', () => {
    it('should escape ampersand', () => {
      expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape less than', () => {
      expect(escapeHTML('a < b')).toBe('a &lt; b')
    })

    it('should escape greater than', () => {
      expect(escapeHTML('a > b')).toBe('a &gt; b')
    })

    it('should escape double quotes', () => {
      expect(escapeHTML('say "hello"')).toBe('say &quot;hello&quot;')
    })

    it('should escape single quotes', () => {
      expect(escapeHTML("it's")).toBe('it&#039;s')
    })

    it('should escape multiple characters', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })

    it('should handle empty string', () => {
      expect(escapeHTML('')).toBe('')
    })

    it('should handle string without special characters', () => {
      expect(escapeHTML('Hello World')).toBe('Hello World')
    })
  })

  describe('stripHTML', () => {
    it('should remove HTML tags', () => {
      expect(stripHTML('<p>Hello</p>')).toBe('Hello')
    })

    it('should remove multiple tags', () => {
      expect(stripHTML('<div><span>Hello</span></div>')).toBe('Hello')
    })

    it('should handle self-closing tags', () => {
      expect(stripHTML('Hello<br/>World')).toBe('HelloWorld')
    })

    it('should handle tags with attributes', () => {
      expect(stripHTML('<a href="http://test.com">Link</a>')).toBe('Link')
    })

    it('should handle empty string', () => {
      expect(stripHTML('')).toBe('')
    })

    it('should handle text without HTML', () => {
      expect(stripHTML('Plain text')).toBe('Plain text')
    })
  })

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })

    it('should remove null bytes', () => {
      expect(sanitizeInput('hello\0world')).toBe('helloworld')
    })

    it('should remove control characters', () => {
      expect(sanitizeInput('hello\x00\x01\x02world')).toBe('helloworld')
    })

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should truncate very long input', () => {
      const longString = 'a'.repeat(20000)
      const result = sanitizeInput(longString)
      expect(result.length).toBe(10000)
    })

    it('should preserve normal text', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!')
    })

    it('should preserve Turkish characters', () => {
      expect(sanitizeInput('Merhaba Dünya')).toBe('Merhaba Dünya')
    })
  })

  describe('sanitizeEmail', () => {
    it('should lowercase email', () => {
      expect(sanitizeEmail('Test@EXAMPLE.com')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should handle empty string', () => {
      expect(sanitizeEmail('')).toBe('')
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('should keep only digits and plus', () => {
      expect(sanitizePhoneNumber('+90 555 123 45 67')).toBe('+905551234567')
    })

    it('should remove parentheses and dashes', () => {
      expect(sanitizePhoneNumber('(555) 123-4567')).toBe('5551234567')
    })

    it('should handle empty string', () => {
      expect(sanitizePhoneNumber('')).toBe('')
    })

    it('should preserve plus at start', () => {
      expect(sanitizePhoneNumber('+1234567890')).toBe('+1234567890')
    })
  })

  describe('sanitizeURL', () => {
    it('should accept valid http URL', () => {
      expect(sanitizeURL('http://example.com')).toBe('http://example.com/')
    })

    it('should accept valid https URL', () => {
      expect(sanitizeURL('https://example.com/path')).toBe(
        'https://example.com/path'
      )
    })

    it('should reject javascript: protocol', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('')
    })

    it('should reject data: protocol', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should reject vbscript: protocol', () => {
      expect(sanitizeURL('vbscript:msgbox(1)')).toBe('')
    })

    it('should handle empty string', () => {
      expect(sanitizeURL('')).toBe('')
    })

    it('should reject ftp protocol', () => {
      expect(sanitizeURL('ftp://example.com')).toBe('')
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove path separators', () => {
      const result = sanitizeFileName('../../../etc/passwd')
      // Should not contain path traversal
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
      expect(result).not.toContain('\\')
    })

    it('should remove leading dots', () => {
      expect(sanitizeFileName('..htaccess')).toBe('htaccess')
    })

    it('should replace special characters with underscore', () => {
      expect(sanitizeFileName('file name!@#.txt')).toBe('file_name___.txt')
    })

    it('should truncate long names', () => {
      const longName = 'a'.repeat(300)
      const result = sanitizeFileName(longName)
      expect(result.length).toBe(255)
    })

    it('should return "file" for empty input', () => {
      expect(sanitizeFileName('')).toBe('file')
    })

    it('should preserve valid filename', () => {
      expect(sanitizeFileName('document.pdf')).toBe('document.pdf')
    })

    it('should handle filename with dashes and underscores', () => {
      expect(sanitizeFileName('my-file_name.txt')).toBe('my-file_name.txt')
    })
  })

  describe('sanitizeJSON', () => {
    it('should sanitize string values', () => {
      const result = sanitizeJSON({ name: '  test  ' })
      expect(result).toEqual({ name: 'test' })
    })

    it('should sanitize nested objects', () => {
      const result = sanitizeJSON({
        user: { name: '  John  ' },
      })
      expect(result).toEqual({ user: { name: 'John' } })
    })

    it('should sanitize arrays', () => {
      const result = sanitizeJSON(['  a  ', '  b  '])
      expect(result).toEqual(['a', 'b'])
    })

    it('should preserve numbers', () => {
      const result = sanitizeJSON({ count: 42 })
      expect(result).toEqual({ count: 42 })
    })

    it('should preserve booleans', () => {
      const result = sanitizeJSON({ active: true })
      expect(result).toEqual({ active: true })
    })

    it('should handle null', () => {
      const result = sanitizeJSON(null)
      expect(result).toBeNull()
    })

    it('should sanitize object keys', () => {
      const result = sanitizeJSON({ '  key  ': 'value' })
      expect(result).toEqual({ key: 'value' })
    })
  })

  describe('containsXSSPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true)
    })

    it('should detect onclick handlers', () => {
      expect(containsXSSPatterns('<div onclick="alert(1)">')).toBe(true)
    })

    it('should detect javascript: protocol', () => {
      expect(containsXSSPatterns('javascript:alert(1)')).toBe(true)
    })

    it('should detect data:text/html', () => {
      expect(containsXSSPatterns('data:text/html,<script>alert(1)</script>')).toBe(
        true
      )
    })

    it('should detect eval', () => {
      expect(containsXSSPatterns('eval(something)')).toBe(true)
    })

    it('should detect iframe', () => {
      expect(containsXSSPatterns('<iframe src="http://evil.com">')).toBe(true)
    })

    it('should detect object tags', () => {
      expect(containsXSSPatterns('<object data="malicious">')).toBe(true)
    })

    it('should detect embed tags', () => {
      expect(containsXSSPatterns('<embed src="malicious">')).toBe(true)
    })

    it('should return false for safe input', () => {
      expect(containsXSSPatterns('Hello World')).toBe(false)
    })

    it('should return false for normal HTML', () => {
      expect(containsXSSPatterns('<p>Safe paragraph</p>')).toBe(false)
    })
  })

  describe('validateInputLength', () => {
    it('should return true for valid length', () => {
      expect(validateInputLength('hello', 1, 10)).toBe(true)
    })

    it('should return false for too short', () => {
      expect(validateInputLength('hi', 5, 10)).toBe(false)
    })

    it('should return false for too long', () => {
      expect(validateInputLength('hello world', 1, 5)).toBe(false)
    })

    it('should trim before checking', () => {
      expect(validateInputLength('  hi  ', 2, 10)).toBe(true)
    })

    it('should use default values', () => {
      expect(validateInputLength('hello')).toBe(true)
    })

    it('should handle exact length', () => {
      expect(validateInputLength('hello', 5, 5)).toBe(true)
    })
  })

  describe('sanitizeAndValidate', () => {
    it('should return valid for simple text', () => {
      const result = sanitizeAndValidate('Hello World')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('Hello World')
    })

    it('should reject required empty input', () => {
      const result = sanitizeAndValidate('', { required: true })
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('zorunlu')
    })

    it('should reject input below min length', () => {
      const result = sanitizeAndValidate('hi', { minLength: 5 })
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('karakter')
    })

    it('should reject input exceeding max length', () => {
      const result = sanitizeAndValidate('hello world', { maxLength: 5 })
      expect(result.isValid).toBe(false)
    })

    it('should sanitize email type', () => {
      const result = sanitizeAndValidate('  TEST@EXAMPLE.COM  ', { type: 'email' })
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('test@example.com')
    })

    it('should sanitize phone type', () => {
      const result = sanitizeAndValidate('(555) 123-4567', { type: 'phone' })
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('5551234567')
    })

    it('should sanitize url type', () => {
      const result = sanitizeAndValidate('http://example.com', { type: 'url' })
      expect(result.isValid).toBe(true)
    })

    it('should reject dangerous url', () => {
      const result = sanitizeAndValidate('javascript:alert(1)', { type: 'url' })
      expect(result.isValid).toBe(true) // URL is sanitized to empty string
      expect(result.sanitized).toBe('')
    })

    it('should sanitize filename type', () => {
      const result = sanitizeAndValidate('../etc/passwd', { type: 'filename' })
      expect(result.isValid).toBe(true)
      expect(result.sanitized).not.toContain('..')
    })

    it('should reject XSS patterns when HTML not allowed', () => {
      const result = sanitizeAndValidate('<script>alert(1)</script>')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('tehlikeli')
    })
  })
})
