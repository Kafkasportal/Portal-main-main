import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    fetchBeneficiaries,
    fetchBeneficiaryById,
    createBeneficiary,
    updateBeneficiary,
    fetchDependentPersons
} from '../beneficiaries.service'
import { mockSupabaseClient, mockSupabaseData } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

describe('beneficiaries.service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseData.data = null
        mockSupabaseData.error = null
        mockSupabaseData.count = null
    })

    describe('fetchBeneficiaries', () => {
        it('should fetch beneficiaries with default pagination', async () => {
            const mockData = [{ id: 1, ad: 'Ahmet', soyad: 'Yılmaz' }]
            mockSupabaseData.data = mockData
            mockSupabaseData.count = 1

            const result = await fetchBeneficiaries()

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('beneficiaries')
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*', { count: 'exact' })
            expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 9)
            expect(result.data).toHaveLength(1)
            expect(result.total).toBe(1)
        })

        it('should apply filters correctly', async () => {
            mockSupabaseData.data = []

            await fetchBeneficiaries({
                search: 'test',
                durum: 'aktif',
                ihtiyacDurumu: 'yuksek',
                kategori: 'gida'
            })

            expect(mockSupabaseClient.or).toHaveBeenCalledWith(
                expect.stringContaining('ad.ilike.%test%')
            )
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('durum', 'aktif')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('ihtiyac_durumu', 'yuksek')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('kategori', 'gida')
        })

        it('should skip filters if value is "all"', async () => {
            await fetchBeneficiaries({ durum: 'all', kategori: 'all' })
            expect(mockSupabaseClient.eq).not.toHaveBeenCalledWith('durum', 'all')
            expect(mockSupabaseClient.eq).not.toHaveBeenCalledWith('kategori', 'all')
        })

        it('should throw error if fetchBeneficiaries fails', async () => {
            mockSupabaseData.error = new Error('Fetch Error')
            await expect(fetchBeneficiaries()).rejects.toThrow('Fetch Error')
        })
    })

    describe('fetchBeneficiaryById', () => {
        it('should fetch a single beneficiary by ID', async () => {
            const mockBeneficiary = { id: 123, ad: 'Mehmet' }
            mockSupabaseData.data = [mockBeneficiary]

            const result = await fetchBeneficiaryById(123)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('beneficiaries')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 123)
            expect(result.id).toBe(123)
        })

        it('should throw error if single() returns error', async () => {
            mockSupabaseData.error = new Error('Not found')

            await expect(fetchBeneficiaryById(999)).rejects.toThrow('Not found')
        })
    })

    describe('createBeneficiary', () => {
        it('should insert a new beneficiary', async () => {
            const newBeneficiary = { ad: 'Yeni', soyad: 'Kişi' }
            mockSupabaseData.data = [{ id: 1, ...newBeneficiary }]

            const result = await createBeneficiary(newBeneficiary as any)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('beneficiaries')
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(newBeneficiary)
            expect(result.id).toBe(1)
        })
    })

    describe('updateBeneficiary', () => {
        it('should update an existing beneficiary', async () => {
            const updates = { ad: 'Güncel' }
            mockSupabaseData.data = [{ id: 1, ad: 'Güncel' }]

            const result = await updateBeneficiary(1, updates)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('beneficiaries')
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(
                expect.objectContaining({ ad: 'Güncel', updated_at: expect.any(String) })
            )
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 1)
            expect(result.ad).toBe('Güncel')
        })
    })

    describe('fetchDependentPersons', () => {
        it('should fetch dependent persons for a parent', async () => {
            mockSupabaseData.data = [{ id: 2, ad: 'Çocuk', parent_id: 1 }]

            const result = await fetchDependentPersons(1)

            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('parent_id', 1)
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('relationship_type', 'Bakmakla Yükümlü Olunan Kişi')
            expect(result).toHaveLength(1)
        })

        it('should throw error if fetchDependentPersons fails', async () => {
            mockSupabaseData.error = new Error('Fetch Error')
            await expect(fetchDependentPersons(1)).rejects.toThrow('Fetch Error')
        })
    })
})
