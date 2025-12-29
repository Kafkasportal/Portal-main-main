import { fetchDonationTrends, fetchDonationSourceDistribution, fetchTopDonors } from './analytics-service'
import { getSupabaseClient } from './supabase/client'

jest.mock('./supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}))

describe('Analytics Service', () => {
  const mockRpc = jest.fn()
  const mockSupabase = {
    rpc: mockRpc,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('fetchDonationTrends calls the correct RPC function for monthly', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })

    await fetchDonationTrends('monthly')

    expect(mockRpc).toHaveBeenCalledWith('get_donation_trends', {
      period_type: 'monthly',
    })
  })

  it('fetchDonationTrends handles RPC errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC Error' } })

    await expect(fetchDonationTrends('monthly')).rejects.toThrow('RPC Error')
  })

  it('fetchDonationSourceDistribution calls the correct RPC function', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })

    await fetchDonationSourceDistribution()

    expect(mockRpc).toHaveBeenCalledWith('get_donation_source_distribution')
  })

  it('fetchTopDonors calls the correct RPC function with limit', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })

    await fetchTopDonors(5)

    expect(mockRpc).toHaveBeenCalledWith('get_top_donors', { limit_count: 5 })
  })
})
