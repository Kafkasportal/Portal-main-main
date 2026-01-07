import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format numbers as Turkish Lira currency', () => {
      const result = formatCurrency(1000)
      expect(result).toContain('1.000')
      expect(result).toContain('₺')
    })

    it('should handle zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should handle decimal values', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format string dates', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })

    it('should handle names with multiple words', () => {
      const result = getInitials('John Michael Doe')
      expect(result.length).toBeLessThanOrEqual(2)
    })
  })

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional')
      expect(result).toContain('conditional')
    })

    it('should filter out falsy values', () => {
      const result = cn('base', false && 'hidden', undefined, null)
      expect(result).toBe('base')
    })
  })
})
