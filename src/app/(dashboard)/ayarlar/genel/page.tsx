'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useDebounce } from '@/hooks/use-debounce'
import { useCurrentUser, useUpdateNotificationPreferences, useUpdatePassword, useUpdateProfile, useNotificationPreferences } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  passwordChangeSchema,
  userProfileSchema,
  type PasswordChangeFormData,
  type UserProfileFormData,
} from '@/lib/validators'
import { Bell, Database, Globe, Save, Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Spinner } from '@/components/ui/spinner'

export default function SettingsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const { data: notificationPrefs, isLoading: prefsLoading } =
    useNotificationPreferences(currentUser?.id || '', {
      enabled: !!currentUser?.id,
    })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  // Update notifications state when preferences are loaded
  useEffect(() => {
    if (notificationPrefs) {
      setNotifications(notificationPrefs)
    }
  }, [notificationPrefs])

  // Debounce notification changes to auto-save
  const debouncedNotifications = useDebounce(notifications, 1000)
  const updateNotificationMutation = useUpdateNotificationPreferences(
    currentUser?.id || ''
  )

  useEffect(() => {
    if (
      currentUser?.id &&
      debouncedNotifications &&
      JSON.stringify(debouncedNotifications) !==
        JSON.stringify(notificationPrefs)
    ) {
      updateNotificationMutation.mutate(debouncedNotifications)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNotifications])

  // Profile form
  const profileForm = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
      })
    }
  }, [currentUser, profileForm])

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      profileForm.reset(profileForm.getValues())
    },
  })

  const onProfileSubmit = (data: UserProfileFormData) => {
    if (!currentUser?.id) return
    updateProfileMutation.mutate({
      id: currentUser.id,
      data,
    })
  }

  // Password form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const updatePasswordMutation = useUpdatePassword({
    onSuccess: () => {
      passwordForm.reset()
    },
  })

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    updatePasswordMutation.mutate([data.currentPassword, data.newPassword])
  }

  if (userLoading || prefsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Sistem ve uygulama ayarlarını yapılandırın"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kullanıcı Bilgileri
              </CardTitle>
              <CardDescription>Hesap bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
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
                  <FormField
                    control={profileForm.control}
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
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Dil ve Bölge
              </CardTitle>
              <CardDescription>Dil ve tarih formatı ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dil</label>
                <Input defaultValue="Türkçe" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Saat Dilimi</label>
                <Input defaultValue="Europe/Istanbul" disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Tercihleri
              </CardTitle>
              <CardDescription>Bildirim türlerini yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    E-posta Bildirimleri
                  </label>
                  <p className="text-muted-foreground text-sm">
                    Önemli güncellemeler için e-posta alın
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, email: checked })
                  }}
                  disabled={updateNotificationMutation.isPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Push Bildirimleri</label>
                  <p className="text-muted-foreground text-sm">
                    Tarayıcı push bildirimleri alın
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, push: checked })
                  }}
                  disabled={updateNotificationMutation.isPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">SMS Bildirimleri</label>
                  <p className="text-muted-foreground text-sm">
                    Acil durumlar için SMS alın
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, sms: checked })
                  }}
                  disabled={updateNotificationMutation.isPending}
                />
              </div>
              {updateNotificationMutation.isPending && (
                <p className="text-muted-foreground text-sm">
                  Kaydediliyor...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
              <CardDescription>Hesap güvenliğinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mevcut Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yeni Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yeni Şifre (Tekrar)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Şifreyi Güncelle
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sistem Ayarları
              </CardTitle>
              <CardDescription>Sistem yapılandırması ve bakım</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Veritabanı Durumu</label>
                <p className="text-muted-foreground text-sm">
                  Bağlı (Supabase)
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Yedekleme</label>
                <p className="text-muted-foreground text-sm">
                  Son yedekleme: Henüz yapılmadı
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/ayarlar/yedekleme">Yedekleme Yönetimi</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
