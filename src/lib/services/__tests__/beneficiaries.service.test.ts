/**
 * Beneficiaries Service Tests
 * İhtiyaç sahipleri servisi birim testleri
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  getClient: vi.fn(() => createClient('mock-url', 'mock-key')),
}))

// Import after mocking
import { fetchBeneficiaries, fetchBeneficiary, createBeneficiary, updateBeneficiary } from '../beneficiaries.service'

describe('Beneficiaries Service', () => {
  const mockSupabase = {
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mock chain
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue({ count: 'exact' }),
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: '1',
                        ad: 'Mehmet',
                        soyad: 'Kaya',
                        tc_kimlik_no: '12345678901',
                        telefon: '5551234567',
                        durum: 'aktif',
                        ihtiyac_durumu: 'acil',
                        kategori: 'ihtiyac-sahibi-aile',
                        adres: 'İstanbul, Türkiye',
                        email: 'mehmet@example.com',
                        cinsiyet: 'erkek',
                        dogum_tarihi: '1990-01-01',
                        hane_buyuklugu: 4,
                        aylık_gelir: 5000,
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
      }),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '1',
          ad: 'Mehmet',
          soyad: 'Kaya',
          tc_kimlik_no: '12345678901',
          telefon: '5551234567',
          durum: 'aktif',
          ihtiyac_durumu: 'acil',
        },
        error: null,
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '1',
              ad: 'Mehmet',
              soyad: 'Kaya',
              tc_kimlik_no: '12345678901',
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '1',
                ad: 'Mehmet',
                soyad: 'Kaya',
                tc_kimlik_no: '12345678901',
                telefon: '5555555555', // Updated
              },
              error: null,
            }),
          }),
        }),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchBeneficiaries', () => {
    it('should fetch beneficiaries with default options', async () => {
      // Arrange
      const expected = {
        data: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }

      // Act
      const result = await fetchBeneficiaries()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('should fetch beneficiaries with pagination', async () => {
      // Arrange
      const options = { page: 2, limit: 20 }

      // Act
      await fetchBeneficiaries(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
    })

    it('should filter beneficiaries by durum', async () => {
      // Arrange
      const options = { durum: 'aktif' }

      // Act
      await fetchBeneficiaries(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
    })

    it('should filter beneficiaries by ihtiyacDurumu', async () => {
      // Arrange
      const options = { ihtiyacDurumu: 'acil' }

      // Act
      await fetchBeneficiaries(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
    })

    it('should filter beneficiaries by kategori', async () => {
      // Arrange
      const options = { kategori: 'ihtiyac-sahibi-aile' }

      // Act
      await fetchBeneficiaries(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
    })

    it('should search beneficiaries by name or TC', async () => {
      // Arrange
      const options = { search: 'Mehmet' }

      // Act
      await fetchBeneficiaries(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
    })

    it('should handle database errors', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          count: vi.fn().mockReturnValue({ count: 'exact' }),
          range: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                      data: null,
                      error: new Error('Database error'),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchBeneficiaries()).rejects.toThrow('Database error')
    })
  })

  describe('fetchBeneficiary', () => {
    it('should fetch beneficiary by ID', async () => {
      // Arrange
      const beneficiaryId = '1'

      // Act
      const result = await fetchBeneficiary(beneficiaryId)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('id', beneficiaryId)
      expect(mockSupabase.from().select().eq().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
      expect(result.ad).toBe('Mehmet')
    })

    it('should handle not found error', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      })

      // Act & Assert
      await expect(fetchBeneficiary('999')).rejects.toThrow()
    })

    it('should handle database errors', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Connection failed'),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchBeneficiary('1')).rejects.toThrow('Connection failed')
    })
  })

  describe('createBeneficiary', () => {
    it('should create a new beneficiary', async () => {
      // Arrange
      const newBeneficiary = {
        ad: 'Mehmet',
        soyad: 'Kaya',
        tc_kimlik_no: '12345678901',
        telefon: '5551234567',
        durum: 'aktif',
        ihtiyac_durumu: 'orta',
        kategori: 'ihtiyac-sahibi-aile',
      }

      // Act
      const result = await createBeneficiary(newBeneficiary as any)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(newBeneficiary)
      expect(mockSupabase.from().insert().select).toHaveBeenCalled()
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
      expect(result.ad).toBe('Mehmet')
    })

    it('should handle validation errors', async () => {
      // Arrange
      const invalidBeneficiary = {
        // Missing required fields
        ad: '',
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Validation error: ad is required'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(createBeneficiary(invalidBeneficiary as any)).rejects.toThrow('Validation error')
    })

    it('should handle duplicate TC Kimlik error', async () => {
      // Arrange
      const newBeneficiary = {
        ad: 'Mehmet',
        soyad: 'Kaya',
        tc_kimlik_no: '12345678901', // Duplicate
        telefon: '5551234567',
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key' },
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(createBeneficiary(newBeneficiary as any)).rejects.toThrow()
    })
  })

  describe('updateBeneficiary', () => {
    it('should update an existing beneficiary', async () => {
      // Arrange
      const beneficiaryId = '1'
      const updateData = {
        telefon: '5555555555',
        adres: 'Yeni adres',
      }

      // Act
      const result = await updateBeneficiary(beneficiaryId, updateData as any)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updateData)
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', beneficiaryId)
      expect(mockSupabase.from().update().eq().select).toHaveBeenCalled()
      expect(mockSupabase.from().update().eq().select().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
    })

    it('should handle not found error', async () => {
      // Arrange
      const beneficiaryId = '999'
      const updateData = { telefon: '5555555555' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(updateBeneficiary(beneficiaryId, updateData as any)).rejects.toThrow()
    })

    it('should handle validation errors', async () => {
      // Arrange
      const beneficiaryId = '1'
      const invalidData = {
        telefon: 'invalid-phone',
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Validation error'),
              }),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(updateBeneficiary(beneficiaryId, invalidData as any)).rejects.toThrow('Validation error')
    })
  })
})


