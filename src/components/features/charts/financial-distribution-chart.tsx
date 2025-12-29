'use client'

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from '@/components/shared/lazy-chart'
import type { CategorySummary } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface FinancialDistributionChartProps {
  data: CategorySummary[]
  isLoading?: boolean
  title?: string
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

export function FinancialDistributionChart({
  data,
  isLoading,
  title,
}: FinancialDistributionChartProps) {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        {isLoading ? 'Yükleniyor...' : 'Veri bulunamadı'}
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.kategori,
    value: item.tutar,
    yuzde: item.yuzde,
  }))

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-center text-lg font-semibold">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: %${((percent || 0) * 100).toFixed(1)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(typeof value === 'number' ? value : Number(value))}
            labelFormatter={(label) => `Kategori: ${label}`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{item.name}</span>
            <span className="ml-auto font-medium">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

