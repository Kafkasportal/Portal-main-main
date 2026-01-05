import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchKumbaras, fetchKumbaraByCode, createKumbara, collectKumbara } from '../kumbaras.service'
import { mockSupabaseClient, mockSupabaseData } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

describe('kumbaras.service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseData.data = null
        mockSupabaseData.error = null
        mockSupabaseData.count = null
    })

    describe('fetchKumbaras', () => {
        it('should fetch kumbaras with status filter', async () => {
            mockSupabaseData.data = [{ id: 1, durum: 'aktif' }]

            const result = await fetchKumbaras({ durum: 'aktif' })

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('kumbaras')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('durum', 'aktif')
            expect(result.data).toHaveLength(1)
        })

        it('should throw error if query fails', async () => {
            mockSupabaseData.error = new Error('Fetch failed')
            await expect(fetchKumbaras()).rejects.toThrow('Fetch failed')
        })
    })

    describe('fetchKumbaraByCode', () => {
        it('should fetch kumbara by its QR code', async () => {
            mockSupabaseData.data = [{ id: 1, kod: 'KMB-001' }]
            const result = await fetchKumbaraByCode('KMB-001')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('kod', 'KMB-001')
            expect(result.kod).toBe('KMB-001')
        })
    })

    describe('createKumbara', () => {
        it('should create a new kumbara', async () => {
            const kumbara = { kod: 'NEW-001', mahalle: 'Test' }
            mockSupabaseData.data = [{ id: 1, ...kumbara }]
            const result = await createKumbara(kumbara as any)
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(kumbara)
            expect(result.id).toBe(1)
        })
    })

    describe('collectKumbara', () => {
        it('should update collected amount correctly', async () => {
            // First mock the select for current amount
            mockSupabaseData.data = [{ id: 1, toplam_toplanan: 100 }]

            // Then the return value for update
            // We use a helper to change mock data between calls if needed, 
            // but for simplicity here we just check if update was called correctly

            const result = await collectKumbara({ id: 1, tutar: 50 })

            expect(mockSupabaseClient.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    toplam_toplanan: 150,
                    durum: 'toplandi'
                })
            )
            expect(result.id).toBe(1)
        })

        it('should throw error if collect fails', async () => {
            mockSupabaseData.data = [{ id: 1, toplam_toplanan: 100 }]
            mockSupabaseData.error = new Error('Update failed')
            await expect(collectKumbara({ id: 1, tutar: 50 })).rejects.toThrow('Update failed')
        })
    })
})
