'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useBeneficiaries,
  useCreatePayment,
  useUpdatePayment,
} from '@/hooks/use-api'
import { paymentSchema, type PaymentFormData } from '@/lib/validators'
import type { Payment } from '@/types'

interface PaymentFormProps {
  onSuccess?: () => void
  initialData?: Partial<PaymentFormData>
  editingPayment?: Payment | null
}

export function PaymentForm({
  onSuccess,
  initialData,
  editingPayment,
}: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      beneficiaryId:
        initialData?.beneficiaryId ?? editingPayment?.beneficiaryId ?? 0,
      applicationId:
        initialData?.applicationId ?? editingPayment?.applicationId,
      tutar: initialData?.tutar ?? editingPayment?.tutar ?? 0,
      odemeTarihi:
        initialData?.odemeTarihi ??
        (editingPayment
          ? new Date(editingPayment.odemeTarihi).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]),
      odemeYontemi:
        initialData?.odemeYontemi ?? editingPayment?.odemeYontemi ?? 'nakit',
      durum: initialData?.durum ?? editingPayment?.durum ?? 'odendi',
      makbuzNo: initialData?.makbuzNo ?? editingPayment?.makbuzNo,
      notlar: initialData?.notlar ?? editingPayment?.notlar,
    },
  })

  const { data: beneficiariesData } = useBeneficiaries({ limit: 1000 })
  const beneficiaries = beneficiariesData?.data || []

  const { mutate: createPayment, isPending: isCreating } = useCreatePayment({
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })

  const { mutate: updatePayment, isPending: isUpdating } = useUpdatePayment({
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: PaymentFormData) {
    if (editingPayment) {
      updatePayment({
        id: editingPayment.id,
        data: {
          tutar: data.tutar,
          odeme_tarihi: data.odemeTarihi,
          odeme_yontemi: data.odemeYontemi,
          durum: data.durum,
          notlar: data.notlar ?? null,
        },
      })
    } else {
      createPayment({
        beneficiary_id: data.beneficiaryId,
        application_id: data.applicationId ?? 0,
        tutar: data.tutar,
        odeme_tarihi: data.odemeTarihi,
        odeme_yontemi: data.odemeYontemi,
        durum: data.durum,
        notlar: data.notlar ?? null,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="beneficiaryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İhtiyaç Sahibi *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number.parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="İhtiyaç sahibi seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {beneficiaries.map((beneficiary) => (
                    <SelectItem
                      key={beneficiary.id}
                      value={beneficiary.id.toString()}
                    >
                      {beneficiary.ad} {beneficiary.soyad}
                      {beneficiary.tcKimlikNo && ` - ${beneficiary.tcKimlikNo}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tutar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutar (TL) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="odemeTarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Tarihi *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="odemeYontemi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Yöntemi *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="havale">Havale</SelectItem>
                    <SelectItem value="elden">Elden</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durum</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="odendi">Ödendi</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notlar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ödeme ile ilgili notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Kaydediliyor...' : 'Ödeme Kaydet'}
        </Button>
      </form>
    </Form>
  )
}

