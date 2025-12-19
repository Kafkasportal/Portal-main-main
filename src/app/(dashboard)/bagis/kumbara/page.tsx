'use client'

import { useQuery } from '@tanstack/react-query'
import { PiggyBank, MapPin, Calendar, User } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchKumbaras } from '@/lib/mock-service'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusLabels = {
    aktif: { label: 'Aktif', variant: 'success' as const },
    pasif: { label: 'Pasif', variant: 'secondary' as const },
    bakim: { label: 'Bakımda', variant: 'warning' as const }
}

export default function KumbaraPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['kumbaras'],
        queryFn: () => fetchKumbaras({ pageSize: 50 })
    })

    const kumbaras = data?.data || []
    const activeCount = kumbaras.filter(k => k.durum === 'aktif').length
    const totalAmount = kumbaras.reduce((sum, k) => sum + k.toplamTutar, 0)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Kumbara Yönetimi"
                description="Bağış kumbaralarını takip edin ve yönetin"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <PiggyBank className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Toplam Kumbara</p>
                                <p className="text-2xl font-bold">{kumbaras.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-success/10">
                                <PiggyBank className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Aktif Kumbara</p>
                                <p className="text-2xl font-bold">{activeCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-chart-4/10">
                                <PiggyBank className="h-6 w-6 text-chart-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Toplam Birikim</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
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
                        Aktif ({kumbaras.filter(k => k.durum === 'aktif').length})
                    </TabsTrigger>
                    <TabsTrigger value="bakim">
                        Bakımda ({kumbaras.filter(k => k.durum === 'bakim').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {isLoading ? (
                        <KumbarasSkeleton />
                    ) : (
                        <KumbaraGrid kumbaras={kumbaras} />
                    )}
                </TabsContent>

                <TabsContent value="aktif" className="space-y-4">
                    <KumbaraGrid kumbaras={kumbaras.filter(k => k.durum === 'aktif')} />
                </TabsContent>

                <TabsContent value="bakim" className="space-y-4">
                    <KumbaraGrid kumbaras={kumbaras.filter(k => k.durum === 'bakim')} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function KumbaraGrid({ kumbaras }: { kumbaras: any[] }) {
    if (kumbaras.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Bu kategoride kumbara bulunmuyor.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kumbaras.map((kumbara) => (
                <Card key={kumbara.id} className="hover-glow cursor-pointer transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    {kumbara.kod}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {kumbara.konum}
                                </p>
                            </div>
                            <Badge variant={statusLabels[kumbara.durum as keyof typeof statusLabels].variant}>
                                {statusLabels[kumbara.durum as keyof typeof statusLabels].label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Birikim</span>
                            <span className="font-mono font-semibold text-primary">
                                {formatCurrency(kumbara.toplamTutar)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Sorumlu
                            </span>
                            <span>{kumbara.sorumlu.name}</span>
                        </div>
                        {kumbara.sonBosaltma && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Son Boşaltma
                                </span>
                                <span>{formatDate(kumbara.sonBosaltma)}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function KumbarasSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[180px]" />
            ))}
        </div>
    )
}
