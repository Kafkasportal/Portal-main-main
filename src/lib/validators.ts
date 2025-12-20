import { z } from 'zod'

// Common validators
export const phoneSchema = z.string()
    .regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz')
    .or(z.literal(''))
    .optional()

export const tcKimlikSchema = z.string()
    .length(11, 'TC Kimlik numarası 11 haneli olmalıdır')
    .regex(/^[0-9]+$/, 'TC Kimlik numarası sadece rakamlardan oluşmalıdır')

export const emailSchema = z.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .or(z.literal(''))
    .optional()

// Donation form schema
export const donationSchema = z.object({
    bagisci: z.object({
        ad: z.string()
            .min(2, 'Ad en az 2 karakter olmalıdır')
            .max(50, 'Ad en fazla 50 karakter olabilir'),
        soyad: z.string()
            .min(2, 'Soyad en az 2 karakter olmalıdır')
            .max(50, 'Soyad en fazla 50 karakter olabilir'),
        telefon: phoneSchema,
        email: emailSchema,
        adres: z.string().max(200, 'Adres en fazla 200 karakter olabilir').optional()
    }),
    tutar: z.number()
        .positive('Tutar pozitif bir sayı olmalıdır')
        .min(1, 'Minimum bağış tutarı 1 TL'),
    currency: z.enum(['TRY', 'USD', 'EUR']),
    amac: z.enum(['genel', 'egitim', 'saglik', 'insani-yardim', 'kurban', 'fitre-zekat']),
    odemeYontemi: z.enum(['nakit', 'havale', 'kredi-karti', 'mobil-odeme']),
    makbuzNo: z.string().optional(),
    aciklama: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional()
})

export type DonationFormData = z.infer<typeof donationSchema>

// Member form schema
export const memberSchema = z.object({
    tcKimlikNo: tcKimlikSchema,
    ad: z.string()
        .min(2, 'Ad en az 2 karakter olmalıdır')
        .max(50, 'Ad en fazla 50 karakter olabilir'),
    soyad: z.string()
        .min(2, 'Soyad en az 2 karakter olmalıdır')
        .max(50, 'Soyad en fazla 50 karakter olabilir'),
    dogumTarihi: z.date({
        message: 'Doğum tarihi gereklidir'
    }),
    cinsiyet: z.enum(['erkek', 'kadin']),
    telefon: z.string()
        .min(10, 'Geçerli bir telefon numarası giriniz'),
    email: emailSchema,
    adres: z.object({
        il: z.string().min(1, 'İl seçiniz'),
        ilce: z.string().min(1, 'İlçe giriniz'),
        mahalle: z.string().min(1, 'Mahalle giriniz'),
        acikAdres: z.string().min(5, 'Açık adres en az 5 karakter olmalıdır')
    }),
    uyeTuru: z.enum(['aktif', 'onursal', 'genc', 'destekci'])
})

export type MemberFormData = z.infer<typeof memberSchema>

// Social aid application schema
export const socialAidApplicationSchema = z.object({
    basvuranKisi: z.object({
        ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
        soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
        tcKimlikNo: tcKimlikSchema,
        telefon: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
        adres: z.string().min(10, 'Adres en az 10 karakter olmalıdır')
    }),
    yardimTuru: z.enum(['ayni', 'nakdi', 'egitim', 'saglik', 'kira', 'fatura']),
    talepEdilenTutar: z.number()
        .positive('Tutar pozitif olmalıdır')
        .optional(),
    gerekce: z.string()
        .min(20, 'Gerekçe en az 20 karakter olmalıdır')
        .max(1000, 'Gerekçe en fazla 1000 karakter olabilir')
})

export type SocialAidApplicationFormData = z.infer<typeof socialAidApplicationSchema>

// Login form schema
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'E-posta adresi gereklidir')
        .email('Geçerli bir e-posta adresi giriniz'),
    password: z.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır'),
    rememberMe: z.boolean().optional()
})

export type LoginFormData = z.infer<typeof loginSchema>

// Kumbara form schema
export const kumbaraSchema = z.object({
    kod: z.string()
        .min(3, 'Kumbara kodu en az 3 karakter olmalıdır'),
    konum: z.string()
        .min(5, 'Konum en az 5 karakter olmalıdır'),
    sorumluId: z.string()
        .min(1, 'Sorumlu seçiniz'),
    notlar: z.string()
        .max(500, 'Notlar en fazla 500 karakter olabilir')
        .optional()
})

export type KumbaraFormData = z.infer<typeof kumbaraSchema>

// Payment approval schema
export const paymentApprovalSchema = z.object({
    tutar: z.number()
        .positive('Tutar pozitif olmalıdır'),
    odemeYontemi: z.enum(['nakit', 'havale', 'kredi-karti', 'mobil-odeme']),
    aciklama: z.string().optional()
})

export type PaymentApprovalFormData = z.infer<typeof paymentApprovalSchema>

// Settings schemas
export const generalSettingsSchema = z.object({
    dernekAdi: z.string().min(3, 'Dernek adı en az 3 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    telefon: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
    adres: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    aidatTutari: z.number().positive('Aidat tutarı pozitif olmalıdır')
})

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

// Basic beneficiary schema for quick registration
export const basicBeneficiarySchema = z.object({
    tcKimlikNo: tcKimlikSchema,
    ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    telefon: phoneSchema
})

export type BasicBeneficiaryFormData = z.infer<typeof basicBeneficiarySchema>

// Detailed beneficiary schema for full profile management
export const beneficiarySchema = z.object({
    // Temel Bilgiler
    ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    uyruk: z.string().min(1, 'Uyruk seçiniz'),
    tcKimlikNo: z.string().optional(),
    yabanciKimlikNo: z.string().optional(),
    kategori: z.enum(['yetiskin', 'cocuk', 'yetim', 'saglik', 'egitim', 'engelli']),
    fonBolgesi: z.string().optional(),
    dosyaBaglantisi: z.string().optional(),
    mernisDogrulama: z.boolean().optional(),

    // İletişim Bilgileri
    cepTelefonu: z.string().optional(),
    cepTelefonuOperator: z.string().optional(),
    sabitTelefon: z.string().optional(),
    yurtdisiTelefon: z.string().optional(),
    email: emailSchema,

    // Adres Bilgileri
    ulke: z.string().min(1, 'Ülke seçiniz'),
    sehir: z.string().min(1, 'Şehir seçiniz'),
    ilce: z.string().optional(),
    mahalle: z.string().optional(),
    adres: z.string().optional(),

    // Kimlik Bilgileri
    kimlikBilgileri: z.object({
        babaAdi: z.string().optional(),
        anneAdi: z.string().optional(),
        belgeTuru: z.string().optional(),
        belgeGecerlilikTarihi: z.date().optional(),
        seriNumarasi: z.string().optional(),
        oncekiUyruk: z.string().optional(),
        oncekiIsim: z.string().optional()
    }).optional(),

    // Pasaport ve Vize Bilgileri
    pasaportVizeBilgileri: z.object({
        pasaportTuru: z.string().optional(),
        pasaportNumarasi: z.string().optional(),
        pasaportGecerlilikTarihi: z.date().optional(),
        vizeGirisTuru: z.string().optional(),
        vizeBitisTarihi: z.date().optional()
    }).optional(),

    // Sağlık Bilgileri
    saglikBilgileri: z.object({
        kanGrubu: z.string().optional(),
        kronikHastalik: z.string().optional(),
        engelDurumu: z.string().optional(),
        engelOrani: z.number().min(0).max(100).optional(),
        surekliIlac: z.string().optional()
    }).optional(),

    // Ekonomik Durum
    ekonomikDurum: z.object({
        egitimDurumu: z.string().optional(),
        meslek: z.string().optional(),
        calismaDurumu: z.string().optional(),
        aylikGelir: z.number().min(0).optional(),
        konutDurumu: z.string().optional(),
        kiraTutari: z.number().min(0).optional()
    }).optional(),

    // Aile ve Hane Bilgileri
    aileHaneBilgileri: z.object({
        medeniHal: z.string().optional(),
        esAdi: z.string().optional(),
        esTelefon: z.string().optional(),
        ailedekiKisiSayisi: z.number().min(1).optional(),
        cocukSayisi: z.number().min(0).optional(),
        yetimSayisi: z.number().min(0).optional(),
        calısanSayisi: z.number().min(0).optional(),
        bakmaklaYukumluSayisi: z.number().min(0).optional()
    }).optional(),

    // Sponsorluk ve Durum
    sponsorlukTipi: z.enum(['bireysel', 'kurumsal', 'yok']).optional(),
    durum: z.enum(['aktif', 'pasif', 'arsiv']).default('aktif'),
    rizaBeyaniDurumu: z.enum(['onaylandi', 'beklemede', 'reddedildi']).optional(),

    // Notlar
    notlar: z.string().max(2000, 'Notlar en fazla 2000 karakter olabilir').optional()
})

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>
