'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
    Plus,
    Download,
    Search,
    Filter,
    Settings,
    ChevronLeft,
    ChevronRight,
    Eye,
    MoreHorizontal,
    Edit,
    Trash2,
    HandHeart
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryError } from '@/components/shared/query-error'
import { NewBeneficiaryDialog } from '@/components/features/social-aid/new-beneficiary-dialog'
import { fetchBeneficiaries } from '@/lib/supabase-service'
import {
    IHTIYAC_SAHIBI_KATEGORI_LABELS,
    IHTIYAC_SAHIBI_TURU_LABELS,
    IHTIYAC_DURUMU_LABELS
} from '@/lib/constants'
import type { IhtiyacSahibi, IhtiyacSahibiKategori } from '@/types'
import { formatDate } from '@/lib/utils'

// Kategori badge renkleri - Modern SaaS palette
const kategoriColors: Record<IhtiyacSahibiKategori, string> = {
    'yetim-ailesi': 'bg-violet-500/15 text-violet-600 border-violet-500/25',
    'multeci-aile': 'bg-sky-500/15 text-sky-600 border-sky-500/25',
    'ihtiyac-sahibi-aile': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    'ogrenci-yabanci': 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    'ogrenci-tc': 'bg-teal-500/15 text-teal-600 border-teal-500/25',
    'vakif-dernek': 'bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/25',
    'devlet-okulu': 'bg-lime-500/15 text-lime-600 border-lime-500/25',
    'kamu-kurumu': 'bg-indigo-500/15 text-indigo-600 border-indigo-500/25',
    'ozel-egitim-kurumu': 'bg-cyan-500/15 text-cyan-600 border-cyan-500/25'
}

export default function BeneficiariesPage() {
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Filtreler
    const [searchId, setSearchId] = useState('')
    const [searchName, setSearchName] = useState('')
    const [searchKimlik, setSearchKimlik] = useState('')
    const [searchDosyaNo, setSearchDosyaNo] = useState('')
    const [operator, setOperator] = useState<string>('~')
    const [filterKategori, setFilterKategori] = useState<string>('all')
    const [filterDurum, setFilterDurum] = useState<string>('all')
    const [filterTur, setFilterTur] = useState<string>('all')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['beneficiaries', page, pageSize, searchName, searchKimlik, searchDosyaNo, filterKategori, filterDurum],
        queryFn: () => fetchBeneficiaries({
            page,
            pageSize,
            search: searchName || searchKimlik || searchDosyaNo || undefined,
            durum: filterKategori !== 'all' ? filterKategori : undefined,
            ihtiyacDurumu: filterDurum !== 'all' ? filterDurum : undefined
        })
    })

    // Use data directly from query (filtering is done server-side)
    const filteredData = data?.data || []

    const totalPages = data?.totalPages || 1
    const totalRecords = data?.total || 0

    const handleSearch = () => {
        setPage(1)
    }

    const getYas = (dogumTarihi?: Date) => {
        if (!dogumTarihi) return '-'
        const today = new Date()
        const birth = new Date(dogumTarihi)
        return today.getFullYear() - birth.getFullYear()
    }

    if (isError) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">İhtiyaç Sahipleri</h1>
                </div>
                <QueryError
                    title="Veriler Yüklenemedi"
                    message="İhtiyaç sahipleri listesi yüklenirken bir hata oluştu."
                    onRetry={refetch}
                />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Üst Başlık ve Navigasyon */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">İhtiyaç Sahipleri</h1>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                        {totalRecords.toLocaleString('tr-TR')} Kayıt
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

            {/* Filtreleme Alanı */}
            <div className="flex flex-wrap items-end gap-3 p-4 bg-card rounded-lg border">
                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">ID</label>
                    <Input
                        placeholder="ID"
                        className="w-24 h-9"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Kişi / Kurum Ünvanı</label>
                    <Input
                        placeholder="Ad Soyad veya Kurum"
                        className="w-56 h-9"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Kimlik No</label>
                    <Input
                        placeholder="TC / Yabancı Kimlik"
                        className="w-40 h-9"
                        value={searchKimlik}
                        onChange={(e) => setSearchKimlik(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Dosya No</label>
                    <Input
                        placeholder="DSY-XXXXXX"
                        className="w-36 h-9"
                        value={searchDosyaNo}
                        onChange={(e) => setSearchDosyaNo(e.target.value)}
                    />
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

                <div className="flex gap-2 ml-auto">
                    <Button
                        onClick={handleSearch}
                        className="h-9"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Ara
                    </Button>
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="secondary" className="h-9">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtre
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                                <SheetTitle>Filtre Seçenekleri</SheetTitle>
                                <SheetDescription>
                                    Listeyi filtrelemek için seçenekleri kullanın
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-6">
                                {/* Kategori Filtresi */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kategori</label>
                                    <Select value={filterKategori} onValueChange={setFilterKategori}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tüm Kategoriler" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tüm Kategoriler</SelectItem>
                                            {Object.entries(IHTIYAC_SAHIBI_KATEGORI_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Durum Filtresi */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Durum</label>
                                    <Select value={filterDurum} onValueChange={setFilterDurum}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tüm Durumlar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tüm Durumlar</SelectItem>
                                            {Object.entries(IHTIYAC_DURUMU_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tür Filtresi */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tür</label>
                                    <Select value={filterTur} onValueChange={setFilterTur}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tüm Türler" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tüm Türler</SelectItem>
                                            {Object.entries(IHTIYAC_SAHIBI_TURU_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filtre Butonları */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={() => {
                                            setFilterKategori('all')
                                            setFilterDurum('all')
                                            setFilterTur('all')
                                            setPage(1)
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Temizle
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setPage(1)
                                            setIsFilterOpen(false)
                                        }}
                                        className="flex-1"
                                    >
                                        Uygula
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button
                        className="bg-primary hover:bg-primary/90 h-9"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Ekle
                    </Button>
                    <Button variant="outline" className="h-9">
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                    </Button>
                </div>
            </div>

            {/* Veri Tablosu */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="min-w-[140px]">Tür</TableHead>
                                <TableHead className="min-w-[160px]">
                                    <div className="flex items-center gap-2">
                                        İsim
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[140px]">Kategori</TableHead>
                                <TableHead className="w-[60px] text-center">Yaş</TableHead>
                                <TableHead className="min-w-[80px]">Uyruk</TableHead>
                                <TableHead className="min-w-[110px]">Kimlik No</TableHead>
                                <TableHead className="min-w-[120px]">Cep Telefonu</TableHead>
                                <TableHead className="min-w-[100px]">Ülke</TableHead>
                                <TableHead className="min-w-[140px]">Şehir</TableHead>
                                <TableHead className="min-w-[100px]">Yerleşim</TableHead>
                                <TableHead className="min-w-[200px]">Adres</TableHead>
                                <TableHead className="w-[50px] text-center">Kişi</TableHead>
                                <TableHead className="w-[50px] text-center">Yetim</TableHead>
                                <TableHead className="w-[60px] text-center">Başvuru</TableHead>
                                <TableHead className="w-[60px] text-center">Yardım</TableHead>
                                <TableHead className="min-w-[100px]">Dosya No</TableHead>
                                <TableHead className="min-w-[100px]">Son Atama</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 19 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={19} className="h-32 text-center text-muted-foreground">
                                        Kayıt bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item: IhtiyacSahibi, index: number) => (
                                    <TableRow
                                        key={item.id}
                                        className={`
                                            cursor-pointer transition-colors
                                            ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                            hover:bg-primary/10
                                        `}
                                    >
                                        <TableCell>
                                            <Link href={`/sosyal-yardim/ihtiyac-sahipleri/${item.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Eye className="h-4 w-4 text-primary" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs">
                                                {IHTIYAC_SAHIBI_TURU_LABELS[item.tur]}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/sosyal-yardim/ihtiyac-sahipleri/${item.id}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {item.ad} {item.soyad}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${kategoriColors[item.kategori]}`}
                                            >
                                                {IHTIYAC_SAHIBI_KATEGORI_LABELS[item.kategori]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getYas(item.dogumTarihi)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.uyruk}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {item.tcKimlikNo || item.yabanciKimlikNo || '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {item.cepTelefonuOperator && item.cepTelefonu
                                                ? `${item.cepTelefonuOperator} ${item.cepTelefonu}`
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.ulke}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.sehir}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.ilce || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                            {item.adres || '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {item.aileHaneBilgileri?.ailedekiKisiSayisi || '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {item.aileHaneBilgileri?.yetimSayisi || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="text-xs">
                                                {item.basvuruSayisi}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="text-xs">
                                                {item.yardimSayisi}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {item.dosyaNo}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.sonAtamaTarihi ? formatDate(item.sonAtamaTarihi) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/sosyal-yardim/ihtiyac-sahipleri/${item.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Detay
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <HandHeart className="mr-2 h-4 w-4" />
                                                        Yardım Başvurusu
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Alt Sayfalama */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    {data ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalRecords)} arası gösteriliyor` : ''}
                </span>
                <div className="flex items-center gap-2">
                    <span>Sayfa başına:</span>
                    <Select defaultValue="20">
                        <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Yeni Kayıt Dialog */}
            <NewBeneficiaryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    )
}
