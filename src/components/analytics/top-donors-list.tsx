'use client'

import { useQuery } from '@tanstack/react-query'
import { Trophy, Calendar, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchTopDonors } from '@/lib/analytics-service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function TopDonorsList() {
  const { data: donors, isLoading } = useQuery({
    queryKey: ['top-donors'],
    queryFn: () => fetchTopDonors(5),
  })

  return (
    <Card className="hover-glow border-border/50 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          En Çok Bağış Yapanlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : donors && donors.length > 0 ? (
          <div className="space-y-4">
            {donors.map((donor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 
                      index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500' :
                      'bg-muted text-muted-foreground'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{donor.donor_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {donor.donation_count} Bağış
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(donor.last_donation_date)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm font-bold ml-2">
                  {formatCurrency(donor.total_amount)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-40 items-center justify-center">
            Veri yok
          </div>
        )}
      </CardContent>
    </Card>
  )
}
