/**
 * Admin Edit User Page
 * Kullanıcı Düzenleme Sayfası
 */

'use client'

import { ArrowLeft, Edit2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { UserForm } from '@/components/admin/users/user-form'
import { useUserManagement } from '@/hooks/use-users'
import { notFound } from 'next/navigation'

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { user, isLoading, error, updateUser, isUpdating } = useUserManagement(params.id)

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>
            Kullanıcı bilgileri yüklenirken bir hata oluştu.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Edit2 className="h-8 w-8" />
              Kullanıcı Düzenle
            </h1>
            <p className="text-muted-foreground mt-1">
              <span className="font-medium">{user.name}</span> kullanıcısının bilgilerini güncelleyin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
          <Badge variant="outline">
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <CardDescription>
              Kullanıcı bilgilerini güncelleyin. Değişiklikler kaydedilmeden önce gözden geçirin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm
              initialData={user}
              onSubmit={(data) => updateUser({ id: params.id, ...data })}
              isLoading={isUpdating}
              mode="edit"
            />
          </CardContent>
        </Card>

        {/* Warning Box */}
        {user.role === 'admin' && (
          <Alert className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Admin Kullanıcı</AlertTitle>
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
              Bu kullanıcı admin rolüne sahip. Bu kullanıcıya yapılan değişiklikler sistem erişimlerini etkileyebilir.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Box */}
        <Alert className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Bilgilendirme</AlertTitle>
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Kullanıcı e-posta adresini değiştirirseniz, kullanıcı yeniden giriş yapmalıdır</li>
              <li>Şifre alanını boş bırakırsanız mevcut şifre korunur</li>
              <li>Rol değişikliği kullanıcının izinlerini günceller</li>
              <li>Özel izinleri yalnızca gerekirse değiştirin</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

