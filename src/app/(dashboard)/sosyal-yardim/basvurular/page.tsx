'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { 
    Plus, 
    Download, 
    Search, 
    Filter, 
    Settings, 
    ChevronLeft, 
    ChevronRight,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryError } from '@/components/shared/query-error'
import { fetchApplications } from '@/lib/mock-service'
import { 
    AID_TYPE_LABELS,
    BASVURU_DURUMU_LABELS
} from '@/lib/constants'
import type { BasvuruDurumu, YardimTuru } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Durum badge renkleri - Modern SaaS palette
const durumColors: Record<BasvuruDurumu, string> = {
    'beklemede': 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    'inceleniyor': 'bg-sky-500/15 text-sky-600 border-sky-500/25',
    'onaylandi': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    'reddedildi': 'bg-red-500/15 text-red-600 border-red-500/25',
    'odendi': 'bg-teal-500/15 text-teal-600 border-teal-500/25'
}

// Yardım türü badge renkleri - Modern SaaS palette
const yardimTuruColors: Record<YardimTuru, string> = {
    'nakdi': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    'ayni': 'bg-sky-500/15 text-sky-600 border-sky-500/25',
    'egitim': 'bg-violet-500/15 text-violet-600 border-violet-500/25',
    'saglik': 'bg-red-500/15 text-red-600 border-red-500/25',
    'kira': 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    'fatura': 'bg-teal-500/15 text-teal-600 border-teal-500/25'
}

export default function ApplicationsPage() {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    
    // Filtreler
    const [searchId, setSearchId] = useState('')
    const [searchName, setSearchName] = useState('')
    const [searchTc, setSearchTc] = useState('')
    const [filterDurum, setFilterDurum] = useState<string>('all')
    const [filterYardimTuru, setFilterYardimTuru] = useState<string>('all')
    const [operator, setOperator] = useState<string>('~')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['applications', page, pageSize, searchName, searchTc, filterDurum, filterYardimTuru],
        queryFn: () => fetchApplications({ 
            page, 
            pageSize,
            search: searchName,
            status: filterDurum !== 'all' ? filterDurum as BasvuruDurumu : undefined,
            yardimTuru: filterYardimTuru !== 'all' ? filterYardimTuru as YardimTuru : undefined
        })
    })

    // Memoize data array to prevent recalculation on every render
    const applications = useMemo(() => data?.data || [], [data?.data])
    const totalPages = data?.totalPages || 1
    const totalRecords = data?.total || 0

    // İstatistikler - memoized (must be before any conditional returns)
    const stats = useMemo(() => ({
        toplam: totalRecords,
        beklemede: applications.filter(a => a.durum === 'beklemede').length,
        inceleniyor: applications.filter(a => a.durum === 'inceleniyor').length,
        onaylandi: applications.filter(a => a.durum === 'onaylandi').length,
        reddedildi: applications.filter(a => a.durum === 'reddedildi').length
    }), [applications, totalRecords])

    // Error state
    if (isError) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Başvurular</h1>
                <QueryError 
                    title="Başvurular Yüklenemedi"
                    message="Başvuru listesi yüklenirken bir hata oluştu."
                    onRetry={refetch}
                />
            </div>
        )
    }

    const handleSearch = () => {
        setPage(1)
    }

    // Filtreleme
    let filteredApplications = applications
    if (filterYardimTuru !== 'all') {
        filteredApplications = filteredApplications.filter(a => a.yardimTuru === filterYardimTuru)
    }
    if (searchTc) {
        filteredApplications = filteredApplications.filter(a => 
            a.basvuranKisi.tcKimlikNo.includes(searchTc)
        )
    }
    if (searchId) {
        filteredApplications = filteredApplications.filter(a => 
            a.id.toLowerCase().includes(searchId.toLowerCase())
        )
    }

    return (
        <div className="space-y-4">
            {/* Üst Başlık ve Navigasyon */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Yardım Başvuruları</h1>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                        {totalRecords.toLocaleString('tr-TR')} Başvuru
                    </span>
                    
                    {/* Sayfa Navigasyonu */}
                    <div className="flex items-center gap-1 bg-muted rounded-md">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2 min-w-[80px] text-center">
                            {page} / {totalPages}
                        </span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Toplam</p>
                                <p className="text-2xl font-bold">{stats.toplam}</p>
                            </div>
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Beklemede</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.beklemede}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">İnceleniyor</p>
                                <p className="text-2xl font-bold text-sky-600">{stats.inceleniyor}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-sky-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Onaylandı</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.onaylandi}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Reddedildi</p>
                                <p className="text-2xl font-bold text-red-600">{stats.reddedildi}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtreleme Alanı */}
            <div className="flex flex-wrap items-end gap-3 p-4 bg-card rounded-lg border">
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Başvuru ID</label>
                    <Input 
                        placeholder="ID" 
                        className="w-32 h-9"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Başvuran Adı</label>
                    <Input 
                        placeholder="Ad Soyad" 
                        className="w-56 h-9"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">TC Kimlik No</label>
                    <Input 
                        placeholder="TC Kimlik" 
                        className="w-40 h-9"
                        value={searchTc}
                        onChange={(e) => setSearchTc(e.target.value)}
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Durum</label>
                    <Select value={filterDurum} onValueChange={setFilterDurum}>
                        <SelectTrigger className="w-40 h-9">
                            <SelectValue placeholder="Tümü" />
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
                
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Yardım Türü</label>
                    <Select value={filterYardimTuru} onValueChange={setFilterYardimTuru}>
                        <SelectTrigger className="w-40 h-9">
                            <SelectValue placeholder="Tümü" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            {Object.entries(AID_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Operatör</label>
                    <Select value={operator} onValueChange={setOperator}>
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value="~">~</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex gap-2">
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Ara
                    </Button>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtre
                    </Button>
                    <Button variant="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Başvuru
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                    </Button>
                </div>
            </div>

            {/* Veri Tablosu */}
            <div className="rounded-lg border bg-card">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[180px]">Başvuran</TableHead>
                                <TableHead className="w-[150px]">Yardım Türü</TableHead>
                                <TableHead className="w-[120px]">Talep Edilen</TableHead>
                                <TableHead className="w-[120px]">Durum</TableHead>
                                <TableHead className="w-[120px]">Başvuru Tarihi</TableHead>
                                <TableHead className="w-[120px]">Değerlendiren</TableHead>
                                <TableHead className="w-[100px]">Belgeler</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        Başvuru bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications.map((application) => (
                                    <TableRow 
                                        key={application.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/sosyal-yardim/basvurular/${application.id}`)}
                                    >
                                        <TableCell>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/sosyal-yardim/basvurular/${application.id}`)
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {application.basvuranKisi.ad} {application.basvuranKisi.soyad}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {application.basvuranKisi.tcKimlikNo}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={yardimTuruColors[application.yardimTuru]}>
                                                {AID_TYPE_LABELS[application.yardimTuru]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono">
                                                {application.talepEdilenTutar
                                                    ? formatCurrency(application.talepEdilenTutar)
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={durumColors[application.durum]}>
                                                {BASVURU_DURUMU_LABELS[application.durum] || application.durum}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(application.createdAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {application.degerlendiren?.name || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {application.belgeler.length} belge
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {application.durum === 'beklemede' && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // Onayla işlemi
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // Reddet işlemi
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
