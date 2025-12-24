import { faker } from '@faker-js/faker'
import type {
    Bagis,
    Bagisci,
    Kumbara,
    Uye,
    SosyalYardimBasvuru,
    User,
    DashboardStats,
    MonthlyData,
    AidDistributionData,
    Currency,
    PaymentMethod,
    PaymentStatus,
    DonationPurpose,
    KumbaraStatus,
    UyeTuru,
    AidatDurumu,
    YardimTuru,
    BasvuruDurumu
} from '@/types'

// Seed for consistent mock data during development
faker.seed(42)

// Helper to get random item from array
function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

// Helper to generate Turkish phone numbers
function generateTurkishPhone(): string {
    const prefix = '05'
    const rest = faker.string.numeric(9)
    return `${prefix}${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`
}

function generateInternationalPhone(): string {
    return `+${faker.string.numeric(2)} ${faker.string.numeric(3)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`
}
// Generate mock donor
export function generateMockBagisci(): Bagisci {
    return {
        id: faker.string.uuid(),
        ad: faker.person.firstName(),
        soyad: faker.person.lastName(),
        telefon: generateTurkishPhone(),
        email: faker.internet.email(),
        adres: faker.location.streetAddress({ useFullAddress: true })
    }
}

// Generate mock donation
export function generateMockBagis(): Bagis {
    const createdAt = faker.date.recent({ days: 90 })
    return {
        id: faker.string.uuid(),
        bagisci: generateMockBagisci(),
        tutar: faker.number.float({ min: 50, max: 10000, fractionDigits: 2 }),
        currency: randomItem<Currency>(['TRY', 'TRY', 'TRY', 'USD', 'EUR']), // More TRY
        amac: randomItem<DonationPurpose>(['genel', 'egitim', 'saglik', 'insani-yardim', 'kurban', 'fitre-zekat']),
        odemeYontemi: randomItem<PaymentMethod>(['nakit', 'havale', 'kredi-karti', 'mobil-odeme']),
        durum: randomItem<PaymentStatus>(['tamamlandi', 'tamamlandi', 'tamamlandi', 'beklemede', 'iptal']),
        makbuzNo: `MKB-2024-${faker.string.numeric({ length: 4 })}`,
        aciklama: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
        createdAt,
        updatedAt: createdAt
    }
}

// Generate multiple donations
export function generateMockDonations(count: number): Bagis[] {
    return Array.from({ length: count }, generateMockBagis)
}

// Generate mock user
export function generateMockUser(): User {
    const createdAt = faker.date.past({ years: 2 })
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: generateTurkishPhone(),
        role: randomItem(['admin', 'muhasebe', 'gorevli', 'uye']),
        avatar: faker.image.avatar(),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        lastLogin: faker.date.recent({ days: 30 }),
        permissions: ['donations.view', 'members.view'],
        createdAt,
        updatedAt: faker.date.recent()
    }
}

// Generate mock kumbara
export function generateMockKumbara(): Kumbara {
    const createdAt = faker.date.past({ years: 1 })
    const kod = `KMB-2024-${faker.string.numeric({ length: 3 })}`
    
    // Istanbul civarında rastgele koordinatlar
    const lat = faker.number.float({ min: 40.8, max: 41.2, fractionDigits: 6 })
    const lng = faker.number.float({ min: 28.8, max: 29.3, fractionDigits: 6 })
    
    return {
        id: faker.string.uuid(),
        kod,
        ad: `${faker.location.city()} ${randomItem(['Cami', 'Market', 'Bakkal', 'Eczane', 'Kafe'])} Kumbarası`,
        konum: `${faker.location.city()} - ${faker.company.name()}`,
        koordinat: faker.helpers.maybe(() => ({ lat, lng }), { probability: 0.8 }),
        qrKod: {
            kod,
            tapilanTarih: createdAt
        },
        sorumlu: generateMockUser(),
        sonBosaltma: faker.helpers.maybe(() => faker.date.recent({ days: 60 }), { probability: 0.7 }),
        toplamTutar: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
        toplamaBaşarina: faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
        toplamaGecmisi: [],
        durum: randomItem<KumbaraStatus>(['aktif', 'aktif', 'aktif', 'pasif', 'bakim']),
        notlar: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
        createdAt,
        updatedAt: faker.date.recent()
    }
}

// Generate multiple kumbaras
export function generateMockKumbaras(count: number): Kumbara[] {
    return Array.from({ length: count }, generateMockKumbara)
}

// Generate mock member
export function generateMockUye(): Uye {
    const createdAt = faker.date.past({ years: 3 })
    const kayitTarihi = faker.date.past({ years: 3 })
    return {
        id: faker.string.uuid(),
        tcKimlikNo: faker.string.numeric({ length: 11 }),
        ad: faker.person.firstName(),
        soyad: faker.person.lastName(),
        dogumTarihi: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        cinsiyet: randomItem(['erkek', 'kadin']),
        telefon: generateTurkishPhone(),
        email: faker.helpers.maybe(() => faker.internet.email(), { probability: 0.7 }),
        adres: {
            il: faker.location.city(),
            ilce: faker.location.county(),
            mahalle: faker.location.street(),
            acikAdres: faker.location.streetAddress({ useFullAddress: true })
        },
        uyeTuru: randomItem<UyeTuru>(['aktif', 'aktif', 'onursal', 'genc', 'destekci']),
        uyeNo: `UY-${faker.string.numeric({ length: 6 })}`,
        kayitTarihi,
        aidatDurumu: randomItem<AidatDurumu>(['guncel', 'guncel', 'gecmis', 'muaf']),
        aidat: {
            tutar: 100,
            sonOdemeTarihi: faker.helpers.maybe(() => faker.date.recent({ days: 90 }), { probability: 0.8 })
        },
        createdAt,
        updatedAt: faker.date.recent()
    }
}

// Generate multiple members
export function generateMockUyeler(count: number): Uye[] {
    return Array.from({ length: count }, generateMockUye)
}

// Generate mock social aid application
export function generateMockSosyalYardimBasvuru(): SosyalYardimBasvuru {
    const durum = randomItem<BasvuruDurumu>(['beklemede', 'inceleniyor', 'onaylandi', 'reddedildi', 'odendi'])
    const createdAt = faker.date.recent({ days: 60 })

    return {
        id: faker.string.uuid(),
        basvuranKisi: {
            ad: faker.person.firstName(),
            soyad: faker.person.lastName(),
            tcKimlikNo: faker.string.numeric({ length: 11 }),
            telefon: generateTurkishPhone(),
            adres: faker.location.streetAddress({ useFullAddress: true })
        },
        yardimTuru: randomItem<YardimTuru>(['ayni', 'nakdi', 'egitim', 'saglik', 'kira', 'fatura']),
        talepEdilenTutar: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 }),
        gerekce: faker.lorem.paragraph(),
        belgeler: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
            url: faker.internet.url(),
            tur: randomItem(['kimlik', 'fakirlik-belgesi', 'saglik-raporu', 'fatura']),
            uploadedAt: faker.date.recent({ days: 30 })
        })),
        durum,
        degerlendiren: durum !== 'beklemede' ? generateMockUser() : undefined,
        degerlendirmeTarihi: durum !== 'beklemede' ? faker.date.recent({ days: 30 }) : undefined,
        degerlendirmeNotu: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
        odemeBilgileri: durum === 'odendi' ? {
            tutar: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 }),
            odemeTarihi: faker.date.recent({ days: 14 }),
            makbuzNo: `OD-2024-${faker.string.numeric({ length: 4 })}`,
            odemeYontemi: randomItem<PaymentMethod>(['nakit', 'havale'])
        } : undefined,
        createdAt,
        updatedAt: faker.date.recent()
    }
}

// Generate multiple applications
export function generateMockBasvurular(count: number): SosyalYardimBasvuru[] {
    return Array.from({ length: count }, generateMockSosyalYardimBasvuru)
}

// Generate mock beneficiary (ihtiyaç sahibi) - Genişletilmiş
import type { 
    IhtiyacSahibi, 
    IhtiyacSahibiListItem,
    IhtiyacDurumu, 
    IhtiyacSahibiKategori,
    IhtiyacSahibiTuru,
    FonBolgesi,
    DosyaBaglantisi,
    KimlikBelgesiTuru,
    PasaportTuru,
    VizeGirisTuru,
    MedeniHal,
    EgitimDurumu,
    RizaBeyaniDurumu
} from '@/types'
import { TURKISH_CITIES, COUNTRIES } from './constants'

export function generateMockIhtiyacSahibi(): IhtiyacSahibi {
    const createdAt = faker.date.past({ years: 2 })
    const kayitTarihi = faker.date.past({ years: 2 })
    const yardimSayisi = faker.number.int({ min: 0, max: 10 })
    const basvuruSayisi = faker.number.int({ min: 0, max: 15 })
    const dogumTarihi = faker.date.birthdate({ min: 1, max: 85, mode: 'age' })

    const kategori = randomItem<IhtiyacSahibiKategori>([
        'yetim-ailesi', 'multeci-aile', 'ihtiyac-sahibi-aile', 
        'ogrenci-yabanci', 'ogrenci-tc'
    ])
    
    const uyruk = randomItem(COUNTRIES)
    const isTurkish = uyruk === 'Türkiye'
    const sehir = randomItem([...TURKISH_CITIES.slice(0, 20), 'İstanbul (Avrupa)', 'İstanbul (Anadolu)'])

    return {
        id: faker.string.uuid(),
        
        // Temel Bilgiler
        tur: randomItem<IhtiyacSahibiTuru>(['ihtiyac-sahibi-kisi', 'bakmakla-yukumlu']),
        kategori,
        ad: faker.person.firstName(),
        soyad: faker.person.lastName(),
        uyruk,
        dogumTarihi,
        cinsiyet: randomItem(['erkek', 'kadin']),
        tcKimlikNo: isTurkish ? faker.string.numeric({ length: 11 }) : undefined,
        yabanciKimlikNo: !isTurkish ? faker.string.alphanumeric({ length: 10 }).toUpperCase() : undefined,
        
        // Dosya Bilgileri
        dosyaNo: `DSY-${faker.string.numeric({ length: 6 })}`,
        fonBolgesi: randomItem<FonBolgesi>(['avrupa', 'serbest']),
        dosyaBaglantisi: randomItem<DosyaBaglantisi>(['partner-kurum', 'calisma-sahasi']),
        dosyaBaglantisiDetay: faker.company.name(),
        
        // İletişim
        cepTelefonu: generateTurkishPhone(),
        cepTelefonuOperator: randomItem(['530', '532', '535', '542', '545', '505']),
        sabitTelefon: faker.helpers.maybe(() => generateTurkishPhone(), { probability: 0.3 }),
        yurtdisiTelefon: faker.helpers.maybe(() => generateInternationalPhone(), { probability: 0.2 }),
        email: faker.helpers.maybe(() => faker.internet.email(), { probability: 0.5 }),
        
        // Adres Bilgileri
        ulke: 'Türkiye',
        sehir,
        ilce: faker.location.county(),
        mahalle: faker.location.street(),
        adres: faker.location.streetAddress({ useFullAddress: true }),
        
        // Kimlik Bilgileri
        kimlikBilgileri: {
            babaAdi: faker.person.firstName('male'),
            anneAdi: faker.person.firstName('female'),
            belgeTuru: randomItem<KimlikBelgesiTuru>(['tc-kimlik-belgesi', 'nufus-cuzdani', 'gecici-ikamet-belgesi', 'yabanci-kimlik-belgesi']),
            belgeGecerlilikTarihi: faker.date.future({ years: 5 }),
            seriNumarasi: faker.string.alphanumeric({ length: 9 }).toUpperCase(),
            oncekiUyruk: faker.helpers.maybe(() => randomItem(COUNTRIES), { probability: 0.2 }),
            oncekiIsim: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.1 })
        },
        
        // Pasaport ve Vize
        pasaportVizeBilgileri: {
            pasaportTuru: randomItem<PasaportTuru>(['yok', 'umuma-mahsus', 'hususi']),
            pasaportNumarasi: faker.helpers.maybe(() => faker.string.alphanumeric({ length: 9 }).toUpperCase(), { probability: 0.5 }),
            pasaportGecerlilikTarihi: faker.helpers.maybe(() => faker.date.future({ years: 10 }), { probability: 0.5 }),
            vizeGirisTuru: randomItem<VizeGirisTuru>(['yok', 'gecici-ikamet', 'multeci', 'siginmaci', 'egitim-ogrenci']),
            vizeBitisTarihi: faker.helpers.maybe(() => faker.date.future({ years: 2 }), { probability: 0.4 }),
            girisTarihi: faker.helpers.maybe(() => faker.date.past({ years: 5 }), { probability: 0.4 }),
            girisKapisi: faker.helpers.maybe(() => randomItem(['İstanbul Havalimanı', 'Edirne Kapıkule', 'Ankara Esenboğa', 'İzmir Adnan Menderes']), { probability: 0.3 })
        },
        
        // Göç ve İkamet
        gocIkametBilgileri: {
            geciciKorumaTarihi: faker.helpers.maybe(() => faker.date.past({ years: 8 }), { probability: 0.3 }),
            geciciKorumaIl: faker.helpers.maybe(() => randomItem(TURKISH_CITIES.slice(0, 10)), { probability: 0.3 }),
            oturmaIzniTuru: faker.helpers.maybe(() => randomItem(['İnsani İkamet', 'Aile İkamet', 'Çalışma İkamet']), { probability: 0.4 }),
            oturmaIzniGecerlilikTarihi: faker.helpers.maybe(() => faker.date.future({ years: 2 }), { probability: 0.4 })
        },
        
        // Sağlık
        saglikBilgileri: {
            kanGrubu: randomItem(['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-']),
            kronikHastalik: faker.helpers.maybe(() => randomItem(['Diyabet', 'Hipertansiyon', 'Kalp', 'Astım']), { probability: 0.2 }),
            engelDurumu: faker.helpers.maybe(() => randomItem(['Görme Engelli', 'İşitme Engelli', 'Fiziksel Engel']), { probability: 0.1 }),
            engelOrani: faker.helpers.maybe(() => faker.number.int({ min: 20, max: 100 }), { probability: 0.1 })
        },
        
        // Ekonomik Durum
        ekonomikDurum: {
            egitimDurumu: randomItem<EgitimDurumu>(['ilkokul', 'ortaokul', 'lise', 'universite', 'okur-yazar-degil']),
            meslek: randomItem(['Ev hanımı', 'İşsiz', 'Emekli', 'Serbest meslek', 'İşçi', 'Esnaf']),
            calismaDurumu: randomItem(['Çalışıyor', 'Çalışmıyor', 'Emekli']),
            aylikGelir: faker.number.int({ min: 0, max: 15000 }),
            gelirKaynagi: randomItem(['Maaş', 'Emekli Maaşı', 'Yok', 'Sosyal Yardım']),
            konutDurumu: randomItem(['kira', 'ev-sahibi', 'misafir']),
            kiraTutari: faker.helpers.maybe(() => faker.number.int({ min: 2000, max: 10000 }), { probability: 0.6 })
        },
        
        // Aile Bilgileri
        aileHaneBilgileri: {
            medeniHal: randomItem<MedeniHal>(['evli', 'bekar', 'dul', 'bosanmis']),
            esAdi: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.5 }),
            esTelefon: faker.helpers.maybe(() => generateTurkishPhone(), { probability: 0.4 }),
            ailedekiKisiSayisi: faker.number.int({ min: 1, max: 10 }),
            cocukSayisi: faker.number.int({ min: 0, max: 6 }),
            yetimSayisi: faker.number.int({ min: 0, max: 3 }),
            calısanSayisi: faker.number.int({ min: 0, max: 3 }),
            bakmaklaYukumluSayisi: faker.number.int({ min: 0, max: 5 })
        },
        
        // Durum
        durum: randomItem<IhtiyacDurumu>(['aktif', 'aktif', 'aktif', 'taslak', 'pasif']),
        rizaBeyaniDurumu: randomItem<RizaBeyaniDurumu>(['alinmadi', 'alindi', 'reddetti']),
        kayitTarihi,
        sonAtamaTarihi: faker.helpers.maybe(() => faker.date.recent({ days: 180 }), { probability: 0.5 }),
        
        // Yardım İstatistikleri
        basvuruSayisi,
        yardimSayisi,
        toplamYardimTutari: yardimSayisi > 0 ? faker.number.float({ min: 1000, max: 80000, fractionDigits: 2 }) : 0,
        sonYardimTarihi: yardimSayisi > 0 ? faker.date.recent({ days: 120 }) : undefined,
        
        // Bağlantılı Kayıtlar
        baglantiliKayitlar: {
            bankaHesaplari: faker.number.int({ min: 0, max: 2 }),
            dokumanlar: faker.number.int({ min: 0, max: 10 }),
            fotograflar: faker.number.int({ min: 0, max: 5 }),
            baktigiYetimler: faker.number.int({ min: 0, max: 4 }),
            baktigiKisiler: faker.number.int({ min: 0, max: 3 }),
            sponsorlar: faker.number.int({ min: 0, max: 2 }),
            referanslar: faker.number.int({ min: 0, max: 2 }),
            gorusmeKayitlari: faker.number.int({ min: 0, max: 5 }),
            gorusmeSeansTakibi: faker.number.int({ min: 0, max: 3 }),
            yardimTalepleri: basvuruSayisi,
            yapilanYardimlar: yardimSayisi,
            rizaBeyannamesi: faker.number.int({ min: 0, max: 1 }),
            sosyalKartlar: faker.number.int({ min: 0, max: 1 })
        },
        
        // Ek
        notlar: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
        mernisDogrulama: faker.datatype.boolean({ probability: 0.7 }),
        
        createdAt,
        updatedAt: faker.date.recent()
    }
}

// Liste görünümü için basitleştirilmiş veri
export function generateMockIhtiyacSahibiListItem(): IhtiyacSahibiListItem {
    const full = generateMockIhtiyacSahibi()
    const dogumTarihi = full.dogumTarihi
    const yas = dogumTarihi ? new Date().getFullYear() - dogumTarihi.getFullYear() : undefined

    return {
        id: full.id,
        tur: full.tur,
        ad: full.ad,
        soyad: full.soyad,
        kategori: full.kategori,
        yas,
        uyruk: full.uyruk,
        tcKimlikNo: full.tcKimlikNo,
        yabanciKimlikNo: full.yabanciKimlikNo,
        cepTelefonu: full.cepTelefonuOperator && full.cepTelefonu 
            ? `${full.cepTelefonuOperator} ${full.cepTelefonu}` 
            : undefined,
        ulke: full.ulke,
        sehir: full.sehir,
        ilce: full.ilce,
        adres: full.adres,
        ailedekiKisiSayisi: full.aileHaneBilgileri?.ailedekiKisiSayisi,
        yetimSayisi: full.aileHaneBilgileri?.yetimSayisi,
        basvuruSayisi: full.basvuruSayisi,
        yardimSayisi: full.yardimSayisi,
        dosyaNo: full.dosyaNo,
        sonAtamaTarihi: full.sonAtamaTarihi,
        durum: full.durum
    }
}

// Generate multiple beneficiaries
export function generateMockIhtiyacSahipleri(count: number): IhtiyacSahibi[] {
    return Array.from({ length: count }, generateMockIhtiyacSahibi)
}

export function generateMockIhtiyacSahipleriListItems(count: number): IhtiyacSahibiListItem[] {
    return Array.from({ length: count }, generateMockIhtiyacSahibiListItem)
}

// Generate monthly data for charts
export function generateMonthlyData(): MonthlyData[] {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    return months.map(month => ({
        month,
        amount: faker.number.float({ min: 10000, max: 100000, fractionDigits: 2 })
    }))
}

// Generate aid distribution data for pie chart
export function generateAidDistribution(): AidDistributionData[] {
    return [
        { name: 'Nakdi Yardım', value: faker.number.int({ min: 30, max: 50 }), color: 'hsl(var(--chart-1))' },
        { name: 'Eğitim', value: faker.number.int({ min: 15, max: 25 }), color: 'hsl(var(--chart-2))' },
        { name: 'Sağlık', value: faker.number.int({ min: 10, max: 20 }), color: 'hsl(var(--chart-3))' },
        { name: 'Kira', value: faker.number.int({ min: 10, max: 15 }), color: 'hsl(var(--chart-4))' },
        { name: 'Fatura', value: faker.number.int({ min: 5, max: 10 }), color: 'hsl(var(--chart-5))' }
    ]
}

// Generate dashboard stats
export function generateDashboardStats(): DashboardStats {
    return {
        totalDonations: faker.number.float({ min: 500000, max: 2000000, fractionDigits: 2 }),
        donationsTrend: faker.number.float({ min: -15, max: 25, fractionDigits: 1 }),
        activeMembers: faker.number.int({ min: 200, max: 500 }),
        pendingApplications: faker.number.int({ min: 5, max: 25 }),
        monthlyAid: faker.number.float({ min: 50000, max: 150000, fractionDigits: 2 }),
        monthlyDonations: generateMonthlyData(),
        aidDistribution: generateAidDistribution(),
        recentDonations: generateMockDonations(5)
    }
}

// Current logged in user (mock)
export const CURRENT_USER: User = {
    id: 'current-user-id',
    name: 'Ahmet Yönetici',
    email: 'admin@kafkasder.org',
    phone: '0532 123 45 67',
    role: 'admin',
    avatar: undefined,
    isActive: true,
    lastLogin: new Date(),
    permissions: [
        'donations.view',
        'donations.create',
        'donations.edit',
        'donations.delete',
        'members.view',
        'members.create',
        'members.edit',
        'social-aid.view',
        'social-aid.approve',
        'reports.export',
        'settings.manage'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
}
