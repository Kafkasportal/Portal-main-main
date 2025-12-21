'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchApplicationById, updateApplicationStatus } from '@/lib/mock-service'
import { 
    AID_TYPE_LABELS,
    BASVURU_DURUMU_LABELS
} from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BasvuruDurumu } from '@/types'

const durumColors: Record<BasvuruDurumu, string> = {
    'beklemede': 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    'inceleniyor': 'bg-sky-500/15 text-sky-600 border-sky-500/25',
    'onaylandi': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    'reddedildi': 'bg-red-500/15 text-red-600 border-red-500/25',
    'odendi': 'bg-teal-500/15 text-teal-600 border-teal-500/25'
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: application, isLoading } = useQuery({
        queryKey: ['application', id],
        queryFn: () => fetchApplicationById(id),
        enabled: !!id
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ durum, notu }: { durum: BasvuruDurumu; notu?: string }) =>
            updateApplicationStatus(id, durum, notu),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application', id] })
            queryClient.invalidateQueries({ queryKey: ['applications'] })
            toast.success('Başvuru durumu başarıyla güncellendi')
        },
        onError: () => {
            toast.error('Başvuru durumu güncellenirken bir hata oluştu')
        }
    })

    const handleApprove = () => {
        updateStatusMutation.mutate({ durum: 'onaylandi' })
    }

    const handleReject = () => {
        updateStatusMutation.mutate({ durum: 'reddedildi', notu: 'Başvuru reddedildi' })
    }

    const handleReview = () => {
        updateStatusMutation.mutate({ durum: 'inceleniyor' })
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Başvuru bulunamadı</h2>
                <p className="text-muted-foreground">Aradığınız başvuru mevcut değil veya silinmiş olabilir.</p>
                <Button onClick={() => router.push('/sosyal-yardim/basvurular')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Başvurular Listesine Dön
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/sosyal-yardim/basvurular')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Başvuru Detayı</h1>
                        <p className="text-sm text-muted-foreground">ID: {application.id}</p>
                    </div>
                </div>
                <Badge className={durumColors[application.durum]}>
                    {BASVURU_DURUMU_LABELS[application.durum] || application.durum}
                </Badge>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2 flex-wrap">
                {application.durum === 'beklemede' && (
                    <>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleApprove}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Onayla
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleReject}
                            disabled={updateStatusMutation.isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reddet
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={handleReview}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            İncelemeye Al
                        </Button>
                    </>
                )}
                {application.durum === 'inceleniyor' && (
                    <>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleApprove}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Onayla
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleReject}
                            disabled={updateStatusMutation.isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reddet
                        </Button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Başvuran Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Başvuran Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Ad Soyad</p>
                            <p className="font-medium">
                                {application.basvuranKisi.ad} {application.basvuranKisi.soyad}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">TC Kimlik No</p>
                            <p className="font-mono">{application.basvuranKisi.tcKimlikNo}</p>
                        </div>
                        {application.basvuranKisi.telefon && (
                            <div>
                                <p className="text-sm text-muted-foreground">Telefon</p>
                                <p>{application.basvuranKisi.telefon}</p>
                            </div>
                        )}
                        {application.basvuranKisi.adres && (
                            <div>
                                <p className="text-sm text-muted-foreground">Adres</p>
                                <p>{application.basvuranKisi.adres}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Başvuru Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Başvuru Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Yardım Türü</p>
                            <Badge className="mt-1">
                                {AID_TYPE_LABELS[application.yardimTuru] || application.yardimTuru}
                            </Badge>
                        </div>
                        {application.talepEdilenTutar && (
                            <div>
                                <p className="text-sm text-muted-foreground">Talep Edilen Tutar</p>
                                <p className="font-mono font-semibold text-lg">
                                    {formatCurrency(application.talepEdilenTutar)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Başvuru Tarihi</p>
                            <p>{formatDate(application.createdAt)}</p>
                        </div>
                        {application.degerlendiren && (
                            <div>
                                <p className="text-sm text-muted-foreground">Değerlendiren</p>
                                <p>{application.degerlendiren.name}</p>
                            </div>
                        )}
                        {application.degerlendirmeNotu && (
                            <div>
                                <p className="text-sm text-muted-foreground">Değerlendirme Notu</p>
                                <p className="text-sm">{application.degerlendirmeNotu}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Belgeler */}
                {application.belgeler && application.belgeler.length > 0 && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Belgeler</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {application.belgeler.map((belge, index) => (
                                    <div key={index} className="border rounded-lg p-4 text-center">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm font-medium">{belge.tur}</p>
                                        {belge.uploadedAt && (
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(belge.uploadedAt)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
