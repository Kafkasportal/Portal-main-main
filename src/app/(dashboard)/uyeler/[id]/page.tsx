'use client'

import { useParams } from 'next/navigation'
import { useMember, useDonations } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Mail, 
  MapPin, 
  Phone, 
  CreditCard,
  History,
  Download
} from 'lucide-react'
import { formatDate, formatPhoneNumber, formatCurrency, getInitials } from '@/lib/utils'
import { MEMBER_TYPE_LABELS, DONATION_PURPOSE_LABELS } from '@/lib/constants'
import { DataTable } from '@/components/shared/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DonationReceiptDialog } from '@/components/features/donations/donation-receipt-dialog'
import type { Bagis } from '@/types'
import { useState } from 'react'

export default function MemberDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)

  const donationColumns: ColumnDef<Bagis>[] = [
    {
      accessorKey: 'tarih',
      header: 'Tarih',
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'tutar',
      header: 'Tutar',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatCurrency(row.original.tutar)}
        </span>
      ),
    },
    {
      accessorKey: 'amac',
      header: 'Amaç',
      cell: ({ row }) => (
        <span className="text-sm">
          {DONATION_PURPOSE_LABELS[row.original.amac] || row.original.amac}
        </span>
      ),
    },
    {
      accessorKey: 'odemeYontemi',
      header: 'Ödeme Yöntemi',
      cell: ({ row }) => (
        <span className="text-sm capitalize">
          {row.original.odemeYontemi.replace('-', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'makbuzNo',
      header: 'Makbuz No',
      cell: ({ row }) => (
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs">
          {row.original.makbuzNo || '-'}
        </code>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedDonationId(row.original.id)
            setReceiptDialogOpen(true)
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Makbuz
        </Button>
      ),
    },
  ]

  const { 
    data: member, 
    isLoading: memberLoading, 
    isError: memberError,
    refetch: refetchMember
  } = useMember(id)

  const {
    data: donations,
    isLoading: donationsLoading,
  } = useDonations({
    memberId: parseInt(id, 10),
    limit: 50
  }, {
    enabled: !!member
  })

  if (memberLoading) {
    return <MemberDetailSkeleton />
  }

  if (memberError || !member) {
    return (
      <div className="animate-in space-y-6">
        <PageHeader title="Üye Detayı" description="Üye bilgileri yüklenemedi" />
        <QueryError 
          title="Üye Bulunamadı" 
          message="İstenen üye kaydı sistemde bulunamadı veya bir hata oluştu." 
          onRetry={refetchMember} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${member.ad} ${member.soyad}`}
        description={`Üye No: ${member.uyeNo || '-'}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Basic Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                    {getInitials(`${member.ad} ${member.soyad}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{member.ad} {member.soyad}</h3>
                  <Badge variant="outline" className="mt-1">
                    {MEMBER_TYPE_LABELS[member.uyeTuru as keyof typeof MEMBER_TYPE_LABELS] || member.uyeTuru}
                  </Badge>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email || 'E-posta belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhoneNumber(member.telefon)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.adres?.il}, {member.adres?.ilce}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Kayıt: {formatDate(member.kayitTarihi)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Üyelik Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TC Kimlik No</span>
                <span className="font-medium">{member.tcKimlikNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cinsiyet</span>
                <span className="font-medium capitalize">{member.cinsiyet === 'erkek' ? 'Erkek' : 'Kadın'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kan Grubu</span>
                <Badge variant="secondary" className="font-mono">{member.kanGrubu || '-'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meslek</span>
                <span className="font-medium">{member.meslek || '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="donations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="donations" className="gap-2">
                <History className="h-4 w-4" />
                Bağış Geçmişi
              </TabsTrigger>
              <TabsTrigger value="aid" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Aidat Durumu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bağış Geçmişi</CardTitle>
                  <CardDescription>
                    Üyenin sisteme kayıtlı tüm bağışları
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={donationColumns}
                    data={donations?.data || []}
                    isLoading={donationsLoading}
                    searchPlaceholder="Bağış ara..."
                    searchColumn="amac"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aid">
              <Card>
                <CardHeader>
                  <CardTitle>Aidat Bilgileri</CardTitle>
                  <CardDescription>Üyelik aidat ödeme durumu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border">
                    <div className={`h-3 w-3 rounded-full ${member.aidatDurumu === 'guncel' ? 'bg-success' : 'bg-destructive'}`} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.aidatDurumu === 'guncel' ? 'Aidat Borcu Yok' : 'Aidat Borcu Bulunuyor'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.aidatDurumu === 'guncel' ? 'Tüm aidatlar zamanında ödenmiş.' : 'Gecikmiş aidat ödemeleri mevcut.'}
                      </p>
                    </div>
                    <Badge variant={member.aidatDurumu === 'guncel' ? 'success' : 'destructive'}>
                      {member.aidatDurumu === 'guncel' ? 'Güncel' : 'Gecikmiş'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedDonationId && (
        <DonationReceiptDialog
          open={receiptDialogOpen}
          onOpenChange={setReceiptDialogOpen}
          donationId={selectedDonationId}
        />
      )}
    </div>
  )
}

function MemberDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Skeleton className="h-75 w-full" />
          <Skeleton className="h-50 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-125 w-full" />
        </div>
      </div>
    </div>
  )
}
