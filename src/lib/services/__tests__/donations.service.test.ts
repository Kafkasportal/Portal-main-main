import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchDonations, fetchDonation, createDonation } from '../donations.service'
import { mockSupabaseClient, mockSupabaseData } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

describe('donations.service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseData.data = null
        mockSupabaseData.error = null
        mockSupabaseData.count = null
    })

    describe('fetchDonations', () => {
        it('should fetch donations with default options', async () => {
            mockSupabaseData.data = [{ id: 1, bagisci_adi: 'Ali' }]
            mockSupabaseData.count = 1

            const result = await fetchDonations()

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('donations')
            expect(result.data).toHaveLength(1)
            expect(result.total).toBe(1)
        })

        it('should apply search and filters correctly', async () => {
            await fetchDonations({ search: 'Ali', amac: 'Gıda', memberId: 10 })

            expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('bagisci_adi', '%Ali%')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('amac', 'Gıda')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('member_id', 10)
        })

        it('should throw error if query fails', async () => {
            mockSupabaseData.error = new Error('Query failed')
            await expect(fetchDonations()).rejects.toThrow('Query failed')
        })
    })

    describe('fetchDonation', () => {
        it('should fetch a single donation', async () => {
            mockSupabaseData.data = [{ id: 5 }]
            const result = await fetchDonation(5)
            expect(result.id).toBe(5)
        })
    })

    describe('createDonation', () => {
        it('should create a new donation', async () => {
            const donation = { bagisci_adi: 'Veli', tutar: 100 }
            mockSupabaseData.data = [{ id: 10, ...donation }]

            const result = await createDonation(donation as any)

            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(donation)
            expect(result.id).toBe(10)
        })
    })
})
