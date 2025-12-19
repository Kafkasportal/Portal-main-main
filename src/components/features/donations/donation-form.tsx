'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { donationSchema, type DonationFormData } from '@/lib/validators'
import { createDonation } from '@/lib/mock-service'
import { PAYMENT_METHOD_LABELS, DONATION_PURPOSE_LABELS } from '@/lib/constants'

interface DonationFormProps {
    onSuccess?: () => void
}

export function DonationForm({ onSuccess }: DonationFormProps) {
    const queryClient = useQueryClient()

    const form = useForm<DonationFormData>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            bagisci: {
                ad: '',
                soyad: '',
                telefon: '',
                email: '',
                adres: ''
            },
            tutar: 0,
            currency: 'TRY',
            amac: 'genel',
            odemeYontemi: 'nakit',
            makbuzNo: '',
            aciklama: ''
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: createDonation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donations'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            toast.success('Bağış başarıyla kaydedildi')
            onSuccess?.()
        },
        onError: (error) => {
            toast.error('Bir hata oluştu', {
                description: error.message
            })
        }
    })

    function onSubmit(data: DonationFormData) {
        mutate({
            bagisci: {
                id: crypto.randomUUID(),
                ...data.bagisci
            },
            tutar: data.tutar,
            currency: data.currency,
            amac: data.amac,
            odemeYontemi: data.odemeYontemi,
            makbuzNo: data.makbuzNo,
            aciklama: data.aciklama
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                {/* Bağışçı Bilgileri */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Bağışçı Bilgileri</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="bagisci.ad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ad *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ahmet" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bagisci.soyad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Soyad *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Yılmaz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="bagisci.telefon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefon</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0555 123 45 67" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bagisci.email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="ahmet@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Bağış Detayları */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Bağış Detayları</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="tutar"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tutar *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Para Birimi *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="TRY">₺ TRY</SelectItem>
                                            <SelectItem value="USD">$ USD</SelectItem>
                                            <SelectItem value="EUR">€ EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="odemeYontemi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ödeme Yöntemi *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="amac"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bağış Amacı *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(DONATION_PURPOSE_LABELS).map(([value, label]) => (
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
                            name="makbuzNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Makbuz Numarası</FormLabel>
                                    <FormControl>
                                        <Input placeholder="MKB-2024-001" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Boş bırakılırsa otomatik üretilir
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="aciklama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Açıklama</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ek notlar..."
                                        className="resize-none"
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            'Kaydet'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
