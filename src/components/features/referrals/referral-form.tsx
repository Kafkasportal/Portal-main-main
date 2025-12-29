'use client'

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
import { Textarea } from '@/components/ui/textarea'
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
import {
  useBeneficiaries,
  useHospitals,
  useCreateReferral,
} from '@/hooks/use-api'
import type { Referral } from '@/types'

const referralSchema = z.object({
  beneficiary_id: z.string().min(1, 'Faydalanıcı seçilmelidir'),
  hospital_id: z.string().min(1, 'Hastane seçilmelidir'),
  reason: z.string().min(5, 'Sevk nedeni detaylı girilmelidir'),
  referral_date: z.date({ message: 'Sevk tarihi seçilmelidir' }),
  notes: z.string().optional(),
})

type ReferralFormValues = z.infer<typeof referralSchema>

interface ReferralFormProps {
  referral?: Referral
  onSuccess?: () => void
}

export function ReferralForm({ referral, onSuccess }: ReferralFormProps) {
  const { data: beneficiariesData } = useBeneficiaries({ limit: 1000 })
  const { data: hospitals } = useHospitals()
  const createReferral = useCreateReferral()

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      beneficiary_id: referral?.beneficiaryId || '',
      hospital_id: referral?.hospitalId || '',
      reason: referral?.reason || '',
      referral_date: referral?.referralDate
        ? new Date(referral.referralDate)
        : new Date(),
      notes: referral?.notes || '',
    },
  })

  function onSubmit(values: ReferralFormValues) {
    createReferral.mutate(
      {
        ...values,
        referral_date: format(values.referral_date, 'yyyy-MM-dd'),
        status: 'referred',
      },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="beneficiary_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasta / Faydalanıcı</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!referral}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Faydalanıcı seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {beneficiariesData?.data.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.ad} {b.soyad} ({b.tcKimlikNo})
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
          name="hospital_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hastane</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hastane seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hospitals?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
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
          name="referral_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Sevk Tarihi</FormLabel>
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
                        format(field.value, 'dd MMMM yyyy')
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sevk Nedeni / Tanı</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Hastanın sevk edilme nedenini açıklayın"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (Opsiyonel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ek bilgiler..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createReferral.isPending}>
            {referral ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
