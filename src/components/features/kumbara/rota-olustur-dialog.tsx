'use client'

import { useState, useMemo } from 'react'
import { 
    MapPin, 
    Navigation, 
    Route, 
    ExternalLink, 
    CheckCircle2, 
    Circle,
    Loader2,
    Map,
    ArrowRight
} from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/utils'
import type { Kumbara, GpsKoordinat } from '@/types'

interface RotaOlusturDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kumbaras: Kumbara[]
}

// Haversine formülü ile iki nokta arası mesafe (km)
function calculateDistance(coord1: GpsKoordinat, coord2: GpsKoordinat): number {
    const R = 6371 // Dünya yarıçapı km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

// Basit Nearest Neighbor algoritması ile rota optimizasyonu
function optimizeRoute(kumbaras: Kumbara[], startCoord?: GpsKoordinat): Kumbara[] {
    if (kumbaras.length <= 1) return kumbaras
    
    const withCoords = kumbaras.filter(k => k.koordinat)
    const withoutCoords = kumbaras.filter(k => !k.koordinat)
    
    if (withCoords.length === 0) return kumbaras
    
    const result: Kumbara[] = []
    const remaining = [...withCoords]
    
    // Başlangıç noktası (mevcut konum veya ilk kumbara)
    let currentCoord = startCoord || withCoords[0].koordinat!
    
    while (remaining.length > 0) {
        // En yakın kumbarayı bul
        let nearestIndex = 0
        let nearestDistance = Infinity
        
        remaining.forEach((k, index) => {
            if (k.koordinat) {
                const dist = calculateDistance(currentCoord, k.koordinat)
                if (dist < nearestDistance) {
                    nearestDistance = dist
                    nearestIndex = index
                }
            }
        })
        
        const nearest = remaining.splice(nearestIndex, 1)[0]
        result.push(nearest)
        if (nearest.koordinat) {
            currentCoord = nearest.koordinat
        }
    }
    
    // Koordinatsız olanları sona ekle
    return [...result, ...withoutCoords]
}

export function RotaOlusturDialog({
    open,
    onOpenChange,
    kumbaras
}: RotaOlusturDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<GpsKoordinat | null>(null)
    const [isGettingLocation, setIsGettingLocation] = useState(false)

    // Aktif ve koordinatlı kumbaralar
    const activeKumbaras = useMemo(() => 
        kumbaras.filter(k => k.durum === 'aktif'),
        [kumbaras]
    )

    // Seçili kumbaralar
    const selectedKumbaras = useMemo(() => 
        activeKumbaras.filter(k => selectedIds.has(k.id)),
        [activeKumbaras, selectedIds]
    )

    // Optimize edilmiş rota
    const optimizedRoute = useMemo(() => 
        optimizeRoute(selectedKumbaras, currentLocation || undefined),
        [selectedKumbaras, currentLocation]
    )

    // Toplam tahmini mesafe
    const totalDistance = useMemo(() => {
        if (optimizedRoute.length < 2) return 0
        
        let total = 0
        let prevCoord = currentLocation
        
        optimizedRoute.forEach(k => {
            if (k.koordinat && prevCoord) {
                total += calculateDistance(prevCoord, k.koordinat)
            }
            if (k.koordinat) {
                prevCoord = k.koordinat
            }
        })
        
        return total
    }, [optimizedRoute, currentLocation])

    // Tümünü seç/kaldır
    const toggleAll = () => {
        if (selectedIds.size === activeKumbaras.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(activeKumbaras.map(k => k.id)))
        }
    }

    // Tek kumbara seç/kaldır
    const toggleKumbara = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    // Mevcut konumu al
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return
        
        setIsGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setIsGettingLocation(false)
            },
            () => {
                setIsGettingLocation(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    // Google Maps'te rotayı aç
    const openInGoogleMaps = () => {
        if (optimizedRoute.length === 0) return
        
        const waypoints = optimizedRoute
            .filter(k => k.koordinat)
            .map(k => `${k.koordinat!.lat},${k.koordinat!.lng}`)
        
        if (waypoints.length === 0) return
        
        let url = 'https://www.google.com/maps/dir/'
        
        // Başlangıç noktası (mevcut konum varsa)
        if (currentLocation) {
            url += `${currentLocation.lat},${currentLocation.lng}/`
        }
        
        // Tüm durakları ekle
        waypoints.forEach(wp => {
            url += `${wp}/`
        })
        
        window.open(url, '_blank')
    }

    // Toplam tahmini birikim
    const totalEstimatedAmount = selectedKumbaras.reduce((sum, k) => sum + k.toplamTutar, 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Toplama Rotası Oluştur
                    </DialogTitle>
                    <DialogDescription>
                        Toplamak istediğiniz kumbaraları seçin, sistem en verimli rotayı hesaplasın
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sol Panel - Kumbara Seçimi */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Kumbaralar</h3>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={toggleAll}
                            >
                                {selectedIds.size === activeKumbaras.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                            </Button>
                        </div>
                        
                        <ScrollArea className="h-[300px] border rounded-lg p-2">
                            <div className="space-y-2">
                                {activeKumbaras.map((kumbara) => (
                                    <Card 
                                        key={kumbara.id}
                                        className={`cursor-pointer transition-colors ${
                                            selectedIds.has(kumbara.id) ? 'border-primary bg-primary/5' : ''
                                        }`}
                                        onClick={() => toggleKumbara(kumbara.id)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox 
                                                    checked={selectedIds.has(kumbara.id)}
                                                    onCheckedChange={() => toggleKumbara(kumbara.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {kumbara.ad || kumbara.kod}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {kumbara.konum}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono text-sm font-medium text-primary">
                                                        {formatCurrency(kumbara.toplamTutar)}
                                                    </p>
                                                    {!kumbara.koordinat && (
                                                        <Badge variant="outline" className="text-xs">
                                                            GPS yok
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                {activeKumbaras.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aktif kumbara bulunmuyor
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Sağ Panel - Optimize Edilmiş Rota */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Optimize Edilmiş Rota</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                            >
                                {isGettingLocation ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Navigation className="h-4 w-4 mr-1" />
                                        {currentLocation ? 'Konum Alındı' : 'Konumumu Al'}
                                    </>
                                )}
                            </Button>
                        </div>

                        <ScrollArea className="h-[300px] border rounded-lg p-2">
                            {optimizedRoute.length > 0 ? (
                                <div className="space-y-1">
                                    {/* Başlangıç noktası */}
                                    {currentLocation && (
                                        <div className="flex items-center gap-3 p-2 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                <Navigation className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-muted-foreground">Mevcut Konumunuz</span>
                                        </div>
                                    )}
                                    
                                    {optimizedRoute.map((kumbara, index) => (
                                        <div key={kumbara.id}>
                                            {(index > 0 || currentLocation) && (
                                                <div className="flex items-center gap-3 py-1">
                                                    <div className="w-6 flex justify-center">
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {kumbara.ad || kumbara.kod}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {kumbara.konum}
                                                    </p>
                                                </div>
                                                <span className="font-mono text-sm">
                                                    {formatCurrency(kumbara.toplamTutar)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Map className="h-12 w-12 mb-2" />
                                    <p className="text-sm">Rota oluşturmak için kumbara seçin</p>
                                </div>
                            )}
                        </ScrollArea>

                        {/* İstatistikler */}
                        {optimizedRoute.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                <Card>
                                    <CardContent className="p-3 text-center">
                                        <p className="text-xs text-muted-foreground">Seçili Kumbara</p>
                                        <p className="text-lg font-bold">{optimizedRoute.length}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-3 text-center">
                                        <p className="text-xs text-muted-foreground">Tahmini Mesafe</p>
                                        <p className="text-lg font-bold">{totalDistance.toFixed(1)} km</p>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-2">
                                    <CardContent className="p-3 text-center">
                                        <p className="text-xs text-muted-foreground">Tahmini Toplam Birikim</p>
                                        <p className="text-xl font-bold text-primary">
                                            {formatCurrency(totalEstimatedAmount)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Kapat
                    </Button>
                    <Button 
                        onClick={openInGoogleMaps}
                        disabled={optimizedRoute.filter(k => k.koordinat).length === 0}
                        className="gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Google Maps'te Aç
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
