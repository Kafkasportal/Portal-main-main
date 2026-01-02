'use client'

import { UseFormReturn } from 'react-hook-form'

import {
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
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  COUNTRIES,
  DOSYA_BAGLANTISI_LABELS,
  FON_BOLGESI_LABELS,
  IHTIYAC_DURUMU_LABELS,
  IHTIYAC_SAHIBI_KATEGORI_LABELS,
  ISTANBUL_REGIONS,
  RIZA_BEYANI_LABELS,
  TELEFON_OPERATOR_KODLARI,
  TURKISH_CITIES,
} from '@/lib/constants'
import { type BeneficiaryFormData } from '@/lib/validators'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// FormKategori type definition
type FormKategori = 'yetiskin' | 'cocuk' | 'yetim' | 'saglik' | 'egitim' | 'engelli'

interface BasicInfoFormProps {
  form: UseFormReturn<BeneficiaryFormData>
  setHasChanges: (val: boolean) => void
  setDeleteChecked: (val: boolean) => void
  deleteChecked: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h3 className="text-foreground text-lg font-semibold">{children}</h3>
      <Separator className="flex-1" />
    </div>
  )
}

export function BasicInfoForm({
  form,
  setHasChanges,
  setDeleteChecked,
  deleteChecked,
}: BasicInfoFormProps) {
  const { register, setValue, formState: { errors } } = form
  const data = form.getValues()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Sol Sütun */}
      <div className="space-y-4">
        <FormField
            control={form.control}
            name="ad"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Ad *</FormLabel>
                    <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="uyruk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uyruk *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <LabelWrapper label="Kimlik No">
            <Input
              {...register(
                data.uyruk === 'Türkiye' ? 'tcKimlikNo' : 'yabanciKimlikNo'
              )}
            />
          </LabelWrapper>
          <div className="mt-1 flex items-center space-x-2">
            <Checkbox
              id="mernis"
              defaultChecked={data.mernisDogrulama}
              onCheckedChange={(checked) => setValue('mernisDogrulama', !!checked)}
            />
            <label
              htmlFor="mernis"
              className="cursor-pointer text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mernis Kontrolü Yap
            </label>
          </div>
        </div>

        <FormField
          control={form.control}
          name="kategori"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(IHTIYAC_SAHIBI_KATEGORI_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fonBolgesi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fon Bölgesi</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(FON_BOLGESI_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosyaBaglantisi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosya Bağlantısı</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(DOSYA_BAGLANTISI_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Dosya No Handling needs custom logic if we want to split input,
            for now simplifying or assuming parent handles specific UI logic
            But here we can just expose a text input or keep it read only if generated
        */}
      </div>

      {/* Orta Sütun */}
      <div className="space-y-4">
        <div className="space-y-2">
          <FormLabel>Cep Telefonu</FormLabel>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="cepTelefonuOperator"
              render={({ field }) => (
                <FormItem className="w-24 space-y-0">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kod" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TELEFON_OPERATOR_KODLARI.map((kod) => (
                        <SelectItem key={kod} value={kod}>
                          {kod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cepTelefonu"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input placeholder="XXX XX XX" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="sabitTelefon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sabit Telefon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yurtdisiTelefon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yurtdışı Telefon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>e-Posta Adresi</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <FormLabel>Bağlı Yetim</FormLabel>
            <div className="flex gap-2">
                <Input value="-" readOnly className="bg-muted" />
                <Button variant="outline" size="icon" type="button">
                    <Info className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div className="space-y-2">
            <FormLabel>Bağlı Kart</FormLabel>
            <div className="flex gap-2">
                <Input value="-" readOnly className="bg-muted" />
                <Button variant="outline" size="icon" type="button">
                    <Info className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      {/* Sağ Sütun */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="ulke"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ülke *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
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
          name="sehir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şehir / Bölge *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ISTANBUL_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                  {TURKISH_CITIES.filter(
                    (c) => !c.includes('İstanbul')
                  ).map((city) => (
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
          name="ilce"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yerleşim</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="İlçe seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value={field.value || 'ilce'}>{field.value || 'Seçiniz'}</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mahalle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mahalle / Köy</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Mahalle seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value={field.value || 'mahalle'}>{field.value || 'Seçiniz'}</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Textarea className="min-h-25" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <FormLabel>Rıza Beyanı</FormLabel>
            <Input
                value={RIZA_BEYANI_LABELS[data.rizaBeyaniDurumu || 'alinmadi']}
                readOnly
                className="bg-muted"
            />
        </div>

        {/* Durum Radio */}
        <div className="bg-muted/50 space-y-3 rounded-lg p-3">
          <div className="flex items-center gap-6">
            <FormLabel className="text-sm font-medium mb-0">Durum:</FormLabel>
            <Badge
              variant={
                data.durum === 'aktif' ? 'default' : 'secondary'
              }
            >
              {IHTIYAC_DURUMU_LABELS[data.durum || 'aktif']}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delete"
              checked={deleteChecked}
              onCheckedChange={(checked) => {
                setDeleteChecked(!!checked)
              }}
            />
            <label
              htmlFor="delete"
              className="text-destructive cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Kaydı Sil
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelWrapper({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <FormLabel>{label}</FormLabel>
            {children}
        </div>
    )
}
