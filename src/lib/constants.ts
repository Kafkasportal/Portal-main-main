import {
  Home,
  Heart,
  Users,
  HandHeart,
  Calendar,
  FileText,
  Settings,
  PiggyBank,
  TrendingUp,
  BarChart3,
  UserPlus,
  ClipboardList,
  CreditCard,
  PieChart,
  Shield,
  Database,
  UserCheck,
  Banknote,
  Building,
  Package,
  Stethoscope,
  ListChecks,
  AlertTriangle,
  Info,
  Wallet,
  FileSpreadsheet,
} from 'lucide-react'
import type { NavItem, Currency } from '@/types'

// Currency symbols - centralized constant
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Genel Bakış',
    href: '/genel',
    icon: Home,
  },
  {
    label: 'Bağışlar',
    icon: Heart,
    children: [
      { label: 'Bağış Listesi', href: '/bagis/liste', icon: TrendingUp },
      { label: 'Kumbara Yönetimi', href: '/bagis/kumbara', icon: PiggyBank },
      { label: 'Gelir-Gider', href: '/bagis/gelir-gider', icon: BarChart3 },
      { label: 'Raporlar', href: '/bagis/raporlar', icon: PieChart },
    ],
  },
  {
    label: 'Üyeler',
    icon: Users,
    children: [
      { label: 'Üye Listesi', href: '/uyeler/liste', icon: Users },
      { label: 'Yeni Üye', href: '/uyeler/yeni', icon: UserPlus },
    ],
  },
  {
    label: 'Sosyal Yardım',
    icon: HandHeart,
    children: [
      {
        label: 'Raporlar',
        href: '/sosyal-yardim/raporlar',
        icon: FileSpreadsheet,
      },
      {
        label: 'İhtiyaç Sahipleri',
        href: '/sosyal-yardim/ihtiyac-sahipleri',
        icon: UserCheck,
      },
      {
        label: 'Yardım Başvuruları',
        href: '/sosyal-yardim/basvurular',
        icon: ClipboardList,
      },
      {
        label: 'Tüm Yardımlar',
        href: '/sosyal-yardim/tum-yardimlar',
        icon: ListChecks,
      },
      {
        label: 'Nakdi Yardım Veznesi',
        href: '/sosyal-yardim/vezne',
        icon: Wallet,
      },
      {
        label: 'Banka Ödeme Emirleri',
        href: '/sosyal-yardim/banka-emirleri',
        icon: Building,
      },
      {
        label: 'Nakdi Yardım İşlemleri',
        href: '/sosyal-yardim/nakdi-islemler',
        icon: Banknote,
      },
      {
        label: 'Ayni Yardım İşlemleri',
        href: '/sosyal-yardim/ayni-islemler',
        icon: Package,
      },
      {
        label: 'Hizmet Takip İşlemleri',
        href: '/sosyal-yardim/hizmet-takip',
        icon: CreditCard,
      },
      {
        label: 'Hastane Sevk İşlemleri',
        href: '/sosyal-yardim/hastane-sevk',
        icon: Stethoscope,
      },
      {
        label: 'Parametreler',
        href: '/sosyal-yardim/parametreler',
        icon: Settings,
      },
      {
        label: 'Veri Kontrolü',
        href: '/sosyal-yardim/veri-kontrol',
        icon: AlertTriangle,
      },
      {
        label: 'Modül Bilgilendirme',
        href: '/sosyal-yardim/bilgilendirme',
        icon: Info,
      },
    ],
  },
  {
    label: 'Etkinlikler',
    href: '/etkinlikler',
    icon: Calendar,
  },
  {
    label: 'Dokümanlar',
    href: '/dokumanlar',
    icon: FileText,
  },
  {
    label: 'Ayarlar',
    icon: Settings,
    children: [
      { label: 'Genel Ayarlar', href: '/ayarlar/genel', icon: Settings },
      { label: 'Kullanıcılar', href: '/ayarlar/kullanicilar', icon: Users },
      { label: 'Roller', href: '/ayarlar/roller', icon: Shield },
      { label: 'Yedekleme', href: '/ayarlar/yedekleme', icon: Database },
    ],
  },
]

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Status badge variants
export const STATUS_VARIANTS = {
  beklemede: 'warning',
  tamamlandi: 'success',
  iptal: 'destructive',
  iade: 'secondary',
  inceleniyor: 'default',
  onaylandi: 'success',
  reddedildi: 'destructive',
  odendi: 'success',
} as const

// Status labels
export const STATUS_LABELS: Record<string, string> = {
  beklemede: 'Beklemede',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
  iade: 'İade',
  inceleniyor: 'İnceleniyor',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
  odendi: 'Ödendi',
}

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
  nakit: 'Nakit',
  havale: 'Havale/EFT',
  'kredi-karti': 'Kredi Kartı',
  'mobil-odeme': 'Mobil Ödeme',
} as const

// Donation purpose labels
export const DONATION_PURPOSE_LABELS = {
  genel: 'Genel',
  egitim: 'Eğitim',
  saglik: 'Sağlık',
  'insani-yardim': 'İnsani Yardım',
  kurban: 'Kurban',
  'fitre-zekat': 'Fitre/Zekat',
} as const

// Aid type labels
export const AID_TYPE_LABELS = {
  ayni: 'Ayni Yardım',
  nakdi: 'Nakdi Yardım',
  egitim: 'Eğitim Desteği',
  saglik: 'Sağlık Desteği',
  kira: 'Kira Yardımı',
  fatura: 'Fatura Desteği',
} as const

// Başvuru durumu labels
export const BASVURU_DURUMU_LABELS = {
  beklemede: 'Beklemede',
  inceleniyor: 'İnceleniyor',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
  odendi: 'Ödendi',
} as const

// Member type labels
export const MEMBER_TYPE_LABELS = {
  aktif: 'Aktif Üye',
  onursal: 'Onursal Üye',
  genc: 'Genç Üye',
  destekci: 'Destekçi',
} as const

// İhtiyaç Sahibi Kategori Labels
export const IHTIYAC_SAHIBI_KATEGORI_LABELS = {
  'yetim-ailesi': 'Yetim Ailesi',
  'multeci-aile': 'Mülteci Aile',
  'ihtiyac-sahibi-aile': 'İhtiyaç Sahibi Aile',
  'ogrenci-yabanci': 'Öğrenci (Yabancı)',
  'ogrenci-tc': 'Öğrenci (TC)',
  'vakif-dernek': 'Vakıf & Dernek',
  'devlet-okulu': 'Devlet Okulu',
  'kamu-kurumu': 'Kamu Kurumu',
  'ozel-egitim-kurumu': 'Özel Eğitim Kurumu',
} as const

export const IHTIYAC_SAHIBI_TURU_LABELS = {
  'ihtiyac-sahibi-kisi': 'İhtiyaç Sahibi Kişi',
  'bakmakla-yukumlu': 'Bakmakla Yükümlü Olunan Kişi',
} as const

export const FON_BOLGESI_LABELS = {
  avrupa: 'Avrupa',
  serbest: 'Serbest',
} as const

export const DOSYA_BAGLANTISI_LABELS = {
  'partner-kurum': 'Partner Kurum',
  'calisma-sahasi': 'Çalışma Sahası',
} as const

export const KIMLIK_BELGESI_TURU_LABELS = {
  yok: 'Yok',
  'nufus-cuzdani': 'Nüfus Cüzdanı',
  'tc-kimlik-belgesi': 'TC Kimlik Belgesi',
  'gecici-ikamet-belgesi': 'Geçici İkamet Belgesi',
  'yabanci-kimlik-belgesi': 'Yabancı Kimlik Belgesi',
} as const

export const PASAPORT_TURU_LABELS = {
  yok: 'Yok',
  diplomatik: 'Diplomatik',
  gecici: 'Geçici (Seyahat Belgesi)',
  hizmet: 'Hizmet (Devlet Görevi)',
  hususi: 'Hususi (Yeşil)',
  'umuma-mahsus': 'Umuma Mahsus',
} as const

export const VIZE_GIRIS_TURU_LABELS = {
  yok: 'Yok',
  'calisma-izni': 'Çalışma İzni',
  'egitim-ogrenci': 'Eğitim / Öğrenci',
  'gecici-ikamet': 'Geçici İkamet',
  'ikinci-vatandaslik': 'İkinci Vatandaşlık',
  multeci: 'Mülteci',
  siginmaci: 'Sığınmacı',
  'turist-seyahat': 'Turist / Seyahat',
} as const

export const MEDENI_HAL_LABELS = {
  bekar: 'Bekar',
  evli: 'Evli',
  dul: 'Dul',
  bosanmis: 'Boşanmış',
} as const

export const EGITIM_DURUMU_LABELS = {
  'okur-yazar-degil': 'Okur-Yazar Değil',
  ilkokul: 'İlkokul',
  ortaokul: 'Ortaokul',
  lise: 'Lise',
  universite: 'Üniversite',
  'yuksek-lisans': 'Yüksek Lisans',
  doktora: 'Doktora',
} as const

export const IHTIYAC_DURUMU_LABELS = {
  taslak: 'Taslak',
  aktif: 'Aktif',
  pasif: 'Pasif',
  tamamlandi: 'Tamamlandı',
} as const

export const RIZA_BEYANI_LABELS = {
  alinmadi: 'Alınmadı',
  alindi: 'Alındı',
  reddetti: 'Reddetti',
} as const

// In-kind aid type labels (Ayni yardım türleri)
export const YARDIM_TURU_LABELS: Record<string, string> = {
  gida: 'Gıda',
  giyim: 'Giyim',
  yakacak: 'Yakacak',
  diger: 'Diğer',
}

// Unit labels for in-kind aid (Birim etiketleri)
export const BIRIM_LABELS: Record<string, string> = {
  adet: 'Adet',
  kg: 'Kilogram',
  paket: 'Paket',
  kutu: 'Kutu',
  takim: 'Takım',
  diger: 'Diğer',
}

// Operatör kodları (Cep telefonu)
export const TELEFON_OPERATOR_KODLARI = [
  '501',
  '502',
  '503',
  '504',
  '505',
  '506',
  '507',
  '508',
  '509',
  '530',
  '531',
  '532',
  '533',
  '534',
  '535',
  '536',
  '537',
  '538',
  '539',
  '540',
  '541',
  '542',
  '543',
  '544',
  '545',
  '546',
  '547',
  '548',
  '549',
  '550',
  '551',
  '552',
  '553',
  '554',
  '555',
  '556',
  '557',
  '558',
  '559',
]

// Ülkeler listesi
export const COUNTRIES = [
  'Türkiye',
  'Abhazya',
  'Acara',
  'Adıge',
  'Afganistan',
  'Almanya',
  'Amerika Birleşik Devletleri',
  'Arnavutluk',
  'Avustralya',
  'Avusturya',
  'Azerbaycan',
  'Bahreyn',
  'Belçika',
  'Birleşik Arap Emirlikleri',
  'Bosna Hersek',
  'Bulgaristan',
  'Cezayir',
  'Çeçenistan',
  'Çin',
  'Dağıstan',
  'Eritre',
  'Etiyopya',
  'Fas',
  'Filistin',
  'Fransa',
  'Gürcistan',
  'Hollanda',
  'Hindistan',
  'Irak',
  'İngiltere',
  'İran',
  'İspanya',
  'İsrail',
  'İsveç',
  'İsviçre',
  'İtalya',
  'Japonya',
  'Kabartay-Balkar',
  'Kanada',
  'Karaçay-Çerkes',
  'Katar',
  'Kazakistan',
  'Kırgızistan',
  'Kosova',
  'Kuveyt',
  'Libya',
  'Lübnan',
  'Macaristan',
  'Makedonya',
  'Mısır',
  'Moldova',
  'Nijerya',
  'Osetya',
  'Özbekistan',
  'Pakistan',
  'Polonya',
  'Romanya',
  'Rusya',
  'Sırbistan',
  'Somali',
  'Sudan',
  'Suriye',
  'Suudi Arabistan',
  'Tacikistan',
  'Tunus',
  'Türkmenistan',
  'Ukrayna',
  'Umman',
  'Ürdün',
  'Yemen',
  'Yunanistan',
]

// İstanbul bölgeleri
export const ISTANBUL_REGIONS = ['İstanbul (Anadolu)', 'İstanbul (Avrupa)']

// Turkish cities for address selection
export const TURKISH_CITIES = [
  'Adana',
  'Adıyaman',
  'Afyonkarahisar',
  'Ağrı',
  'Amasya',
  'Ankara',
  'Antalya',
  'Artvin',
  'Aydın',
  'Balıkesir',
  'Bilecik',
  'Bingöl',
  'Bitlis',
  'Bolu',
  'Burdur',
  'Bursa',
  'Çanakkale',
  'Çankırı',
  'Çorum',
  'Denizli',
  'Diyarbakır',
  'Edirne',
  'Elazığ',
  'Erzincan',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'Giresun',
  'Gümüşhane',
  'Hakkari',
  'Hatay',
  'Isparta',
  'Mersin',
  'İstanbul',
  'İzmir',
  'Kars',
  'Kastamonu',
  'Kayseri',
  'Kırklareli',
  'Kırşehir',
  'Kocaeli',
  'Konya',
  'Kütahya',
  'Malatya',
  'Manisa',
  'Kahramanmaraş',
  'Mardin',
  'Muğla',
  'Muş',
  'Nevşehir',
  'Niğde',
  'Ordu',
  'Rize',
  'Sakarya',
  'Samsun',
  'Siirt',
  'Sinop',
  'Sivas',
  'Tekirdağ',
  'Tokat',
  'Trabzon',
  'Tunceli',
  'Şanlıurfa',
  'Uşak',
  'Van',
  'Yozgat',
  'Zonguldak',
  'Aksaray',
  'Bayburt',
  'Karaman',
  'Kırıkkale',
  'Batman',
  'Şırnak',
  'Bartın',
  'Ardahan',
  'Iğdır',
  'Yalova',
  'Karabük',
  'Kilis',
  'Osmaniye',
  'Düzce',
]
