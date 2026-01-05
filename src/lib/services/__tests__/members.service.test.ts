import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    fetchMembers,
    fetchMember,
    createMember,
    updateMember,
    deleteMember
} from '../members.service'
import { mockSupabaseClient, mockSupabaseData } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

describe('members.service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseData.data = null
        mockSupabaseData.error = null
        mockSupabaseData.count = null
    })

    describe('fetchMembers', () => {
        it('should fetch members with correct filters', async () => {
            mockSupabaseData.data = [{ id: 1, ad: 'Jane' }]

            await fetchMembers({
                uyeTuru: 'aktif',
                aidatDurumu: 'guncel',
                cinsiyet: 'Kadin',
                kanGrubu: 'A Rh+',
                meslek: 'Mühendis',
                il: 'İstanbul'
            })

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('members')
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('uye_turu', ['standart'])
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('aidat_durumu', ['odendi'])
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('cinsiyet', ['kadin'])
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('kan_grubu', ['A Rh+'])
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('meslek', ['Mühendis'])
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('il', ['İstanbul'])
        })

        it('should handle array filters', async () => {
            await fetchMembers({
                uyeTuru: ['aktif', 'onursal'],
            })
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('uye_turu', ['standart', 'onursal'])
        })

        it('should apply search filter if search term is provided', async () => {
            await fetchMembers({ search: 'Jane' })
            expect(mockSupabaseClient.or).toHaveBeenCalledWith(
                expect.stringContaining('ad.ilike.%Jane%,soyad.ilike.%Jane%,tc_kimlik_no.ilike.%Jane%')
            )
        })

        it('should throw error if query fails', async () => {
            mockSupabaseData.error = new Error('Query failed')
            await expect(fetchMembers()).rejects.toThrow('Query failed')
        })
    })

    describe('fetchMember', () => {
        it('should fetch a single member', async () => {
            mockSupabaseData.data = [{ id: 10 }]
            const result = await fetchMember(10)
            expect(result.id).toBe(10)
        })
    })

    describe('deleteMember', () => {
        it('should delete a member', async () => {
            await deleteMember(99)
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('members')
            expect(mockSupabaseClient.delete).toHaveBeenCalled()
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 99)
        })
    })

    describe('createMember', () => {
        it('should create a new member', async () => {
            const member = { ad: 'Yeni', soyad: 'Üye' }
            mockSupabaseData.data = [{ id: 1, ...member }]
            const result = await createMember(member as any)
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(member)
            expect(result.id).toBe(1)
        })
    })

    describe('updateMember', () => {
        it('should update a member', async () => {
            const updates = { ad: 'Güncel' }
            mockSupabaseData.data = [{ id: 1, ad: 'Güncel' }]
            const result = await updateMember(1, updates)
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(expect.objectContaining({ ad: 'Güncel' }))
            expect(result.ad).toBe('Güncel')
        })
    })
})
