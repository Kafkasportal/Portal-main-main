/**
 * Admin New User Page
 * Yeni Kullanıcı Oluşturma Sayfası
 */

import { ArrowLeft, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserForm } from '@/components/admin/users/user-form'
import { useCreateUser } from '@/hooks/use-users'
import type { CreateUserData } from '@/types/users'

export default function NewUserPage() {
  const createUserMutation = useCreateUser()

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
              <UserPlus className="h-8 w-8" />
              Yeni Kullanıcı Oluştur
            </h1>
            <p className="text-muted-foreground mt-1">
              Sisteme yeni bir dernek çalışanı ekleyin
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <CardDescription>
              Lütfen aşağıdaki formu doldurarak yeni bir kullanıcı oluşturun. Tüm zorunlu alanları (*) işaretlidir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm
              onSubmit={(data) => createUserMutation.mutate(data as CreateUserData)}
              isLoading={createUserMutation.isPending}
              mode="create"
            />
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">Bilgilendirme</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 dark:text-blue-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Yeni kullanıcı oluşturulduğunda otomatik olarak e-posta onaylanır</li>
              <li>Varsayılan şifre sistem tarafından oluşturulur</li>
              <li>Kullanıcı kendi şifresini ilk girişte değiştirebilir</li>
              <li>Role göre varsayılan izinler otomatik atanır</li>
              <li>Kullanıcı e-posta adresi benzersiz olmalıdır</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

