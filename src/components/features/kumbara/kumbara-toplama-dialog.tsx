'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Banknote, Calendar, Camera, MapPin, PiggyBank, QrCode, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { collectKumbara, fetchKumbaraByCode } from '@/lib/mock-service'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Kumbara } from '@/types'
import { QRScannerDialog } from './qr-scanner-dialog'

// Form validation schema
const toplamaFormSchema = z.object({
    tutar: z.number()
        .positive('Tutar 0\'dan büyük olmalıdır')
        .max(100000, 'Tutar çok yüksek'),
    notlar: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
})

type ToplamaFormData = z.infer<typeof toplamaFormSchema>

interface KumbaraToplamaDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    initialKumbara?: Kumbara | null
}

const statusLabels = {
    aktif: { label: 'Aktif', variant: 'success' as const },
    pasif: { label: 'Pasif', variant: 'secondary' as const },
    bakim: { label: 'Bakımda', variant: 'warning' as const }
}

export function KumbaraToplamaDialog({
    open,
    onOpenChange,
    onSuccess,
    initialKumbara
}: KumbaraToplamaDialogProps) {
    const [qrScannerOpen, setQrScannerOpen] = useState(false)
    const [selectedKumbara, setSelectedKumbara] = useState<Kumbara | null>(initialKumbara || null)
    const [isSearching, setIsSearching] = useState(false)
    const [currentStep, setCurrentStep] = useState<'scan' | 'collect'>('scan')
    
    const queryClient = useQueryClient()

    const form = useForm<ToplamaFormData>({
        resolver: zodResolver(toplamaFormSchema),
        defaultValues: {
            tutar: 0,
            notlar: '',
        },
    })

    // initialKumbara değiştiğinde güncelle
    useEffect(() => {
        if (initialKumbara) {
            setSelectedKumbara(initialKumbara)
            setCurrentStep('collect')
        }
    }, [initialKumbara])

    // Dialog açıldığında reset
    useEffect(() => {
        if (open && !initialKumbara) {
            form.reset()
            setSelectedKumbara(null)
            setCurrentStep('scan')
        }
    }, [open, initialKumbara, form])

    const { mutate, isPending } = useMutation({
        mutationFn: collectKumbara,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['kumbaras'] })
            toast.success('Toplama başarıyla kaydedildi', {
                description: `${formatCurrency(form.getValues('tutar'))} toplandı`
            })
            onOpenChange(false)
            form.reset()
            setSelectedKumbara(null)
            setCurrentStep('scan')
            onSuccess?.()
        },
        onError: (error) => {
            toast.error('Bir hata oluştu', {
                description: error.message
            })
        },
    })

    // QR Kod tarandığında - kumbarayı bul
    const handleQrScan = async (qrCode: string) => {
        setQrScannerOpen(false)
        setIsSearching(true)

        try {
            const kumbara = await fetchKumbaraByCode(qrCode)
            
            if (kumbara) {
                setSelectedKumbara(kumbara)
                setCurrentStep('collect')
                toast.success('Kumbara bulundu', {
                    description: kumbara.ad || kumbara.kod
                })
            } else {
                toast.error('Kumbara bulunamadı', {
                    description: `"${qrCode}" kodlu kumbara sistemde kayıtlı değil`
                })
            }
        } catch {
            toast.error('Arama hatası')
        } finally {
            setIsSearching(false)
        }
    }

    const onSubmit = (data: ToplamaFormData) => {
        if (!selectedKumbara) return

        mutate({
            kumbaraId: selectedKumbara.id,
            tutar: data.tutar,
            notlar: data.notlar,
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5" />
                            Kumbara Toplama
                        </DialogTitle>
                        <DialogDescription>
                            {currentStep === 'scan' 
                                ? 'Toplamak istediğiniz kumbaranın QR kodunu tarayın'
                                : 'Toplanan miktarı girin'}
                        </DialogDescription>
                    </DialogHeader>

                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12">
                            <Spinner className="h-12 w-12" />
                            <p className="text-muted-foreground">Kumbara aranıyor...</p>
                        </div>
                    ) : currentStep === 'scan' ? (
                        <div className="space-y-4 py-4">
                            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 rounded-lg">
                                <QrCode className="h-16 w-16 text-muted-foreground" />
                                <p className="text-center text-muted-foreground">
                                    Toplamak istediğiniz kumbaranın QR kodunu tarayın
                                </p>
                                <Button onClick={() => { setQrScannerOpen(true); }} className="gap-2">
                                    <Camera className="h-4 w-4" />
                                    Kumbarayı Tara
                                </Button>
                            </div>
                        </div>
                    ) : selectedKumbara ? (
                        <div className="space-y-4">
                            {/* Kumbara Bilgi Kartı */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <PiggyBank className="h-5 w-5 text-primary" />
                                                <h3 className="font-semibold truncate">
                                                    {selectedKumbara.ad || selectedKumbara.kod}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                                <MapPin className="h-3 w-3" />
                                                {selectedKumbara.konum}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate">{selectedKumbara.sorumlu.name}</span>
                                                </div>
                                                {selectedKumbara.sonBosaltma && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Son: {formatDate(selectedKumbara.sonBosaltma, 'dd MMM')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={statusLabels[selectedKumbara.durum].variant}>
                                                {statusLabels[selectedKumbara.durum].label}
                                            </Badge>
                                            <p className="text-lg font-mono font-semibold text-primary mt-2">
                                                {formatCurrency(selectedKumbara.toplamTutar)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Mevcut Birikim</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Toplama Formu */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="tutar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Toplanan Tutar (₺)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input 
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            className="pl-10 text-lg font-mono"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Kumbaradan toplanan para miktarını girin
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                                if (initialKumbara) {
                                                    onOpenChange(false)
                                                } else {
                                                    setSelectedKumbara(null)
                                                    setCurrentStep('scan')
                                                    form.reset()
                                                }
                                            }}
                                        >
                                            {initialKumbara ? 'İptal' : 'Geri'}
                                        </Button>
                                        <Button type="submit" disabled={form.getValues('tutar') <= 0} loading={isPending}>
                                            {isPending ? 'Kaydediliyor...' : 'Toplamayı Kaydet'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <QRScannerDialog
                open={qrScannerOpen}
                onOpenChange={setQrScannerOpen}
                onScan={handleQrScan}
                title="Kumbara QR Kodu Tara"
                description="Toplamak istediğiniz kumbaranın QR kodunu tarayın"
            />
        </>
    )
}
