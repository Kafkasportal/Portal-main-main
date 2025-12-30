'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { useRoles } from '@/hooks/use-permissions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { DEPARTMENTS } from '@/types/rbac'
import type { StaffUser } from '@/types/rbac'

// Form validation schema
const staffUserSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  roleId: z.string().min(1, 'Rol seçimi zorunludur'),
  hireDate: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
})

type StaffUserFormData = z.infer<typeof staffUserSchema>

interface StaffUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: StaffUser | null
}

export function StaffUserForm({ open, onOpenChange, user }: StaffUserFormProps) {
  const isEdit = !!user
  const queryClient = useQueryClient()
  const { data: roles, isLoading: rolesLoading } = useRoles()

  const form = useForm<StaffUserFormData>({
    resolver: zodResolver(staffUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      phone: user?.phone || '',
      title: user?.title || '',
      department: user?.department || '',
      roleId: user?.roleId || '',
      hireDate: user?.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : '',
      isActive: user?.isActive ?? true,
      notes: user?.notes || '',
    },
  })

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        title: user.title || '',
        department: user.department || '',
        roleId: user.roleId || '',
        hireDate: user.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : '',
        isActive: user.isActive,
        notes: user.notes || '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        department: '',
        roleId: '',
        hireDate: '',
        isActive: true,
        notes: '',
      })
    }
  }, [user, form])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: StaffUserFormData) => {
      const supabase = getSupabaseClient()
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || '',
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı')

      // Create user record
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        title: data.title || null,
        department: data.department || null,
        role_id: data.roleId,
        hire_date: data.hireDate || null,
        is_active: data.isActive,
        notes: data.notes || null,
      })

      if (userError) throw userError

      return authData.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Kullanıcı başarıyla oluşturuldu')
      form.reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error('Kullanıcı oluşturulamadı', { description: error.message })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: StaffUserFormData) => {
      if (!user) throw new Error('Kullanıcı bulunamadı')
      
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          title: data.title || null,
          department: data.department || null,
          role_id: data.roleId,
          hire_date: data.hireDate || null,
          is_active: data.isActive,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Kullanıcı başarıyla güncellendi')
      form.reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error('Kullanıcı güncellenemedi', { description: error.message })
    },
  })

  const onSubmit = (data: StaffUserFormData) => {
    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      if (!data.password) {
        form.setError('password', { message: 'Yeni kullanıcı için şifre zorunludur' })
        return
      }
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Personel Düzenle' : 'Yeni Personel'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Personel bilgilerini ve yetkilerini güncelleyin'
              : 'Dernek için yeni bir personel hesabı oluşturun'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet Yılmaz" {...field} />
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
                    <FormLabel>E-posta *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ahmet@dernek.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>En az 6 karakter</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="5XX XXX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşe Başlama Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unvan</FormLabel>
                    <FormControl>
                      <Input placeholder="Dernek Başkanı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birim</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Birim seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rol seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="" disabled>Yükleniyor...</SelectItem>
                      ) : (
                        roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.displayName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Rol, kullanıcının sistemdeki yetkilerini belirler
                  </FormDescription>
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
                      placeholder="Personel hakkında ek notlar..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aktif Kullanıcı</FormLabel>
                    <FormDescription>
                      Pasif kullanıcılar sisteme giriş yapamaz
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                  </>
                ) : (
                  <>{isEdit ? 'Güncelle' : 'Oluştur'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
