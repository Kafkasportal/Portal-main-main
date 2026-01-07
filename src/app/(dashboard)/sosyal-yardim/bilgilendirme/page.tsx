'use client'

import { BookOpen, FileText, Info, Shield, Users } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function BilgilendirmePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bilgilendirme"
        description="Sosyal yardım modülü hakkında bilgiler ve dokümantasyon"
      />

      <Tabs defaultValue="genel" className="space-y-6">
        <TabsList>
          <TabsTrigger value="genel">Genel Bilgi</TabsTrigger>
          <TabsTrigger value="surec">İş Akışı</TabsTrigger>
          <TabsTrigger value="roller">Roller</TabsTrigger>
          <TabsTrigger value="sss">Sıkça Sorulanlar</TabsTrigger>
        </TabsList>

        {/* Genel Bilgi */}
        <TabsContent value="genel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Sosyal Yardım Modülü
              </CardTitle>
              <CardDescription>
                Dernek üyelerine ve ihtiyaç sahiplerine yönelik yardım yönetim sistemi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Modül Özellikleri</h3>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>Nakdi ve ayni yardım başvuruları</li>
                  <li>Eğitim ve sağlık yardımları</li>
                  <li>Kira ve fatura desteği</li>
                  <li>Hastane sevk yönetimi</li>
                  <li>Vezne ve banka ödemeleri</li>
                  <li>Veri kontrolü ve raporlama</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-semibold">Yardım Türleri</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">Nakdi Yardım</Badge>
                  <Badge variant="outline">Ayni Yardım</Badge>
                  <Badge variant="outline">Eğitim Yardımı</Badge>
                  <Badge variant="outline">Sağlık Yardımı</Badge>
                  <Badge variant="outline">Kira Yardımı</Badge>
                  <Badge variant="outline">Fatura Yardımı</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* İş Akışı */}
        <TabsContent value="surec" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Başvuru İş Akışı
              </CardTitle>
              <CardDescription>
                Yardım başvurusundan ödemeye kadar olan süreç
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Başvuru Oluşturma</h4>
                    <p className="text-muted-foreground text-sm">
                      İhtiyaç sahibi veya görevli tarafından başvuru formu doldurulur
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">İnceleme</h4>
                    <p className="text-muted-foreground text-sm">
                      Başvuru sosyal yardım görevlisi tarafından incelenir
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Değerlendirme</h4>
                    <p className="text-muted-foreground text-sm">
                      Başvuru durumuna göre onaylanır veya reddedilir
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Ödeme</h4>
                    <p className="text-muted-foreground text-sm">
                      Onaylanan başvurular vezne veya banka yoluyla ödenir
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Tamamlama</h4>
                    <p className="text-muted-foreground text-sm">
                      Ödeme yapıldıktan sonra başvuru tamamlanmış olarak işaretlenir
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roller */}
        <TabsContent value="roller" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kullanıcı Rolleri
              </CardTitle>
              <CardDescription>
                Modüldeki kullanıcı rolleri ve yetkileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-primary h-5 w-5" />
                    <h4 className="font-semibold">Yönetici</h4>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Tüm işlemleri yapabilir, ayarları yönetebilir, raporları görüntüleyebilir
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    <h4 className="font-semibold">Sosyal Yardım Görevlisi</h4>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Başvuru oluşturabilir, inceleyebilir, onaylayabilir, ödeme yapabilir
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary h-5 w-5" />
                    <h4 className="font-semibold">Muhasebe Görevlisi</h4>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Ödemeleri yönetebilir, banka emirleri oluşturabilir, raporları görüntüleyebilir
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-primary h-5 w-5" />
                    <h4 className="font-semibold">Üye</h4>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Kendi başvurularını görüntüleyebilir, durumlarını takip edebilir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSS */}
        <TabsContent value="sss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sıkça Sorulan Sorular
              </CardTitle>
              <CardDescription>
                Sosyal yardım modülü hakkında sıkça sorulan sorular
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Nasıl başvuru yapabilirim?</h4>
                  <p className="text-muted-foreground text-sm">
                    Başvuru yapmak için sosyal yardım görevlisine başvurabilir veya online formu doldurabilirsiniz.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold">Başvurum ne zaman onaylanır?</h4>
                  <p className="text-muted-foreground text-sm">
                    Başvurular genellikle 7 iş günü içinde incelenir ve onaylanır.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold">Ödemeler nasıl yapılır?</h4>
                  <p className="text-muted-foreground text-sm">
                    Ödemeler vezneden nakit olarak veya banka havalesi yoluyla yapılır.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold">Birden fazla başvuru yapabilir miyim?</h4>
                  <p className="text-muted-foreground text-sm">
                    Evet, ancak aylık ve yıllık başvuru limitleri vardır. Detaylı bilgi için parametreler sayfasını inceleyin.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold">Reddedilen başvurumu ne yapabilirim?</h4>
                  <p className="text-muted-foreground text-sm">
                    Reddedilen başvurular için itiraz mekanizması mevcuttur. Yönetici ile iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Yardım Butonu */}
      <Card>
        <CardHeader>
          <CardTitle>Daha Fazla Bilgi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Daha fazla bilgi için dokümantasyonu inceleyin veya yönetici ile iletişime geçin.
          </p>
          <div className="flex gap-2">
            <Button>Dokümantasyon</Button>
            <Button variant="outline">İletişim</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
