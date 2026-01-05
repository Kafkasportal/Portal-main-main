import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    fetchFamilyMembers,
    fetchFamilyMember,
    searchFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    deleteAllFamilyMembers,
    batchAddFamilyMembers,
    getFamilyCompositionSummary,
    checkDuplicateRecipients,
    findBeneficiariesWithMultipleAidRecipients
} from '../beneficiary-family-service'
import { mockSupabaseClient, mockSupabaseData } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

describe('beneficiary-family-service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseData.data = null
        mockSupabaseData.error = null
        mockSupabaseData.count = null
    })

    describe('fetchFamilyMembers', () => {
        it('should fetch family members for a beneficiary', async () => {
            mockSupabaseData.data = [{ id: 1, beneficiary_id: 10, ad: 'Ali', created_at: '2023-01-01', updated_at: '2023-01-01' }]
            const result = await fetchFamilyMembers(10)
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('beneficiary_family_members')
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('beneficiary_id', 10)
            expect(result).toHaveLength(1)
            expect(result[0].ad).toBe('Ali')
        })

        it('should throw error if fetch fails', async () => {
            mockSupabaseData.error = new Error('Fetch Error')
            await expect(fetchFamilyMembers(10)).rejects.toThrow('Fetch Error')
        })
    })

    describe('fetchFamilyMember', () => {
        it('should fetch a single family member', async () => {
            mockSupabaseData.data = [{ id: 1, ad: 'Ali', created_at: '2023-01-01', updated_at: '2023-01-01' }]
            const result = await fetchFamilyMember(1)
            expect(result.ad).toBe('Ali')
        })
    })

    describe('searchFamilyMembers', () => {
        it('should search family members using ilike', async () => {
            mockSupabaseData.data = [{ id: 1, ad: 'Ali', created_at: '2023-01-01', updated_at: '2023-01-01' }]
            await searchFamilyMembers('Ali')
            expect(mockSupabaseClient.or).toHaveBeenCalledWith(expect.stringContaining('ad.ilike.%Ali%'))
        })
    })

    describe('addFamilyMember', () => {
        it('should add a new family member', async () => {
            const member = {
                beneficiaryId: 10,
                ad: 'Veli',
                soyad: 'Can',
                tcKimlikNo: '12345678901',
                cinsiyet: 'erkek' as const,
                iliski: 'çocuk',
                medeniDurum: 'bekar'
            }
            mockSupabaseData.data = [{ id: 1, ...member, beneficiary_id: 10, created_at: '2023-01-01', updated_at: '2023-01-01' }]
            const result = await addFamilyMember(member as any)
            expect(mockSupabaseClient.insert).toHaveBeenCalled()
            expect(result.ad).toBe('Veli')
        })
    })

    describe('updateFamilyMember', () => {
        it('should update an existing family member', async () => {
            const updates = { ad: 'Updated Name' }
            mockSupabaseData.data = [{ id: 1, ad: 'Updated Name', created_at: '2023-01-01', updated_at: '2023-01-01' }]
            const result = await updateFamilyMember(1, updates)
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(expect.objectContaining({ ad: 'Updated Name' }))
            expect(result.ad).toBe('Updated Name')
        })
    })

    describe('deleteFamilyMember', () => {
        it('should delete a family member', async () => {
            await deleteFamilyMember(1)
            expect(mockSupabaseClient.delete).toHaveBeenCalled()
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 1)
        })
    })

    describe('deleteAllFamilyMembers', () => {
        it('should delete all family members for a beneficiary', async () => {
            await deleteAllFamilyMembers(10)
            expect(mockSupabaseClient.delete).toHaveBeenCalled()
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('beneficiary_id', 10)
        })
    })

    describe('batchAddFamilyMembers', () => {
        it('should add multiple family members', async () => {
            const members = [{
                beneficiaryId: 10,
                ad: 'Ali',
                soyad: 'Can',
                cinsiyet: 'erkek' as const,
                iliski: 'çocuk'
            }]
            mockSupabaseData.data = [{ id: 1, beneficiary_id: 10, ad: 'Ali', created_at: '2023-01-01', updated_at: '2023-01-01' }]
            const result = await batchAddFamilyMembers(members as any)
            expect(mockSupabaseClient.insert).toHaveBeenCalled()
            expect(result).toHaveLength(1)
        })
    })

    describe('getFamilyCompositionSummary', () => {
        it('should return a summary of family composition', async () => {
            mockSupabaseData.data = [
                { iliski: 'eş', medeni_durum: 'evli', cinsiyet: 'kadın', egitim_durumu: 'lise', gelir_durumu: 'yok' },
                { iliski: 'çocuk', medeni_durum: 'bekar', cinsiyet: 'erkek', egitim_durumu: 'ilkokul', gelir_durumu: 'yok' }
            ]
            const summary = await getFamilyCompositionSummary(10)
            expect(summary.total).toBe(2)
            expect(summary.byRelationship['eş']).toBe(1)
            expect(summary.byGender['kadın']).toBe(1)
        })

        it('should return empty summary if no data found', async () => {
            mockSupabaseData.data = []
            const summary = await getFamilyCompositionSummary(10)
            expect(summary.total).toBe(0)
        })
    })

    describe('checkDuplicateRecipients', () => {
        it('should return duplicate info if recipients found', async () => {
            mockSupabaseData.data = [
                { basvuran_tc_kimlik_no: '123', basvuran_ad: 'Ali', basvuran_soyad: 'Can', durum: 'onaylandi' }
            ]
            const result = await checkDuplicateRecipients(['123'])
            expect(result).toHaveLength(1)
            expect(result[0]).toContain('Ali Can')
        })

        it('should ignore rejected applications', async () => {
            mockSupabaseData.data = [
                { basvuran_tc_kimlik_no: '123', basvuran_ad: 'Ali', basvuran_soyad: 'Can', durum: 'reddedildi' }
            ]
            const result = await checkDuplicateRecipients(['123'])
            expect(result).toHaveLength(0)
        })
    })

    describe('findBeneficiariesWithMultipleAidRecipients', () => {
        it('should find beneficiaries with family members', async () => {
            // First call to get family members
            mockSupabaseClient.from.mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValueOnce({ data: [{ beneficiary_id: 1, ad: 'Zeynep' }], error: null })
            } as any)

            // Second call to get beneficiaries
            mockSupabaseClient.from.mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValueOnce({ data: [{ id: 1, ad: 'Hüseyin' }], error: null })
            } as any)

            const result = await findBeneficiariesWithMultipleAidRecipients()
            expect(result).toHaveLength(1)
            expect(result[0].ad).toBe('Hüseyin')
            expect(result[0].familyMemberCount).toBe(1)
        })
    })
})
