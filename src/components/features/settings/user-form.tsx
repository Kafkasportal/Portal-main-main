'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
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
import { Spinner } from '@/components/ui/spinner'
import { useCreateUser, useUpdateUser } from '@/hooks/use-api'
import { userSchema, type UserFormData } from '@/lib/validators'
import type { User } from '@/types'

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

const ROLE_LABELS = {
  admin: 'Yönetici',
  moderator: 'Moderatör',
  user: 'Kullanıcı',
} as const

export function UserForm({ open, onOpenChange, user }: UserFormProps) {
  const isEdit = !!user

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: (user?.role === 'admin'
        ? 'admin'
        : user?.role === 'muhasebe'
          ? 'moderator'
          : 'user') as 'admin' | 'moderator' | 'user',
      phone: user?.phone || '',
    },
  })

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '', // Don't pre-fill password
        role: (user.role === 'admin'
          ? 'admin'
          : user.role === 'muhasebe'
            ? 'moderator'
            : 'user') as 'admin' | 'moderator' | 'user',
        phone: user.phone || '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
      })
    }
  }, [user, form])

  const createMutation = useCreateUser({
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const onSubmit = (data: UserFormData) => {
    if (isEdit && user) {
      // For update, we don't send password if it's empty
      const updateData: Parameters<typeof updateMutation.mutate>[0]['data'] = {
        name: data.name,
        email: data.email,
        role: data.role,
        updated_at: new Date().toISOString(),
      }
      updateMutation.mutate({ id: user.id, data: updateData })
    } else {
      // For create, password is required
      createMutation.mutate({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Kullanıcı bilgilerini güncelleyin'
              : 'Yeni bir kullanıcı hesabı oluşturun'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rol seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        {ROLE_LABELS.admin}
                      </SelectItem>
                      <SelectItem value="moderator">
                        {ROLE_LABELS.moderator}
                      </SelectItem>
                      <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
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

