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
import { inKindAidSchema, type InKindAidFormData } from '@/lib/validators'
import type { InKindAid, InKindAidUnit } from '@/types'
import {
  useBeneficiaries,
  useCreateInKindAid,
  useUpdateInKindAid,
} from '@/hooks/use-api'

interface InKindAidFormProps {
  onSuccess?: () => void
  initialData?: Partial<InKindAidFormData>
  editingAid?: InKindAid | null
}

export function InKindAidForm({
  onSuccess,
  initialData,
  editingAid,
}: InKindAidFormProps) {
  const form = useForm<InKindAidFormData>({
    resolver: zodResolver(inKindAidSchema),
    defaultValues: {
      beneficiaryId: initialData?.beneficiaryId || editingAid?.beneficiaryId,
      yardimTuru: initialData?.yardimTuru || editingAid?.yardimTuru || 'gida',
      miktar: initialData?.miktar || editingAid?.miktar || 0,
      birim:
        (initialData?.birim as InKindAidUnit) ||
        (editingAid?.birim as InKindAidUnit) ||
        'adet',
      dagitimTarihi:
        initialData?.dagitimTarihi ||
        (editingAid
          ? new Date(editingAid.dagitimTarihi).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]),
      notlar: initialData?.notlar || editingAid?.notlar,
    },
  })

  const { data: beneficiariesData } = useBeneficiaries({ limit: 1000 })
  const beneficiaries = beneficiariesData?.data || []

  const { mutate: createAid, isPending: isCreating } = useCreateInKindAid({
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })

  const { mutate: updateAid, isPending: isUpdating } = useUpdateInKindAid({
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: InKindAidFormData) {
    if (editingAid) {
      updateAid({
        id: editingAid.id,
        data: {
          yardim_turu: data.yardimTuru,
          miktar: data.miktar,
          birim: data.birim,
          dagitim_tarihi: data.dagitimTarihi,
          notlar: data.notlar || undefined,
        },
      })
    } else {
      createAid({
        beneficiary_id: data.beneficiaryId,
        yardim_turu: data.yardimTuru,
        miktar: data.miktar,
        birim: data.birim,
        dagitim_tarihi: data.dagitimTarihi,
        notlar: data.notlar || undefined,
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
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value, 10))
                }
                value={field.value?.toString()}
                disabled={!!editingAid}
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
            name="yardimTuru"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yardım Türü *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Yardım türü seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gida">Gıda</SelectItem>
                    <SelectItem value="giyim">Giyim</SelectItem>
                    <SelectItem value="yakacak">Yakacak</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dagitimTarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dağıtım Tarihi *</FormLabel>
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
            name="miktar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miktar *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birim *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Birim seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adet">Adet</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="paket">Paket</SelectItem>
                    <SelectItem value="kutu">Kutu</SelectItem>
                    <SelectItem value="takim">Takım</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
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
                  placeholder="Ayni yardım ile ilgili notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? 'Kaydediliyor...'
            : editingAid
              ? 'Güncelle'
              : 'Ayni Yardım Kaydet'}
        </Button>
      </form>
    </Form>
  )
}
