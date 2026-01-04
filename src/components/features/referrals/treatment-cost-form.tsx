'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useCreateTreatmentCost } from '@/hooks/use-api'
import type { TreatmentCost } from '@/types'

const costSchema = z.object({
  referral_id: z.string().min(1),
  description: z.string().min(2, 'Açıklama gereklidir'),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Geçerli bir tutar giriniz'
    ),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  payment_status: z
    .enum(['pending', 'paid', 'partially_paid'])
    .default('pending'),
  payment_date: z.date().optional().nullable(),
  payment_method: z.enum(['nakit', 'havale', 'elden']).optional().nullable(),
  incurred_date: z.date({ message: 'Gider tarihi seçilmelidir' }),
})

type CostFormValues = z.infer<typeof costSchema>

interface TreatmentCostFormProps {
  referralId: string
  cost?: TreatmentCost
  onSuccess?: () => void
}

export function TreatmentCostForm({
  referralId,
  cost,
  onSuccess,
}: TreatmentCostFormProps) {
  const createCost = useCreateTreatmentCost(referralId)
  const [showPaymentFields, setShowPaymentFields] = useState(false)

  const form = useForm({
    resolver: zodResolver(costSchema),
    defaultValues: {
      referral_id: referralId,
      description: cost?.description || '',
      amount: cost?.amount.toString() || '',
      currency: (cost?.currency as 'TRY' | 'EUR' | 'USD') || 'TRY',
      payment_status:
        (cost?.paymentStatus as 'pending' | 'paid' | 'partially_paid') ||
        'pending',
      payment_date: cost?.paymentDate ? new Date(cost.paymentDate) : null,
      payment_method:
        (cost?.paymentMethod as 'nakit' | 'havale' | 'elden' | null) || null,
      incurred_date: cost?.incurredDate
        ? new Date(cost.incurredDate)
        : new Date(),
    },
  })

  function onSubmit(values: CostFormValues) {
    createCost.mutate(
      {
        referral_id: referralId,
        description: values.description,
        amount: Number(values.amount),
        currency: values.currency,
        payment_status: values.payment_status,
        payment_date: values.payment_date
          ? format(values.payment_date, 'yyyy-MM-dd')
          : null,
        payment_method: values.payment_method,
        incurred_date: format(values.incurred_date, 'yyyy-MM-dd'),
      },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  // Update payment fields visibility when payment_status changes
  useEffect(() => {
    const status = form.getValues('payment_status')
    setShowPaymentFields(status !== 'pending')
    // Also update when form values change
    const subscription = form.watch((value) => {
      if ('payment_status' in value) {
        setShowPaymentFields(value.payment_status !== 'pending')
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gider Açıklaması</FormLabel>
              <FormControl>
                <Input
                  placeholder="Örn: Muayene ücreti, İlaç bedeli..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutar</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
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
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="incurred_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Gider Tarihi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Tarih seçiniz</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Durumu</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="paid">Ödendi</SelectItem>
                    <SelectItem value="partially_paid">Kısmi Ödeme</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showPaymentFields && (
          <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ödeme Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Tarih seçiniz</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ödeme Yöntemi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nakit">Nakit</SelectItem>
                      <SelectItem value="havale">Havale/EFT</SelectItem>
                      <SelectItem value="elden">Elden</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createCost.isPending}>
            {cost ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
