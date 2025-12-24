'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Camera,
  CreditCard,
  DollarSign,
  FileText,
  Heart,
  History,
  Image,
  Info,
  Link2,
  MessageSquare,
  Plane,
  Printer,
  Save,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import {
  COUNTRIES,
  DOSYA_BAGLANTISI_LABELS,
  EGITIM_DURUMU_LABELS,
  FON_BOLGESI_LABELS,
  IHTIYAC_DURUMU_LABELS,
  IHTIYAC_SAHIBI_KATEGORI_LABELS,
  ISTANBUL_REGIONS,
  KIMLIK_BELGESI_TURU_LABELS,
  MEDENI_HAL_LABELS,
  PASAPORT_TURU_LABELS,
  RIZA_BEYANI_LABELS,
  TELEFON_OPERATOR_KODLARI,
  TURKISH_CITIES,
  VIZE_GIRIS_TURU_LABELS,
} from '@/lib/constants'
import {
  fetchBeneficiaryById,
  fetchDependentPersons,
  updateBeneficiary,
} from '@/lib/supabase-service'
import { beneficiarySchema, type BeneficiaryFormData } from '@/lib/validators'

// Bağlantılı Kayıt Butonu
function LinkedRecordButton({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: React.ElementType
  label: string
  count?: number
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      className="bg-muted/50 border-border hover:bg-muted hover:border-border text-foreground relative h-auto justify-start gap-3 px-4 py-3"
      onClick={onClick}
    >
      <Icon className="text-primary h-4 w-4" />
      <span className="text-sm">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge
          variant="destructive"
          className="text-2.5 absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center p-0"
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
    <div className="mb-4 flex items-center gap-3">
      <h3 className="text-foreground text-lg font-semibold">{children}</h3>
      <Separator className="flex-1" />
    </div>
  )
}

// Bağlantılı Kayıt Sheet
function LinkedRecordSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

export default function BeneficiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap params immediately to avoid serialization issues
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = id === 'yeni'
  const [, setHasChanges] = useState(false)
  const [deleteChecked, setDeleteChecked] = useState(false)
  const [activeSheet, setActiveSheet] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: beneficiary, isLoading } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => fetchBeneficiaryById(id),
    enabled: !isNew,
  })

  // Bağımlı kişiler için query
  const { data: dependentPersons, isLoading: isLoadingDependents } = useQuery({
    queryKey: ['dependent-persons', id],
    queryFn: () => fetchDependentPersons(id),
    enabled: !isNew && beneficiary?.tur === 'ihtiyac-sahibi-kisi',
  })

  // React Hook Form setup
  const defaultDurum: 'aktif' | 'pasif' | 'arsiv' = (beneficiary?.durum ??
    'aktif') as 'aktif' | 'pasif' | 'arsiv'
  // Map IhtiyacSahibiKategori to form schema kategori
  const mapKategoriToFormSchema = (
    kategori?: string
  ): 'yetiskin' | 'cocuk' | 'yetim' | 'saglik' | 'egitim' | 'engelli' => {
    if (!kategori) return 'yetiskin'
    // Simple mapping - you can expand this based on business logic
    if (kategori.includes('yetim') || kategori.includes('ogrenci'))
      return 'yetim'
    if (kategori.includes('multeci') || kategori.includes('ozel'))
      return 'cocuk'
    return 'yetiskin'
  }

  const defaultValues = {
    ad: beneficiary?.ad ?? '',
    soyad: beneficiary?.soyad ?? '',
    uyruk: beneficiary?.uyruk ?? '',
    tcKimlikNo: beneficiary?.tcKimlikNo,
    yabanciKimlikNo: beneficiary?.yabanciKimlikNo,
    kategori: mapKategoriToFormSchema(beneficiary?.kategori),
    fonBolgesi: beneficiary?.fonBolgesi,
    dosyaBaglantisi: beneficiary?.dosyaBaglantisi,
    cepTelefonu: beneficiary?.cepTelefonu,
    cepTelefonuOperator: beneficiary?.cepTelefonuOperator,
    sabitTelefon: beneficiary?.sabitTelefon,
    yurtdisiTelefon: beneficiary?.yurtdisiTelefon,
    email: beneficiary?.email ?? '',
    ulke: beneficiary?.ulke ?? '',
    sehir: beneficiary?.sehir ?? '',
    ilce: beneficiary?.ilce,
    mahalle: beneficiary?.mahalle,
    adres: beneficiary?.adres,
    kimlikBilgileri: beneficiary?.kimlikBilgileri,
    pasaportVizeBilgileri: beneficiary?.pasaportVizeBilgileri,
    saglikBilgileri: beneficiary?.saglikBilgileri,
    ekonomikDurum: beneficiary?.ekonomikDurum,
    aileHaneBilgileri: beneficiary?.aileHaneBilgileri,
    sponsorlukTipi: beneficiary?.sponsorlukTipi,
    durum: defaultDurum,
    rizaBeyaniDurumu: beneficiary?.rizaBeyaniDurumu,
    notlar: beneficiary?.notlar,
  } satisfies Partial<BeneficiaryFormData>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues,
  })

  const {
    formState: { isDirty, isSubmitting, errors: formErrors },
    handleSubmit,
    reset,
    setValue,
    register,
  } = form

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = formErrors as Record<string, any>

  // Reset form when beneficiary data loads
  useEffect(() => {
    if (beneficiary) {
      reset({
        ad: beneficiary.ad,
        soyad: beneficiary.soyad,
        uyruk: beneficiary.uyruk,
        tcKimlikNo: beneficiary.tcKimlikNo,
        yabanciKimlikNo: beneficiary.yabanciKimlikNo,
        kategori: beneficiary.kategori,
        fonBolgesi: beneficiary.fonBolgesi,
        dosyaBaglantisi: beneficiary.dosyaBaglantisi,
        cepTelefonu: beneficiary.cepTelefonu,
        cepTelefonuOperator: beneficiary.cepTelefonuOperator,
        sabitTelefon: beneficiary.sabitTelefon,
        yurtdisiTelefon: beneficiary.yurtdisiTelefon,
        email: beneficiary.email,
        ulke: beneficiary.ulke,
        sehir: beneficiary.sehir,
        ilce: beneficiary.ilce,
        mahalle: beneficiary.mahalle,
        adres: beneficiary.adres,
        kimlikBilgileri: beneficiary.kimlikBilgileri,
        pasaportVizeBilgileri: beneficiary.pasaportVizeBilgileri,
        saglikBilgileri: beneficiary.saglikBilgileri,
        ekonomikDurum: beneficiary.ekonomikDurum,
        aileHaneBilgileri: beneficiary.aileHaneBilgileri,
        sponsorlukTipi: beneficiary.sponsorlukTipi,
        durum: beneficiary.durum,
        rizaBeyaniDurumu: beneficiary.rizaBeyaniDurumu,
        notlar: beneficiary.notlar,
      })
    }
  }, [beneficiary, reset])

  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => updateBeneficiary(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['beneficiary', id] })
      void queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      toast.success('Kayıt başarıyla güncellendi')
      reset(undefined, { keepValues: true })
    },
    onError: () => {
      toast.error('Kayıt güncellenirken bir hata oluştu')
    },
  })

  const onSubmit = (data: BeneficiaryFormData) => {
    updateMutation.mutate(data)
  }

  // Fotoğraf işleme fonksiyonları
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu en fazla 5MB olabilir')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        toast.success('Fotoğraf yüklendi')
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoRemove = () => {
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Fotoğraf kaldırıldı')
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="col-span-1 h-150" />
          <Skeleton className="col-span-3 h-150" />
        </div>
      </div>
    )
  }

  if (!beneficiary && !isNew) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-muted-foreground h-16 w-16" />
        <h2 className="text-xl font-semibold">Kayıt Bulunamadı</h2>
        <p className="text-muted-foreground">
          İstenen ihtiyaç sahibi kaydı bulunamadı.
        </p>
        <Button
          onClick={() => {
            router.back()
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
      </div>
    )
  }

  const data = beneficiary!

  return (
    <div className="relative space-y-4">
      {/* Sağ Üst Köşe Sabit Butonlar - Scroll edilse bile görünür */}
      <div
        className="bg-background/95 border-border fixed top-28 right-6 z-100 flex items-center gap-2 rounded-lg border p-2 shadow-lg backdrop-blur-sm"
        style={{ position: 'fixed' }}
      >
        <Button
          disabled={!isDirty || isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            router.push('/sosyal-yardim/ihtiyac-sahipleri')
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Kapat
        </Button>
        <div className="bg-border h-8 w-px" />
        <Button variant="ghost" size="icon" title="Yazdır">
          <Printer className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
        >
          <Link2 className="mr-1 h-4 w-4" />
          Kart Birleştirme
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
        >
          <History className="mr-1 h-4 w-4" />
          İşlem Geçmişi
        </Button>
        <div className="bg-border h-8 w-px" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.back()
          }}
          title="Geri"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Sayfa Başlığı */}
      <div className="pr-125">
        <h1 className="text-xl font-bold">
          İhtiyaç Sahibi Kişi ID # {data.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sol Panel - Fotoğraf ve Bağlantılı Kayıtlar */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          {/* Fotoğraf Alanı */}
          <Card>
            <CardContent className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div
                className="bg-muted border-border hover:bg-muted/80 mb-3 flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors"
                onClick={handlePhotoClick}
              >
                {photoPreview || data.fotografUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Using img for data URLs and dynamic user uploads
                  <img
                    src={photoPreview || data.fotografUrl}
                    alt="İhtiyaç sahibi fotoğrafı"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <User className="mx-auto mb-2 h-12 w-12 opacity-30" />
                    <p className="text-xs">Fotoğraf yüklemek için tıklayın</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handlePhotoClick}
                >
                  <Camera className="mr-1 h-3 w-3" />
                  Yükle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handlePhotoRemove}
                  disabled={!photoPreview && !data.fotografUrl}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Kaldır
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sponsorluk Tipi */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-muted-foreground mb-2 block text-sm">
                Sponsorluk Tipi
              </Label>
              <Select
                defaultValue={data.sponsorlukTipi}
                onValueChange={(value: string) =>
                  setValue('sponsorlukTipi', value, { shouldDirty: true })
                }
              >
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
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Bağlantılı Kayıtlar</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <LinkedRecordButton
                  icon={CreditCard}
                  label="Banka Hesapları"
                  count={data.baglantiliKayitlar?.bankaHesaplari}
                  onClick={() => {
                    setActiveSheet('bankaHesaplari')
                  }}
                />
                <LinkedRecordButton
                  icon={FileText}
                  label="Dokümanlar"
                  count={data.baglantiliKayitlar?.dokumanlar}
                  onClick={() => {
                    setActiveSheet('dokumanlar')
                  }}
                />
                <LinkedRecordButton
                  icon={Image}
                  label="Fotoğraflar"
                  count={data.baglantiliKayitlar?.fotograflar}
                  onClick={() => {
                    setActiveSheet('fotograflar')
                  }}
                />
                <LinkedRecordButton
                  icon={Users}
                  label="Baktığı Yetimler"
                  count={data.baglantiliKayitlar?.baktigiYetimler}
                  onClick={() => {
                    setActiveSheet('baktigiYetimler')
                  }}
                />
                <LinkedRecordButton
                  icon={Users}
                  label="Baktığı Kişiler"
                  count={data.baglantiliKayitlar?.baktigiKisiler}
                  onClick={() => {
                    setActiveSheet('baktigiKisiler')
                  }}
                />
                <LinkedRecordButton
                  icon={Heart}
                  label="Sponsorlar"
                  count={data.baglantiliKayitlar?.sponsorlar}
                  onClick={() => {
                    setActiveSheet('sponsorlar')
                  }}
                />
                <LinkedRecordButton
                  icon={User}
                  label="Referanslar"
                  count={data.baglantiliKayitlar?.referanslar}
                  onClick={() => {
                    setActiveSheet('referanslar')
                  }}
                />
                <LinkedRecordButton
                  icon={MessageSquare}
                  label="Görüşme Kayıtları"
                  count={data.baglantiliKayitlar?.gorusmeKayitlari}
                  onClick={() => {
                    setActiveSheet('gorusmeKayitlari')
                  }}
                />
                <LinkedRecordButton
                  icon={History}
                  label="Görüşme Seans"
                  count={data.baglantiliKayitlar?.gorusmeSeansTakibi}
                  onClick={() => {
                    setActiveSheet('gorusmeSeans')
                  }}
                />
                <LinkedRecordButton
                  icon={DollarSign}
                  label="Yardım Talepleri"
                  count={data.baglantiliKayitlar?.yardimTalepleri}
                  onClick={() => {
                    setActiveSheet('yardimTalepleri')
                  }}
                />
                <LinkedRecordButton
                  icon={DollarSign}
                  label="Yapılan Yardımlar"
                  count={data.baglantiliKayitlar?.yapilanYardimlar}
                  onClick={() => {
                    setActiveSheet('yapilanYardimlar')
                  }}
                />
                <LinkedRecordButton
                  icon={Shield}
                  label="Rıza Beyanları"
                  count={data.baglantiliKayitlar?.rizaBeyannamesi}
                  onClick={() => {
                    setActiveSheet('rizaBeyannamesi')
                  }}
                />
                <LinkedRecordButton
                  icon={CreditCard}
                  label="Sosyal Kartlar"
                  count={data.baglantiliKayitlar?.sosyalKartlar}
                  onClick={() => {
                    setActiveSheet('sosyalKartlar')
                  }}
                />
                <LinkedRecordButton
                  icon={FileText}
                  label="Kart Özeti"
                  onClick={() => {
                    setActiveSheet('kartOzeti')
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel - Form Bölümleri */}
        <div className="col-span-12 space-y-6 lg:col-span-9">
          {/* BÖLÜM 1: TEMEL BİLGİLER */}
          <Card>
            <CardContent className="p-6">
              <SectionTitle>Temel Bilgiler</SectionTitle>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Sol Sütun */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ad *</Label>
                    <Input {...register('ad')} defaultValue={data.ad} />
                    {errors.ad && (
                      <p className="text-destructive text-sm">
                        {errors.ad.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Soyad *</Label>
                    <Input {...register('soyad')} defaultValue={data.soyad} />
                    {errors.soyad && (
                      <p className="text-destructive text-sm">
                        {errors.soyad.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Uyruk *</Label>
                    <Select
                      defaultValue={data.uyruk}
                      onValueChange={(value) =>
                        setValue('uyruk', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.uyruk && (
                      <p className="text-destructive text-sm">
                        {errors.uyruk.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Kimlik No</Label>
                    <Input
                      {...register(
                        data.uyruk === 'Türkiye'
                          ? 'tcKimlikNo'
                          : 'yabanciKimlikNo'
                      )}
                      defaultValue={data.tcKimlikNo || data.yabanciKimlikNo}
                    />
                    <div className="mt-1 flex items-center space-x-2">
                      <Checkbox
                        id="mernis"
                        defaultChecked={data.mernisDogrulama}
                      />
                      <Label
                        htmlFor="mernis"
                        className="cursor-pointer text-xs"
                      >
                        Mernis Kontrolü Yap
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Select
                      defaultValue={data.kategori}
                      onValueChange={(value: string) =>
                        setValue('kategori', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(IHTIYAC_SAHIBI_KATEGORI_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {errors.kategori && (
                      <p className="text-destructive text-sm">
                        {errors.kategori.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Fon Bölgesi</Label>
                    <Select
                      defaultValue={data.fonBolgesi}
                      onValueChange={(value) =>
                        setValue('fonBolgesi', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FON_BOLGESI_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosya Bağlantısı</Label>
                    <Select
                      defaultValue={data.dosyaBaglantisi}
                      onValueChange={(value) =>
                        setValue('dosyaBaglantisi', value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOSYA_BAGLANTISI_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosya Numarası</Label>
                    <div className="flex gap-2">
                      <Input
                        value={data.dosyaNo.split('-')[0] || ''}
                        readOnly
                        className="bg-muted w-20"
                      />
                      <Input
                        defaultValue={data.dosyaNo
                          .split('-')
                          .slice(1)
                          .join('-')}
                        onChange={() => {
                          setHasChanges(true)
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Orta Sütun */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cep Telefonu</Label>
                    <div className="flex gap-2">
                      <Select
                        defaultValue={data.cepTelefonuOperator}
                        onValueChange={(value) =>
                          setValue('cepTelefonuOperator', value, {
                            shouldDirty: true,
                          })
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Kod" />
                        </SelectTrigger>
                        <SelectContent>
                          {TELEFON_OPERATOR_KODLARI.map((kod) => (
                            <SelectItem key={kod} value={kod}>
                              {kod}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        {...register('cepTelefonu')}
                        placeholder="XXX XX XX"
                        defaultValue={data.cepTelefonu}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sabit Telefon</Label>
                    <Input
                      {...register('sabitTelefon')}
                      defaultValue={data.sabitTelefon}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yurtdışı Telefon</Label>
                    <Input
                      {...register('yurtdisiTelefon')}
                      defaultValue={data.yurtdisiTelefon}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>e-Posta Adresi</Label>
                    <Input
                      {...register('email')}
                      type="email"
                      defaultValue={data.email}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">
                        {errors.email.message}
                      </p>
                    )}
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
                    <Select
                      defaultValue={String(
                        data.aileHaneBilgileri?.ailedekiKisiSayisi || '1'
                      )}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Yok</SelectItem>
                        {Array.from({ length: 20 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sağ Sütun */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ülke *</Label>
                    <Select
                      defaultValue={data.ulke}
                      onValueChange={(value) =>
                        setValue('ulke', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ulke && (
                      <p className="text-destructive text-sm">
                        {errors.ulke.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Şehir / Bölge *</Label>
                    <Select
                      defaultValue={data.sehir}
                      onValueChange={(value) =>
                        setValue('sehir', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ISTANBUL_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                        {TURKISH_CITIES.filter(
                          (c) => !c.includes('İstanbul')
                        ).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sehir && (
                      <p className="text-destructive text-sm">
                        {errors.sehir.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Yerleşim</Label>
                    <Select
                      defaultValue={data.ilce}
                      onValueChange={(value) =>
                        setValue('ilce', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İlçe seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={data.ilce || 'ilce'}>
                          {data.ilce || 'Seçiniz'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mahalle / Köy</Label>
                    <Select
                      defaultValue={data.mahalle}
                      onValueChange={(value) =>
                        setValue('mahalle', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mahalle seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={data.mahalle || 'mahalle'}>
                          {data.mahalle || 'Seçiniz'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <Textarea
                      {...register('adres')}
                      defaultValue={data.adres}
                      className="min-h-25"
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
                  <div className="bg-muted/50 space-y-3 rounded-lg p-3">
                    <div className="flex items-center gap-6">
                      <Label className="text-sm font-medium">Durum:</Label>
                      <Badge
                        variant={
                          data.durum === 'aktif' ? 'default' : 'secondary'
                        }
                      >
                        {IHTIYAC_DURUMU_LABELS[data.durum]}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete"
                        checked={deleteChecked}
                        onCheckedChange={(checked) => {
                          setDeleteChecked(checked as boolean)
                        }}
                      />
                      <Label
                        htmlFor="delete"
                        className="text-destructive cursor-pointer text-sm"
                      >
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Sütun 1 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Baba Adı</Label>
                    <Input
                      {...register('kimlikBilgileri.babaAdi')}
                      defaultValue={data.kimlikBilgileri?.babaAdi}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Anne Adı</Label>
                    <Input
                      {...register('kimlikBilgileri.anneAdi')}
                      defaultValue={data.kimlikBilgileri?.anneAdi}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kimlik Belgesi Türü</Label>
                    <Select
                      defaultValue={data.kimlikBilgileri?.belgeTuru}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(KIMLIK_BELGESI_TURU_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Geçerlilik / Veriliş Tarihi</Label>
                    <Input
                      type="date"
                      defaultValue={
                        data.kimlikBilgileri?.belgeGecerlilikTarihi
                          ?.toISOString()
                          .split('T')[0]
                      }
                      onChange={() => {
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seri Numarası</Label>
                    <Input
                      {...register('kimlikBilgileri.seriNumarasi')}
                      defaultValue={data.kimlikBilgileri?.seriNumarasi}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Önceki Uyruğu (Varsa)</Label>
                    <Select
                      defaultValue={data.kimlikBilgileri?.oncekiUyruk}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yok" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yok">Yok</SelectItem>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Önceki İsmi (Varsa)</Label>
                    <Input
                      {...register('kimlikBilgileri.oncekiIsim')}
                      defaultValue={data.kimlikBilgileri?.oncekiIsim}
                    />
                  </div>
                </div>

                {/* Sütun 2 - Pasaport ve Vize */}
                <div className="space-y-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <Plane className="h-4 w-4" />
                    Pasaport ve Vize
                  </div>
                  <div className="space-y-2">
                    <Label>Pasaport Türü</Label>
                    <Select
                      defaultValue={data.pasaportVizeBilgileri?.pasaportTuru}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PASAPORT_TURU_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pasaport Numarası</Label>
                    <div className="flex gap-2">
                      <Input
                        defaultValue={
                          data.pasaportVizeBilgileri?.pasaportNumarasi
                        }
                        onChange={() => {
                          setHasChanges(true)
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-amber-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Pasaport Geçerlilik Tarihi</Label>
                    <Input
                      type="date"
                      defaultValue={
                        data.pasaportVizeBilgileri?.pasaportGecerlilikTarihi
                          ?.toISOString()
                          .split('T')[0]
                      }
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vize / Giriş Türü</Label>
                    <Select
                      defaultValue={data.pasaportVizeBilgileri?.vizeGirisTuru}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VIZE_GIRIS_TURU_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vize Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      defaultValue={
                        data.pasaportVizeBilgileri?.vizeBitisTarihi
                          ?.toISOString()
                          .split('T')[0]
                      }
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                </div>

                {/* Sütun 3 - Sağlık */}
                <div className="space-y-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <Heart className="h-4 w-4" />
                    Sağlık Bilgileri
                  </div>
                  <div className="space-y-2">
                    <Label>Kan Grubu</Label>
                    <Select
                      defaultValue={data.saglikBilgileri?.kanGrubu}
                      onValueChange={(value) =>
                        setValue('saglikBilgileri.kanGrubu', value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'A Rh+',
                          'A Rh-',
                          'B Rh+',
                          'B Rh-',
                          'AB Rh+',
                          'AB Rh-',
                          '0 Rh+',
                          '0 Rh-',
                        ].map((kan) => (
                          <SelectItem key={kan} value={kan}>
                            {kan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kronik Hastalık</Label>
                    <Input
                      {...register('saglikBilgileri.kronikHastalik')}
                      defaultValue={data.saglikBilgileri?.kronikHastalik}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Engel Durumu</Label>
                    <Input
                      {...register('saglikBilgileri.engelDurumu')}
                      defaultValue={data.saglikBilgileri?.engelDurumu}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Engel Oranı (%)</Label>
                    <Input
                      {...register('saglikBilgileri.engelOrani', {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={data.saglikBilgileri?.engelOrani}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sürekli Kullanılan İlaç</Label>
                    <Input
                      {...register('saglikBilgileri.surekliIlac')}
                      defaultValue={data.saglikBilgileri?.surekliIlac}
                    />
                  </div>
                </div>

                {/* Sütun 4 - Ekonomik Durum */}
                <div className="space-y-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4" />
                    Ekonomik Durum
                  </div>
                  <div className="space-y-2">
                    <Label>Eğitim Durumu</Label>
                    <Select
                      defaultValue={data.ekonomikDurum?.egitimDurumu}
                      onValueChange={(value) =>
                        setValue('ekonomikDurum.egitimDurumu', value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EGITIM_DURUMU_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Meslek</Label>
                    <Input
                      {...register('ekonomikDurum.meslek')}
                      defaultValue={data.ekonomikDurum?.meslek}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Çalışma Durumu</Label>
                    <Select
                      defaultValue={data.ekonomikDurum?.calismaDurumu}
                      onValueChange={(value) =>
                        setValue('ekonomikDurum.calismaDurumu', value, {
                          shouldDirty: true,
                        })
                      }
                    >
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
                      {...register('ekonomikDurum.aylikGelir', {
                        valueAsNumber: true,
                      })}
                      type="number"
                      defaultValue={data.ekonomikDurum?.aylikGelir}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konut Durumu</Label>
                    <Select
                      defaultValue={data.ekonomikDurum?.konutDurumu}
                      onValueChange={(value) =>
                        setValue('ekonomikDurum.konutDurumu', value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kira">Kiracı</SelectItem>
                        <SelectItem value="ev-sahibi">Ev Sahibi</SelectItem>
                        <SelectItem value="misafir">Misafir</SelectItem>
                        <SelectItem value="barinma-merkezi">
                          Barınma Merkezi
                        </SelectItem>
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Medeni Hal</Label>
                    <Select
                      defaultValue={data.aileHaneBilgileri?.medeniHal}
                      onValueChange={() => {
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MEDENI_HAL_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Eş Adı</Label>
                    <Input
                      {...register('aileHaneBilgileri.esAdi')}
                      defaultValue={data.aileHaneBilgileri?.esAdi}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Eş Telefonu</Label>
                    <Input
                      {...register('aileHaneBilgileri.esTelefon')}
                      defaultValue={data.aileHaneBilgileri?.esTelefon}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ailedeki Kişi Sayısı</Label>
                    <Input
                      {...register('aileHaneBilgileri.ailedekiKisiSayisi', {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={1}
                      defaultValue={data.aileHaneBilgileri?.ailedekiKisiSayisi}
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
                      defaultValue={
                        data.aileHaneBilgileri?.bakmaklaYukumluSayisi
                      }
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
                {...register('notlar')}
                defaultValue={data.notlar}
                className="min-h-37.5"
                placeholder="İhtiyaç sahibi ile ilgili ek notlar..."
              />
              {errors.notlar && (
                <p className="text-destructive mt-2 text-sm">
                  {errors.notlar.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bağlantılı Kayıtlar Sheet'leri */}

      {/* Banka Hesapları */}
      <LinkedRecordSheet
        open={activeSheet === 'bankaHesaplari'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Banka Hesapları"
        description={`${data.ad} ${data.soyad} - Banka Hesap Bilgileri`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Yeni Banka Hesabı Ekle
          </Button>
          {data.baglantiliKayitlar?.bankaHesaplari &&
          data.baglantiliKayitlar.bankaHesaplari > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banka Adı</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Banka hesap verisi yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <CreditCard className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz banka hesabı eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Dokümanlar */}
      <LinkedRecordSheet
        open={activeSheet === 'dokumanlar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Dokümanlar"
        description={`${data.ad} ${data.soyad} - Doküman Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Yeni Doküman Yükle
          </Button>
          {data.baglantiliKayitlar?.dokumanlar &&
          data.baglantiliKayitlar.dokumanlar > 0 ? (
            <div className="grid gap-2">
              <p className="text-muted-foreground text-sm">
                Toplam {data.baglantiliKayitlar.dokumanlar} doküman
                bulunmaktadır.
              </p>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz doküman eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Fotoğraflar */}
      <LinkedRecordSheet
        open={activeSheet === 'fotograflar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Fotoğraflar"
        description={`${data.ad} ${data.soyad} - Fotoğraf Galerisi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            {/* eslint-disable-next-line jsx-a11y/alt-text -- This is a Lucide icon, not an img element */}
            <Image className="mr-2 h-4 w-4" />
            Yeni Fotoğraf Yükle
          </Button>
          {data.baglantiliKayitlar?.fotograflar &&
          data.baglantiliKayitlar.fotograflar > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              <p className="text-muted-foreground col-span-3 text-sm">
                Toplam {data.baglantiliKayitlar.fotograflar} fotoğraf
                bulunmaktadır.
              </p>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              {/* eslint-disable-next-line jsx-a11y/alt-text -- This is a Lucide icon, not an img element */}
              <Image className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz fotoğraf eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Baktığı Yetimler */}
      <LinkedRecordSheet
        open={activeSheet === 'baktigiYetimler'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Baktığı Yetimler"
        description={`${data.ad} ${data.soyad} - Baktığı Yetim Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Yeni Yetim Bağlantısı Ekle
          </Button>
          {data.baglantiliKayitlar?.baktigiYetimler &&
          data.baglantiliKayitlar.baktigiYetimler > 0 ? (
            <p className="text-muted-foreground text-sm">
              Toplam {data.baglantiliKayitlar.baktigiYetimler} yetim
              bulunmaktadır.
            </p>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz yetim bağlantısı eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Baktığı Kişiler */}
      <LinkedRecordSheet
        open={activeSheet === 'baktigiKisiler'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Baktığı Kişiler"
        description={`${data.ad} ${data.soyad} - Baktığı Kişi Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Yeni Kişi Bağlantısı Ekle
          </Button>
          {isLoadingDependents ? (
            <div className="text-muted-foreground py-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : dependentPersons && dependentPersons.length > 0 ? (
            <div className="space-y-4">
              <div className="text-muted-foreground mb-4 text-sm">
                Toplam {dependentPersons.length} kişi bulunmaktadır.
              </div>
              <div className="space-y-3">
                {dependentPersons.map((person) => (
                  <div
                    key={person.id}
                    className="hover:bg-muted/30 rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="text-foreground font-medium">
                            {person.ad} {person.soyad}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Bakmakla Yükümlü
                          </Badge>
                        </div>
                        <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">TC No: </span>
                            <span className="font-mono">
                              {person.tcKimlikNo || 'Belirtilmemiş'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Telefon: </span>
                            <span className="font-mono">
                              {person.cepTelefonu || 'Belirtilmemiş'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Yaş: </span>
                            <span>
                              {person.dogumTarihi
                                ? new Date().getFullYear() -
                                  new Date(person.dogumTarihi).getFullYear()
                                : 'Belirtilmemiş'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Durum: </span>
                            <Badge
                              variant={
                                person.durum === 'aktif'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {person.durum === 'aktif'
                                ? 'Aktif'
                                : person.durum === 'pasif'
                                  ? 'Pasif'
                                  : 'Bilinmiyor'}
                            </Badge>
                          </div>
                        </div>
                        {person.adres && (
                          <div className="text-muted-foreground mt-2 text-sm">
                            <span className="font-medium">Adres: </span>
                            <span>{person.adres}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(
                              `/sosyal-yardim/ihtiyac-sahipleri/${person.id}`
                            )
                          }}
                        >
                          <User className="mr-1 h-4 w-4" />
                          Görüntüle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Bu kişinin baktığı başka kimse bulunmamaktadır</p>
              <p className="mt-1 text-xs">
                Hane reisi ise, ona bağımlı kişiler burada görünecektir
              </p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Sponsorlar */}
      <LinkedRecordSheet
        open={activeSheet === 'sponsorlar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Sponsorlar"
        description={`${data.ad} ${data.soyad} - Sponsor Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <Heart className="mr-2 h-4 w-4" />
            Yeni Sponsor Ekle
          </Button>
          {data.baglantiliKayitlar?.sponsorlar &&
          data.baglantiliKayitlar.sponsorlar > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sponsor Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Sponsor verisi yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Heart className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz sponsor eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Referanslar */}
      <LinkedRecordSheet
        open={activeSheet === 'referanslar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Referanslar"
        description={`${data.ad} ${data.soyad} - Referans Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <User className="mr-2 h-4 w-4" />
            Yeni Referans Ekle
          </Button>
          {data.baglantiliKayitlar?.referanslar &&
          data.baglantiliKayitlar.referanslar > 0 ? (
            <p className="text-muted-foreground text-sm">
              Toplam {data.baglantiliKayitlar.referanslar} referans
              bulunmaktadır.
            </p>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <User className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz referans eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Görüşme Kayıtları */}
      <LinkedRecordSheet
        open={activeSheet === 'gorusmeKayitlari'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Görüşme Kayıtları"
        description={`${data.ad} ${data.soyad} - Görüşme Geçmişi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Yeni Görüşme Kaydı Ekle
          </Button>
          {data.baglantiliKayitlar?.gorusmeKayitlari &&
          data.baglantiliKayitlar.gorusmeKayitlari > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Görüşen</TableHead>
                  <TableHead>Özet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Görüşme kayıtları yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz görüşme kaydı eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Görüşme Seans Takibi */}
      <LinkedRecordSheet
        open={activeSheet === 'gorusmeSeans'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Görüşme Seans Takibi"
        description={`${data.ad} ${data.soyad} - Seans Takibi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <History className="mr-2 h-4 w-4" />
            Yeni Seans Ekle
          </Button>
          {data.baglantiliKayitlar?.gorusmeSeansTakibi &&
          data.baglantiliKayitlar.gorusmeSeansTakibi > 0 ? (
            <p className="text-muted-foreground text-sm">
              Toplam {data.baglantiliKayitlar.gorusmeSeansTakibi} seans kaydı
              bulunmaktadır.
            </p>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <History className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz seans kaydı eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Yardım Talepleri */}
      <LinkedRecordSheet
        open={activeSheet === 'yardimTalepleri'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Yardım Talepleri"
        description={`${data.ad} ${data.soyad} - Yardım Talep Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <DollarSign className="mr-2 h-4 w-4" />
            Yeni Yardım Talebi Ekle
          </Button>
          {data.baglantiliKayitlar?.yardimTalepleri &&
          data.baglantiliKayitlar.yardimTalepleri > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Talep Türü</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground text-center"
                  >
                    Yardım talepleri yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <DollarSign className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz yardım talebi eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Yapılan Yardımlar */}
      <LinkedRecordSheet
        open={activeSheet === 'yapilanYardimlar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Yapılan Yardımlar"
        description={`${data.ad} ${data.soyad} - Yardım Geçmişi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <DollarSign className="mr-2 h-4 w-4" />
            Yeni Yardım Ekle
          </Button>
          {data.baglantiliKayitlar?.yapilanYardimlar &&
          data.baglantiliKayitlar.yapilanYardimlar > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Yardım Türü</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground text-center"
                  >
                    Yapılan yardımlar yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <DollarSign className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz yapılmış yardım kaydı yok</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Rıza Beyanları */}
      <LinkedRecordSheet
        open={activeSheet === 'rizaBeyannamesi'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Rıza Beyanları"
        description={`${data.ad} ${data.soyad} - Rıza Beyannamesi Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <Shield className="mr-2 h-4 w-4" />
            Yeni Rıza Beyanı Ekle
          </Button>
          {data.baglantiliKayitlar?.rizaBeyannamesi &&
          data.baglantiliKayitlar.rizaBeyannamesi > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Beyan Türü</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Rıza beyanları yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Shield className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz rıza beyanı eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Sosyal Kartlar */}
      <LinkedRecordSheet
        open={activeSheet === 'sosyalKartlar'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Sosyal Kartlar"
        description={`${data.ad} ${data.soyad} - Sosyal Kart Listesi`}
      >
        <div className="space-y-4">
          <Button className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Yeni Sosyal Kart Ekle
          </Button>
          {data.baglantiliKayitlar?.sosyalKartlar &&
          data.baglantiliKayitlar.sosyalKartlar > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kart No</TableHead>
                  <TableHead>Kart Türü</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Sosyal kart verisi yükleniyor...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <CreditCard className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Henüz sosyal kart eklenmemiş</p>
            </div>
          )}
        </div>
      </LinkedRecordSheet>

      {/* Kart Özeti */}
      <LinkedRecordSheet
        open={activeSheet === 'kartOzeti'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        title="Kart Özeti"
        description={`${data.ad} ${data.soyad} - Genel Özet`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {data.baglantiliKayitlar?.yardimTalepleri || 0}
                </div>
                <div className="text-muted-foreground text-sm">
                  Toplam Talep
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {data.baglantiliKayitlar?.yapilanYardimlar || 0}
                </div>
                <div className="text-muted-foreground text-sm">
                  Yapılan Yardım
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {data.baglantiliKayitlar?.sponsorlar || 0}
                </div>
                <div className="text-muted-foreground text-sm">Sponsor</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {data.baglantiliKayitlar?.gorusmeKayitlari || 0}
                </div>
                <div className="text-muted-foreground text-sm">Görüşme</div>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">Kişi Bilgileri</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Ad Soyad:</div>
              <div>
                {data.ad} {data.soyad}
              </div>
              <div className="text-muted-foreground">Uyruk:</div>
              <div>{data.uyruk}</div>
              <div className="text-muted-foreground">Telefon:</div>
              <div>{data.cepTelefonu}</div>
              <div className="text-muted-foreground">E-posta:</div>
              <div>{data.email || '-'}</div>
            </div>
          </div>
        </div>
      </LinkedRecordSheet>
    </div>
  )
}
