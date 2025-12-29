'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useCreateAppointment } from '@/hooks/use-api'
import type { HospitalAppointment } from '@/types'

const appointmentSchema = z.object({
  referral_id: z.string().min(1),
  appointment_date: z
    .date({ message: 'Randevu tarihi seçilmelidir' })
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Geçmiş tarihe randevu alınamaz',
    }),
  appointment_time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Geçerli bir saat giriniz (HH:mm)'
    ),
  location: z.string().min(2, 'Konum/Birim belirtilmelidir'),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  referralId: string
  appointment?: HospitalAppointment
  onSuccess?: () => void
}

export function AppointmentForm({
  referralId,
  appointment,
  onSuccess,
}: AppointmentFormProps) {
  const createAppointment = useCreateAppointment(referralId)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      referral_id: referralId,
      appointment_date: appointment?.appointmentDate
        ? new Date(appointment.appointmentDate)
        : new Date(),
      appointment_time: appointment?.appointmentDate
        ? format(new Date(appointment.appointmentDate), 'HH:mm')
        : '09:00',
      location: appointment?.location || '',
      notes: appointment?.notes || '',
    },
  })

  function onSubmit(values: AppointmentFormValues) {
    const [hours, minutes] = values.appointment_time.split(':').map(Number)
    const fullDate = new Date(values.appointment_date)
    fullDate.setHours(hours, minutes, 0, 0)

    createAppointment.mutate(
      {
        referral_id: referralId,
        appointment_date: fullDate.toISOString(),
        location: values.location,
        notes: values.notes,
        status: 'scheduled',
        reminder_sent: false,
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="appointment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Randevu Tarihi</FormLabel>
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
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
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
            name="appointment_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saat</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="09:00" {...field} />
                    <Clock className="text-muted-foreground absolute top-2.5 right-3 h-4 w-4" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konum / Bölüm / Oda</FormLabel>
              <FormControl>
                <Input
                  placeholder="Örn: Kardiyoloji Polikliniği, 2. Kat"
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
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Randevu ile ilgili ek bilgiler..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createAppointment.isPending}>
            {appointment ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
