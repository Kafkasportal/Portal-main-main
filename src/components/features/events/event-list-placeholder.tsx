'use client'

import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'Geleneksel Kafkas Festivali',
    date: '2024-06-15',
    time: '14:00',
    location: 'Kafkasder Kültür Merkezi',
    attendees: 120,
    category: 'Kültür',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    title: 'Yardımlaşma Kermesi',
    date: '2024-05-20',
    time: '10:00',
    location: 'Şehir Meydanı',
    attendees: 85,
    category: 'Yardım',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1561489404-5857242d558d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    title: 'Dil Kursu Tanıtım Toplantısı',
    date: '2024-05-10',
    time: '19:00',
    location: 'Seminer Salonu A',
    attendees: 45,
    category: 'Eğitim',
    status: 'past',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
  },
]

export function EventListPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Etkinlikler</h2>
          <p className="text-muted-foreground">
            Dernek etkinliklerini buradan planlayabilir ve yönetebilirsiniz.
          </p>
        </div>
        <Button className="hover-glow shadow-md">
          <Calendar className="mr-2 h-4 w-4" />
          Yeni Etkinlik Oluştur
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {UPCOMING_EVENTS.map((event, index) => (
          <Card 
            key={event.id} 
            className="hover-glow group overflow-hidden border-border/50 shadow-sm transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="aspect-video w-full overflow-hidden bg-muted/20 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={event.image} 
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'} className="shadow-sm">
                  {event.status === 'upcoming' ? 'Yaklaşan' : 'Tamamlanan'}
                </Badge>
              </div>
            </div>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="w-fit">
                  {event.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {event.time}
                </span>
              </div>
              <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  <span>{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/70" />
                  <span>{event.attendees} Katılımcı</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <Button variant="ghost" size="sm" className="bg-muted/50 hover:bg-primary/10 hover:text-primary w-full group-hover/btn:translate-x-1" asChild>
                  <Link href={`/etkinlikler/${event.id}`}>
                    Detayları Gör
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State Example */}
      <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center bg-muted/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Daha fazla etkinlik planlayın</h3>
        <p className="text-muted-foreground max-w-sm mt-1 mb-4 text-sm">
          Topluluğu bir araya getirmek için yeni etkinlikler oluşturun.
        </p>
        <Button variant="outline">
          Tüm Geçmiş Etkinlikler
        </Button>
      </Card>
    </div>
  )
}
