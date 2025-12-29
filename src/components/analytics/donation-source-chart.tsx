'use client'

import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from '@/components/shared/lazy-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDonationSourceDistribution } from '@/lib/analytics-service'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useChartExport } from '@/hooks/use-chart-export'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function DonationSourceChart() {
  const { chartRef, exportChart } = useChartExport('kaynak-dagilimi')
  const { data: distribution, isLoading } = useQuery({
    queryKey: ['donation-source-distribution'],
    queryFn: fetchDonationSourceDistribution,
  })

  return (
    <Card className="hover-glow border-border/50 shadow-sm lg:col-span-2" ref={chartRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Kaynak Dağılımı
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={exportChart}
          title="Grafiği İndir"
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="h-75 w-full md:w-1/2">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : distribution && distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution as unknown as Array<Record<string, unknown>>}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="total_amount"
                    nameKey="source"
                  >
                    {distribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
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
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Veri yok
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
             {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => (
                 <Skeleton key={i} className="h-8 w-full" />
               ))
             ) : distribution?.map((item, index) => (
               <div key={item.source} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/20">
                 <div
                   className="h-3 w-3 rounded-full shrink-0"
                   style={{ backgroundColor: COLORS[index % COLORS.length] }}
                 />
                 <div className="flex flex-col min-w-0">
                    <span className="text-muted-foreground truncate">{item.source}</span>
                    <span className="font-bold">{formatCurrency(item.total_amount)}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
