/**
 * Utility Function Tests
 * Tests for utility functions in utils.ts
 */

import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPhoneNumber,
  generateId,
  truncate,
  getInitials,
} from './utils'

describe('formatCurrency', () => {
  it('formats TRY currency correctly', () => {
    expect(formatCurrency(1000)).toBe('₺1.000,00')
    expect(formatCurrency(1234.56)).toBe('₺1.234,56')
    expect(formatCurrency(0)).toBe('₺0,00')
  })

  it('formats USD currency correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1.000,00')
    expect(formatCurrency(1234.56, 'USD')).toBe('$1.234,56')
  })

  it('formats EUR currency correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1.000,00')
    expect(formatCurrency(500.99, 'EUR')).toBe('€500,99')
  })

  it('handles decimal places correctly', () => {
    expect(formatCurrency(10.1)).toBe('₺10,10')
    expect(formatCurrency(10.123)).toBe('₺10,12') // Rounds to 2 decimals
    expect(formatCurrency(10.999)).toBe('₺11,00') // Rounds up
  })

  it('handles large numbers', () => {
    expect(formatCurrency(1000000)).toBe('₺1.000.000,00')
    expect(formatCurrency(9999999.99)).toBe('₺9.999.999,99')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('₺-100,00')
    expect(formatCurrency(-1234.56)).toBe('₺-1.234,56')
  })
})

describe('formatPhoneNumber', () => {
  it('formats 10-digit phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('0555 123 45 67')
  })

  it('formats 11-digit phone numbers starting with 0', () => {
    expect(formatPhoneNumber('05551234567')).toBe('0555 123 45 67')
  })

  it('handles phone numbers with existing formatting', () => {
    expect(formatPhoneNumber('0555 123 45 67')).toBe('0555 123 45 67')
    expect(formatPhoneNumber('(0555) 123-45-67')).toBe('0555 123 45 67')
  })

  it('handles international format', () => {
    // International format with 12 digits doesn't match the expected patterns
    // So it returns the original input unchanged
    expect(formatPhoneNumber('+905551234567')).toBe('+905551234567')
  })

  it('returns original if format is unrecognized', () => {
    expect(formatPhoneNumber('123')).toBe('123')
    expect(formatPhoneNumber('invalid')).toBe('invalid')
  })
})

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('includes prefix when provided', () => {
    const id = generateId('test')
    expect(id).toMatch(/^test-/)
  })

  it('has correct format without prefix', () => {
    const id = generateId()
    // Format: timestamp-random (base36)
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
  })

  it('has correct format with prefix', () => {
    const id = generateId('user')
    // Format: prefix-timestamp-random (base36)
    expect(id).toMatch(/^user-[a-z0-9]+-[a-z0-9]+$/)
  })

  it('generates different IDs on consecutive calls', () => {
    const ids = new Set()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId('test'))
    }
    // All should be unique
    expect(ids.size).toBe(100)
  })
})

describe('truncate', () => {
  it('does not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
    expect(truncate('Short text', 20)).toBe('Short text')
  })

  it('truncates long text with ellipsis', () => {
    expect(truncate('This is a very long text', 10)).toBe('This is...')
    expect(truncate('Another long text here', 15)).toBe('Another long...')
  })

  it('handles exact length correctly', () => {
    expect(truncate('Exactly10!', 10)).toBe('Exactly10!')
    expect(truncate('Exactly11!', 11)).toBe('Exactly11!')
  })

  it('handles edge cases', () => {
    expect(truncate('', 10)).toBe('')
    expect(truncate('Short', 5)).toBe('Short')
    expect(truncate('12345678', 5)).toBe('12...')
  })

  it('ensures ellipsis is included in max length', () => {
    const truncated = truncate('This is a very long text', 10)
    expect(truncated.length).toBe(10)
    expect(truncated).toBe('This is...')
  })
})

describe('getInitials', () => {
  it('gets initials from full name', () => {
    expect(getInitials('Ahmet Yılmaz')).toBe('AY')
    expect(getInitials('Mehmet Ali Demir')).toBe('MA')
  })

  it('gets initials from single name', () => {
    expect(getInitials('Ahmet')).toBe('A')
    expect(getInitials('X')).toBe('X')
  })

  it('handles multiple word names', () => {
    expect(getInitials('Ali Veli Kemal Özer')).toBe('AV')
  })

  it('converts to uppercase', () => {
    expect(getInitials('ahmet yılmaz')).toBe('AY')
    expect(getInitials('john doe')).toBe('JD')
  })

  it('takes only first two initials', () => {
    expect(getInitials('A B C D E')).toBe('AB')
  })

  it('handles names with extra spaces', () => {
    expect(getInitials('Ahmet  Yılmaz')).toBe('AY')
    expect(getInitials('  Mehmet   Demir  ')).toBe('MD')
  })

  it('handles Turkish characters correctly', () => {
    expect(getInitials('Özgür Şahin')).toBe('ÖŞ')
    expect(getInitials('İsmail Çelik')).toBe('İÇ')
  })
})
