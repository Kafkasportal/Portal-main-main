'use client'

import { memo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface AidDistributionChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export const AidDistributionChart = memo(function AidDistributionChart({ data }: AidDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="text-muted-foreground flex h-full items-center justify-center"
        role="status"
        aria-live="polite"
      >
        Veri yok
      </div>
    )
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Prepare data with percentages
  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={300} minHeight={300}>
      <PieChart role="img" aria-label="Yardım dağılımı grafiği">
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={105}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '8px 12px',
          }}
          formatter={(
            value: number | string | undefined,
            _name: string | undefined,
            props: { payload?: { percentage?: number; name?: string } }
          ) => {
            const numValue = typeof value === 'number' ? value : 0
            const percentage = props?.payload?.percentage || 0
            const itemName = props?.payload?.name || ''
            return [`${numValue} (%${percentage})`, itemName] as const
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
})
