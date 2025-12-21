'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Bell, Shield, User, Globe, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false
    })

    const handleSave = () => {
        toast.success('Ayarlar kaydedildi')
    }

    return (
        <div className="space-y-6">
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
                            <CardDescription>
                                Hesap bilgilerinizi güncelleyin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input id="name" defaultValue="Admin Kullanıcı" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" type="email" defaultValue="admin@kafkasder.org" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" type="tel" defaultValue="+90 555 123 4567" />
                            </div>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Kaydet
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Dil ve Bölge
                            </CardTitle>
                            <CardDescription>
                                Dil ve tarih formatı ayarları
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">Dil</Label>
                                <Input id="language" defaultValue="Türkçe" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Saat Dilimi</Label>
                                <Input id="timezone" defaultValue="Europe/Istanbul" disabled />
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
                            <CardDescription>
                                Bildirim türlerini yönetin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>E-posta Bildirimleri</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Önemli güncellemeler için e-posta alın
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.email}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, email: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Bildirimleri</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Tarayıcı push bildirimleri alın
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.push}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, push: checked })
                                    }
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>SMS Bildirimleri</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Acil durumlar için SMS alın
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.sms}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, sms: checked })
                                    }
                                />
                            </div>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Kaydet
                            </Button>
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
                            <CardDescription>
                                Hesap güvenliğinizi yönetin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Mevcut Şifre</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Yeni Şifre</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Şifreyi Güncelle
                            </Button>
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
                            <CardDescription>
                                Sistem yapılandırması ve bakım
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Veritabanı Durumu</Label>
                                <p className="text-sm text-muted-foreground">
                                    Bağlı (Mock Service)
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Yedekleme</Label>
                                <p className="text-sm text-muted-foreground">
                                    Son yedekleme: Henüz yapılmadı
                                </p>
                            </div>
                            <Button variant="outline">
                                Yedekleme Oluştur
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
