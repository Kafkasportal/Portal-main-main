import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  generateId,
  truncate,
  formatPhoneNumber,
  getInitials,
} from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format TRY currency correctly', () => {
      expect(formatCurrency(1000, 'TRY')).toBe('₺1.000,00')
    })

    it('should format USD currency correctly', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1.000,00')
    })

    it('should format EUR currency correctly', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1.000,00')
    })

    it('should handle decimal values', () => {
      expect(formatCurrency(1234.56, 'TRY')).toBe('₺1.234,56')
    })

    it('should default to TRY when no currency specified', () => {
      expect(formatCurrency(100)).toBe('₺100,00')
    })

    it('should handle zero value', () => {
      expect(formatCurrency(0, 'TRY')).toBe('₺0,00')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-100, 'TRY')).toBe('₺-100,00')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000, 'TRY')).toBe('₺1.000.000,00')
    })
  })

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toContain('Oca')
      expect(result).toContain('2024')
    })

    it('should format string date', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('Oca')
      expect(result).toContain('2024')
    })

    it('should handle custom format', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date, 'yyyy-MM-dd')
      expect(result).toBe('2024-01-15')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should format recent time', () => {
      const date = new Date('2024-01-15T11:00:00Z')
      const result = formatRelativeTime(date)
      expect(result).toContain('önce')
    })

    it('should format string date', () => {
      const result = formatRelativeTime('2024-01-15T10:00:00Z')
      expect(result).toContain('önce')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should include prefix when provided', () => {
      const id = generateId('test')
      expect(id.startsWith('test-')).toBe(true)
    })

    it('should generate ID without prefix', () => {
      const id = generateId()
      expect(id).not.toContain('undefined')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should have consistent format', () => {
      const id = generateId('prefix')
      const parts = id.split('-')
      expect(parts.length).toBe(3) // prefix-timestamp-random
      expect(parts[0]).toBe('prefix')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })

    it('should handle very short maxLength', () => {
      expect(truncate('Hello World', 4)).toBe('H...')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format 10 digit phone number', () => {
      expect(formatPhoneNumber('5551234567')).toBe('0555 123 45 67')
    })

    it('should format 11 digit phone number starting with 0', () => {
      expect(formatPhoneNumber('05551234567')).toBe('0555 123 45 67')
    })

    it('should handle phone with special characters', () => {
      const result = formatPhoneNumber('555-123-4567')
      expect(result).toBe('0555 123 45 67')
    })

    it('should return original if not Turkish format', () => {
      expect(formatPhoneNumber('12345')).toBe('12345')
    })

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('')
    })

    it('should handle phone with spaces', () => {
      const result = formatPhoneNumber('555 123 4567')
      expect(result).toBe('0555 123 45 67')
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle multiple names', () => {
      expect(getInitials('John Paul Doe')).toBe('JP')
    })

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should handle Turkish names', () => {
      expect(getInitials('Ahmet Yılmaz')).toBe('AY')
    })

    it('should limit to 2 characters', () => {
      expect(getInitials('A B C D E')).toBe('AB')
    })
  })
})
