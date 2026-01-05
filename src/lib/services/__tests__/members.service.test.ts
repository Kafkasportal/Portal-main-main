/**
 * Members Service Tests
 * Üye servisi birim testleri
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  getClient: vi.fn(() => createClient('mock-url', 'mock-key')),
}))

// Import after mocking
import { fetchMembers, fetchMember, createMember, updateMember, deleteMember } from '../members.service'

describe('Members Service', () => {
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
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  in: vi.fn().mockReturnValue({
                    in: vi.fn().mockReturnValue({
                      in: vi.fn().mockResolvedValue({
                        data: [
                          {
                            id: '1',
                            ad: 'Ahmet',
                            soyad: 'Yılmaz',
                            tc_kimlik_no: '12345678901',
                            telefon: '5551234567',
                            email: 'ahmet@example.com',
                            uye_turu: 'standart',
                            aidat_durumu: 'odendi',
                            kayit_tarihi: '2025-01-01',
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
        }),
      }),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '1',
          ad: 'Ahmet',
          soyad: 'Yılmaz',
          tc_kimlik_no: '12345678901',
          telefon: '5551234567',
          email: 'ahmet@example.com',
          uye_turu: 'standart',
          aidat_durumu: 'odendi',
          kayit_tarihi: '2025-01-01',
        },
        error: null,
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '1',
              ad: 'Ahmet',
              soyad: 'Yılmaz',
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
                ad: 'Ahmet',
                soyad: 'Yılmaz',
                tc_kimlik_no: '12345678901',
              },
              error: null,
            }),
          }),
        }),
      }),
      delete: vi.fn().mockResolvedValue({
        error: null,
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchMembers', () => {
    it('should fetch members with default options', async () => {
      // Act
      const result = await fetchMembers()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('should fetch members with pagination', async () => {
      // Arrange
      const options = { page: 2, limit: 20 }

      // Act
      await fetchMembers(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
    })

    it('should filter members by uyeTuru', async () => {
      // Arrange
      const options = { uyeTuru: 'aktif' }

      // Act
      await fetchMembers(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
    })

    it('should filter members by aidatDurumu', async () => {
      // Arrange
      const options = { aidatDurumu: 'guncel' }

      // Act
      await fetchMembers(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
    })

    it('should filter members by cinsiyet', async () => {
      // Arrange
      const options = { cinsiyet: 'erkek' }

      // Act
      await fetchMembers(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
    })

    it('should search members by name or TC', async () => {
      // Arrange
      const options = { search: 'Ahmet' }

      // Act
      await fetchMembers(options)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
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
      await expect(fetchMembers()).rejects.toThrow('Database error')
    })
  })

  describe('fetchMember', () => {
    it('should fetch member by ID', async () => {
      // Arrange
      const memberId = 1

      // Act
      const result = await fetchMember(memberId)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('id', memberId)
      expect(mockSupabase.from().select().eq().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
      expect(result.ad).toBe('Ahmet')
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
      await expect(fetchMember(999)).rejects.toThrow()
    })

    it('should handle database errors', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Connection failed'),
            }),
          }),
        }),
      })

      // Act & Assert
      await expect(fetchMember(1)).rejects.toThrow('Connection failed')
    })
  })

  describe('createMember', () => {
    it('should create a new member', async () => {
      // Arrange
      const newMember = {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        tc_kimlik_no: '12345678901',
        telefon: '5551234567',
        email: 'ahmet@example.com',
        uye_turu: 'standart',
      }

      // Act
      const result = await createMember(newMember as any)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(newMember)
      expect(mockSupabase.from().insert().select).toHaveBeenCalled()
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
      expect(result.ad).toBe('Ahmet')
    })

    it('should handle validation errors', async () => {
      // Arrange
      const invalidMember = {
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
      await expect(createMember(invalidMember as any)).rejects.toThrow('Validation error')
    })

    it('should handle duplicate TC Kimlik error', async () => {
      // Arrange
      const newMember = {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        tc_kimlik_no: '12345678901', // Duplicate
        telefon: '5551234567',
        email: 'ahmet@example.com',
        uye_turu: 'standart',
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
      await expect(createMember(newMember as any)).rejects.toThrow()
    })
  })

  describe('updateMember', () => {
    it('should update an existing member', async () => {
      // Arrange
      const memberId = 1
      const updateData = {
        ad: 'Mehmet',
        soyad: 'Yılmaz',
      }

      // Act
      const result = await updateMember(memberId, updateData as any)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updateData)
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', memberId)
      expect(mockSupabase.from().update().eq().select).toHaveBeenCalled()
      expect(mockSupabase.from().update().eq().select().single).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
    })

    it('should handle not found error', async () => {
      // Arrange
      const memberId = 999
      const updateData = { ad: 'Mehmet' }

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
      await expect(updateMember(memberId, updateData as any)).rejects.toThrow()
    })

    it('should handle validation errors', async () => {
      // Arrange
      const memberId = 1
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
      await expect(updateMember(memberId, invalidData as any)).rejects.toThrow('Validation error')
    })
  })

  describe('deleteMember', () => {
    it('should delete a member', async () => {
      // Arrange
      const memberId = 1

      // Act
      await deleteMember(memberId)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('members')
      expect(mockSupabase.from().delete).toHaveBeenCalled()
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', memberId)
    })

    it('should handle database errors', async () => {
      // Arrange
      const memberId = 1

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error('Database constraint violation'),
          }),
        }),
      })

      // Act & Assert
      await expect(deleteMember(memberId)).rejects.toThrow('Database constraint violation')
    })

    it('should handle foreign key constraint errors', async () => {
      // Arrange
      const memberId = 1

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { code: '23503', message: 'foreign key violation' },
          }),
        }),
      })

      // Act & Assert
      await expect(deleteMember(memberId)).rejects.toThrow()
    })
  })
})


