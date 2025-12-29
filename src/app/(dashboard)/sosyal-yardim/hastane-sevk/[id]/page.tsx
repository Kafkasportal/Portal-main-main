'use client'

import { useParams } from 'next/navigation'
import {
  useReferral,
  useAppointments,
  useTreatmentCosts,
  useOutcomes,
} from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, ClipboardCheck, Plus, Stethoscope, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ReferralStatusWorkflow } from '@/components/features/referrals/referral-status-workflow'
import { AppointmentForm } from '@/components/features/referrals/appointment-form'
import { TreatmentCostForm } from '@/components/features/referrals/treatment-cost-form'
import { TreatmentOutcomeForm } from '@/components/features/referrals/treatment-outcome-form'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import type { HospitalAppointment, TreatmentCost } from '@/types'

// Define minimal column structures for the tables
const appointmentColumns: ColumnDef<HospitalAppointment>[] = [
  {
    accessorKey: 'appointmentDate',
    header: 'Tarih',
    cell: ({ row }) => formatDate(row.getValue('appointmentDate')),
  },
  {
    accessorKey: 'location',
    header: 'Hastane',
  },
  {
    accessorKey: 'status',
    header: 'Durum',
  },
]

const costColumns: ColumnDef<TreatmentCost>[] = [
  {
    accessorKey: 'description',
    header: 'Açıklama',
  },
  {
    accessorKey: 'amount',
    header: 'Tutar',
    cell: ({ row }) => formatCurrency(row.getValue('amount')),
  },
  {
    accessorKey: 'incurredDate',
    header: 'Tarih',
    cell: ({ row }) => formatDate(row.getValue('incurredDate')),
  },
]

export default function ReferralDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false)
  const [isCostOpen, setIsCostOpen] = useState(false)
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false)

  const {
    data: referral,
    isLoading: referralLoading,
    isError: referralError,
    refetch: refetchReferral,
  } = useReferral(id)
  const { data: appointments, isLoading: appointmentsLoading } =
    useAppointments(id)
  const { data: costs, isLoading: costsLoading } = useTreatmentCosts(id)
  const { data: outcomes } = useOutcomes(id)

  if (referralLoading) return <ReferralDetailSkeleton />
  if (referralError || !referral) {
    return (
      <div className="animate-in space-y-6">
        <PageHeader
          title="Sevk Detayı"
          description="Sevk bilgileri yüklenemedi"
        />
        <QueryError
          title="Sevk Bulunamadı"
          message="İstenen sevk kaydı sistemde bulunamadı."
          onRetry={refetchReferral}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sevk Detayları"
        description={`${referral.beneficiary?.ad} ${referral.beneficiary?.soyad} - ${referral.hospital?.name}`}
      />

      <Card className="bg-muted/30">
        <CardContent className="p-0">
          <ReferralStatusWorkflow status={referral.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="text-primary h-4 w-4" />
                Sevk Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  Faydalanıcı
                </span>
                <p className="text-sm font-medium">
                  {referral.beneficiary?.ad} {referral.beneficiary?.soyad}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  Hastane
                </span>
                <p className="text-sm font-medium">{referral.hospital?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  Sevk Tarihi
                </span>
                <p className="text-sm font-medium">
                  {formatDate(referral.referralDate)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  Sevk Nedeni / Tanı
                </span>
                <p className="text-sm">{referral.reason}</p>
              </div>
              {referral.notes && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    Notlar
                  </span>
                  <p className="text-muted-foreground text-sm italic">
                    &ldquo;{referral.notes}&rdquo;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="text-primary h-4 w-4" />
                Maliyet Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Toplam Gider:
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(
                      costs?.reduce((sum, c) => sum + c.amount, 0) || 0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Ödenen:</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {formatCurrency(
                      costs
                        ?.filter((c) => c.paymentStatus === 'paid')
                        .reduce((sum, c) => sum + c.amount, 0) || 0
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="appointments" className="gap-2">
                <Clock className="h-4 w-4" />
                Randevular
              </TabsTrigger>
              <TabsTrigger value="costs" className="gap-2">
                <Wallet className="h-4 w-4" />
                Maliyetler
              </TabsTrigger>
              <TabsTrigger value="outcomes" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Tedavi Sonuçları
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Randevu Takibi</CardTitle>
                    <CardDescription>
                      Hastane randevu geçmişi ve planlananlar
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAppointmentOpen}
                    onOpenChange={setIsAppointmentOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Randevu Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Randevu Planla</DialogTitle>
                        <DialogDescription>
                          Bu sevk için yeni bir randevu kaydı oluşturun.
                        </DialogDescription>
                      </DialogHeader>
                      <AppointmentForm
                        referralId={id}
                        onSuccess={() => setIsAppointmentOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={appointmentColumns}
                    data={appointments || []}
                    isLoading={appointmentsLoading}
                    searchPlaceholder="Randevu ara..."
                    searchColumn="location"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tedavi Giderleri</CardTitle>
                    <CardDescription>
                      Yapılan ödemeler ve bekleyen giderler
                    </CardDescription>
                  </div>
                  <Dialog open={isCostOpen} onOpenChange={setIsCostOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Gider Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Gider Kaydı</DialogTitle>
                        <DialogDescription>
                          Tedavi süreciyle ilgili bir masraf ekleyin.
                        </DialogDescription>
                      </DialogHeader>
                      <TreatmentCostForm
                        referralId={id}
                        onSuccess={() => setIsCostOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={costColumns}
                    data={costs || []}
                    isLoading={costsLoading}
                    searchPlaceholder="Gider ara..."
                    searchColumn="description"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tedavi Sonuçları</CardTitle>
                    <CardDescription>
                      Tanı, tedavi detayları ve sonuç belgeleri
                    </CardDescription>
                  </div>
                  <Dialog open={isOutcomeOpen} onOpenChange={setIsOutcomeOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Sonuç Belgele
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Tedavi Sonucunu Belgele</DialogTitle>
                        <DialogDescription>
                          Uygulanan tedavi, tanı ve varsa kontrol randevusu
                          bilgilerini kaydedin.
                        </DialogDescription>
                      </DialogHeader>
                      <TreatmentOutcomeForm
                        referralId={id}
                        onSuccess={() => setIsOutcomeOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {outcomes && outcomes.length > 0 ? (
                    <div className="space-y-6">
                      {outcomes.map((outcome) => (
                        <div
                          key={outcome.id}
                          className="border-muted relative border-l pb-6 pl-6 last:pb-0"
                        >
                          <div className="bg-primary absolute top-0 -left-1.25 h-2.5 w-2.5 rounded-full" />
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-bold">
                                {outcome.diagnosis || 'Tanı Belirtilmemiş'}
                              </h4>
                              <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                {formatDate(outcome.createdAt)}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {outcome.treatmentReceived}
                            </p>
                            {outcome.outcomeNotes && (
                              <p className="bg-muted/50 rounded p-2 text-xs italic">
                                &ldquo;{outcome.outcomeNotes}&rdquo;
                              </p>
                            )}
                            {outcome.followUpNeeded && (
                              <Badge variant="warning" className="text-[10px]">
                                Kontrol Gerekli:{' '}
                                {outcome.followUpDate
                                  ? formatDate(outcome.followUpDate)
                                  : 'Tarih Belirtilmemiş'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-12 text-center">
                      <Stethoscope className="mx-auto mb-4 h-12 w-12 opacity-20" />
                      <p>Henüz kaydedilmiş bir tedavi sonucu bulunmuyor.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ReferralDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Skeleton className="h-75 w-full" />
          <Skeleton className="h-37.5 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-125 w-full" />
        </div>
      </div>
    </div>
  )
}
