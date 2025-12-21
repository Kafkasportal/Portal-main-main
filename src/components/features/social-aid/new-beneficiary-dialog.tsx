'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { createBeneficiary } from '@/lib/mock-service'
import {
    IHTIYAC_SAHIBI_KATEGORI_LABELS,
    FON_BOLGESI_LABELS,
    DOSYA_BAGLANTISI_LABELS,
    COUNTRIES
} from '@/lib/constants'

// Form validasyon şeması
const newBeneficiarySchema = z.object({
    kategori: z.enum([
        'yetim-ailesi', 'multeci-aile', 'ihtiyac-sahibi-aile',
        'ogrenci-yabanci', 'ogrenci-tc', 'vakif-dernek',
        'devlet-okulu', 'kamu-kurumu', 'ozel-egitim-kurumu'
    ], { message: 'Kategori seçiniz' }),
    ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    uyruk: z.string().min(1, 'Uyruk seçiniz'),
    dogumTarihi: z.string().optional(),
    kimlikNo: z.string().optional(),
    mernisKontrol: z.boolean().optional(),
    fonBolgesi: z.enum(['avrupa', 'serbest']).optional(),
    dosyaBaglantisi: z.enum(['partner-kurum', 'calisma-sahasi']).optional(),
    dosyaBaglantisiDetay: z.string().optional(),
    dosyaNo: z.string().min(1, 'Dosya numarası gereklidir')
})

type NewBeneficiaryFormData = z.infer<typeof newBeneficiarySchema>

interface NewBeneficiaryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NewBeneficiaryDialog({ open, onOpenChange }: NewBeneficiaryDialogProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [mernisKontrol, setMernisKontrol] = useState(false)

    const form = useForm<NewBeneficiaryFormData>({
        resolver: zodResolver(newBeneficiarySchema),
        defaultValues: {
            kategori: undefined,
            ad: '',
            soyad: '',
            uyruk: 'Türkiye',
            dogumTarihi: '',
            kimlikNo: '',
            mernisKontrol: false,
            fonBolgesi: 'serbest',
            dosyaBaglantisi: undefined,
            dosyaBaglantisiDetay: '',
            dosyaNo: ''
        }
    })

    const mutation = useMutation({
        mutationFn: createBeneficiary,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
            toast.success('Kayıt başarıyla oluşturuldu')
            form.reset()
            onOpenChange(false)
            // Navigate after dialog closes
            setTimeout(() => {
                router.push(`/sosyal-yardim/ihtiyac-sahipleri/${data.id}`)
            }, 100)
        },
        onError: () => {
            toast.error('Kayıt oluşturulurken bir hata oluştu')
        }
    })

    const onSubmit = (data: NewBeneficiaryFormData) => {
        mutation.mutate({
            kategori: data.kategori,
            ad: data.ad,
            soyad: data.soyad,
            uyruk: data.uyruk,
            dogumTarihi: data.dogumTarihi ? new Date(data.dogumTarihi) : undefined,
            tcKimlikNo: data.uyruk === 'Türkiye' ? data.kimlikNo : undefined,
            yabanciKimlikNo: data.uyruk !== 'Türkiye' ? data.kimlikNo : undefined,
            fonBolgesi: data.fonBolgesi,
            dosyaBaglantisi: data.dosyaBaglantisi,
            dosyaBaglantisiDetay: data.dosyaBaglantisiDetay,
            dosyaNo: data.dosyaNo,
            mernisDogrulama: data.mernisKontrol
        })
    }

    // Check if form is valid for submission
    const isFormValid = form.formState.isValid && form.getValues('kategori') && form.getValues('ad') && form.getValues('soyad') && form.getValues('dosyaNo')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle>Kayıt Ekle</DialogTitle>
                        <DialogDescription>
                            Yeni ihtiyaç sahibi kaydı oluşturun. Tüm zorunlu alanları doldurun.
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Kategori */}
                        <FormField
                            control={form.control}
                            name="kategori"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kategori seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(IHTIYAC_SAHIBI_KATEGORI_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ad Soyad */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ad *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Adı giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="soyad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Soyad *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Soyadı giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Uyruk */}
                        <FormField
                            control={form.control}
                            name="uyruk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Uyruk *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Uyruk seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COUNTRIES.map(country => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Doğum Tarihi */}
                        <FormField
                            control={form.control}
                            name="dogumTarihi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Doğum Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Kimlik No ve Mernis */}
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="kimlikNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kimlik No</FormLabel>
                                        <FormControl>
                                            <Input
                                                // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch is standard usage
                                                placeholder={form.watch('uyruk') === 'Türkiye' ? 'TC Kimlik No' : 'Yabancı Kimlik No'}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="mernis"
                                    checked={mernisKontrol}
                                    onCheckedChange={(checked) => setMernisKontrol(checked as boolean)}
                                />
                                <Label htmlFor="mernis" className="text-sm cursor-pointer">
                                    Mernis Kontrolü Yap
                                </Label>
                            </div>
                        </div>

                        {/* Fon Bölgesi */}
                        <FormField
                            control={form.control}
                            name="fonBolgesi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fon Bölgesi</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(FON_BOLGESI_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dosya Bağlantısı */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dosyaBaglantisi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dosya Bağlantısı</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seçiniz" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(DOSYA_BAGLANTISI_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dosyaBaglantisiDetay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bağlantı Detayı</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Kurum/Saha adı" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Dosya Numarası */}
                        <FormField
                            control={form.control}
                            name="dosyaNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dosya Numarası *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="DSY-XXXXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                Kapat
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isFormValid}
                                loading={mutation.isPending}
                            >
                                {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}








