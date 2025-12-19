import type {
    Bagis,
    Kumbara,
    Uye,
    SosyalYardimBasvuru,
    IhtiyacSahibi,
    IhtiyacSahibiListItem,
    IhtiyacDurumu,
    IhtiyacSahibiKategori,
    DashboardStats,
    PaginatedResponse,
    PaymentStatus,
    DonationPurpose,
    BasvuruDurumu
} from '@/types'
import {
    generateMockDonations,
    generateMockKumbaras,
    generateMockUyeler,
    generateMockBasvurular,
    generateMockIhtiyacSahipleri,
    generateMockIhtiyacSahipleriListItems,
    generateDashboardStats
} from './mock-data'

// Simulated network delay - minimal for smooth UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 50)))

// Cache for consistent data during session
let donationsCache: Bagis[] | null = null
let kumbarasCache: Kumbara[] | null = null
let membersCache: Uye[] | null = null
let applicationsCache: SosyalYardimBasvuru[] | null = null
let beneficiariesCache: IhtiyacSahibi[] | null = null

// Initialize caches
function getDonations(): Bagis[] {
    if (!donationsCache) {
        donationsCache = generateMockDonations(100)
    }
    return donationsCache
}

function getKumbaras(): Kumbara[] {
    if (!kumbarasCache) {
        kumbarasCache = generateMockKumbaras(25)
    }
    return kumbarasCache
}

function getMembers(): Uye[] {
    if (!membersCache) {
        membersCache = generateMockUyeler(150)
    }
    return membersCache
}

function getApplications(): SosyalYardimBasvuru[] {
    if (!applicationsCache) {
        applicationsCache = generateMockBasvurular(50)
    }
    return applicationsCache
}

function getBeneficiaries(): IhtiyacSahibi[] {
    if (!beneficiariesCache) {
        beneficiariesCache = generateMockIhtiyacSahipleri(80)
    }
    return beneficiariesCache
}

// Fetch dashboard stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
    await delay(500)
    return generateDashboardStats()
}

// Fetch donations with pagination, sorting, and filtering
export async function fetchDonations(options: {
    page?: number
    pageSize?: number
    search?: string
    status?: PaymentStatus
    purpose?: DonationPurpose
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}): Promise<PaginatedResponse<Bagis>> {
    await delay(300)

    const {
        page = 1,
        pageSize = 10,
        search = '',
        status,
        purpose,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options

    let data = [...getDonations()]

    // Filter by search
    if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter(d =>
            d.bagisci.ad.toLowerCase().includes(searchLower) ||
            d.bagisci.soyad.toLowerCase().includes(searchLower) ||
            d.makbuzNo?.toLowerCase().includes(searchLower)
        )
    }

    // Filter by status
    if (status) {
        data = data.filter(d => d.durum === status)
    }

    // Filter by purpose
    if (purpose) {
        data = data.filter(d => d.amac === purpose)
    }

    // Sort
    data.sort((a, b) => {
        const aValue = a[sortBy as keyof Bagis]
        const bValue = b[sortBy as keyof Bagis]

        if (aValue instanceof Date && bValue instanceof Date) {
            return sortOrder === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime()
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
        }

        return 0
    })

    // Paginate
    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch single donation
export async function fetchDonation(id: string): Promise<Bagis | null> {
    await delay(200)
    const donations = getDonations()
    return donations.find(d => d.id === id) || null
}

// Fetch kumbaras
export async function fetchKumbaras(options: {
    page?: number
    pageSize?: number
    status?: 'aktif' | 'pasif' | 'bakim'
}): Promise<PaginatedResponse<Kumbara>> {
    await delay(300)

    const { page = 1, pageSize = 10, status } = options
    let data = [...getKumbaras()]

    if (status) {
        data = data.filter(k => k.durum === status)
    }

    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch members
export async function fetchMembers(options: {
    page?: number
    pageSize?: number
    search?: string
    type?: string
}): Promise<PaginatedResponse<Uye>> {
    await delay(300)

    const { page = 1, pageSize = 10, search = '', type } = options
    let data = [...getMembers()]

    if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter(m =>
            m.ad.toLowerCase().includes(searchLower) ||
            m.soyad.toLowerCase().includes(searchLower) ||
            m.uyeNo.toLowerCase().includes(searchLower) ||
            m.telefon.includes(search)
        )
    }

    if (type) {
        data = data.filter(m => m.uyeTuru === type)
    }

    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch single member
export async function fetchMember(id: string): Promise<Uye | null> {
    await delay(200)
    const members = getMembers()
    return members.find(m => m.id === id) || null
}

// Fetch social aid applications
export async function fetchApplications(options: {
    page?: number
    pageSize?: number
    status?: BasvuruDurumu
    search?: string
    yardimTuru?: YardimTuru
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
    await delay(300)

    const { page = 1, pageSize = 10, status, search = '', yardimTuru } = options
    let data = [...getApplications()]

    if (status) {
        data = data.filter(a => a.durum === status)
    }

    if (yardimTuru) {
        data = data.filter(a => a.yardimTuru === yardimTuru)
    }

    if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter(a =>
            a.basvuranKisi.ad.toLowerCase().includes(searchLower) ||
            a.basvuranKisi.soyad.toLowerCase().includes(searchLower) ||
            a.basvuranKisi.tcKimlikNo.includes(search)
        )
    }

    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch payments (approved applications)
export async function fetchPayments(options: {
    page?: number
    pageSize?: number
}): Promise<PaginatedResponse<SosyalYardimBasvuru>> {
    await delay(300)

    const { page = 1, pageSize = 10 } = options
    const data = getApplications().filter(a => a.durum === 'odendi')

    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch beneficiaries (ihtiyaç sahipleri) - Genişletilmiş
export async function fetchBeneficiaries(options: {
    page?: number
    pageSize?: number
    status?: IhtiyacDurumu
    kategori?: IhtiyacSahibiKategori
    search?: string
    city?: string
    dosyaNo?: string
    kimlikNo?: string
}): Promise<PaginatedResponse<IhtiyacSahibi>> {
    await delay(300)

    const { page = 1, pageSize = 20, status, kategori, search = '', city, dosyaNo, kimlikNo } = options
    let data = [...getBeneficiaries()]

    if (status) {
        data = data.filter(b => b.durum === status)
    }

    if (kategori) {
        data = data.filter(b => b.kategori === kategori)
    }

    if (city) {
        data = data.filter(b => b.sehir === city)
    }

    if (dosyaNo) {
        data = data.filter(b => b.dosyaNo.toLowerCase().includes(dosyaNo.toLowerCase()))
    }

    if (kimlikNo) {
        data = data.filter(b => 
            (b.tcKimlikNo && b.tcKimlikNo.includes(kimlikNo)) ||
            (b.yabanciKimlikNo && b.yabanciKimlikNo.includes(kimlikNo))
        )
    }

    if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter(b =>
            b.ad.toLowerCase().includes(searchLower) ||
            b.soyad.toLowerCase().includes(searchLower) ||
            (b.tcKimlikNo && b.tcKimlikNo.includes(search)) ||
            (b.yabanciKimlikNo && b.yabanciKimlikNo.toLowerCase().includes(searchLower)) ||
            (b.cepTelefonu && b.cepTelefonu.includes(search)) ||
            b.dosyaNo.toLowerCase().includes(searchLower)
        )
    }

    // Sort by most recent
    data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedData = data.slice(start, start + pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
    }
}

// Fetch single beneficiary by ID
export async function fetchBeneficiaryById(id: string): Promise<IhtiyacSahibi | null> {
    await delay(200)
    const beneficiaries = getBeneficiaries()
    return beneficiaries.find(b => b.id === id) || null
}

// Create new beneficiary
export async function createBeneficiary(data: Partial<IhtiyacSahibi>): Promise<IhtiyacSahibi> {
    await delay(500)
    
    const newBeneficiary: IhtiyacSahibi = {
        id: crypto.randomUUID(),
        tur: data.tur || 'ihtiyac-sahibi-kisi',
        kategori: data.kategori || 'ihtiyac-sahibi-aile',
        ad: data.ad || '',
        soyad: data.soyad || '',
        uyruk: data.uyruk || 'Türkiye',
        dosyaNo: data.dosyaNo || `DSY-${Math.random().toString().slice(2, 8)}`,
        ulke: data.ulke || 'Türkiye',
        sehir: data.sehir || '',
        durum: 'taslak',
        rizaBeyaniDurumu: 'alinmadi',
        kayitTarihi: new Date(),
        basvuruSayisi: 0,
        yardimSayisi: 0,
        toplamYardimTutari: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
    } as IhtiyacSahibi
    
    getBeneficiaries().unshift(newBeneficiary)
    return newBeneficiary
}

// Update beneficiary
export async function updateBeneficiary(id: string, data: Partial<IhtiyacSahibi>): Promise<IhtiyacSahibi | null> {
    await delay(400)
    
    const beneficiaries = getBeneficiaries()
    const index = beneficiaries.findIndex(b => b.id === id)
    
    if (index === -1) return null
    
    beneficiaries[index] = {
        ...beneficiaries[index],
        ...data,
        updatedAt: new Date()
    }
    
    return beneficiaries[index]
}

// Mock create donation
export async function createDonation(data: Partial<Bagis>): Promise<Bagis> {
    await delay(500)

    const newDonation: Bagis = {
        id: crypto.randomUUID(),
        bagisci: data.bagisci || {
            id: crypto.randomUUID(),
            ad: '',
            soyad: ''
        },
        tutar: data.tutar || 0,
        currency: data.currency || 'TRY',
        amac: data.amac || 'genel',
        odemeYontemi: data.odemeYontemi || 'nakit',
        durum: 'tamamlandi',
        makbuzNo: `MKB-2024-${Math.random().toString().slice(2, 6)}`,
        aciklama: data.aciklama,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    getDonations().unshift(newDonation)
    return newDonation
}

// Mock create member
export async function createMember(data: Partial<Uye>): Promise<Uye> {
    await delay(500)

    const newMember: Uye = {
        id: crypto.randomUUID(),
        tcKimlikNo: data.tcKimlikNo || '',
        ad: data.ad || '',
        soyad: data.soyad || '',
        dogumTarihi: data.dogumTarihi || new Date(),
        cinsiyet: data.cinsiyet || 'erkek',
        telefon: data.telefon || '',
        email: data.email,
        adres: data.adres || {
            il: '',
            ilce: '',
            mahalle: '',
            acikAdres: ''
        },
        uyeTuru: data.uyeTuru || 'aktif',
        uyeNo: `UY-${Math.random().toString().slice(2, 8)}`,
        kayitTarihi: new Date(),
        aidatDurumu: 'guncel',
        aidat: {
            tutar: 100,
            sonOdemeTarihi: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }

    getMembers().unshift(newMember)
    return newMember
}
