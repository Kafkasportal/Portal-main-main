import { fetchMembers, fetchMember, createMember, fetchDonations, fetchKumbaras, fetchBeneficiaries } from '../supabase-service'

// Mock Supabase client
const mockSelect = jest.fn()
const mockFrom = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockRange = jest.fn()
const mockOrder = jest.fn()
const mockOr = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

const mockSupabaseClient = {
  from: mockFrom,
}

jest.mock('../supabase/client', () => ({
  getSupabaseClient: jest.fn(() => mockSupabaseClient),
}))

describe('Supabase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })
    
    mockSelect.mockReturnValue({
      range: mockRange,
      eq: mockEq,
      or: mockOr,
      single: mockSingle,
    })
    
    mockRange.mockReturnValue({
      order: mockOrder,
    })
    
    mockOrder.mockReturnValue({
      or: mockOr,
    })
    
    mockOr.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })
    
    mockEq.mockReturnValue({
      single: mockSingle,
    })
    
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    })
  })

  describe('fetchMembers', () => {
    it('should fetch members with default pagination', async () => {
      const mockMembers = [
        {
          id: '1',
          tc_kimlik_no: '12345678901',
          ad: 'Ahmet',
          soyad: 'Yılmaz',
          dogum_tarihi: '1990-01-01',
          cinsiyet: 'erkek',
          telefon: '05551234567',
          email: 'ahmet@test.com',
          adres: 'İstanbul',
          uye_turu: 'standart',
          kayit_tarihi: '2024-01-01',
          aidat_durumu: 'odendi',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      mockOr.mockResolvedValue({
        data: mockMembers,
        error: null,
        count: 1,
      })

      const result = await fetchMembers()

      expect(mockFrom).toHaveBeenCalledWith('members')
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(mockRange).toHaveBeenCalledWith(0, 9)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('should fetch members with custom pagination', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      await fetchMembers({ page: 2, limit: 20 })

      expect(mockRange).toHaveBeenCalledWith(20, 39)
    })

    it('should search members by name or TC', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      await fetchMembers({ search: 'Ahmet' })

      expect(mockOr).toHaveBeenCalledWith(
        'ad.ilike.%Ahmet%,soyad.ilike.%Ahmet%,tc_kimlik_no.ilike.%Ahmet%'
      )
    })

    it('should throw error when fetch fails', async () => {
      mockOr.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(fetchMembers()).rejects.toEqual({ message: 'Database error' })
    })

    it('should handle empty results', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const result = await fetchMembers()

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })
  })

  describe('fetchMember', () => {
    it('should fetch a single member by id', async () => {
      const mockMember = {
        id: '1',
        tc_kimlik_no: '12345678901',
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        dogum_tarihi: '1990-01-01',
        cinsiyet: 'erkek',
        telefon: '05551234567',
        email: 'ahmet@test.com',
        adres: 'İstanbul',
        uye_turu: 'standart',
        kayit_tarihi: '2024-01-01',
        aidat_durumu: 'odendi',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockSingle.mockResolvedValue({
        data: mockMember,
        error: null,
      })

      const result = await fetchMember('1')

      expect(mockFrom).toHaveBeenCalledWith('members')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockMember)
    })

    it('should throw error when member not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      await expect(fetchMember('999')).rejects.toEqual({ message: 'Not found' })
    })
  })

  describe('createMember', () => {
    it('should create a new member', async () => {
      const newMember = {
        tc_kimlik_no: '12345678901',
        ad: 'Mehmet',
        soyad: 'Demir',
        telefon: '05559876543',
        cinsiyet: 'erkek' as const,
        uye_turu: 'standart' as const,
        kayit_tarihi: '2024-01-01',
        aidat_durumu: 'beklemede' as const,
      }

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '2', ...newMember },
            error: null,
          }),
        }),
      })

      await createMember(newMember)

      expect(mockFrom).toHaveBeenCalledWith('members')
      expect(mockInsert).toHaveBeenCalledWith(newMember)
    })
  })

  describe('fetchDonations', () => {
    it('should fetch donations with pagination', async () => {
      const mockDonations = [
        {
          id: '1',
          bagisci_adi: 'Ahmet Yılmaz',
          member_id: null,
          tutar: 1000,
          currency: 'TRY',
          amac: 'genel',
          odeme_yontemi: 'nakit',
          tarih: '2024-01-01',
          created_at: '2024-01-01',
          makbuz_no: null,
          aciklama: null,
        },
      ]

      mockOr.mockResolvedValue({
        data: mockDonations,
        error: null,
        count: 1,
      })

      const result = await fetchDonations()

      expect(mockFrom).toHaveBeenCalledWith('donations')
      expect(result.data).toHaveLength(1)
    })
  })

  describe('fetchKumbaras', () => {
    it('should fetch kumbaras', async () => {
      const mockKumbaras = [
        {
          id: '1',
          kod: 'KUM-001',
          konum: 'Merkez Cami',
          sorumlu_id: 'user-1',
          toplam_toplanan: 5000,
          durum: 'aktif',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      mockOrder.mockResolvedValue({
        data: mockKumbaras,
        error: null,
        count: 1,
      })

      // Mock the chain for kumbaras (doesn't use 'or')
      mockRange.mockReturnValue({
        order: mockOrder,
      })

      const result = await fetchKumbaras()

      expect(mockFrom).toHaveBeenCalledWith('kumbaras')
      expect(result.data).toHaveLength(1)
    })
  })

  describe('fetchBeneficiaries', () => {
    it('should fetch beneficiaries with pagination', async () => {
      const mockBeneficiaries = [
        {
          id: '1',
          ad: 'Ali',
          soyad: 'Veli',
          tc_kimlik_no: '98765432109',
          telefon: '05559999999',
          il: 'Ankara',
          ilce: 'Çankaya',
          adres: 'Test Mahalle',
          kategori: 'ihtiyac-sahibi-aile',
          dogum_tarihi: '1985-05-15',
          cinsiyet: 'erkek',
          email: null,
          durum: 'aktif',
          ihtiyac_durumu: 'orta',
          hane_buyuklugu: 4,
          medeni_hal: 'evli',
          meslek: 'İşçi',
          aylik_gelir: '5000',
          egitim_durumu: 'lise',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      mockOr.mockResolvedValue({
        data: mockBeneficiaries,
        error: null,
        count: 1,
      })

      const result = await fetchBeneficiaries()

      expect(mockFrom).toHaveBeenCalledWith('beneficiaries')
      expect(result.data).toHaveLength(1)
    })

    it('should search beneficiaries by name or TC', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      await fetchBeneficiaries({ search: 'Ali' })

      expect(mockOr).toHaveBeenCalledWith(
        'ad.ilike.%Ali%,soyad.ilike.%Ali%,tc_kimlik_no.ilike.%Ali%'
      )
    })
  })

  describe('Pagination helper', () => {
    it('should calculate total pages correctly', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: 25,
      })

      const result = await fetchMembers({ limit: 10 })

      expect(result.totalPages).toBe(3)
    })

    it('should handle zero count', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
        count: null,
      })

      const result = await fetchMembers()

      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })
  })

  describe('Data mapping', () => {
    it('should map member data correctly', async () => {
      const mockMember = {
        id: '1',
        tc_kimlik_no: '12345678901',
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        dogum_tarihi: '1990-01-01',
        cinsiyet: 'erkek',
        telefon: '05551234567',
        email: 'ahmet@test.com',
        adres: 'İstanbul, Kadıköy',
        uye_turu: 'standart',
        kayit_tarihi: '2024-01-01T00:00:00Z',
        aidat_durumu: 'odendi',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockOr.mockResolvedValue({
        data: [mockMember],
        error: null,
        count: 1,
      })

      const result = await fetchMembers()

      expect(result.data[0].tcKimlikNo).toBe('12345678901')
      expect(result.data[0].ad).toBe('Ahmet')
      expect(result.data[0].soyad).toBe('Yılmaz')
      expect(result.data[0].uyeTuru).toBe('aktif') // standart mapped to aktif
    })

    it('should handle null values in member mapping', async () => {
      const mockMember = {
        id: '1',
        tc_kimlik_no: '12345678901',
        ad: 'Test',
        soyad: 'User',
        dogum_tarihi: null,
        cinsiyet: 'erkek',
        telefon: '05551234567',
        email: null,
        adres: null,
        uye_turu: 'standart',
        kayit_tarihi: null,
        aidat_durumu: 'beklemede',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockOr.mockResolvedValue({
        data: [mockMember],
        error: null,
        count: 1,
      })

      const result = await fetchMembers()

      expect(result.data[0].email).toBeUndefined()
      expect(result.data[0].adres.acikAdres).toBe('')
    })
  })
})
