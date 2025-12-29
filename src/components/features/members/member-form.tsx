'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { useCreateMember } from '@/hooks/use-api'
import { MEMBER_TYPE_LABELS, TURKISH_CITIES } from '@/lib/constants'
import { memberSchema, type MemberFormData } from '@/lib/validators'

interface MemberFormProps {
  onSuccess?: () => void
  initialData?: Partial<MemberFormData>
}

export function MemberForm({ onSuccess, initialData }: MemberFormProps) {
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    mode: 'onChange', // Validate on change for instant feedback
    reValidateMode: 'onChange', // Re-validate on change
    defaultValues: {
      tcKimlikNo: initialData?.tcKimlikNo || '',
      ad: initialData?.ad || '',
      soyad: initialData?.soyad || '',
      telefon: initialData?.telefon || '',
      email: initialData?.email || '',
      dogumTarihi: initialData?.dogumTarihi || '',
      cinsiyet: initialData?.cinsiyet || 'erkek',
      uyeTuru: initialData?.uyeTuru || 'aktif',
      adres: {
        il: initialData?.adres?.il || '',
        ilce: initialData?.adres?.ilce || '',
        mahalle: initialData?.adres?.mahalle || '',
        acikAdres: initialData?.adres?.acikAdres || '',
      },
    },
  })

  const { mutate, isPending } = useCreateMember({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  function onSubmit(data: MemberFormData) {
    // Clean phone number - remove spaces, dashes, parentheses
    const cleanPhone = data.telefon
      .replaceAll(/[\s\-()]/g, '')
      .replace(/^\+90/, '0')

    // Map uyeTuru from form values to DB enum values
    const uyeTuruMap: Record<string, 'standart' | 'onursal' | 'fahri'> = {
      aktif: 'standart',
      genc: 'standart',
      destekci: 'fahri',
      onursal: 'onursal',
    }

    // Construct address string from nested object
    const adresString = [
      data.adres.il,
      data.adres.ilce,
      data.adres.mahalle,
      data.adres.acikAdres,
    ]
      .filter(Boolean)
      .join(', ')

    mutate({
      tc_kimlik_no: data.tcKimlikNo,
      ad: data.ad,
      soyad: data.soyad,
      telefon: cleanPhone,
      email: data.email || null,
      dogum_tarihi: data.dogumTarihi || null,
      cinsiyet: data.cinsiyet,
      uye_turu: uyeTuruMap[data.uyeTuru] || 'standart',
      adres: adresString || null,
      kayit_tarihi: new Date().toISOString(),
      aidat_durumu: 'beklemede',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* Kişisel Bilgiler */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Kişisel Bilgiler
          </h3>

          <FormField
            control={form.control}
            name="tcKimlikNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TC Kimlik No *</FormLabel>
                <FormControl>
                  <Input placeholder="12345678901" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ad"
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
              name="soyad"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dogumTarihi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doğum Tarihi</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const value = e.target.value
                        // Handle invalid date values from browser
                        // Check if the input's validity state indicates an invalid date
                        const input = e.target as HTMLInputElement
                        const isValid = input.validity.valid

                        if (
                          !isValid ||
                          value === 'invalid-date' ||
                          value === ''
                        ) {
                          // Clear invalid date
                          field.onChange('')
                          // Trigger validation immediately to show error
                          setTimeout(() => {
                            form.trigger('dogumTarihi')
                          }, 0)
                        } else {
                          // Validate date format
                          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
                          if (dateRegex.test(value)) {
                            const date = new Date(value)
                            // Check if date is valid and matches the input format
                            if (
                              !isNaN(date.getTime()) &&
                              date.toISOString().split('T')[0] === value
                            ) {
                              field.onChange(value)
                            } else {
                              // Invalid date, clear and trigger validation
                              field.onChange('')
                              setTimeout(() => {
                                form.trigger('dogumTarihi')
                              }, 0)
                            }
                          } else {
                            // Invalid format, clear and trigger validation
                            field.onChange('')
                            setTimeout(() => {
                              form.trigger('dogumTarihi')
                            }, 0)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        const input = e.target as HTMLInputElement

                        // Check if the input is invalid
                        if (!input.validity.valid || value === 'invalid-date') {
                          // Clear invalid date
                          field.onChange('')
                        }

                        field.onBlur()
                        // Trigger validation on blur to show errors
                        setTimeout(() => {
                          form.trigger('dogumTarihi')
                        }, 0)
                      }}
                    />
                  </FormControl>
                  <FormDescription>İsteğe bağlı</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cinsiyet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cinsiyet *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="erkek">Erkek</SelectItem>
                      <SelectItem value="kadin">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold">
            İletişim Bilgileri
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="telefon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="0555 123 45 67 veya 05551234567"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Türk telefon formatı (örn: 0555 123 45 67 veya 05551234567)
                  </FormDescription>
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
                    <Input
                      type="email"
                      placeholder="ornek@mail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Adres Bilgileri */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Adres Bilgileri
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="adres.il"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İl *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="İl seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TURKISH_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
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
              name="adres.ilce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İlçe *</FormLabel>
                  <FormControl>
                    <Input placeholder="İlçe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="adres.mahalle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mahalle</FormLabel>
                <FormControl>
                  <Input placeholder="Mahalle (isteğe bağlı)" {...field} />
                </FormControl>
                <FormDescription>İsteğe bağlı</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adres.acikAdres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açık Adres</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Sokak, bina no, daire... (isteğe bağlı)"
                    className="resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormDescription>İsteğe bağlı</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Üyelik Bilgileri */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Üyelik Bilgileri
          </h3>

          <FormField
            control={form.control}
            name="uyeTuru"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Üye Türü *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MEMBER_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Üyelik türüne göre aidat miktarı belirlenir
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
          <Button type="submit" loading={isPending}>
            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
