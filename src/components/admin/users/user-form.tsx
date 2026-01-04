/**
 * User Form Component
 * Kullanıcı oluşturma ve düzenleme formu
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionConfig } from './permission-config'
import { User, Role, Permission } from '@/types/users'
import { ROLE_PERMISSIONS_MAP } from '@/lib/services/users.service'

// Form validation schema
const userFormSchema = z.object({
  email: z.string().email('Geçersiz e-posta adresi'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional().or(z.literal('')),
  ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  role: z.enum(['admin', 'moderator', 'user']),
  phone: z.string().optional(),
  birim: z.string().optional(),
  yetki: z.string().optional(),
  gorev: z.string().optional(),
  dahili: z.string().optional(),
  kisa_kod: z.string().optional(),
  kisa_kod2: z.string().optional(),
  erisim_yetkisi: z.string().optional(),
  imza_yetkisi: z.string().optional(),
  fon_yetkisi: z.string().optional(),
  fon_bolgesi_yetkisi: z.string().optional(),
  fon_yetkisi2: z.string().optional(),
  fon_yetkisi3: z.string().optional(),
  imza_yetkisi2: z.string().optional(),
  imza_yetkisi3: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.record(z.boolean()).optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  initialData?: User
  onSubmit: (data: UserFormValues) => void
  isLoading: boolean
  mode: 'create' | 'edit'
}

export function UserForm({ initialData, onSubmit, isLoading, mode }: UserFormProps) {
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean>>(
    initialData?.permissions || {}
  )
  const [useCustomPermissions, setUseCustomPermissions] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData ? {
      email: initialData.email,
      password: '',
      ad: initialData.ad || '',
      soyad: initialData.soyad || '',
      role: initialData.role,
      phone: initialData.phone || '',
      birim: initialData.birim || '',
      yetki: initialData.yetki || '',
      gorev: initialData.gorev || '',
      dahili: initialData.dahili || '',
      kisa_kod: initialData.kisa_kod || '',
      kisa_kod2: initialData.kisa_kod2 || '',
      erisim_yetkisi: initialData.erisim_yetkisi || '',
      imza_yetkisi: initialData.imza_yetkisi || '',
      fon_yetkisi: initialData.fon_yetkisi || '',
      fon_bolgesi_yetkisi: initialData.fon_bolgesi_yetkisi || '',
      fon_yetkisi2: initialData.fon_yetkisi2 || '',
      fon_yetkisi3: initialData.fon_yetkisi3 || '',
      imza_yetkisi2: initialData.imza_yetkisi2 || '',
      imza_yetkisi3: initialData.imza_yetkisi3 || '',
      isActive: initialData.isActive,
      permissions: customPermissions,
    } : {
      email: '',
      password: '',
      ad: '',
      soyad: '',
      role: 'user',
      phone: '',
      birim: '',
      yetki: '',
      gorev: '',
      dahili: '',
      kisa_kod: '',
      kisa_kod2: '',
      erisim_yetkisi: '',
      imza_yetkisi: '',
      fon_yetkisi: '',
      fon_bolgesi_yetkisi: '',
      fon_yetkisi2: '',
      fon_yetkisi3: '',
      imza_yetkisi2: '',
      imza_yetkisi3: '',
      isActive: true,
      permissions: {},
    },
  })

  const selectedRole = form.watch('role')

  const handlePermissionChange = (permission: string, value: boolean) => {
    setCustomPermissions(prev => ({ ...prev, [permission]: value }))
  }

  const handleRoleChange = (role: string) => {
    form.setValue('role', role as Role)
    if (!useCustomPermissions) {
      // Role değiştiğinde varsayılan izinleri yükle
      const defaultPermissions = ROLE_PERMISSIONS_MAP[role as Role]
      setCustomPermissions(defaultPermissions)
    }
  }

  const handleFormSubmit = (values: UserFormValues) => {
    // Eğer özel izinler kullanılıyorsa, form verilerine ekle
    const submitData = {
      ...values,
      password: values.password || undefined, // Boşsa undefined yap
      permissions: useCustomPermissions ? customPermissions : undefined,
    }
    onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="work">İş Bilgileri</TabsTrigger>
            <TabsTrigger value="permissions">İzinler</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@kafkasder.org" {...field} />
                    </FormControl>
                    <FormDescription>
                      Kullanıcının e-posta adresi (benzersiz olmalıdır)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'create' && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="En az 6 karakter" {...field} />
                      </FormControl>
                      <FormDescription>
                        Varsayılan şifre (ilk girişte değiştirebilir)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+90 555 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <Select onValueChange={handleRoleChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Kullanıcı</SelectItem>
                        <SelectItem value="moderator">Moderatör</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Kullanıcının sistemdeki rolü
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktif Durumu</FormLabel>
                      <FormDescription>
                        Kullanıcının sisteme giriş yapabilip yapamayacağını belirler
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
            )}
          </TabsContent>

          {/* Tab 2: Work Information */}
          <TabsContent value="work" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birim</FormLabel>
                    <FormControl>
                      <Input placeholder="Teşkilatlandırma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gorev"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Görev</FormLabel>
                    <FormControl>
                      <Input placeholder="Birim Başkanı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yetki"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yetki</FormLabel>
                    <FormControl>
                      <Input placeholder="KULLANICI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dahili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dahili</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kisa_kod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kısa Kod</FormLabel>
                    <FormControl>
                      <Input placeholder="USR001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kisa_kod2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kısa Kod 2</FormLabel>
                    <FormControl>
                      <Input placeholder="USR002" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="erisim_yetkisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erişim Yetkisi</FormLabel>
                    <FormControl>
                      <Input placeholder="user@kafkasder.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imza_yetkisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İmza Yetkisi</FormLabel>
                    <FormControl>
                      <Input placeholder="Birim Başkanı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Fon Yetkileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fon_yetkisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fon Yetkisi</FormLabel>
                      <FormControl>
                        <Input placeholder="Genel Fon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fon_bolgesi_yetkisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fon Bölgesi Yetkisi</FormLabel>
                      <FormControl>
                        <Input placeholder="ALL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fon_yetkisi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fon Yetkisi 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Özel Fon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fon_yetkisi3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fon Yetkisi 3</FormLabel>
                      <FormControl>
                        <Input placeholder="Bağış Fonu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imza_yetkisi2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İmza Yetkisi 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Genel Sekreter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imza_yetkisi3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İmza Yetkisi 3</FormLabel>
                      <FormControl>
                        <Input placeholder="Başkan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Permissions */}
          <TabsContent value="permissions" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">İzin Ayarları</h3>
                <p className="text-sm text-muted-foreground">
                  Seçilen rol için varsayılan: <strong>{selectedRole}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={useCustomPermissions}
                  onCheckedChange={setUseCustomPermissions}
                />
                <span className="text-sm">Özel İzinler</span>
              </div>
            </div>

            <PermissionConfig
              permissions={customPermissions}
              onPermissionChange={handlePermissionChange}
              disabled={!useCustomPermissions}
            />
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            İptal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : mode === 'create' ? 'Kullanıcı Oluştur' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

