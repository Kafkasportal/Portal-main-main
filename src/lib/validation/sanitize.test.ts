/**
 * Sanitization Utilities Tests
 * Tests for security-critical input sanitization functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sanitizeHTML,
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
} from './sanitize'

// Mock DOM APIs for sanitizeHTML tests
beforeEach(() => {
  // Mock document.createElement for sanitizeHTML
  global.document = {
    createElement: vi.fn((tag: string) => {
      const element = {
        tagName: tag.toUpperCase(),
        innerHTML: '',
        childNodes: [] as any[],
        attributes: [] as any[],
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        replaceWith: vi.fn(),
      } as any

      // Simulate innerHTML setter behavior
      Object.defineProperty(element, 'innerHTML', {
        get() {
          return this._innerHTML || ''
        },
        set(value: string) {
          this._innerHTML = value
          // Simple parsing simulation - just store the HTML
          this.childNodes = []
        },
      })

      return element
    }),
    createTextNode: vi.fn((text: string) => ({
      nodeType: 3, // Node.TEXT_NODE
      textContent: text,
    })),
  } as any

  // Mock Node class and constants
  // @ts-expect-error - Mocking Node for test environment
  global.Node = class Node {
    static ELEMENT_NODE = 1
    static TEXT_NODE = 3
  }

  // Also add Element constructor
  // @ts-expect-error - Mocking Element for test environment
  global.Element = class Element {}
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('escapeHTML', () => {
  it('escapes ampersand', () => {
    expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('escapes less than and greater than', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('escapes double quotes', () => {
    expect(escapeHTML('Say "Hello"')).toBe('Say &quot;Hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHTML("It's working")).toBe('It&#039;s working')
  })

  it('escapes multiple characters', () => {
    expect(escapeHTML('<div class="test">Tom & Jerry\'s "Show"</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s &quot;Show&quot;&lt;/div&gt;'
    )
  })

  it('handles text without special characters', () => {
    expect(escapeHTML('Hello World')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('')
  })
})

describe('stripHTML', () => {
  it('removes simple HTML tags', () => {
    expect(stripHTML('<p>Hello</p>')).toBe('Hello')
    expect(stripHTML('<b>Bold</b> text')).toBe('Bold text')
  })

  it('removes nested tags', () => {
    expect(stripHTML('<div><p>Nested <b>text</b></p></div>')).toBe('Nested text')
  })

  it('removes tags with attributes', () => {
    expect(stripHTML('<a href="test.com">Link</a>')).toBe('Link')
    expect(stripHTML('<div class="container" id="main">Content</div>')).toBe('Content')
  })

  it('removes self-closing tags', () => {
    expect(stripHTML('Line 1<br/>Line 2')).toBe('Line 1Line 2')
    expect(stripHTML('Image: <img src="test.jpg" />')).toBe('Image: ')
  })

  it('handles multiple tags', () => {
    expect(stripHTML('<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>')).toBe('TitleParagraphItem')
  })

  it('handles text without tags', () => {
    expect(stripHTML('Plain text')).toBe('Plain text')
  })

  it('handles empty string', () => {
    expect(stripHTML('')).toBe('')
  })

  it('handles malformed HTML', () => {
    expect(stripHTML('<div>Unclosed')).toBe('Unclosed')
    // Malformed tags may not be fully removed by simple regex
    expect(stripHTML('Text with <')).toBe('Text with <')
  })
})

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\n\ttest\n\t')).toBe('test')
  })

  it('removes null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld')
  })

  it('removes control characters', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld')
    expect(sanitizeInput('test\x1Fdata')).toBe('testdata')
  })

  it('limits length to 10000 characters', () => {
    const longString = 'a'.repeat(15000)
    const result = sanitizeInput(longString)
    expect(result.length).toBe(10000)
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('handles normal text', () => {
    expect(sanitizeInput('Normal text 123')).toBe('Normal text 123')
  })

  it('preserves newlines', () => {
    expect(sanitizeInput('Line 1\nLine 2')).toBe('Line 1\nLine 2')
  })

  it('handles Turkish characters', () => {
    expect(sanitizeInput('Türkçe metin: çığöşü')).toBe('Türkçe metin: çığöşü')
  })
})

describe('sanitizeEmail', () => {
  it('converts to lowercase', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
  })

  it('sanitizes input', () => {
    expect(sanitizeEmail('test\0@example.com')).toBe('test@example.com')
  })

  it('handles valid email', () => {
    expect(sanitizeEmail('user@domain.com')).toBe('user@domain.com')
  })

  it('handles empty string', () => {
    expect(sanitizeEmail('')).toBe('')
  })
})

describe('sanitizePhoneNumber', () => {
  it('keeps only digits and +', () => {
    expect(sanitizePhoneNumber('(555) 123-4567')).toBe('5551234567')
    expect(sanitizePhoneNumber('+90 555 123 45 67')).toBe('+905551234567')
  })

  it('removes letters', () => {
    expect(sanitizePhoneNumber('555-ABC-1234')).toBe('5551234')
  })

  it('removes special characters', () => {
    expect(sanitizePhoneNumber('555.123.4567')).toBe('5551234567')
    expect(sanitizePhoneNumber('555 123 4567')).toBe('5551234567')
  })

  it('handles international format', () => {
    expect(sanitizePhoneNumber('+1-555-123-4567')).toBe('+15551234567')
  })

  it('handles empty string', () => {
    expect(sanitizePhoneNumber('')).toBe('')
  })
})

describe('sanitizeURL', () => {
  it('allows https URLs', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com/')
  })

  it('allows http URLs', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com/')
  })

  it('blocks javascript: protocol', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('')
  })

  it('blocks data: protocol', () => {
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('')
  })

  it('blocks vbscript: protocol', () => {
    expect(sanitizeURL('vbscript:msgbox(1)')).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitizeURL('')).toBe('')
  })

  it('handles URLs with paths', () => {
    expect(sanitizeURL('https://example.com/path/to/page')).toBe('https://example.com/path/to/page')
  })

  it('handles URLs with query params', () => {
    expect(sanitizeURL('https://example.com?param=value')).toBe('https://example.com/?param=value')
  })

  it('sanitizes input before processing', () => {
    expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com/')
  })
})

describe('sanitizeFileName', () => {
  it('removes path separators', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('etcpasswd')
    expect(sanitizeFileName('folder/file.txt')).toBe('folderfile.txt')
    expect(sanitizeFileName('folder\\file.txt')).toBe('folderfile.txt')
  })

  it('removes leading dots', () => {
    expect(sanitizeFileName('...hidden.txt')).toBe('hidden.txt')
    expect(sanitizeFileName('..file.txt')).toBe('file.txt')
  })

  it('replaces invalid characters with underscore', () => {
    expect(sanitizeFileName('file name.txt')).toBe('file_name.txt')
    expect(sanitizeFileName('file@#$.txt')).toBe('file___.txt')
  })

  it('allows valid characters', () => {
    expect(sanitizeFileName('my-file_2024.txt')).toBe('my-file_2024.txt')
    expect(sanitizeFileName('report.final.pdf')).toBe('report.final.pdf')
  })

  it('limits length to 255 characters', () => {
    const longName = 'a'.repeat(300) + '.txt'
    const result = sanitizeFileName(longName)
    expect(result.length).toBe(255)
  })

  it('handles empty string', () => {
    expect(sanitizeFileName('')).toBe('file')
  })

  it('returns "file" for invalid names', () => {
    expect(sanitizeFileName('/')).toBe('file')
    expect(sanitizeFileName('...')).toBe('file')
  })
})

describe('sanitizeJSON', () => {
  it('sanitizes string values', () => {
    const result = sanitizeJSON('  test  ')
    expect(result).toBe('test')
  })

  it('sanitizes object keys and values', () => {
    const obj = { '  name  ': '  John  ', age: 30 }
    const result = sanitizeJSON(obj) as Record<string, unknown>

    expect(result.name).toBe('John')
    expect(result.age).toBe(30)
  })

  it('sanitizes nested objects', () => {
    const obj = {
      user: {
        name: '  Alice  ',
        email: '  alice@test.com  ',
      },
    }

    const result = sanitizeJSON(obj) as any
    expect(result.user.name).toBe('Alice')
    expect(result.user.email).toBe('alice@test.com')
  })

  it('sanitizes arrays', () => {
    const arr = ['  test1  ', '  test2  ', 123]
    const result = sanitizeJSON(arr) as any[]

    expect(result[0]).toBe('test1')
    expect(result[1]).toBe('test2')
    expect(result[2]).toBe(123)
  })

  it('sanitizes arrays of objects', () => {
    const data = [
      { name: '  John  ' },
      { name: '  Jane  ' },
    ]

    const result = sanitizeJSON(data) as any[]
    expect(result[0].name).toBe('John')
    expect(result[1].name).toBe('Jane')
  })

  it('preserves non-string primitives', () => {
    expect(sanitizeJSON(123)).toBe(123)
    expect(sanitizeJSON(true)).toBe(true)
    expect(sanitizeJSON(null)).toBe(null)
  })

  it('handles deeply nested structures', () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            value: '  deep  ',
          },
        },
      },
    }

    const result = sanitizeJSON(obj) as any
    expect(result.level1.level2.level3.value).toBe('deep')
  })

  it('removes null bytes from strings', () => {
    const obj = { name: 'test\0value' }
    const result = sanitizeJSON(obj) as any
    expect(result.name).toBe('testvalue')
  })
})

describe('containsXSSPatterns', () => {
  it('detects script tags', () => {
    expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true)
    expect(containsXSSPatterns('<SCRIPT>alert(1)</SCRIPT>')).toBe(true)
  })

  it('detects event handlers', () => {
    expect(containsXSSPatterns('<div onclick="alert(1)">Click</div>')).toBe(true)
    expect(containsXSSPatterns('<img onload="alert(1)">')).toBe(true)
    expect(containsXSSPatterns('<body onload="malicious()">')).toBe(true)
  })

  it('detects javascript: protocol', () => {
    expect(containsXSSPatterns('javascript:alert(1)')).toBe(true)
    expect(containsXSSPatterns('<a href="javascript:void(0)">Link</a>')).toBe(true)
  })

  it('detects vbscript: protocol', () => {
    expect(containsXSSPatterns('vbscript:msgbox(1)')).toBe(true)
  })

  it('detects data:text/html', () => {
    expect(containsXSSPatterns('data:text/html,<script>alert(1)</script>')).toBe(true)
  })

  it('detects eval', () => {
    expect(containsXSSPatterns('eval(malicious)')).toBe(true)
  })

  it('detects expression', () => {
    expect(containsXSSPatterns('expression(alert(1))')).toBe(true)
  })

  it('detects iframe tags', () => {
    expect(containsXSSPatterns('<iframe src="malicious.com"></iframe>')).toBe(true)
  })

  it('detects object tags', () => {
    expect(containsXSSPatterns('<object data="malicious"></object>')).toBe(true)
  })

  it('detects embed tags', () => {
    expect(containsXSSPatterns('<embed src="malicious">')).toBe(true)
  })

  it('detects src with javascript:', () => {
    expect(containsXSSPatterns('<img src="javascript:alert(1)">')).toBe(true)
  })

  it('detects src with data:', () => {
    expect(containsXSSPatterns('<img src="data:text/html,<script>">')).toBe(true)
  })

  it('returns false for safe content', () => {
    expect(containsXSSPatterns('Hello World')).toBe(false)
    expect(containsXSSPatterns('<p>Safe paragraph</p>')).toBe(false)
    expect(containsXSSPatterns('<a href="https://example.com">Link</a>')).toBe(false)
  })
})

describe('validateInputLength', () => {
  it('validates within range', () => {
    expect(validateInputLength('test', 0, 10)).toBe(true)
    expect(validateInputLength('hello', 3, 10)).toBe(true)
  })

  it('rejects below minimum', () => {
    expect(validateInputLength('hi', 5, 10)).toBe(false)
  })

  it('rejects above maximum', () => {
    expect(validateInputLength('this is too long', 0, 5)).toBe(false)
  })

  it('handles exact boundaries', () => {
    expect(validateInputLength('exact', 5, 5)).toBe(true)
    expect(validateInputLength('exact', 5, 10)).toBe(true)
  })

  it('trims whitespace before checking', () => {
    expect(validateInputLength('  test  ', 0, 10)).toBe(true)
    expect(validateInputLength('  test  ', 0, 3)).toBe(false) // 4 chars after trim
  })

  it('uses default values', () => {
    expect(validateInputLength('test')).toBe(true)
    expect(validateInputLength('a'.repeat(15000))).toBe(false)
  })

  it('handles empty string', () => {
    expect(validateInputLength('', 0, 10)).toBe(true)
    expect(validateInputLength('', 1, 10)).toBe(false)
  })
})

describe('sanitizeAndValidate', () => {
  it('validates required field', () => {
    const result = sanitizeAndValidate('', { required: true })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Bu alan zorunludur')
  })

  it('sanitizes text type', () => {
    const result = sanitizeAndValidate('  test  ', { type: 'text' })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('test')
  })

  it('sanitizes email type', () => {
    const result = sanitizeAndValidate('Test@Example.COM', { type: 'email' })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('test@example.com')
  })

  it('sanitizes phone type', () => {
    const result = sanitizeAndValidate('(555) 123-4567', { type: 'phone' })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('5551234567')
  })

  it('sanitizes url type', () => {
    const result = sanitizeAndValidate('https://example.com', { type: 'url' })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('https://example.com/')
  })

  it('sanitizes filename type', () => {
    const result = sanitizeAndValidate('../../etc/passwd', { type: 'filename' })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('etcpasswd')
  })

  it('validates minLength', () => {
    const result = sanitizeAndValidate('hi', { minLength: 5 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('5-10000')
  })

  it('validates maxLength', () => {
    const result = sanitizeAndValidate('too long text', { maxLength: 5 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('0-5')
  })

  it('detects XSS when HTML not allowed', () => {
    const result = sanitizeAndValidate('<script>alert(1)</script>', { allowHTML: false })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Girdi tehlikeli içerik içeriyor')
  })

  it('allows safe content', () => {
    const result = sanitizeAndValidate('Safe text content', {
      minLength: 5,
      maxLength: 100,
    })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Safe text content')
  })

  it('handles all options together', () => {
    const result = sanitizeAndValidate('  valid@test.com  ', {
      required: true,
      type: 'email',
      minLength: 5,
      maxLength: 50,
    })
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('valid@test.com')
  })

  it('allows optional empty field', () => {
    const result = sanitizeAndValidate('', { required: false })
    expect(result.isValid).toBe(true)
  })
})
