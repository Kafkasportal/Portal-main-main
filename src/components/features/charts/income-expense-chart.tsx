'use client'

import { memo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/shared/lazy-chart'
import type { IncomeExpenseReport } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface IncomeExpenseChartProps {
  data: IncomeExpenseReport[]
  isLoading?: boolean
}

export const IncomeExpenseChart = memo(function IncomeExpenseChart({
  data,
  isLoading,
}: IncomeExpenseChartProps) {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        {isLoading ? 'Yükleniyor...' : 'Veri bulunamadı'}
      </div>
    )
  }

  const chartData = data.map((item) => ({
    tarih: formatDate(item.tarih, 'dd/MM'),
    gelir: item.gelir,
    gider: item.gider,
    net: item.net,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tarih" />
        <YAxis
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
            return value.toString()
          }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(typeof value === 'number' ? value : Number(value))}
          labelFormatter={(label) => `Tarih: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="gelir"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorGelir)"
          name="Gelir"
        />
        <Area
          type="monotone"
          dataKey="gider"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorGider)"
          name="Gider"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

