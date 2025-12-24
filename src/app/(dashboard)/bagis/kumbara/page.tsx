'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Banknote,
  History,
  MapPin,
  PiggyBank,
  Plus,
  QrCode,
  Route,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { KumbaraToplamaDialog } from '@/components/features/kumbara/kumbara-toplama-dialog'
import { RotaOlusturDialog } from '@/components/features/kumbara/rota-olustur-dialog'
import { YeniKumbaraDialog } from '@/components/features/kumbara/yeni-kumbara-dialog'

import { fetchKumbaras } from '@/lib/mock-service'
import { formatCurrency } from '@/lib/utils'
import type { Kumbara } from '@/types'

const statusLabels = {
  aktif: { label: 'Aktif', variant: 'success' as const },
  pasif: { label: 'Pasif', variant: 'secondary' as const },
  bakim: { label: 'Bakımda', variant: 'warning' as const },
}

export default function KumbaraPage() {
  const [yeniKumbaraOpen, setYeniKumbaraOpen] = useState(false)
  const [toplamaOpen, setToplamaOpen] = useState(false)
  const [rotaOpen, setRotaOpen] = useState(false)
  const [selectedKumbara, setSelectedKumbara] = useState<Kumbara | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['kumbaras'],
    queryFn: () => fetchKumbaras({ pageSize: 50 }),
  })

  // Memoize data array to prevent recalculation
  const kumbaras = useMemo(() => data?.data || [], [data?.data])

  // Memoize expensive calculations
  const stats = useMemo(
    () => ({
      activeCount: kumbaras.filter((k) => k.durum === 'aktif').length,
      totalAmount: kumbaras.reduce((sum, k) => sum + k.toplamTutar, 0),
      totalCollected: kumbaras.reduce(
        (sum, k) => sum + (k.toplamaBaşarina || 0),
        0
      ),
    }),
    [kumbaras]
  )

  const { activeCount, totalAmount, totalCollected } = stats

  // Kumbara kartına tıklandığında toplama dialogunu aç
  const handleKumbaraClick = (kumbara: Kumbara) => {
    setSelectedKumbara(kumbara)
    setToplamaOpen(true)
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kumbara Yönetimi"
          description="Bağış kumbaralarını takip edin ve yönetin"
        />
        <QueryError
          title="Kumbaralar Yüklenemedi"
          message="Kumbara listesi yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kumbara Yönetimi"
        description="Bağış kumbaralarını takip edin ve yönetin"
        action={
          <div className="flex items-center gap-2">
            {/* Rota Oluştur Butonu */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRotaOpen(true)
              }}
              className="gap-1.5"
            >
              <Route className="h-4 w-4" />
              <span className="hidden md:inline">Rota</span>
            </Button>

            {/* Kumbarayı Tara (Toplama) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedKumbara(null)
                setToplamaOpen(true)
              }}
              className="gap-1.5"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden md:inline">Tara</span>
            </Button>

            {/* Yeni Kumbara Ekle */}
            <Button
              size="sm"
              onClick={() => {
                setYeniKumbaraOpen(true)
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Ekle
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <PiggyBank className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Toplam Kumbara</p>
                <p className="text-2xl font-bold">{kumbaras.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 rounded-xl p-3">
                <PiggyBank className="text-success h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Aktif Kumbara</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-chart-4/10 rounded-xl p-3">
                <Banknote className="text-chart-4 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Mevcut Birikim</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-chart-2/10 rounded-xl p-3">
                <History className="text-chart-2 h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Toplam Toplanan</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalCollected)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tümü ({kumbaras.length})</TabsTrigger>
          <TabsTrigger value="aktif">
            Aktif ({kumbaras.filter((k) => k.durum === 'aktif').length})
          </TabsTrigger>
          <TabsTrigger value="bakim">
            Bakımda ({kumbaras.filter((k) => k.durum === 'bakim').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <KumbarasSkeleton />
          ) : (
            <KumbaraGrid
              kumbaras={kumbaras}
              onKumbaraClick={handleKumbaraClick}
            />
          )}
        </TabsContent>

        <TabsContent value="aktif" className="space-y-4">
          <KumbaraGrid
            kumbaras={kumbaras.filter((k) => k.durum === 'aktif')}
            onKumbaraClick={handleKumbaraClick}
          />
        </TabsContent>

        <TabsContent value="bakim" className="space-y-4">
          <KumbaraGrid
            kumbaras={kumbaras.filter((k) => k.durum === 'bakim')}
            onKumbaraClick={handleKumbaraClick}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <YeniKumbaraDialog
        open={yeniKumbaraOpen}
        onOpenChange={setYeniKumbaraOpen}
      />

      <KumbaraToplamaDialog
        open={toplamaOpen}
        onOpenChange={setToplamaOpen}
        initialKumbara={selectedKumbara}
      />

      <RotaOlusturDialog
        open={rotaOpen}
        onOpenChange={setRotaOpen}
        kumbaras={kumbaras}
      />
    </div>
  )
}

function KumbaraGrid({
  kumbaras,
  onKumbaraClick,
}: {
  kumbaras: Kumbara[]
  onKumbaraClick: (kumbara: Kumbara) => void
}) {
  if (kumbaras.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Bu kategoride kumbara bulunmuyor.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {kumbaras.map((kumbara) => (
        <Card
          key={kumbara.id}
          className="hover-glow hover:border-primary cursor-pointer transition-all"
          onClick={() => {
            onKumbaraClick(kumbara)
          }}
        >
          <CardContent className="space-y-1.5 p-3">
            <div className="flex items-start justify-between gap-1">
              <h4 className="flex-1 truncate text-xs font-semibold">
                {kumbara.ad || kumbara.kod}
              </h4>
              <Badge
                variant={
                  statusLabels[kumbara.durum as keyof typeof statusLabels]
                    .variant
                }
                className="text-2.5 shrink-0 px-1.5 py-0"
              >
                {statusLabels[kumbara.durum as keyof typeof statusLabels].label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-2.5 flex items-center gap-1 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{kumbara.konum}</span>
            </p>
            <div className="border-t pt-1">
              <p className="text-primary font-mono text-sm font-bold">
                {formatCurrency(kumbara.toplamTutar)}
              </p>
            </div>
            <div className="text-muted-foreground text-2.5 flex items-center justify-between">
              <span className="truncate">
                {kumbara.sorumlu.name.split(' ')[0]}
              </span>
              {kumbara.koordinat && (
                <MapPin className="text-success h-2.5 w-2.5" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function KumbarasSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-25" />
      ))}
    </div>
  )
}
