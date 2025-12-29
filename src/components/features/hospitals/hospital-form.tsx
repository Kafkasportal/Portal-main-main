'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useCreateHospital } from '@/hooks/use-api'
import type { Hospital } from '@/types'

const hospitalSchema = z.object({
  name: z.string().min(2, 'Hastane adı en az 2 karakter olmalıdır'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta giriniz').optional().or(z.literal('')),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

type HospitalFormValues = z.infer<typeof hospitalSchema>

interface HospitalFormProps {
  hospital?: Hospital
  onSuccess?: () => void
}

const COMMON_SPECIALTIES = [
  'Kardiyoloji',
  'Nöroloji',
  'Ortopedi',
  'Dahiliye',
  'Göz Hastalıkları',
  'Onkoloji',
  'Pediatri',
  'Genel Cerrahi',
  'Kadın Doğum',
  'KBB',
]

export function HospitalForm({ hospital, onSuccess }: HospitalFormProps) {
  const createHospital = useCreateHospital()
  // Note: useUpdateHospital hook needs to be updated to handle variables correctly if it doesn't
  
  const form = useForm({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: hospital?.name || '',
      address: hospital?.address || '',
      phone: hospital?.phone || '',
      email: hospital?.email || '',
      specialties: hospital?.specialties || [],
      isActive: hospital?.isActive ?? true,
      notes: hospital?.notes || '',
    },
  })

  function onSubmit(values: HospitalFormValues) {
    if (hospital) {
      // updateHospital.mutate({ id: hospital.id, data: values })
    } else {
      createHospital.mutate(values as Parameters<typeof createHospital.mutate>[0], {
        onSuccess: () => {
          onSuccess?.()
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hastane Adı</FormLabel>
              <FormControl>
                <Input placeholder="Hastane adını giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="0212..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input placeholder="info@hastane.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Textarea placeholder="Hastane adresi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Uzmanlık Alanları</FormLabel>
          <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
            {COMMON_SPECIALTIES.map((spec) => (
              <FormField
                key={spec}
                control={form.control}
                name="specialties"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={spec}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(spec)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), spec])
                              : field.onChange(
                                  field.value?.filter((value) => value !== spec)
                                )
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-xs cursor-pointer">
                        {spec}
                      </FormLabel>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif Durum</FormLabel>
                <div className="text-xs text-muted-foreground">
                  Hastane sevklere açık mı?
                </div>
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea placeholder="Ek bilgiler..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createHospital.isPending}>
            {hospital ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
