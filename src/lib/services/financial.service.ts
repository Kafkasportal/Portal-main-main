/**
 * Financial Analysis Service
 * Finansal raporlama ve analiz
 * TODO: Implement detailed financial reports
 */

import { getClient } from './base.service'

/**
 * Finansal özet raporu
 * TODO: Implement full financial summary with income/expense breakdown
 */
export async function fetchFinancialSummary() {
  // Placeholder - will be implemented with actual financial calculations
  return {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyTrend: [],
  }
}

/**
 * Gelir-gider raporu
 * TODO: Implement daily income vs expense report
 */
export async function fetchIncomeExpenseReport(
  _startDate: string,
  _endDate: string
) {
  // TODO: Implement based on donations (income) and payments (expense)
  return {
    income: [],
    expense: [],
    daily: [],
  }
}

/**
 * Kategoriye göre gelir dağılımı
 */
export async function fetchIncomeByCategory() {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('donations')
    .select('amac, tutar')

  if (error) throw error

  // Group by purpose (amac)
  const grouped = (data || []).reduce(
    (acc: Record<string, number>, d: { amac: string | null; tutar: number }) => {
      const category = d.amac || 'Diğer'
      acc[category] = (acc[category] || 0) + d.tutar
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }))
}

/**
 * Kategoriye göre gider dağılımı
 */
export async function fetchExpenseByCategory() {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('social_aid_applications')
    .select('yardim_turu, onaylanan_tutar')
    .eq('durum', 'onaylandi')

  if (error) throw error

  // Group by aid type
  const grouped = (data || []).reduce(
    (acc: Record<string, number>, app: { yardim_turu: string | null; onaylanan_tutar: number | null }) => {
      const category = app.yardim_turu || 'Diğer'
      acc[category] = (acc[category] || 0) + (app.onaylanan_tutar || 0)
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }))
}
