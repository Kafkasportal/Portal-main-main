# 📊 Data Model

KafkasDer Yönetim Paneli veri modelleri ve ilişkileri.

## Entity Relationships

```
┌──────────────────┐
│   Uye (Members)  │
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│   Bagis (Donations)│
└──────────────────┘

┌──────────────────────┐
│ IhtiyacSahibi        │
│ (Beneficiaries)     │
└──────────┬───────────┘
           │ 1:N
           ▼
┌──────────────────────┐
│ SosyalYardimBasvuru  │
│ (Applications)       │
└──────────┬───────────┘
           │ 1:1
           ▼
┌──────────────────────┐
│ OdemeBilgileri       │
│ (Payment Info)       │
└──────────────────────┘

┌──────────────────┐
│ Kumbara          │
│ (Collection Box) │
└──────────────────┘
```

## Core Entities

### 1. IhtiyacSahibi (Beneficiary)

**Table:** `beneficiaries`

```typescript
interface IhtiyacSahibi {
  id: string
  tur: 'ihtiyac-sahibi-kisi' | 'bakmakla-yukumlu'
  kategori: 'yetim-ailesi' | 'multeci-aile' | 'ihtiyac-sahibi-aile' |
            'ogrenci-yabanci' | 'ogrenci-tc' | 'vakif-dernek' |
            'devlet-okulu' | 'kamu-kurumu' | 'ozel-egitim-kurumu'
  ad: string
  soyad: string
  uyruk: string
  dogumTarihi?: Date
  cinsiyet?: 'erkek' | 'kadin'
  tcKimlikNo?: string
  yabanciKimlikNo?: string
  dosyaNo: string
  fonBolgesi?: 'avrupa' | 'serbest'
  dosyaBaglantisi?: 'partner-kurum' | 'calisma-sahasi'
  cepTelefonu?: string
  cepTelefonuOperator?: string
  sabitTelefon?: string
  yurtdisiTelefon?: string
  email?: string
  ulke: string
  sehir: string
  ilce?: string
  mahalle?: string
  adres?: string
  kimlikBilgileri?: KimlikBilgileri
  pasaportVizeBilgileri?: PasaportVizeBilgileri
  gocIkametBilgileri?: GocIkametBilgileri
  saglikBilgileri?: SaglikBilgileri
  ekonomikDurum?: EkonomikSosyalDurum
  aileHaneBilgileri?: AileHaneBilgileri
  sponsorlukTipi?: 'bireysel' | 'kurumsal' | 'yok'
  durum: 'taslak' | 'aktif' | 'pasif' | 'tamamlandi'
  rizaBeyaniDurumu: 'alinmadi' | 'alindi' | 'reddetti'
  kayitTarihi: Date
  sonAtamaTarihi?: Date
  basvuruSayisi: number
  yardimSayisi: number
  toplamYardimTutari: number
  sonYardimTarihi?: Date
  baglantiliKayitlar?: BaglantiliKayitlar
  fotografUrl?: string
  notlar?: string
  mernisDogrulama?: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2. SosyalYardimBasvuru (Application)

**Table:** `social_aid_applications`

```typescript
interface SosyalYardimBasvuru {
  id: string
  basvuranKisi: BasvuranKisi
  yardimTuru: 'nakdi' | 'ayni' | 'egitim' | 'saglik' | 'kira' | 'fatura'
  talepEdilenTutar?: number
  gerekce: string
  belgeler: BasvuruBelge[]
  durum: 'beklemede' | 'inceleniyor' | 'onaylandi' | 'reddedildi' | 'odendi'
  degerlendiren?: User
  degerlendirmeTarihi?: Date
  degerlendirmeNotu?: string
  odemeBilgileri?: OdemeBilgileri
  createdAt: Date
  updatedAt: Date
}
```

### 3. Uye (Member)

**Table:** `members`

```typescript
interface Uye {
  id: string
  tcKimlikNo: string
  ad: string
  soyad: string
  dogumTarihi: Date
  cinsiyet: 'erkek' | 'kadin'
  telefon: string
  email?: string
  adres: UyeAdres
  uyeTuru: 'aktif' | 'onursal' | 'genc' | 'destekci'
  uyeNo: string
  kayitTarihi: Date
  aidatDurumu: 'guncel' | 'gecmis' | 'muaf'
  aidat: {
    tutar: number
    sonOdemeTarihi?: Date
  }
  createdAt: Date
  updatedAt: Date
}
```

### 4. Bagis (Donation)

**Table:** `donations`

```typescript
interface Bagis {
  id: string
  bagisci: Bagisci
  tutar: number
  currency: 'TRY' | 'USD' | 'EUR'
  amac: 'genel' | 'egitim' | 'saglik' | 'insani-yardim' | 'kurban' | 'fitre-zekat'
  odemeYontemi: 'nakit' | 'havale' | 'kredi-karti' | 'mobil-odeme'
  durum: 'beklemede' | 'tamamlandi' | 'iptal' | 'iade'
  makbuzNo?: string
  aciklama?: string
  fatura?: {
    url: string
    uploadedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}
```

### 5. Kumbara (Collection Box)

**Table:** `kumbaras`

```typescript
interface Kumbara {
  id: string
  kod: string
  ad: string
  konum: string
  koordinat?: GpsKoordinat
  qrKod?: KumbaraQR
  sorumlu: User
  sonBosaltma?: Date
  toplamTutar: number
  toplamaGecmisi: KumbaraToplama[]
  durum: 'aktif' | 'pasif' | 'bakim'
  notlar?: string
  fotograf?: string
  createdAt: Date
  updatedAt: Date
}
```

## Supporting Types

### BasvuranKisi
```typescript
interface BasvuranKisi {
  ad: string
  soyad: string
  tcKimlikNo: string
  telefon: string
  adres: string
}
```

### OdemeBilgileri
```typescript
interface OdemeBilgileri {
  tutar: number
  odemeTarihi: Date
  makbuzNo: string
  odemeYontemi: 'nakit' | 'havale' | 'kredi-karti' | 'mobil-odeme'
  iban?: string
  bankaAdi?: string
  durum?: string
}
```

### BasvuruBelge
```typescript
interface BasvuruBelge {
  url: string
  tur: string
  uploadedAt: Date
}
```

### KimlikBilgileri
```typescript
interface KimlikBilgileri {
  babaAdi?: string
  anneAdi?: string
  belgeTuru: 'yok' | 'nufus-cuzdani' | 'tc-kimlik-belgesi' |
             'gecici-ikamet-belgesi' | 'yabanci-kimlik-belgesi'
  belgeGecerlilikTarihi?: Date
  seriNumarasi?: string
  oncekiUyruk?: string
  oncekiIsim?: string
}
```

### AileHaneBilgileri
```typescript
interface AileHaneBilgileri {
  medeniHal: 'bekar' | 'evli' | 'dul' | 'bosanmis'
  esAdi?: string
  esTelefon?: string
  ailedekiKisiSayisi: number
  cocukSayisi: number
  yetimSayisi: number
  calısanSayisi: number
  bakmaklaYukumluSayisi: number
}
```

### EkonomikSosyalDurum
```typescript
interface EkonomikSosyalDurum {
  egitimDurumu?: 'okur-yazar-degil' | 'ilkokul' | 'ortaokul' | 'lise' |
                  'universite' | 'yuksek-lisans' | 'doktora'
  meslek?: string
  calismaDurumu?: string
  aylikGelir?: number
  gelirKaynagi?: string
  konutDurumu?: 'kira' | 'ev-sahibi' | 'misafir' | 'barinma-merkezi'
  kiraTutari?: number
  borcDurumu?: string
  borcTutari?: number
}
```

## Enums

### YardimTuru
```typescript
type YardimTuru =
  | 'nakdi'      // Cash aid
  | 'ayni'       // In-kind aid
  | 'egitim'     // Education support
  | 'saglik'     // Health support
  | 'kira'       // Rent assistance
  | 'fatura'     // Bill payment
```

### BasvuruDurumu
```typescript
type BasvuruDurumu =
  | 'beklemede'      // Pending
  | 'inceleniyor'    // Under review
  | 'onaylandi'      // Approved
  | 'reddedildi'     // Rejected
  | 'odendi'         // Paid
```

### IhtiyacDurumu
```typescript
type IhtiyacDurumu =
  | 'taslak'        // Draft
  | 'aktif'         // Active
  | 'pasif'         // Inactive
  | 'tamamlandi'    // Completed
```

### IhtiyacSahibiKategori
```typescript
type IhtiyacSahibiKategori =
  | 'yetim-ailesi'
  | 'multeci-aile'
  | 'ihtiyac-sahibi-aile'
  | 'ogrenci-yabanci'
  | 'ogrenci-tc'
  | 'vakif-dernek'
  | 'devlet-okulu'
  | 'kamu-kurumu'
  | 'ozel-egitim-kurumu'
```

## Database Schema

### Main Tables

| Table | Purpose | Primary Key |
|-------|---------|-------------|
| `beneficiaries` | İhtiyaç sahipleri | `id` |
| `social_aid_applications` | Yardım başvuruları | `id` |
| `members` | Dernek üyeleri | `id` |
| `donations` | Bağışlar | `id` |
| `kumbaras` | Kumbaralar | `id` |

### Relationships

| From | To | Type | Foreign Key |
|------|-----|------|-------------|
| `beneficiaries` | `social_aid_applications` | 1:N | `beneficiary_id` |
| `members` | `donations` | 1:N | `member_id` |
| `social_aid_applications` | `odeme_bilgileri` | 1:1 | `application_id` |

## Indexes

```sql
-- Beneficiaries
CREATE INDEX idx_beneficiaries_dosya_no ON beneficiaries(dosya_no);
CREATE INDEX idx_beneficiaries_durum ON beneficiaries(durum);
CREATE INDEX idx_beneficiaries_kategori ON beneficiaries(kategori);

-- Applications
CREATE INDEX idx_applications_durum ON social_aid_applications(durum);
CREATE INDEX idx_applications_yardim_turu ON social_aid_applications(yardim_turu);
CREATE INDEX idx_applications_beneficiary_id ON social_aid_applications(beneficiary_id);

-- Members
CREATE INDEX idx_members_tc_kimlik_no ON members(tc_kimlik_no);
CREATE INDEX idx_members_uye_turu ON members(uye_turu);

-- Donations
CREATE INDEX idx_donations_tarih ON donations(tarih);
CREATE INDEX idx_donations_amac ON donations(amac);
```

## Data Validation

### Required Fields

**IhtiyacSahibi:**
- `ad`, `soyad`, `uyruk`, `dosyaNo`, `durum`

**SosyalYardimBasvuru:**
- `basvuranKisi`, `yardimTuru`, `gerekce`, `durum`

**Uye:**
- `tcKimlikNo`, `ad`, `soyad`, `dogumTarihi`, `cinsiyet`, `telefon`

**Bagis:**
- `bagisci`, `tutar`, `currency`, `amac`, `odemeYontemi`, `durum`

### Constraints

- `tcKimlikNo`: 11 haneli, benzersiz
- `telefon`: Türkiye formatı (5XX XXX XX XX)
- `tutar`: Pozitif sayı
- `email`: Geçerli e-posta formatı

## Related Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [WORKFLOW.md](./WORKFLOW.md) - Business workflows
- [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Database setup
