import { describe, it, expect } from 'vitest'
import { toPaginatedResponse } from '../services/base.service'

describe('base.service', () => {
  describe('toPaginatedResponse', () => {
    it('should create paginated response with correct structure', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = toPaginatedResponse(data, 30, 1, 10)

      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 30,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      })
    })

    it('should calculate total pages correctly', () => {
      const data = [{ id: 1 }]

      expect(toPaginatedResponse(data, 25, 1, 10).totalPages).toBe(3)
      expect(toPaginatedResponse(data, 30, 1, 10).totalPages).toBe(3)
      expect(toPaginatedResponse(data, 31, 1, 10).totalPages).toBe(4)
    })

    it('should handle null count', () => {
      const data = [{ id: 1 }]
      const result = toPaginatedResponse(data, null, 1, 10)

      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it('should handle empty data', () => {
      const result = toPaginatedResponse([], 0, 1, 10)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it('should preserve page and pageSize', () => {
      const data = [{ id: 1 }]
      const result = toPaginatedResponse(data, 100, 5, 20)

      expect(result.page).toBe(5)
      expect(result.pageSize).toBe(20)
    })

    it('should handle single page', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const result = toPaginatedResponse(data, 2, 1, 10)

      expect(result.totalPages).toBe(1)
    })

    it('should preserve data types', () => {
      const data = [
        { id: 1, name: 'Test', active: true, date: new Date('2024-01-01') },
      ]
      const result = toPaginatedResponse(data, 1, 1, 10)

      expect(result.data[0]).toEqual(data[0])
    })
  })
})
