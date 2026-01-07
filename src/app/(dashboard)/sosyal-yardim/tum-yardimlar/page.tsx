'use client'

import { Download, Filter, RefreshCw, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useApplications } from '@/hooks/use-api'
import { AID_TYPE_LABELS, BASVURU_DURUMU_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

const durumColors = {
  beklemede: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  inceleniyor: 'bg-sky-500/15 text-sky-600 border-sky-500/25',
  onaylandi: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  reddedildi: 'bg-red-500/15 text-red-600 border-red-500/25',
  odendi: 'bg-teal-500/15 text-teal-600 border-teal-500/25',
}

export default function TumYardimlarPage() {
  const [filterDurum, setFilterDurum] = useState<string>('all')
  const [filterYardimTuru, setFilterYardimTuru] = useState<string>('all')

  const { data, isLoading, isError, refetch } = useApplications({
    limit: 1000,
  })

  const filteredData = useMemo(() => {
    let applications = data?.data || []

    if (filterDurum !== 'all') {
      applications = applications.filter((a: any) => a.durum === filterDurum)
    }

    if (filterYardimTuru !== 'all') {
      applications = applications.filter((a: any) => a.yardimTuru === filterYardimTuru)
    }

    return applications
  }, [data, filterDurum, filterYardimTuru])

  const stats = useMemo(() => {
    const tumYardimlar = filteredData
    return {
      toplam: tumYardimlar.length,
      beklemede: tumYardimlar.filter((a: any) => a.durum === 'beklemede').length,
      onaylanan: tumYardimlar.filter((a: any) => a.durum === 'onaylandi').length,
      tamamlanan: tumYardimlar.filter((a: any) => a.durum === 'odendi').length,
      toplamTutar: tumYardimlar.reduce((sum: number, a: any) => sum + (a.odemeBilgileri?.tutar || a.talepEdilenTutar || 0), 0),
    }
  }, [filteredData])

  const columns = [
    {
      accessorKey: 'id',
      header: 'Başvuru No',
      cell: ({ row }: any) => (
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs">
          {row.original.id.slice(0, 8)}
        </code>
      ),
    },
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
      cell: ({ row }: any) => (
        <Badge variant="outline">{AID_TYPE_LABELS[row.original.yardimTuru as keyof typeof AID_TYPE_LABELS]}</Badge>
      ),
    },
    {
      accessorKey: 'tutar',
      header: 'Tutar',
      cell: ({ row }: any) => formatCurrency(row.original.odemeBilgileri?.tutar || row.original.talepEdilenTutar),
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
      accessorKey: 'createdAt',
      header: 'Başvuru Tarihi',
      cell: ({ row }: any) => formatDate(row.original.createdAt),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tüm Yardımlar"
          description="Tüm yardım başvurularını görüntüleyin ve yönetin"
        />
        <QueryError
          title="Veriler Yüklenemedi"
          message="Yardım verileri yüklenirken bir hata oluştu."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tüm Yardımlar"
        description="Tüm yardım başvurularını görüntüleyin ve yönetin"
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.toplam}</div>
            <p className="text-muted-foreground text-xs">Tüm başvurular</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Filter className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.beklemede}</div>
            <p className="text-muted-foreground text-xs">İnceleme bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onaylanan}</div>
            <p className="text-muted-foreground text-xs">Ödeme bekleniyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <Download className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tamamlanan}</div>
            <p className="text-muted-foreground text-xs">Tamamlandı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.toplamTutar)}</div>
            <p className="text-muted-foreground text-xs">Dağıtılan toplam</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={filterDurum} onValueChange={setFilterDurum}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="beklemede">Beklemede</SelectItem>
                  <SelectItem value="inceleniyor">İnceleniyor</SelectItem>
                  <SelectItem value="onaylandi">Onaylandı</SelectItem>
                  <SelectItem value="reddedildi">Reddedildi</SelectItem>
                  <SelectItem value="odendi">Ödendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yardım Türü</label>
              <Select value={filterYardimTuru} onValueChange={setFilterYardimTuru}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="nakdi">Nakdi Yardım</SelectItem>
                  <SelectItem value="ayni">Ayni Yardım</SelectItem>
                  <SelectItem value="egitim">Eğitim Yardımı</SelectItem>
                  <SelectItem value="saglik">Sağlık Yardımı</SelectItem>
                  <SelectItem value="kira">Kira Yardımı</SelectItem>
                  <SelectItem value="fatura">Fatura Yardımı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yardım Tablosu */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Yardımlar Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isLoading}
              searchPlaceholder="Ad veya TC ile ara..."
              searchColumn="basvuranKisi"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
