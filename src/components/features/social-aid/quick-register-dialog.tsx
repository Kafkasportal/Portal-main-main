'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { basicBeneficiarySchema, type BasicBeneficiaryFormData } from '@/lib/validators'

interface QuickRegisterDialogProps {
    children: React.ReactNode
}

export function QuickRegisterDialog({ children }: QuickRegisterDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<BasicBeneficiaryFormData>({
        resolver: zodResolver(basicBeneficiarySchema),
        defaultValues: {
            tcKimlikNo: '',
            ad: '',
            soyad: '',
            telefon: ''
        }
    })

    async function onSubmit(data: BasicBeneficiaryFormData) {
        setIsLoading(true)
        try {
            // Simulate API call to create basic record
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Create a fake ID for redirection (in real app, get ID from response)
            const newId = crypto.randomUUID()

            toast.success('Ön kayıt oluşturuldu', {
                description: 'Detay sayfasına yönlendiriliyorsunuz...'
            })

            setOpen(false)
            router.push(`/sosyal-yardim/ihtiyac-sahipleri/${newId}?edit=true`)
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni İhtiyaç Sahibi</DialogTitle>
                    <DialogDescription>
                        Temel bilgileri girerek kaydı başlatın. Detayları bir sonraki sayfada doldurabilirsiniz.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="tcKimlikNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TC Kimlik No</FormLabel>
                                    <FormControl>
                                        <Input placeholder="11 haneli TC No" maxLength={11} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ad" {...field} />
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
                                        <FormLabel>Soyad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Soyad" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="telefon"
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

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Oluşturuluyor...
                                    </>
                                ) : (
                                    'Kaydet ve Devam Et'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
