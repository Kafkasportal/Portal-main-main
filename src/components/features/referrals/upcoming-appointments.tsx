'use client'

import { useReferrals } from '@/hooks/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function UpcomingAppointments() {
  const { data: referrals } = useReferrals({ status: 'scheduled' })
  
  // This is a simplified version. Ideally we'd have a specific API for global upcoming appointments.
  // For now, we show referrals that are in 'scheduled' status.

  return (
    <Card className="hover-glow border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Yaklaşan Randevular
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sosyal-yardim/hastane-sevk">
            Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referrals && referrals.length > 0 ? (
            referrals.slice(0, 3).map((referral) => (
              <div 
                key={referral.id} 
                className="p-3 rounded-lg border border-border/50 bg-muted/10 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{referral.beneficiary?.ad} {referral.beneficiary?.soyad}</p>
                    <p className="text-xs text-muted-foreground">{referral.hospital?.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {formatDate(referral.referralDate)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Hastane Sevki
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Clock className="h-3 w-3" />
                    İşlem Bekliyor
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm italic">
              Yakın zamanda planlanmış randevu bulunmuyor.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
