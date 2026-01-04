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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  useCreateOutcome, 
  useAppointments,
  useUpdateReferral 
} from '@/hooks/use-api'
import type { TreatmentOutcome } from '@/types'

const outcomeSchema = z.object({
  referral_id: z.string().min(1),
  appointment_id: z.string().optional().nullable(),
  diagnosis: z.string().min(2, 'Tanı bilgisi gereklidir'),
  treatment_received: z.string().min(2, 'Yapılan işlem/tedavi belirtilmelidir'),
  outcome_notes: z.string().optional(),
  follow_up_needed: z.boolean().default(false),
  follow_up_date: z.date().optional().nullable(),
})

type OutcomeFormValues = z.infer<typeof outcomeSchema>

interface TreatmentOutcomeFormProps {
  referralId: string
  outcome?: TreatmentOutcome
  onSuccess?: () => void
}

export function TreatmentOutcomeForm({ referralId, outcome, onSuccess }: TreatmentOutcomeFormProps) {
  const createOutcome = useCreateOutcome(referralId)
  const updateReferral = useUpdateReferral(referralId)
  const { data: appointments } = useAppointments(referralId)
  const [showFollowUpDate, setShowFollowUpDate] = useState(false)

  const form = useForm({
    resolver: zodResolver(outcomeSchema),
    defaultValues: {
      referral_id: referralId,
      appointment_id: outcome?.appointmentId || '',
      diagnosis: outcome?.diagnosis || '',
      treatment_received: outcome?.treatmentReceived || '',
      outcome_notes: outcome?.outcomeNotes || '',
      follow_up_needed: outcome?.followUpNeeded ?? false,
      follow_up_date: outcome?.followUpDate ? new Date(outcome.followUpDate) : null,
    },
  })

  function onSubmit(values: OutcomeFormValues) {
    createOutcome.mutate({
      referral_id: values.referral_id,
      appointment_id: values.appointment_id || null,
      diagnosis: values.diagnosis,
      treatment_received: values.treatment_received,
      outcome_notes: values.outcome_notes || null,
      follow_up_needed: values.follow_up_needed,
      follow_up_date: values.follow_up_date ? format(values.follow_up_date, 'yyyy-MM-dd') : null,
    }, {
      onSuccess: () => {
        // Automatically update referral status to 'treated' or 'follow-up'
        updateReferral.mutate({
          status: values.follow_up_needed ? 'follow-up' : 'treated'
        })
        onSuccess?.()
      }
    })
  }

  // Update follow-up date visibility when follow_up_needed changes
  useEffect(() => {
    const needed = form.getValues('follow_up_needed')
    setShowFollowUpDate(needed)
    // Also update when form values change
    const subscription = form.watch((value) => {
      if ('follow_up_needed' in value) {
        setShowFollowUpDate(value.follow_up_needed)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="appointment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İlgili Randevu (Opsiyonel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Randevu seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {appointments?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {format(new Date(a.appointmentDate), 'dd/MM/yyyy HH:mm')} - {a.location}
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
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanı / Teşhis</FormLabel>
              <FormControl>
                <Input placeholder="Konulan teşhis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment_received"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uygulanan Tedavi / İşlem</FormLabel>
              <FormControl>
                <Textarea placeholder="Yapılan tedavi veya ameliyat detayları" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outcome_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sonuç Notları</FormLabel>
              <FormControl>
                <Textarea placeholder="Tedavi sonucu ile ilgili ek notlar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="follow_up_needed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Kontrol Gerekli mi?</FormLabel>
                <FormDescription className="text-xs">
                  Hastanın ilerleyen tarihte tekrar görülmesi gerekiyor mu?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {showFollowUpDate && (
          <FormField
            control={form.control}
            name="follow_up_date"
            render={({ field }) => (
              <FormItem className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <FormLabel>Kontrol Tarihi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createOutcome.isPending}>
            Belgele
          </Button>
        </div>
      </form>
    </Form>
  )
}
