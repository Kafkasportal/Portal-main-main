'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Banknote, CheckCircle, Printer, RefreshCw, Wallet } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useApplications } from '@/hooks/use-api'
import { BASVURU_DURUMU_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cashPaymentSchema, type CashPaymentFormData } from '@/lib/validators'
import { updateApplicationStatus } from '@/lib/supabase-service'

const durumColors = {
  onaylandi: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  odendi: 'bg-teal-500/15 text-teal-600 border-teal-500/25',
}

export default function VeznePage() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useApplications({
    limit: 100,
    durum: 'onaylandi',
  })

  const form = useForm<CashPaymentFormData>({
    resolver: zodResolver(cashPaymentSchema),
    defaultValues: {
      tutar: 0,
      makbuzNo: '',
      aliciAdi: '',
      aliciSoyadi: '',
      aliciImza: '',
    },
  })

  const paymentMutation = useMutation({
    mutationFn: (data: { id: string; paymentData: any }) =>
      updateApplicationStatus(data.id, data.paymentData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Nakit ödeme başarıyla kaydedildi')
      setIsPaymentDialogOpen(false)
      form.reset()
      setSelectedApplication(null)
    },
    onError: () => {
      toast.error('Ödeme kaydedilirken bir hata oluştu')
    },
  })

  const handlePayment = (values: CashPaymentFormData) => {
    if (!selectedApplication) return

    paymentMutation.mutate({
      id: selectedApplication.id,
      paymentData: {
        odemeBilgileri: {
          tutar: values.tutar,
          odemeTarihi: new Date().toISOString(),
          makbuzNo: values.makbuzNo,
          odemeYontemi: 'nakit',
          durum: 'odendi',
          aliciAdi: values.aliciAdi,
          aliciSoyadi: values.aliciSoyadi,
          aliciImza: values.aliciImza,
        },
        durum: 'odendi',
      },
    })
  }

  const handlePrintReceipt = (application: any) => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Makbuz - ${application.odemeBilgileri?.makbuzNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .receipt { border: 1px solid #ddd; padding: 20px; }
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
            <p>Nakit Ödeme Makbuzu</p>
          </div>
          <div class="receipt">
            <div class="row">
              <span class="label">Makbuz No:</span>
              <span>${application.odemeBilgileri?.makbuzNo}</span>
            </div>
            <div class="row">
              <span class="label">Tarih:</span>
              <span>${formatDate(application.odemeBilgileri?.odemeTarihi)}</span>
            </div>
            <div class="row">
              <span class="label">Alıcı:</span>
              <span>${application.basvuranKisi.ad} ${application.basvuranKisi.soyad}</span>
            </div>
            <div class="row">
              <span class="label">TC Kimlik:</span>
              <span>${application.basvuranKisi.tcKimlikNo}</span>
            </div>
            <div class="row">
              <span class="label">Yardım Türü:</span>
              <span>${application.yardimTuru}</span>
            </div>
            <div class="total">
              <div class="row">
                <span class="label">Toplam Tutar:</span>
                <span class="label">${formatCurrency(application.odemeBilgileri?.tutar)}</span>
              </div>
            </div>
            <div class="signature">
              <div>
                <div class="signature-line">Alıcı İmza</div>
                <p>${application.odemeBilgileri?.aliciAdi} ${application.odemeBilgileri?.aliciSoyadi}</p>
              </div>
              <div>
                <div class="signature-line">Veznedar İmza</div>
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
                setIsPaymentDialogOpen(true)
              }}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Öde
            </Button>
          )}
          {row.original.durum === 'odendi' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrintReceipt(row.original)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Makbuz
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
          title="Vezne - Nakit Ödemeler"
          description="Onaylanan başvuruların nakit ödemelerini yönetin"
        />
        <QueryError
          title="Veriler Yüklenemedi"
          message="Vezne verileri yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vezne - Nakit Ödemeler"
        description="Onaylanan başvuruların nakit ödemelerini yönetin"
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
            <CardTitle className="text-sm font-medium">Bekleyen Ödeme</CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
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
            <CardTitle className="text-sm font-medium">Bugün Ödenen</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((a: any) => a.durum === 'odendi').length || 0}
            </div>
            <p className="text-muted-foreground text-xs">Ödeme tamamlandı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <Banknote className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                data?.data
                  ?.filter((a: any) => a.durum === 'odendi')
                  .reduce((sum: number, a: any) => sum + (a.odemeBilgileri?.tutar || 0), 0) || 0
              )}
            </div>
            <p className="text-muted-foreground text-xs">Bugün ödenen toplam</p>
          </CardContent>
        </Card>
      </div>

      {/* Ödeme Tablosu */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Listesi</CardTitle>
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

      {/* Ödeme Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nakit Ödeme</DialogTitle>
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
            <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
              <FormField
                control={form.control}
                name="tutar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ödenecek Tutar</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="makbuzNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Makbuz No</FormLabel>
                    <FormControl>
                      <Input placeholder="MZ-2024-XXXXX" {...field} />
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
                name="aliciImza"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İmza (Alıcı)</FormLabel>
                    <FormControl>
                      <Input placeholder="İmza atınız..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={paymentMutation.isPending}>
                  {paymentMutation.isPending ? 'Kaydediliyor...' : 'Ödemeyi Tamamla'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
