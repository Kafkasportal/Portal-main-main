'use client'

import { Settings, Shield, Sliders } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ParametrelerPage() {
  const handleSave = () => {
    toast.success('Parametreler kaydedildi')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parametreler"
        description="Sosyal yardım modülü sistem ayarları"
      />

      <Tabs defaultValue="genel" className="space-y-6">
        <TabsList>
          <TabsTrigger value="genel">Genel Ayarlar</TabsTrigger>
          <TabsTrigger value="limitler">Limitler</TabsTrigger>
          <TabsTrigger value="onay">Onay Süreci</TabsTrigger>
        </TabsList>

        {/* Genel Ayarlar */}
        <TabsContent value="genel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>
                Sosyal yardım modülünün genel yapılandırması
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-yardim-turu">Varsayılan Yardım Türü</Label>
                  <select
                    id="default-yardim-turu"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="nakdi">Nakdi Yardım</option>
                    <option value="ayni">Ayni Yardım</option>
                    <option value="egitim">Eğitim Yardımı</option>
                    <option value="saglik">Sağlık Yardımı</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basvuru-sure-siniri">Başvuru Süre Sınırı (Gün)</Label>
                  <Input id="basvuru-sure-siniri" type="number" defaultValue="30" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basvuru-notu">Varsayılan Başvuru Notu</Label>
                <Textarea
                  id="basvuru-notu"
                  placeholder="Başvuru için varsayılan açıklama..."
                  className="resize-none"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Otomasyon Ayarları</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Otomatik Onay</Label>
                    <p className="text-muted-foreground text-xs">
                      Belirli tutar altındaki başvuruları otomatik onayla
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Otomatik Bildirim</Label>
                    <p className="text-muted-foreground text-xs">
                      Durum değişikliklerinde otomatik bildirim gönder
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limitler */}
        <TabsContent value="limitler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Yardım Limitleri
              </CardTitle>
              <CardDescription>
                Kişi bazlı yardım limitleri ve kısıtlamalar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-nakdi-tutar">Maksimum Nakdi Tutar (TL)</Label>
                  <Input id="max-nakdi-tutar" type="number" defaultValue="50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-aylik-basvuru">Aylık Maksimum Başvuru</Label>
                  <Input id="max-aylik-basvuru" type="number" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-yillik-basvuru">Yıllık Maksimum Başvuru</Label>
                  <Input id="max-yillik-basvuru" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-bekleme-suresi">Başvuru Arası Minimum Bekleme (Gün)</Label>
                  <Input id="min-bekleme-suresi" type="number" defaultValue="7" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Kategori Bazlı Limitler</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-egitim-tutar">Eğitim Yardımı Maksimum (TL)</Label>
                    <Input id="max-egitim-tutar" type="number" defaultValue="20000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-saglik-tutar">Sağlık Yardımı Maksimum (TL)</Label>
                    <Input id="max-saglik-tutar" type="number" defaultValue="100000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-kira-tutar">Kira Yardımı Maksimum (TL)</Label>
                    <Input id="max-kira-tutar" type="number" defaultValue="15000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-fatura-tutar">Fatura Yardımı Maksimum (TL)</Label>
                    <Input id="max-fatura-tutar" type="number" defaultValue="10000" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onay Süreci */}
        <TabsContent value="onay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Onay Süreci
              </CardTitle>
              <CardDescription>
                Başvuru onay ve değerlendirme süreç ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inceleme-suresi">İnceleme Süresi (Gün)</Label>
                  <Input id="inceleme-suresi" type="number" defaultValue="7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onay-suresi">Onay Süresi (Gün)</Label>
                  <Input id="onay-suresi" type="number" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odeme-suresi">Ödeme Süresi (Gün)</Label>
                  <Input id="odeme-suresi" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otomatik-red-suresi">Otomatik Red Süresi (Gün)</Label>
                  <Input id="otomatik-red-suresi" type="number" defaultValue="30" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Onay Seviyeleri</h3>
                <div className="space-y-2">
                  <Label htmlFor="onay-seviye-1">1. Seviye Onay Tutarı (TL)</Label>
                  <Input id="onay-seviye-1" type="number" defaultValue="10000" />
                  <p className="text-muted-foreground text-xs">
                    Bu tutar ve altındaki başvurular tek onay ile tamamlanır
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onay-seviye-2">2. Seviye Onay Tutarı (TL)</Label>
                  <Input id="onay-seviye-2" type="number" defaultValue="50000" />
                  <p className="text-muted-foreground text-xs">
                    Bu tutar ve altındaki başvurular iki onay gerektirir
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onay-seviye-3">3. Seviye Onay Tutarı (TL)</Label>
                  <Input id="onay-seviye-3" type="number" defaultValue="100000" />
                  <p className="text-muted-foreground text-xs">
                    Bu tutar ve üstündeki başvurular üç onay gerektirir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}
