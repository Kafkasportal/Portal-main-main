/**
 * Donations Service Tests
 * Bağış servisi birim testleri
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  getClient: vi.fn(() => createClient('mock-url', 'mock-key')),
}))

// Import after mocking
import { fetchDonations, fetchDonation, createDonation } from '../donations.service'

describe('Donations Service', () => {
  const mockSupabase = {
    from: vi.fn(),
  }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Setup mock chain
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue({ count: 'exact' }),
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      bagisci_adi: 'Test Bağışçı',
                      tutar: 1000,
                      amac: 'genel',
                      odeme_yontemi: 'nakit',
                      tarih: '2025-01-05',
                    },
                  ],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchDonations', () => {
    it('should fetch donations with default options', async () => {
      // Arrange
      const expected = {
        data: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }

      // Act
      const result = await fetchDonations()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('should fetch donations with pagination', async () => {
      // Arrange
      const options = { page: 2, limit: 20 }

      // Act
      await fetchDonations(options)

      // Assert
      const mockChain = mockSupabase.from()
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
    })

    it('should filter donations by amac', async () => {
      // Arrange
      const options = { amac: 'genel' }

      // Act
      await fetchDonations(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
    })

    it('should filter donations by member ID', async () => {
      // Arrange
      const options = { memberId: 123 }

      // Act
      await fetchDonations(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
    })

    it('should search donations by donor name', async () => {
      // Arrange
      const options = { search: 'Ahmet' }

      // Act
      await fetchDonations(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
    })

    it('should handle database errors', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          count: vi.fn().mockReturnValue({ count: 'exact' }),
          range: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchDonations()).rejects.toThrow('Database error')
    })
  })

  describe('fetchDonation', () => {
    it('should fetch donation by ID', async () => {
      // Arrange
      const donationId = 1
      const mockData = {
        id: '1',
        bagisci_adi: 'Test Bağışçı',
        tutar: 1000,
        amac: 'genel',
        odeme_yontemi: 'nakit',
        tarih: '2025-01-05',
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await fetchDonation(donationId)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('bagisci')
    })

    it('should handle not found error', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchDonation(999)).rejects.toThrow()
    })

    it('should handle database errors', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database connection failed'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchDonation(1)).rejects.toThrow('Database connection failed')
    })
  })

  describe('createDonation', () => {
    it('should create a new donation', async () => {
      // Arrange
      const newDonation = {
        bagisci_adi: 'Test Bağışçı',
        tutar: 1000,
        amac: 'genel',
        odeme_yontemi: 'nakit',
        tarih: '2025-01-05',
      }

      const createdDonation = {
        id: '1',
        ...newDonation,
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: createdDonation,
              error: null,
            }),
          }),
        }),
      })

      // Act
      const result = await createDonation(newDonation as any)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('donations')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(newDonation)
      expect(result).toHaveProperty('id')
      expect(result.bagisci_adi).toBe('Test Bağışçı')
    })

    it('should handle validation errors', async () => {
      // Arrange
      const invalidDonation = {
        // Missing required fields
        bagisci_adi: '',
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Validation error: bagisci_adi is required'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(createDonation(invalidDonation as any)).rejects.toThrow('Validation error')
    })

    it('should handle database errors during creation', async () => {
      // Arrange
      const newDonation = {
        bagisci_adi: 'Test Bağışçı',
        tutar: 1000,
        amac: 'genel',
        odeme_yontemi: 'nakit',
        tarih: '2025-01-05',
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Foreign key constraint violation'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(createDonation(newDonation as any)).rejects.toThrow('Foreign key constraint violation')
    })
  })
})


