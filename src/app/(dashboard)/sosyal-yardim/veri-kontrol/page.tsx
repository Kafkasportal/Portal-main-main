'use client'

import { AlertCircle, CheckCircle2, Database, RefreshCw, Search, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { QueryError } from '@/components/shared/query-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useApplications, useBeneficiaries, useMembers } from '@/hooks/use-api'

export default function VeriKontrolPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: applications, isLoading: appsLoading, isError: appsError, refetch: refetchApps } = useApplications({ limit: 1000 })
  const { data: beneficiaries, isLoading: benLoading, isError: benError, refetch: refetchBen } = useBeneficiaries({ limit: 1000 })
  const { data: members, isLoading: memLoading, isError: memError, refetch: refetchMem } = useMembers({ limit: 1000 })

  const isLoading = appsLoading || benLoading || memLoading
  const isError = appsError || benError || memError

  const dataIssues = useMemo(() => {
    const issues: any[] = []

    if (applications?.data) {
      applications.data.forEach((app: any) => {
        if (!app.basvuranKisi?.tcKimlikNo || app.basvuranKisi.tcKimlikNo.length !== 11) {
          issues.push({
            type: 'Uyarı',
            category: 'Başvuru',
            message: `Geçersiz TC Kimlik - ${app.basvuranKisi?.ad} ${app.basvuranKisi?.soyad}`,
            severity: 'warning',
            id: app.id,
          })
        }
        if (!app.gerekce || app.gerekce.length < 10) {
          issues.push({
            type: 'Hata',
            category: 'Başvuru',
            message: `Eksik gerekçe - Başvuru #${app.id.slice(0, 8)}`,
            severity: 'error',
            id: app.id,
          })
        }
      })
    }

    if (beneficiaries?.data) {
      beneficiaries.data.forEach((ben: any) => {
        if (!ben.dosyaNo) {
          issues.push({
            type: 'Hata',
            category: 'İhtiyaç Sahibi',
            message: `Dosya numarası eksik - ${ben.ad} ${ben.soyad}`,
            severity: 'error',
            id: ben.id,
          })
        }
        if (!ben.ulke || !ben.sehir) {
          issues.push({
            type: 'Uyarı',
            category: 'İhtiyaç Sahibi',
            message: `Adres bilgisi eksik - ${ben.ad} ${ben.soyad}`,
            severity: 'warning',
            id: ben.id,
          })
        }
      })
    }

    if (members?.data) {
      members.data.forEach((mem: any) => {
        if (!mem.tcKimlikNo || mem.tcKimlikNo.length !== 11) {
          issues.push({
            type: 'Hata',
            category: 'Üye',
            message: `Geçersiz TC Kimlik - ${mem.ad} ${mem.soyad}`,
            severity: 'error',
            id: mem.id,
          })
        }
        if (!mem.telefon) {
          issues.push({
            type: 'Uyarı',
            category: 'Üye',
            message: `Telefon numarası eksik - ${mem.ad} ${mem.soyad}`,
            severity: 'warning',
            id: mem.id,
          })
        }
      })
    }

    return issues
  }, [applications, beneficiaries, members])

  const filteredIssues = useMemo(() => {
    if (!searchQuery) return dataIssues
    return dataIssues.filter((issue) =>
      issue.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [dataIssues, searchQuery])

  const stats = useMemo(() => ({
    total: dataIssues.length,
    errors: dataIssues.filter((i) => i.severity === 'error').length,
    warnings: dataIssues.filter((i) => i.severity === 'warning').length,
    info: dataIssues.filter((i) => i.severity === 'info').length,
  }), [dataIssues])

  const columns = [
    {
      accessorKey: 'severity',
      header: 'Seviye',
      cell: ({ row }: any) => {
        const severity = row.original.severity
        const config = {
          error: { icon: XCircle, color: 'text-destructive bg-destructive/10' },
          warning: { icon: AlertCircle, color: 'text-warning bg-warning/10' },
          info: { icon: CheckCircle2, color: 'text-info bg-info/10' },
        }
        const { icon: Icon, color } = config[severity as keyof typeof config]
        return (
          <Badge className={color}>
            <Icon className="mr-1 h-3 w-3" />
            {severity === 'error' ? 'Hata' : severity === 'warning' ? 'Uyarı' : 'Bilgi'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }: any) => <span className="font-medium">{row.original.category}</span>,
    },
    {
      accessorKey: 'message',
      header: 'Mesaj',
      cell: ({ row }: any) => <p className="max-w-md truncate text-sm">{row.original.message}</p>,
    },
    {
      accessorKey: 'id',
      header: 'Kayıt ID',
      cell: ({ row }: any) => (
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs">
          {row.original.id.slice(0, 8)}
        </code>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Veri Kontrolü"
          description="Veri bütünlüğü ve doğrulama kontrolleri"
        />
        <QueryError
          title="Veriler Yüklenemedi"
          message="Veri kontrolü bilgileri yüklenirken bir hata oluştu."
          onRetry={() => {
            void refetchApps()
            void refetchBen()
            void refetchMem()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veri Kontrolü"
        description="Veri bütünlüğü ve doğrulama kontrolleri"
        action={
          <Button variant="outline" onClick={() => {
            void refetchApps()
            void refetchBen()
            void refetchMem()
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Tara
          </Button>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sorun</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">Tespit edilen sorun</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hatalar</CardTitle>
            <XCircle className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
            <p className="text-muted-foreground text-xs">Acil düzeltme gerekli</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uyarılar</CardTitle>
            <AlertCircle className="text-warning h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.warnings}</div>
            <p className="text-muted-foreground text-xs">Dikkat gerektiren</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilgiler</CardTitle>
            <CheckCircle2 className="text-info h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.info}</div>
            <p className="text-muted-foreground text-xs">Bilgilendirme</p>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle>Sorun Arama</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Sorun ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sorunlar Tablosu */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Veri Sorunları Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="text-emerald-500 mb-4 h-16 w-16" />
                <h3 className="text-lg font-semibold">Sorun Bulunamadı</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Arama kriterlerine uygun sorun bulunamadı.'
                    : 'Tüm veriler bütünlük kontrolünü geçti.'}
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredIssues}
                isLoading={isLoading}
                searchPlaceholder="Mesaj ile ara..."
                searchColumn="message"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
