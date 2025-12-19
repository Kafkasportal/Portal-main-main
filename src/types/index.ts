// Common Types
export type Currency = 'TRY' | 'USD' | 'EUR';
export type PaymentMethod = 'nakit' | 'havale' | 'kredi-karti' | 'mobil-odeme';
export type PaymentStatus = 'beklemede' | 'tamamlandi' | 'iptal' | 'iade';

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// User Types
export type UserRole = 'admin' | 'muhasebe' | 'gorevli' | 'uye';

export type Permission =
    | 'donations.view'
    | 'donations.create'
    | 'donations.edit'
    | 'donations.delete'
    | 'members.view'
    | 'members.create'
    | 'members.edit'
    | 'social-aid.view'
    | 'social-aid.approve'
    | 'reports.export'
    | 'settings.manage';

export interface User extends Timestamps {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    permissions: Permission[];
}

// Donation (Bağış) Types
export type DonationPurpose = 'genel' | 'egitim' | 'saglik' | 'insani-yardim' | 'kurban' | 'fitre-zekat';

export interface Bagisci {
    id: string;
    ad: string;
    soyad: string;
    telefon?: string;
    email?: string;
    adres?: string;
}

export interface Bagis extends Timestamps {
    id: string;
    bagisci: Bagisci;
    tutar: number;
    currency: Currency;
    amac: DonationPurpose;
    odemeYontemi: PaymentMethod;
    durum: PaymentStatus;
    makbuzNo?: string;
    aciklama?: string;
    fatura?: {
        url: string;
        uploadedAt: Date;
    };
}

export interface BagisStats {
    toplamBagis: number;
    toplamBagisci: number;
    aylikOrtalama: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
}

// Kumbara (Collection Box) Types
export type KumbaraStatus = 'aktif' | 'pasif' | 'bakim';

export interface Kumbara extends Timestamps {
    id: string;
    kod: string;
    konum: string;
    sorumlu: User;
    sonBosaltma?: Date;
    toplamTutar: number;
    durum: KumbaraStatus;
    notlar?: string;
}

// Member (Üye) Types
export type UyeTuru = 'aktif' | 'onursal' | 'genc' | 'destekci';
export type AidatDurumu = 'guncel' | 'gecmis' | 'muaf';
export type Cinsiyet = 'erkek' | 'kadin';

export interface UyeAdres {
    il: string;
    ilce: string;
    mahalle: string;
    acikAdres: string;
}

export interface Uye extends Timestamps {
    id: string;
    tcKimlikNo: string;
    ad: string;
    soyad: string;
    dogumTarihi: Date;
    cinsiyet: Cinsiyet;
    telefon: string;
    email?: string;
    adres: UyeAdres;
    uyeTuru: UyeTuru;
    uyeNo: string;
    kayitTarihi: Date;
    aidatDurumu: AidatDurumu;
    aidat: {
        tutar: number;
        sonOdemeTarihi?: Date;
    };
}

// Social Aid (Sosyal Yardım) Types
export type YardimTuru = 'ayni' | 'nakdi' | 'egitim' | 'saglik' | 'kira' | 'fatura';
export type BasvuruDurumu = 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi' | 'odendi';

export interface BasvuranKisi {
    ad: string;
    soyad: string;
    tcKimlikNo: string;
    telefon: string;
    adres: string;
}

export interface BasvuruBelge {
    url: string;
    tur: string;
    uploadedAt: Date;
}

export interface OdemeBilgileri {
    tutar: number;
    odemeTarihi: Date;
    makbuzNo: string;
    odemeYontemi: PaymentMethod;
}

export interface SosyalYardimBasvuru extends Timestamps {
    id: string;
    basvuranKisi: BasvuranKisi;
    yardimTuru: YardimTuru;
    talepEdilenTutar?: number;
    gerekce: string;
    belgeler: BasvuruBelge[];
    durum: BasvuruDurumu;
    degerlendiren?: User;
    degerlendirmeTarihi?: Date;
    degerlendirmeNotu?: string;
    odemeBilgileri?: OdemeBilgileri;
}

// İhtiyaç Sahibi (Beneficiary) Types - Kapsamlı Sistem
export type IhtiyacDurumu = 'taslak' | 'aktif' | 'pasif' | 'tamamlandi';

export type IhtiyacSahibiKategori = 
    | 'yetim-ailesi'
    | 'multeci-aile'
    | 'ihtiyac-sahibi-aile'
    | 'ogrenci-yabanci'
    | 'ogrenci-tc'
    | 'vakif-dernek'
    | 'devlet-okulu'
    | 'kamu-kurumu'
    | 'ozel-egitim-kurumu';

export type IhtiyacSahibiTuru = 'ihtiyac-sahibi-kisi' | 'bakmakla-yukumlu';

export type FonBolgesi = 'avrupa' | 'serbest';

export type DosyaBaglantisi = 'partner-kurum' | 'calisma-sahasi';

export type KimlikBelgesiTuru = 
    | 'yok'
    | 'nufus-cuzdani'
    | 'tc-kimlik-belgesi'
    | 'gecici-ikamet-belgesi'
    | 'yabanci-kimlik-belgesi';

export type PasaportTuru = 
    | 'yok'
    | 'diplomatik'
    | 'gecici'
    | 'hizmet'
    | 'hususi'
    | 'umuma-mahsus';

export type VizeGirisTuru = 
    | 'yok'
    | 'calisma-izni'
    | 'egitim-ogrenci'
    | 'gecici-ikamet'
    | 'ikinci-vatandaslik'
    | 'multeci'
    | 'siginmaci'
    | 'turist-seyahat';

export type MedeniHal = 'bekar' | 'evli' | 'dul' | 'bosanmis';

export type EgitimDurumu = 
    | 'okur-yazar-degil'
    | 'ilkokul'
    | 'ortaokul'
    | 'lise'
    | 'universite'
    | 'yuksek-lisans'
    | 'doktora';

export type SaglikDurumu = 'iyi' | 'kronik-hasta' | 'engelli' | 'yasli-bakim';

export type RizaBeyaniDurumu = 'alinmadi' | 'alindi' | 'reddetti';

// Kimlik Bilgileri
export interface KimlikBilgileri {
    babaAdi?: string;
    anneAdi?: string;
    belgeTuru: KimlikBelgesiTuru;
    belgeGecerlilikTarihi?: Date;
    seriNumarasi?: string;
    oncekiUyruk?: string;
    oncekiIsim?: string;
}

// Pasaport ve Vize Bilgileri
export interface PasaportVizeBilgileri {
    pasaportTuru: PasaportTuru;
    pasaportNumarasi?: string;
    pasaportGecerlilikTarihi?: Date;
    vizeGirisTuru: VizeGirisTuru;
    vizeBitisTarihi?: Date;
    girisTarihi?: Date;
    girisKapisi?: string;
}

// Göç ve İkamet Bilgileri
export interface GocIkametBilgileri {
    geciciKorumaTarihi?: Date;
    geciciKorumaIl?: string;
    oturmaIzniTuru?: string;
    oturmaIzniGecerlilikTarihi?: Date;
    oturmaIzniAlinmaTarihi?: Date;
    oturmaIzniYenilenmeTarihi?: Date;
    yukumluOlduguKurum?: string;
    sonGeldigiAdres?: string;
}

// Sağlık Bilgileri
export interface SaglikBilgileri {
    kanGrubu?: string;
    kronikHastalik?: string;
    engelDurumu?: string;
    engelOrani?: number;
    surekliIlac?: string;
    saglikGuvenceleri?: string;
}

// Ekonomik ve Sosyal Durum
export interface EkonomikSosyalDurum {
    egitimDurumu?: EgitimDurumu;
    meslek?: string;
    calismaDurumu?: string;
    aylikGelir?: number;
    gelirKaynagi?: string;
    konutDurumu?: 'kira' | 'ev-sahibi' | 'misafir' | 'barinma-merkezi';
    kiraTutari?: number;
    borcDurumu?: string;
    borcTutari?: number;
}

// Aile ve Hane Bilgileri
export interface AileHaneBilgileri {
    medeniHal: MedeniHal;
    esAdi?: string;
    esTelefon?: string;
    ailedekiKisiSayisi: number;
    cocukSayisi: number;
    yetimSayisi: number;
    calısanSayisi: number;
    bakmaklaYukumluSayisi: number;
}

// Bağlantılı Kayıt Sayıları
export interface BaglantiliKayitlar {
    bankaHesaplari: number;
    dokumanlar: number;
    fotograflar: number;
    baktigiYetimler: number;
    baktigiKisiler: number;
    sponsorlar: number;
    referanslar: number;
    gorusmeKayitlari: number;
    gorusmeSeansTakibi: number;
    yardimTalepleri: number;
    yapilanYardimlar: number;
    rizaBeyannamesi: number;
    sosyalKartlar: number;
}

// Ana İhtiyaç Sahibi Interface (Genişletilmiş)
export interface IhtiyacSahibi extends Timestamps {
    id: string;
    
    // Temel Bilgiler
    tur: IhtiyacSahibiTuru;
    kategori: IhtiyacSahibiKategori;
    ad: string;
    soyad: string;
    uyruk: string;
    dogumTarihi?: Date;
    cinsiyet?: Cinsiyet;
    tcKimlikNo?: string;
    yabanciKimlikNo?: string;
    
    // Dosya Bilgileri
    dosyaNo: string;
    fonBolgesi?: FonBolgesi;
    dosyaBaglantisi?: DosyaBaglantisi;
    dosyaBaglantisiDetay?: string;
    
    // İletişim
    cepTelefonu?: string;
    cepTelefonuOperator?: string;
    sabitTelefon?: string;
    yurtdisiTelefon?: string;
    email?: string;
    
    // Adres Bilgileri
    ulke: string;
    sehir: string;
    ilce?: string;
    mahalle?: string;
    adres?: string;
    
    // Alt Bilgiler
    kimlikBilgileri?: KimlikBilgileri;
    pasaportVizeBilgileri?: PasaportVizeBilgileri;
    gocIkametBilgileri?: GocIkametBilgileri;
    saglikBilgileri?: SaglikBilgileri;
    ekonomikDurum?: EkonomikSosyalDurum;
    aileHaneBilgileri?: AileHaneBilgileri;
    
    // Sponsorluk
    sponsorlukTipi?: string;
    
    // Durum ve İstatistikler
    durum: IhtiyacDurumu;
    rizaBeyaniDurumu: RizaBeyaniDurumu;
    kayitTarihi: Date;
    sonAtamaTarihi?: Date;
    
    // Yardım İstatistikleri
    basvuruSayisi: number;
    yardimSayisi: number;
    toplamYardimTutari: number;
    sonYardimTarihi?: Date;
    
    // Bağlantılı Kayıtlar
    baglantiliKayitlar?: BaglantiliKayitlar;
    
    // Ek Bilgiler
    fotografUrl?: string;
    notlar?: string;
    mernisDogrulama?: boolean;
}

// Liste görünümü için kısa versiyon
export interface IhtiyacSahibiListItem {
    id: string;
    tur: IhtiyacSahibiTuru;
    ad: string;
    soyad: string;
    kategori: IhtiyacSahibiKategori;
    yas?: number;
    uyruk: string;
    tcKimlikNo?: string;
    yabanciKimlikNo?: string;
    cepTelefonu?: string;
    ulke: string;
    sehir: string;
    ilce?: string;
    adres?: string;
    ailedekiKisiSayisi?: number;
    yetimSayisi?: number;
    basvuruSayisi: number;
    yardimSayisi: number;
    dosyaNo: string;
    sonAtamaTarihi?: Date;
    durum: IhtiyacDurumu;
}

// Table State Types (for nuqs URL state)
export interface TableState {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string | string[]>;
}

// Dashboard Stats Types
export interface DashboardStats {
    totalDonations: number;
    donationsTrend: number;
    activeMembers: number;
    pendingApplications: number;
    monthlyAid: number;
    monthlyDonations: MonthlyData[];
    aidDistribution: AidDistributionData[];
    recentDonations: Bagis[];
}

export interface MonthlyData {
    month: string;
    amount: number;
}

export interface AidDistributionData {
    name: string;
    value: number;
    color: string;
}

// Navigation Types
export interface NavItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
    badge?: number;
}
