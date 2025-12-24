'use client'

import { Camera, QrCode, SwitchCamera, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface QRScannerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onScan: (qrCode: string) => void
    title?: string
    description?: string
}

export function QRScannerDialog({
    open,
    onOpenChange,
    onScan,
    title = "QR Kod Tara",
    description = "Kumbaranın üzerindeki QR kodu kameraya gösterin"
}: QRScannerDialogProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState('')
    const [, setHasPermission] = useState<boolean | null>(null)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
    
    const videoRef = useRef<HTMLVideoElement>(null)
    const readerRef = useRef<unknown>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Kamerayı durdur
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => { track.stop(); })
            streamRef.current = null
        }
        if (readerRef.current && typeof readerRef.current === 'object' && 'reset' in readerRef.current) {
            (readerRef.current as { reset: () => void }).reset()
        }
        setIsScanning(false)
    }, [])

    // Kamerayı başlat
    const startCamera = useCallback(async () => {
        setError(null)
        setIsScanning(true)

        try {
            // Kamera izni kontrolü
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            })
            
            streamRef.current = stream
            setHasPermission(true)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()

                // QR kod okuyucu başlat - lazy load @zxing/library
                const { BrowserMultiFormatReader, NotFoundException } = await import('@zxing/library')
                readerRef.current = new BrowserMultiFormatReader()

                const decode = async () => {
                    if (!videoRef.current || !readerRef.current || !isScanning) return

                    try {
                        const result = await (readerRef.current as { decodeFromVideoElement: (video: HTMLVideoElement) => Promise<{ getText: () => string }> }).decodeFromVideoElement(videoRef.current)
                        if (result) {
                            const qrCode = result.getText()
                            stopCamera()
                            onScan(qrCode)
                            onOpenChange(false)
                        }
                    } catch (err) {
                        if (!(err instanceof NotFoundException)) {
                            // QR decode error - silent in production
                        }
                        // Taramaya devam et
                        if (isScanning) {
                            requestAnimationFrame(decode)
                        }
                    }
                }

                void decode()
            }
        } catch {
            // Camera error - silent in production
            setHasPermission(false)
            setError('Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin.')
            setIsScanning(false)
        }
    }, [facingMode, isScanning, onScan, onOpenChange, stopCamera])

    // Dialog kapandığında kamerayı durdur
    const prevOpenRef = useRef(open)
    useEffect(() => {
        // Sadece open false'a değiştiğinde çalış
        if (prevOpenRef.current && !open) {
            stopCamera()
            setManualCode('')
            setError(null)
        }
        prevOpenRef.current = open
    }, [open, stopCamera])

    // Kamera değiştir
    const switchCamera = () => {
        stopCamera()
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    }

    // Manuel kod girişi
    const handleManualSubmit = () => {
        if (manualCode.trim()) {
            onScan(manualCode.trim())
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Kamera Görüntüsü */}
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                        {isScanning ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                {/* QR Çerçeve Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                                        {/* Tarama animasyonu */}
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse" 
                                             style={{ animation: 'scan 2s ease-in-out infinite' }} />
                                    </div>
                                </div>
                                {/* Kamera kontrolleri */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={switchCamera}
                                        className="rounded-full"
                                    >
                                        <SwitchCamera className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={stopCamera}
                                        className="rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <Camera className="h-16 w-16 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground text-center px-4">
                                    {error || "Kamerayı başlatmak için butona tıklayın"}
                                </p>
                                <Button onClick={startCamera} className="gap-2">
                                    <Camera className="h-4 w-4" />
                                    Kamerayı Başlat
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Hata mesajı */}
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Manuel Kod Girişi */}
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    veya manuel giriş
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Kumbara kodunu yazın (örn: KMB-2024-001)"
                                    value={manualCode}
                                    onChange={(e) => { setManualCode(e.target.value); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                />
                            </div>
                            <Button 
                                onClick={handleManualSubmit}
                                disabled={!manualCode.trim()}
                            >
                                Onayla
                            </Button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes scan {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(190px); }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    )
}
