'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, CheckCircle, FileText, Printer, RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useApplications } from '@/hooks/use-api'
import { BASVURU_DURUMU_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { bankOrderSchema, type BankOrderFormData } from '@/lib/validators'
import { updateApplicationStatus } from '@/lib/supabase-service'

const durumColors = {
  onaylandi: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  odendi: 'bg-teal-500/15 text-teal-600 border-teal-500/25',
}

const BANKS = [
  { value: 'ziraat', label: 'Ziraat Bankası' },
  { value: 'halkbank', label: 'Halkbank' },
  { value: 'vakifbank', label: 'Vakıfbank' },
  { value: 'isbank', label: 'İş Bankası' },
  { value: 'garanti', label: 'Garanti BBVA' },
  { value: 'yapikredi', label: 'Yapı Kredi' },
  { value: 'akbank', label: 'Akbank' },
  { value: 'finansbank', label: 'QNB Finansbank' },
  { value: 'denizbank', label: 'Denizbank' },
  { value: 'sekerbank', label: 'Şekerbank' },
  { value: 'kuveytturk', label: 'Kuveyt Türk' },
  { value: 'albaraka', label: 'Albaraka Türk' },
  { value: 'turkiye', label: 'Türkiye Finans' },
  { value: 'diger', label: 'Diğer' },
]

export default function BankaEmirleriPage() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useApplications({
    limit: 100,
    durum: 'onaylandi',
  })

  const form = useForm<BankOrderFormData>({
    resolver: zodResolver(bankOrderSchema),
    defaultValues: {
      tutar: 0,
      iban: '',
      bankaAdi: '',
      aliciAdi: '',
      aliciSoyadi: '',
      aciklama: '',
    },
  })

  const orderMutation = useMutation({
    mutationFn: (data: { id: string; paymentData: any }) =>
      updateApplicationStatus(data.id, data.paymentData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Banka emri başarıyla oluşturuldu')
      setIsOrderDialogOpen(false)
      form.reset()
      setSelectedApplication(null)
    },
    onError: () => {
      toast.error('Banka emri oluşturulurken bir hata oluştu')
    },
  })

  const handleCreateOrder = (values: BankOrderFormData) => {
    if (!selectedApplication) return

    orderMutation.mutate({
      id: selectedApplication.id,
      paymentData: {
        odemeBilgileri: {
          tutar: values.tutar,
          odemeTarihi: new Date().toISOString(),
          makbuzNo: `BE-${Date.now()}`,
          odemeYontemi: 'havale',
          durum: 'odendi',
          iban: values.iban,
          bankaAdi: values.bankaAdi,
          aliciAdi: values.aliciAdi,
          aliciSoyadi: values.aliciSoyadi,
          aciklama: values.aciklama,
        },
        durum: 'odendi',
      },
    })
  }

  const handlePrintOrder = (application: any) => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Banka Emri - ${application.odemeBilgileri?.makbuzNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .order { border: 1px solid #ddd; padding: 20px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KafkasDer Derneği</h1>
            <p>Banka Emri Formu</p>
          </div>
          <div class="order">
            <div class="row">
              <span class="label">Emir No:</span>
              <span>${application.odemeBilgileri?.makbuzNo}</span>
            </div>
            <div class="row">
              <span class="label">Tarih:</span>
              <span>${formatDate(application.odemeBilgileri?.odemeTarihi)}</span>
            </div>
            <div class="row">
              <span class="label">Alıcı:</span>
              <span>${application.odemeBilgileri?.aliciAdi} ${application.odemeBilgileri?.aliciSoyadi}</span>
            </div>
            <div class="row">
              <span class="label">Banka:</span>
              <span>${application.odemeBilgileri?.bankaAdi}</span>
            </div>
            <div class="row">
              <span class="label">IBAN:</span>
              <span>${application.odemeBilgileri?.iban}</span>
            </div>
            <div class="row">
              <span class="label">Yardım Türü:</span>
              <span>${application.yardimTuru}</span>
            </div>
            ${application.odemeBilgileri?.aciklama ? `
            <div class="row">
              <span class="label">Açıklama:</span>
              <span>${application.odemeBilgileri.aciklama}</span>
            </div>
            ` : ''}
            <div class="total">
              <div class="row">
                <span class="label">Transfer Tutarı:</span>
                <span class="label">${formatCurrency(application.odemeBilgileri?.tutar)}</span>
              </div>
            </div>
            <div class="signature">
              <div>
                <div class="signature-line">Muhasebe Yetkilisi</div>
              </div>
              <div>
                <div class="signature-line">Onay</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const columns = [
    {
      accessorKey: 'basvuranKisi',
      header: 'Ad Soyad',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">
            {row.original.basvuranKisi.ad} {row.original.basvuranKisi.soyad}
          </p>
          <p className="text-muted-foreground text-xs">
            {row.original.basvuranKisi.tcKimlikNo}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'yardimTuru',
      header: 'Yardım Türü',
      cell: ({ row }: any) => <Badge variant="outline">{row.original.yardimTuru}</Badge>,
    },
    {
      accessorKey: 'talepEdilenTutar',
      header: 'Talep Tutar',
      cell: ({ row }: any) => formatCurrency(row.original.talepEdilenTutar),
    },
    {
      accessorKey: 'durum',
      header: 'Durum',
      cell: ({ row }: any) => (
        <Badge className={durumColors[row.original.durum as keyof typeof durumColors]}>
          {BASVURU_DURUMU_LABELS[row.original.durum as keyof typeof BASVURU_DURUMU_LABELS]}
        </Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'İşlemler',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row.original.durum === 'onaylandi' && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedApplication(row.original)
                form.setValue('tutar', row.original.talepEdilenTutar || 0)
                form.setValue('aliciAdi', row.original.basvuranKisi.ad)
                form.setValue('aliciSoyadi', row.original.basvuranKisi.soyad)
                setIsOrderDialogOpen(true)
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Emir Oluştur
            </Button>
          )}
          {row.original.durum === 'odendi' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrintOrder(row.original)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Yazdır
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Banka Emirleri"
          description="Onaylanan başvurular için banka transfer emirleri oluşturun"
        />
        <QueryError
          title="Veriler Yüklenemedi"
          message="Banka emri verileri yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banka Emirleri"
        description="Onaylanan başvurular için banka transfer emirleri oluşturun"
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Emir</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((a: any) => a.durum === 'onaylandi').length || 0}
            </div>
            <p className="text-muted-foreground text-xs">Onaylanmış başvuru</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gönderilen</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((a: any) => a.durum === 'odendi').length || 0}
            </div>
            <p className="text-muted-foreground text-xs">Emir tamamlandı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                data?.data
                  ?.filter((a: any) => a.durum === 'odendi')
                  .reduce((sum: number, a: any) => sum + (a.odemeBilgileri?.tutar || 0), 0) || 0
              )}
            </div>
            <p className="text-muted-foreground text-xs">Bugün transfer edilen toplam</p>
          </CardContent>
        </Card>
      </div>

      {/* Emir Tablosu */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Banka Emirleri Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              searchPlaceholder="Ad veya TC ile ara..."
              searchColumn="basvuranKisi"
            />
          </CardContent>
        </Card>
      )}

      {/* Banka Emri Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Banka Transfer Emri</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  {selectedApplication.basvuranKisi.ad}{' '}
                  {selectedApplication.basvuranKisi.soyad} -{' '}
                  {formatCurrency(selectedApplication.talepEdilenTutar)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateOrder)} className="space-y-4">
              <FormField
                control={form.control}
                name="tutar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Tutarı</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankaAdi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banka</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Banka seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANKS.map((bank) => (
                          <SelectItem key={bank.value} value={bank.value}>
                            {bank.label}
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
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aliciAdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alıcı Adı</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aliciSoyadi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alıcı Soyadı</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="aciklama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Transfer açıklaması..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrderDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={orderMutation.isPending}>
                  {orderMutation.isPending ? 'Oluşturuluyor...' : 'Emri Gönder'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
