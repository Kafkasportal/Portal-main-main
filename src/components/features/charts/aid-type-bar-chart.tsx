'use client'

import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface AidTypeBarChartProps {
  data: {
    name: string
    count: number
    color: string
  }[]
}

export const AidTypeBarChart = memo(function AidTypeBarChart({ data }: AidTypeBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        Veri yok
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          formatter={(value) => [value, 'Başvuru']}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})
