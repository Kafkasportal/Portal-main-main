import { fetchMembers } from './supabase-service'
import { getSupabaseClient } from './supabase/client'

// Mock the Supabase client
jest.mock('./supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}))

describe('fetchMembers Filtering', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation((callback) => {
      return Promise.resolve(callback({ data: [], error: null, count: 0 }))
    }),
  } as const

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('should apply search filter when provided', async () => {
    await fetchMembers({ search: 'John' })
    expect(mockSupabase.or).toHaveBeenCalledWith(
      expect.stringContaining('ad.ilike.%John%')
    )
  })

  it('should apply multiple uyeTuru filters using .in()', async () => {
    await fetchMembers({ uyeTuru: ['aktif', 'onursal'] })
    expect(mockSupabase.in).toHaveBeenCalledWith('uye_turu', ['standart', 'onursal'])
  })

  it('should apply aidatDurumu filters using .in()', async () => {
    await fetchMembers({ aidatDurumu: ['guncel', 'gecmis'] })
    expect(mockSupabase.in).toHaveBeenCalledWith('aidat_durumu', ['odendi', 'gecikti'])
  })

  it('should apply cinsiyet filters using .in()', async () => {
    await fetchMembers({ cinsiyet: ['erkek'] })
    expect(mockSupabase.in).toHaveBeenCalledWith('cinsiyet', ['erkek'])
  })

  it('should apply kanGrubu, meslek, and il filters', async () => {
    await fetchMembers({ 
      kanGrubu: ['A+'],
      meslek: ['Mühendis'],
      il: ['İstanbul']
    })
    expect(mockSupabase.in).toHaveBeenCalledWith('kan_grubu', ['A+'])
    expect(mockSupabase.in).toHaveBeenCalledWith('meslek', ['Mühendis'])
    expect(mockSupabase.in).toHaveBeenCalledWith('il', ['İstanbul'])
  })
})
