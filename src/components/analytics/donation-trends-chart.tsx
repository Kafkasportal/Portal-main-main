'use client'

import { memo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/shared/lazy-chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDonationTrends } from '@/lib/analytics-service'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useChartExport } from '@/hooks/use-chart-export'

export const DonationTrendsChart = memo(function DonationTrendsChart() {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const { chartRef, exportChart } = useChartExport('bagis-trendleri')

  const { data: trends, isLoading } = useQuery({
    queryKey: ['donation-trends', period],
    queryFn: () => fetchDonationTrends(period),
  })

  // Format data for chart - reverse to show oldest to newest
  const chartData = [...(trends || [])].reverse().map(item => ({
    name: item.period,
    amount: item.total_amount,
    count: item.count
  }))

  return (
    <Card className="hover-glow border-border/50 shadow-sm" ref={chartRef}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Bağış Trendleri
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as 'monthly' | 'quarterly' | 'yearly')}
          >
            <SelectTrigger className="w-30 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="quarterly">Çeyreklik</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={exportChart}
            title="Grafiği İndir"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={500}
                  tickFormatter={(val) => {
                    // Simple formatter based on period length
                    if (val.length > 7) return val.slice(0, 7) // 2023-01
                    return val
                  }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={500}
                  tickFormatter={(value) =>
                    `₺${(value / 1000).toFixed(0)}K`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => {
                    const numValue = typeof value === 'number' ? value : Number(value)
                    return [formatCurrency(numValue), 'Tutar']
                  }}
                  labelFormatter={(label) => `Dönem: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTrends)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              Veri yok
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
