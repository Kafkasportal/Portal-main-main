'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, QrCode, User, Camera, Navigation, Loader2, Printer, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { QRScannerDialog } from './qr-scanner-dialog'
import { createKumbara } from '@/lib/mock-service'
import type { GpsKoordinat } from '@/types'

const kumbaraFormSchema = z.object({
    qrKod: z.string().min(3, 'QR kod en az 3 karakter olmalıdır'),
    ad: z.string().min(2, 'Kumbara adı en az 2 karakter olmalıdır'),
    konum: z.string().min(5, 'Konum açıklaması en az 5 karakter olmalıdır'),
    koordinatLat: z.number().optional(),
    koordinatLng: z.number().optional(),
    sorumluId: z.string().min(1, 'Sorumlu seçiniz'),
    notlar: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
})

type KumbaraFormData = z.infer<typeof kumbaraFormSchema>

interface YeniKumbaraDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    initialQrCode?: string
}

// Mock sorumlular listesi
const MOCK_SORUMLULAR = [
    { id: '1', name: 'Ahmet Yılmaz' },
    { id: '2', name: 'Mehmet Demir' },
    { id: '3', name: 'Ali Kaya' },
    { id: '4', name: 'Fatma Şahin' },
]

// Otomatik QR kod üretici
function generateAutoQRCode(): string {
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `KMB-${year}-${random}`
}

export function YeniKumbaraDialog({
    open,
    onOpenChange,
    onSuccess,
    initialQrCode
}: YeniKumbaraDialogProps) {
    const [qrScannerOpen, setQrScannerOpen] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [currentStep, setCurrentStep] = useState<'scan' | 'form'>('scan')
    const [showPrintPreview, setShowPrintPreview] = useState(false)
    const [savedKumbaraData, setSavedKumbaraData] = useState<{ qrKod: string; ad: string; konum: string } | null>(null)
    const printRef = useRef<HTMLDivElement>(null)
    
    const queryClient = useQueryClient()

    const form = useForm<KumbaraFormData>({
        resolver: zodResolver(kumbaraFormSchema),
        defaultValues: {
            qrKod: initialQrCode || '',
            ad: '',
            konum: '',
            koordinatLat: undefined,
            koordinatLng: undefined,
            sorumluId: '',
            notlar: '',
        },
    })

    // initialQrCode değiştiğinde form'u güncelle
    useEffect(() => {
        if (initialQrCode) {
            form.setValue('qrKod', initialQrCode)
            setCurrentStep('form')
        }
    }, [initialQrCode, form])

    // Dialog açıldığında reset
    useEffect(() => {
        if (open && !initialQrCode) {
            form.reset()
            setCurrentStep('scan')
            setShowPrintPreview(false)
            setSavedKumbaraData(null)
        }
    }, [open, initialQrCode, form])

    const { mutate, isPending } = useMutation({
        mutationFn: createKumbara,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['kumbaras'] })
            toast.success('Kumbara başarıyla eklendi')
            
            // Print preview için verileri sakla
            setSavedKumbaraData({
                qrKod: variables.qrKod,
                ad: variables.ad,
                konum: variables.konum,
            })
            setShowPrintPreview(true)
            
            form.reset()
            setCurrentStep('scan')
            onSuccess?.()
        },
        onError: (error) => {
            toast.error('Bir hata oluştu', {
                description: error.message
            })
        },
    })

    // QR Kod tarandığında
    const handleQrScan = (qrCode: string) => {
        form.setValue('qrKod', qrCode)
        setQrScannerOpen(false)
        setCurrentStep('form')
        toast.success('QR kod tarandı', {
            description: `Kod: ${qrCode}`
        })
    }

    // Otomatik QR Kod üret
    const handleAutoGenerateQR = () => {
        const newQrCode = generateAutoQRCode()
        form.setValue('qrKod', newQrCode)
        setCurrentStep('form')
        toast.success('QR kod otomatik üretildi', {
            description: `Kod: ${newQrCode}`
        })
    }

    // QR Kod yazdır (40x40mm)
    const handlePrint = () => {
        if (!savedKumbaraData) return

        const printWindow = window.open('', '_blank', 'width=400,height=500')
        if (!printWindow) {
            toast.error('Yazdırma penceresi açılamadı')
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Kumbara QR - ${savedKumbaraData.qrKod}</title>
                <style>
                    @page {
                        size: 50mm 60mm;
                        margin: 5mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .qr-container {
                        width: 40mm;
                        height: 40mm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .qr-container img {
                        width: 100%;
                        height: 100%;
                    }
                    .label {
                        font-size: 8pt;
                        font-weight: bold;
                        margin-top: 2mm;
                        text-align: center;
                    }
                    .code {
                        font-size: 7pt;
                        margin-top: 1mm;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(savedKumbaraData.qrKod)}" alt="QR Code" />
                </div>
                <div class="label">${savedKumbaraData.ad}</div>
                <div class="code">${savedKumbaraData.qrKod}</div>
                <script>
                    document.querySelector('img').onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                </script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    // Dialog kapatıldığında print preview'ı da kapat
    const handleDialogClose = (isOpen: boolean) => {
        if (!isOpen) {
            setShowPrintPreview(false)
            setSavedKumbaraData(null)
        }
        onOpenChange(isOpen)
    }

    // GPS konumu al
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Tarayıcınız konum özelliğini desteklemiyor')
            return
        }

        setIsGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue('koordinatLat', position.coords.latitude)
                form.setValue('koordinatLng', position.coords.longitude)
                setIsGettingLocation(false)
                toast.success('Konum alındı', {
                    description: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                })
            },
            (error) => {
                setIsGettingLocation(false)
                let message = 'Konum alınamadı'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Konum izni reddedildi'
                        break
                    case error.POSITION_UNAVAILABLE:
                        message = 'Konum bilgisi mevcut değil'
                        break
                    case error.TIMEOUT:
                        message = 'Konum isteği zaman aşımına uğradı'
                        break
                }
                toast.error(message)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const onSubmit = (data: KumbaraFormData) => {
        const koordinat: GpsKoordinat | undefined = 
            data.koordinatLat && data.koordinatLng 
                ? { lat: data.koordinatLat, lng: data.koordinatLng }
                : undefined

        mutate({
            qrKod: data.qrKod,
            ad: data.ad,
            konum: data.konum,
            koordinat,
            sorumluId: data.sorumluId,
            notlar: data.notlar,
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-lg">
                    {showPrintPreview && savedKumbaraData ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-600">
                                    <QrCode className="h-5 w-5" />
                                    Kumbara Başarıyla Eklendi!
                                </DialogTitle>
                                <DialogDescription>
                                    QR kodu yazdırarak kumbaranın üzerine yapıştırabilirsiniz
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col items-center gap-4 py-6">
                                <div 
                                    ref={printRef}
                                    className="bg-white p-4 rounded-lg border-2 border-dashed border-muted"
                                    style={{ width: '160px', height: '160px' }}
                                >
                                    <QRCode 
                                        value={savedKumbaraData.qrKod}
                                        size={128}
                                        level="H"
                                    />
                                </div>
                                
                                <div className="text-center">
                                    <p className="font-semibold">{savedKumbaraData.ad}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{savedKumbaraData.qrKod}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{savedKumbaraData.konum}</p>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
                                    Etiket boyutu: 40mm x 40mm
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => handleDialogClose(false)}
                                >
                                    Kapat
                                </Button>
                                <Button onClick={handlePrint} className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    QR Kod Yazdır (40x40mm)
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Yeni Kumbara Ekle
                                </DialogTitle>
                                <DialogDescription>
                                    {currentStep === 'scan' 
                                        ? 'Otomatik QR kod üretin veya mevcut kodu tarayın'
                                        : 'Kumbara bilgilerini girin'}
                                </DialogDescription>
                            </DialogHeader>

                            {currentStep === 'scan' ? (
                                <div className="space-y-4 py-4">
                                    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-muted/50 rounded-lg">
                                        <QrCode className="h-12 w-12 text-muted-foreground" />
                                        <p className="text-center text-sm text-muted-foreground">
                                            Yeni kumbara için otomatik QR kod üretin
                                        </p>
                                        <Button onClick={handleAutoGenerateQR} className="gap-2" size="lg">
                                            <RefreshCw className="h-4 w-4" />
                                            Otomatik QR Kod Üret
                                        </Button>
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                veya
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 gap-2"
                                            onClick={() => setQrScannerOpen(true)}
                                        >
                                            <Camera className="h-4 w-4" />
                                            Mevcut QR Tara
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="flex-1"
                                            onClick={() => setCurrentStep('form')}
                                        >
                                            Manuel Kod Gir
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        {/* QR Kod */}
                                        <FormField
                                            control={form.control}
                                            name="qrKod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>QR Kod / Kumbara Kodu</FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="KMB-2025-XXXXXX" 
                                                                {...field} 
                                                                className="font-mono"
                                                            />
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newCode = generateAutoQRCode()
                                                                form.setValue('qrKod', newCode)
                                                                toast.success('Yeni kod üretildi', { description: newCode })
                                                            }}
                                                            title="Yeni kod üret"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kumbara Adı */}
                                        <FormField
                                            control={form.control}
                                            name="ad"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kumbara Adı</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Merkez Cami Kumbarası" 
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Kumbarayı tanımlayan bir isim verin
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Konum Açıklaması */}
                                        <FormField
                                            control={form.control}
                                            name="konum"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Konum Açıklaması</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Merkez Cami Girişi, Ana Kapı Yanı" 
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* GPS Koordinatları */}
                                        <div className="space-y-2">
                                            <FormLabel>GPS Koordinatları (Opsiyonel)</FormLabel>
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="koordinatLat"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input 
                                                                    type="number"
                                                                    step="any"
                                                                    placeholder="Enlem"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="koordinatLng"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input 
                                                                    type="number"
                                                                    step="any"
                                                                    placeholder="Boylam"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={getCurrentLocation}
                                                    disabled={isGettingLocation}
                                                >
                                                    {isGettingLocation ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Navigation className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Rota oluşturmak için konum bilgisi gereklidir
                                            </p>
                                        </div>

                                        {/* Sorumlu */}
                                        <FormField
                                            control={form.control}
                                            name="sorumluId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sorumlu Kişi</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sorumlu seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {MOCK_SORUMLULAR.map((sorumlu) => (
                                                                <SelectItem key={sorumlu.id} value={sorumlu.id}>
                                                                    {sorumlu.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Notlar */}
                                        <FormField
                                            control={form.control}
                                            name="notlar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            placeholder="Ek bilgiler..."
                                                            className="resize-none"
                                                            rows={2}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    if (initialQrCode) {
                                                        handleDialogClose(false)
                                                    } else {
                                                        setCurrentStep('scan')
                                                        form.reset()
                                                    }
                                                }}
                                            >
                                                {initialQrCode ? 'İptal' : 'Geri'}
                                            </Button>
                                            <Button type="submit" disabled={isPending}>
                                                {isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Kaydediliyor...
                                                    </>
                                                ) : (
                                                    'Kumbarayı Ekle'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <QRScannerDialog
                open={qrScannerOpen}
                onOpenChange={setQrScannerOpen}
                onScan={handleQrScan}
                title="Kumbara QR Kodu Tara"
                description="Mevcut kumbaranın QR kodunu tarayın"
            />
        </>
    )
}
