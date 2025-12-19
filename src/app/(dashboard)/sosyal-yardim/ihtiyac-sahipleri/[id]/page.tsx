'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { 
    ArrowLeft, 
    Save, 
    X, 
    Printer, 
    History, 
    Link2,
    Camera,
    Trash2,
    Info,
    User,
    CreditCard,
    Plane,
    Heart,
    Briefcase,
    Users,
    FileText,
    Image,
    DollarSign,
    MessageSquare,
    Shield,
    AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { fetchBeneficiaryById, updateBeneficiary } from '@/lib/mock-service'
import { 
    IHTIYAC_SAHIBI_KATEGORI_LABELS,
    FON_BOLGESI_LABELS,
    DOSYA_BAGLANTISI_LABELS,
    KIMLIK_BELGESI_TURU_LABELS,
    PASAPORT_TURU_LABELS,
    VIZE_GIRIS_TURU_LABELS,
    MEDENI_HAL_LABELS,
    EGITIM_DURUMU_LABELS,
    IHTIYAC_DURUMU_LABELS,
    RIZA_BEYANI_LABELS,
    TELEFON_OPERATOR_KODLARI,
    TURKISH_CITIES,
    ISTANBUL_REGIONS,
    COUNTRIES
} from '@/lib/constants'
import type { IhtiyacSahibi } from '@/types'

// Bağlantılı Kayıt Butonu
function LinkedRecordButton({
    icon: Icon,
    label,
    count
}: {
    icon: React.ElementType
    label: string
    count?: number
}) {
    return (
        <Button
            variant="outline"
            className="h-auto py-3 px-4 justify-start gap-3 bg-muted/50 border-border hover:bg-muted hover:border-border text-foreground relative"
        >
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-sm">{label}</span>
            {count !== undefined && count > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center text-[10px] p-0"
                >
                    {count}
                </Badge>
            )}
        </Button>
    )
}

// Bölüm Başlığı
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-foreground">{children}</h3>
            <Separator className="flex-1" />
        </div>
    )
}

export default function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const resolvedParams = use(params)
    const isNew = resolvedParams.id === 'yeni'
    const [hasChanges, setHasChanges] = useState(false)
    const [deleteChecked, setDeleteChecked] = useState(false)

    const { data: beneficiary, isLoading } = useQuery({
        queryKey: ['beneficiary', resolvedParams.id],
        queryFn: () => fetchBeneficiaryById(resolvedParams.id),
        enabled: !isNew
    })

    const updateMutation = useMutation({
        mutationFn: (data: Partial<IhtiyacSahibi>) => updateBeneficiary(resolvedParams.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['beneficiary', resolvedParams.id] })
            queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
            toast.success('Kayıt başarıyla güncellendi')
            setHasChanges(false)
        },
        onError: () => {
            toast.error('Kayıt güncellenirken bir hata oluştu')
        }
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-4 gap-6">
                    <Skeleton className="h-[600px] col-span-1" />
                    <Skeleton className="h-[600px] col-span-3" />
                </div>
            </div>
        )
    }

    if (!beneficiary && !isNew) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Kayıt Bulunamadı</h2>
                <p className="text-muted-foreground">İstenen ihtiyaç sahibi kaydı bulunamadı.</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Geri Dön
                </Button>
            </div>
        )
    }

    const data = beneficiary!

    return (
        <div className="space-y-4 relative">
            {/* Sağ Üst Köşe Sabit Butonlar - Scroll edilse bile görünür */}
            <div className="fixed top-28 right-6 z-[100] flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg" style={{ position: 'fixed' }}>
                    <Button
                        disabled={!hasChanges || updateMutation.isPending}
                        onClick={() => updateMutation.mutate({})}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={() => router.push('/sosyal-yardim/ihtiyac-sahipleri')}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Kapat
                    </Button>
                    <div className="w-px h-8 bg-border" />
                    <Button variant="ghost" size="icon" title="Yazdır">
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Link2 className="mr-1 h-4 w-4" />
                        Kart Birleştirme
                    </Button>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <History className="mr-1 h-4 w-4" />
                        İşlem Geçmişi
                    </Button>
                    <div className="w-px h-8 bg-border" />
                    <Button variant="ghost" size="icon" onClick={() => router.back()} title="Geri">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>

            {/* Sayfa Başlığı */}
            <div className="pr-[500px]">
                <h1 className="text-xl font-bold">
                    İhtiyaç Sahibi Kişi ID # {data.id.slice(0, 8)}
                </h1>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sol Panel - Fotoğraf ve Bağlantılı Kayıtlar */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {/* Fotoğraf Alanı */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-border">
                                {data.fotografUrl ? (
                                    <img src={data.fotografUrl} alt="Fotoğraf" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <User className="h-16 w-16 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Fotoğraf yüklenmedi</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Camera className="mr-1 h-3 w-3" />
                                    Çek
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Kaldır
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sponsorluk Tipi */}
                    <Card>
                        <CardContent className="p-4">
                            <Label className="text-sm text-muted-foreground mb-2 block">Sponsorluk Tipi</Label>
                            <Select defaultValue={data.sponsorlukTipi}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bireysel">Bireysel Sponsor</SelectItem>
                                    <SelectItem value="kurumsal">Kurumsal Sponsor</SelectItem>
                                    <SelectItem value="yok">Sponsor Yok</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Bağlantılı Kayıtlar */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Bağlantılı Kayıtlar</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                <LinkedRecordButton icon={CreditCard} label="Banka Hesapları" count={data.baglantiliKayitlar?.bankaHesaplari} />
                                <LinkedRecordButton icon={FileText} label="Dokümanlar" count={data.baglantiliKayitlar?.dokumanlar} />
                                <LinkedRecordButton icon={Image} label="Fotoğraflar" count={data.baglantiliKayitlar?.fotograflar} />
                                <LinkedRecordButton icon={Users} label="Baktığı Yetimler" count={data.baglantiliKayitlar?.baktigiYetimler} />
                                <LinkedRecordButton icon={Users} label="Baktığı Kişiler" count={data.baglantiliKayitlar?.baktigiKisiler} />
                                <LinkedRecordButton icon={Heart} label="Sponsorlar" count={data.baglantiliKayitlar?.sponsorlar} />
                                <LinkedRecordButton icon={User} label="Referanslar" count={data.baglantiliKayitlar?.referanslar} />
                                <LinkedRecordButton icon={MessageSquare} label="Görüşme Kayıtları" count={data.baglantiliKayitlar?.gorusmeKayitlari} />
                                <LinkedRecordButton icon={History} label="Görüşme Seans" count={data.baglantiliKayitlar?.gorusmeSeansTakibi} />
                                <LinkedRecordButton icon={DollarSign} label="Yardım Talepleri" count={data.baglantiliKayitlar?.yardimTalepleri} />
                                <LinkedRecordButton icon={DollarSign} label="Yapılan Yardımlar" count={data.baglantiliKayitlar?.yapilanYardimlar} />
                                <LinkedRecordButton icon={Shield} label="Rıza Beyanları" count={data.baglantiliKayitlar?.rizaBeyannamesi} />
                                <LinkedRecordButton icon={CreditCard} label="Sosyal Kartlar" count={data.baglantiliKayitlar?.sosyalKartlar} />
                                <LinkedRecordButton icon={FileText} label="Kart Özeti" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Panel - Form Bölümleri */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    {/* BÖLÜM 1: TEMEL BİLGİLER */}
                    <Card>
                        <CardContent className="p-6">
                            <SectionTitle>Temel Bilgiler</SectionTitle>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Sol Sütun */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Ad *</Label>
                                        <Input defaultValue={data.ad} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Soyad *</Label>
                                        <Input defaultValue={data.soyad} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Uyruk *</Label>
                                        <div className="flex gap-2">
                                            <Input value={data.uyruk} readOnly className="bg-muted" />
                                            <Button variant="outline" size="icon">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kimlik No</Label>
                                        <Input defaultValue={data.tcKimlikNo || data.yabanciKimlikNo} onChange={() => setHasChanges(true)} />
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Checkbox id="mernis" defaultChecked={data.mernisDogrulama} />
                                            <Label htmlFor="mernis" className="text-xs cursor-pointer">Mernis Kontrolü Yap</Label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kategori *</Label>
                                        <Select defaultValue={data.kategori} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(IHTIYAC_SAHIBI_KATEGORI_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fon Bölgesi</Label>
                                        <Select defaultValue={data.fonBolgesi} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(FON_BOLGESI_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dosya Bağlantısı</Label>
                                        <Select defaultValue={data.dosyaBaglantisi} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(DOSYA_BAGLANTISI_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dosya Numarası</Label>
                                        <div className="flex gap-2">
                                            <Input value={data.dosyaNo.split('-')[0] || ''} readOnly className="w-20 bg-muted" />
                                            <Input defaultValue={data.dosyaNo.split('-').slice(1).join('-')} onChange={() => setHasChanges(true)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Orta Sütun */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Cep Telefonu</Label>
                                        <div className="flex gap-2">
                                            <Select defaultValue={data.cepTelefonuOperator} onValueChange={() => setHasChanges(true)}>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue placeholder="Kod" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TELEFON_OPERATOR_KODLARI.map(kod => (
                                                        <SelectItem key={kod} value={kod}>{kod}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input 
                                                placeholder="XXX XX XX" 
                                                defaultValue={data.cepTelefonu} 
                                                onChange={() => setHasChanges(true)}
                                                className="flex-1" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sabit Telefon</Label>
                                        <Input defaultValue={data.sabitTelefon} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Yurtdışı Telefon</Label>
                                        <Input defaultValue={data.yurtdisiTelefon} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>e-Posta Adresi</Label>
                                        <Input type="email" defaultValue={data.email} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bağlı Yetim</Label>
                                        <div className="flex gap-2">
                                            <Input value="-" readOnly className="bg-muted" />
                                            <Button variant="outline" size="icon">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bağlı Kart</Label>
                                        <div className="flex gap-2">
                                            <Input value="-" readOnly className="bg-muted" />
                                            <Button variant="outline" size="icon">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ailedeki Kişi Sayısı</Label>
                                        <Select defaultValue={String(data.aileHaneBilgileri?.ailedekiKisiSayisi || '1')} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Yok</SelectItem>
                                                {Array.from({ length: 20 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Sağ Sütun */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Ülke *</Label>
                                        <Select defaultValue={data.ulke} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map(country => (
                                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Şehir / Bölge *</Label>
                                        <Select defaultValue={data.sehir} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ISTANBUL_REGIONS.map(region => (
                                                    <SelectItem key={region} value={region}>{region}</SelectItem>
                                                ))}
                                                {TURKISH_CITIES.filter(c => !c.includes('İstanbul')).map(city => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Yerleşim</Label>
                                        <Select defaultValue={data.ilce} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="İlçe seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={data.ilce || 'ilce'}>{data.ilce || 'Seçiniz'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mahalle / Köy</Label>
                                        <Select defaultValue={data.mahalle} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Mahalle seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={data.mahalle || 'mahalle'}>{data.mahalle || 'Seçiniz'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Adres</Label>
                                        <Textarea 
                                            defaultValue={data.adres} 
                                            onChange={() => setHasChanges(true)}
                                            className="min-h-[100px]" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rıza Beyanı</Label>
                                        <Input 
                                            value={RIZA_BEYANI_LABELS[data.rizaBeyaniDurumu]} 
                                            readOnly 
                                            className="bg-muted" 
                                        />
                                    </div>
                                    
                                    {/* Durum Radio */}
                                    <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                                        <div className="flex items-center gap-6">
                                            <Label className="text-sm font-medium">Durum:</Label>
                                            <Badge variant={data.durum === 'aktif' ? 'default' : 'secondary'}>
                                                {IHTIYAC_DURUMU_LABELS[data.durum]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="delete" 
                                                checked={deleteChecked}
                                                onCheckedChange={(checked) => setDeleteChecked(checked as boolean)}
                                            />
                                            <Label htmlFor="delete" className="text-sm cursor-pointer text-destructive">
                                                Kaydı Sil
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BÖLÜM 2: KİMLİK BİLGİLERİ */}
                    <Card>
                        <CardContent className="p-6">
                            <SectionTitle>Kimlik Bilgileri</SectionTitle>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Sütun 1 */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Baba Adı</Label>
                                        <Input defaultValue={data.kimlikBilgileri?.babaAdi} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Anne Adı</Label>
                                        <Input defaultValue={data.kimlikBilgileri?.anneAdi} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kimlik Belgesi Türü</Label>
                                        <Select defaultValue={data.kimlikBilgileri?.belgeTuru} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(KIMLIK_BELGESI_TURU_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Geçerlilik / Veriliş Tarihi</Label>
                                        <Input 
                                            type="date" 
                                            defaultValue={data.kimlikBilgileri?.belgeGecerlilikTarihi?.toISOString().split('T')[0]} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Seri Numarası</Label>
                                        <Input defaultValue={data.kimlikBilgileri?.seriNumarasi} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Önceki Uyruğu (Varsa)</Label>
                                        <Select defaultValue={data.kimlikBilgileri?.oncekiUyruk} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Yok" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yok">Yok</SelectItem>
                                                {COUNTRIES.map(country => (
                                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Önceki İsmi (Varsa)</Label>
                                        <Input defaultValue={data.kimlikBilgileri?.oncekiIsim} onChange={() => setHasChanges(true)} />
                                    </div>
                                </div>

                                {/* Sütun 2 - Pasaport ve Vize */}
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <Plane className="h-4 w-4" />
                                        Pasaport ve Vize
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pasaport Türü</Label>
                                        <Select defaultValue={data.pasaportVizeBilgileri?.pasaportTuru} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(PASAPORT_TURU_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pasaport Numarası</Label>
                                        <div className="flex gap-2">
                                            <Input defaultValue={data.pasaportVizeBilgileri?.pasaportNumarasi} onChange={() => setHasChanges(true)} />
                                            <Button variant="outline" size="icon" className="text-amber-500">
                                                <AlertCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pasaport Geçerlilik Tarihi</Label>
                                        <Input 
                                            type="date" 
                                            defaultValue={data.pasaportVizeBilgileri?.pasaportGecerlilikTarihi?.toISOString().split('T')[0]}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vize / Giriş Türü</Label>
                                        <Select defaultValue={data.pasaportVizeBilgileri?.vizeGirisTuru} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(VIZE_GIRIS_TURU_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vize Bitiş Tarihi</Label>
                                        <Input 
                                            type="date" 
                                            defaultValue={data.pasaportVizeBilgileri?.vizeBitisTarihi?.toISOString().split('T')[0]}
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>

                                {/* Sütun 3 - Sağlık */}
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <Heart className="h-4 w-4" />
                                        Sağlık Bilgileri
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kan Grubu</Label>
                                        <Select defaultValue={data.saglikBilgileri?.kanGrubu} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map(kan => (
                                                    <SelectItem key={kan} value={kan}>{kan}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kronik Hastalık</Label>
                                        <Input defaultValue={data.saglikBilgileri?.kronikHastalik} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Engel Durumu</Label>
                                        <Input defaultValue={data.saglikBilgileri?.engelDurumu} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Engel Oranı (%)</Label>
                                        <Input 
                                            type="number" 
                                            min={0} 
                                            max={100}
                                            defaultValue={data.saglikBilgileri?.engelOrani} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sürekli Kullanılan İlaç</Label>
                                        <Input defaultValue={data.saglikBilgileri?.surekliIlac} onChange={() => setHasChanges(true)} />
                                    </div>
                                </div>

                                {/* Sütun 4 - Ekonomik Durum */}
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Ekonomik Durum
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Eğitim Durumu</Label>
                                        <Select defaultValue={data.ekonomikDurum?.egitimDurumu} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(EGITIM_DURUMU_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Meslek</Label>
                                        <Input defaultValue={data.ekonomikDurum?.meslek} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Çalışma Durumu</Label>
                                        <Select defaultValue={data.ekonomikDurum?.calismaDurumu} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Çalışıyor">Çalışıyor</SelectItem>
                                                <SelectItem value="Çalışmıyor">Çalışmıyor</SelectItem>
                                                <SelectItem value="Emekli">Emekli</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aylık Gelir (TL)</Label>
                                        <Input 
                                            type="number" 
                                            defaultValue={data.ekonomikDurum?.aylikGelir} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Konut Durumu</Label>
                                        <Select defaultValue={data.ekonomikDurum?.konutDurumu} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kira">Kiracı</SelectItem>
                                                <SelectItem value="ev-sahibi">Ev Sahibi</SelectItem>
                                                <SelectItem value="misafir">Misafir</SelectItem>
                                                <SelectItem value="barinma-merkezi">Barınma Merkezi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kira Tutarı (TL)</Label>
                                        <Input 
                                            type="number" 
                                            defaultValue={data.ekonomikDurum?.kiraTutari} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BÖLÜM 3: AİLE BİLGİLERİ */}
                    <Card>
                        <CardContent className="p-6">
                            <SectionTitle>Aile ve Hane Bilgileri</SectionTitle>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Medeni Hal</Label>
                                        <Select defaultValue={data.aileHaneBilgileri?.medeniHal} onValueChange={() => setHasChanges(true)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(MEDENI_HAL_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Eş Adı</Label>
                                        <Input defaultValue={data.aileHaneBilgileri?.esAdi} onChange={() => setHasChanges(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Eş Telefonu</Label>
                                        <Input defaultValue={data.aileHaneBilgileri?.esTelefon} onChange={() => setHasChanges(true)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Ailedeki Kişi Sayısı</Label>
                                        <Input 
                                            type="number" 
                                            min={1}
                                            defaultValue={data.aileHaneBilgileri?.ailedekiKisiSayisi} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Çocuk Sayısı</Label>
                                        <Input 
                                            type="number" 
                                            min={0}
                                            defaultValue={data.aileHaneBilgileri?.cocukSayisi} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Yetim Sayısı</Label>
                                        <Input 
                                            type="number" 
                                            min={0}
                                            defaultValue={data.aileHaneBilgileri?.yetimSayisi} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Çalışan Sayısı</Label>
                                        <Input 
                                            type="number" 
                                            min={0}
                                            defaultValue={data.aileHaneBilgileri?.calısanSayisi} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bakmakla Yükümlü Sayısı</Label>
                                        <Input 
                                            type="number" 
                                            min={0}
                                            defaultValue={data.aileHaneBilgileri?.bakmaklaYukumluSayisi} 
                                            onChange={() => setHasChanges(true)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BÖLÜM 4: NOTLAR */}
                    <Card>
                        <CardContent className="p-6">
                            <SectionTitle>Ek Notlar</SectionTitle>
                            <Textarea 
                                defaultValue={data.notlar}
                                onChange={() => setHasChanges(true)}
                                className="min-h-[150px]"
                                placeholder="İhtiyaç sahibi ile ilgili ek notlar..."
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
