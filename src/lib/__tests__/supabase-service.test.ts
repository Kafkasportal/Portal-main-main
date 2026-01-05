import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as supabaseService from '../supabase-service'
import { getSupabaseClient } from '../supabase/client'

// Mock the client
vi.mock('../supabase/client', () => ({
    getSupabaseClient: vi.fn(),
}))

const createMockChain = (resolvedValue?: any) => {
    const chain: any = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        then: (onFulfilled: any) => Promise.resolve(resolvedValue).then(onFulfilled),
        catch: (onRejected: any) => Promise.resolve(resolvedValue).catch(onRejected),
    }
    chain.from.mockReturnValue(chain)
    chain.select.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)
    chain.gte.mockReturnValue(chain)
    chain.range.mockReturnValue(chain)
    chain.order.mockReturnValue(chain)
    chain.single.mockReturnValue(chain)
    chain.insert.mockReturnValue(chain)
    return chain
}

describe('supabase-service', () => {
    const mockSupabase = {
        from: vi.fn(),
        rpc: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as any)
    })

    describe('fetchDashboardStats', () => {
        it('should return stats from RPC if successful', async () => {
            const mockStats = { activeMembers: 50, totalDonations: 1000 }
            mockSupabase.rpc.mockResolvedValue({ data: mockStats, error: null })

            const result = await supabaseService.fetchDashboardStats()

            expect(result).toEqual(mockStats)
            expect(mockSupabase.rpc).toHaveBeenCalledWith('get_dashboard_stats')
        })

        it('should fallback to manual aggregation if RPC fails', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('RPC Error') })

            // Order: members, beneficiaries, donations, activeKumbaras, pendingApplications, applications, monthlyPayments
            mockSupabase.from
                .mockReturnValueOnce(createMockChain({ count: 10, error: null })) // members
                .mockReturnValueOnce(createMockChain({ count: 5, error: null }))  // beneficiaries
                .mockReturnValueOnce(createMockChain({ data: [{ tutar: 100 }], error: null })) // donations
                .mockReturnValueOnce(createMockChain({ count: 2, error: null }))  // activeKumbaras
                .mockReturnValueOnce(createMockChain({ count: 3, error: null }))  // pendingApplications
                .mockReturnValueOnce(createMockChain({ data: [], error: null }))  // applications
                .mockReturnValueOnce(createMockChain({ data: [], error: null }))  // monthlyPayments

            const result = await supabaseService.fetchDashboardStats()

            expect(result).toBeDefined()
            expect(result.activeMembers).toBe(10)
            expect(result.totalBeneficiaries).toBe(5)
            expect(result.totalDonations).toBe(100)
        })
    })

    describe('fetchMembers', () => {
        it('should return paginated members', async () => {
            const mockMembers = [{ id: 1, ad: 'Ali', tc_kimlik_no: '123', dogum_tarihi: '1990-01-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]
            mockSupabase.from.mockReturnValue(createMockChain({ data: mockMembers, count: 1, error: null }))

            const result = await supabaseService.fetchMembers({ page: 1, limit: 10 })

            expect(result.data).toHaveLength(1)
            expect(result.total).toBe(1)
            expect(result.data[0].ad).toBe('Ali')
        })
    })

    describe('fetchMember', () => {
        it('should return a single member', async () => {
            const mockMember = { id: 1, ad: 'Ali', tc_kimlik_no: '123', dogum_tarihi: '1990-01-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
            mockSupabase.from.mockReturnValue(createMockChain({ data: mockMember, error: null }))

            const result = await supabaseService.fetchMember(1)
            expect(result.ad).toBe('Ali')
        })
    })

    describe('createMember', () => {
        it('should insert a member', async () => {
            const newMember = { ad: 'Veli', soyad: 'Can' }
            mockSupabase.from.mockReturnValue(createMockChain({ data: { id: 2, ...newMember }, error: null }))

            const result = await supabaseService.createMember(newMember as any)
            expect(result.id).toBe(2)
        })
    })
})
