import { getSupabaseClient } from './supabase/client'

export interface DonationTrend {
  period: string
  total_amount: number
  count: number
}

export async function fetchDonationTrends(
  periodType: 'monthly' | 'quarterly' | 'yearly'
): Promise<DonationTrend[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('get_donation_trends', {
    period_type: periodType,
  })

  if (error) throw new Error(error.message)

  return data || []
}

export interface DonationSourceStats {
  source: string
  total_amount: number
  count: number
}

export interface TopDonor {
  donor_name: string
  total_amount: number
  donation_count: number
  last_donation_date: string
}

export async function fetchDonationSourceDistribution(): Promise<DonationSourceStats[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('get_donation_source_distribution')

  if (error) throw new Error(error.message)

  return data || []
}

export async function fetchTopDonors(limit: number = 10): Promise<TopDonor[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('get_top_donors', { limit_count: limit })

  if (error) throw new Error(error.message)

  return data || []
}
