# Portal Projesi - Detaylı Mimari Analizi

## 📊 Proje Özeti
- **Teknoloji**: Next.js 16 + React 19, TypeScript, Tailwind CSS
- **UI**: Radix UI + shadcn/ui
- **State**: Zustand (global) + TanStack Query (server)
- **Form**: React Hook Form + Zod
- **Dil**: Türkçe arayüz

---

## 🗂️ Tip Sistemi (src/types/index.ts)

### Ana Interface'ler
| Interface | Alan Sayısı | Açıklama |
|-----------|-------------|----------|
| `IhtiyacSahibi` | 40+ | İhtiyaç sahibi tam modeli |
| `IhtiyacSahibiListItem` | 20 | Liste görünümü için özet |
| `Kumbara` | 13 | Bağış kumbarası |
| `Bagis` | 10 | Bağış kaydı |
| `Uye` | 14 | Dernek üyesi |
| `SosyalYardimBasvuru` | 12 | Yardım başvurusu |
| `User` | 10 | Sistem kullanıcısı |

### Alt Interface'ler
- `AileHaneBilgileri` - Aile/hane bilgileri
- `EkonomikSosyalDurum` - Ekonomik durum
- `SaglikBilgileri` - Sağlık bilgileri
- `KimlikBilgileri` - Kimlik belge bilgileri
- `GocIkametBilgileri` - Göç/ikamet
- `PasaportVizeBilgileri` - Pasaport/vize
- `BaglantiliKayitlar` - İlişkili kayıtlar

### Enum-like Types
- `BasvuruDurumu`, `IhtiyacDurumu`, `KumbaraStatus`
- `PaymentMethod`, `PaymentStatus`, `DonationPurpose`
- `UserRole`, `Permission`, `UyeTuru`, `AidatDurumu`
- `Cinsiyet`, `MedeniHal`, `EgitimDurumu`

---

## 🔧 Utility Functions (src/lib/utils.ts)

| Fonksiyon | Açıklama |
|-----------|----------|
| `cn()` | Tailwind class birleştirme |
| `formatCurrency()` | Para formatı (TRY, EUR, USD) |
| `formatDate()` | Tarih formatı |
| `formatRelativeTime()` | Göreli zaman |
| `formatPhoneNumber()` | Telefon formatı |
| `getInitials()` | İsimden baş harfler |
| `generateId()` | UUID üretimi |
| `truncate()` | Metin kısaltma |

---

## 📝 Validators (src/lib/validators.ts)

### Form Şemaları (Zod)
| Şema | Alanlar |
|------|---------|
| `loginSchema` | email, password, rememberMe |
| `memberSchema` | ad, soyad, tcKimlikNo, email, telefon, cinsiyet, dogumTarihi, adres, uyeTuru |
| `donationSchema` | bagisci, tutar, currency, amac, odemeYontemi, makbuzNo, aciklama |
| `beneficiarySchema` | 28+ alan (tam ihtiyaç sahibi) |
| `basicBeneficiarySchema` | ad, soyad, tcKimlikNo, telefon |
| `kumbaraSchema` | kod, konum, notlar, sorumluId |
| `socialAidApplicationSchema` | basvuranKisi, yardimTuru, talepEdilenTutar, gerekce |
| `generalSettingsSchema` | dernekAdi, email, telefon, adres, aidatTutari |

---

## 📦 Constants (src/lib/constants.ts)

### Label Mappings
- `STATUS_LABELS`, `STATUS_VARIANTS`
- `BASVURU_DURUMU_LABELS`, `IHTIYAC_DURUMU_LABELS`
- `DONATION_PURPOSE_LABELS`, `PAYMENT_METHOD_LABELS`
- `MEMBER_TYPE_LABELS`, `AID_TYPE_LABELS`
- `IHTIYAC_SAHIBI_KATEGORI_LABELS`, `IHTIYAC_SAHIBI_TURU_LABELS`
- `MEDENI_HAL_LABELS`, `EGITIM_DURUMU_LABELS`
- `KIMLIK_BELGESI_TURU_LABELS`, `PASAPORT_TURU_LABELS`
- `VIZE_GIRIS_TURU_LABELS`, `RIZA_BEYANI_LABELS`
- `FON_BOLGESI_LABELS`, `DOSYA_BAGLANTISI_LABELS`

### Veri Listeleri
- `NAV_ITEMS` - Navigasyon menüsü
- `TURKISH_CITIES` - Türkiye şehirleri
- `ISTANBUL_REGIONS` - İstanbul ilçeleri
- `COUNTRIES` - Ülke listesi
- `TELEFON_OPERATOR_KODLARI` - Operatör kodları
- `PAGE_SIZE_OPTIONS`, `DEFAULT_PAGE_SIZE`

---

## 🗄️ State Management

### Zustand Stores
**UserStore** (`src/stores/user-store.ts`)
- `user`, `isAuthenticated`, `isLoading`
- `login()`, `logout()`, `updateUser()`

**SidebarStore** (`src/stores/sidebar-store.ts`)
- `isCollapsed`, `isOpen`, `isMobile`, `openMenus`
- `toggle()`, `setCollapsed()`, `setOpen()`, `toggleMenu()`, `closeAllMenus()`

---

## 🪝 Custom Hooks (src/hooks/)

| Hook | Açıklama |
|------|----------|
| `useDebounce` | Değer geciktirme |
| `useMediaQuery` | CSS media query |
| `useBreakpoint` | Tailwind breakpoint kontrolü |
| `useCurrentBreakpoint` | Aktif breakpoint |
| `useIsMobile` | Mobil cihaz kontrolü |

---

## 🎨 Shared Components

### PageHeader
```tsx
interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode  // TEKİL!
    className?: string
}
```

### StatCard
```tsx
interface StatCardProps {
    label: string
    value: string | number
    icon?: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    trendLabel?: string
    variant?: 'default' | 'success' | 'warning' | 'danger'
    className?: string
}
```

### EmptyState
```tsx
interface EmptyStateProps {
    title: string
    description?: string
    action?: ReactNode
    variant?: 'default' | 'search' | 'no-data' | 'error'
    className?: string
}
```

### DataTable
```tsx
interface DataTableProps<T> {
    columns: ColumnDef<T>[]
    data: T[]
    isLoading?: boolean
    pageCount?: number
    searchColumn?: string
    searchPlaceholder?: string
    filters?: FilterConfig[]
    onRowClick?: (row: T) => void
    onExport?: () => void
}
```

---

## 📄 Sayfa Bileşenleri

| Sayfa | Ana Fonksiyon | Özellikler |
|-------|---------------|------------|
| `DashboardPage` | Dashboard | StatCard'lar, grafikler, son bağışlar |
| `LoginPage` | Giriş | Form validation, hata gösterimi |
| `KumbaraPage` | Kumbara yönetimi | Grid görünüm, QR tarama, toplama dialog |
| `BeneficiariesPage` | İhtiyaç sahipleri | Filtreleme, sayfalama, detay görünüm |
| `DonationsListPage` | Bağış listesi | DataTable, export, yeni bağış sheet |

---

## 🧩 Feature Components

### Kumbara Modülü
- `KumbaraToplamaDialog` - Toplama kaydı
- `YeniKumbaraDialog` - Yeni kumbara ekleme, QR kod
- `QRScannerDialog` - QR kod tarama
- `RotaOlusturDialog` - Rota planlama

### Members Modülü
- `MemberForm` - Üye formu (18 alan)

### Donations Modülü
- `DonationForm` - Bağış formu (16 alan)
- `columns.tsx` - Tablo kolonları

### Social Aid Modülü
- `NewBeneficiaryDialog` - Yeni ihtiyaç sahibi
- `QuickRegisterDialog` - Hızlı kayıt
- `columns.tsx`, `payment-columns.tsx` - Tablo kolonları

---

## 🔗 Mock Service API

### CRUD Fonksiyonları
| Fonksiyon | Açıklama |
|-----------|----------|
| `fetchMembers()`, `fetchMember()`, `createMember()` | Üye işlemleri |
| `fetchDonations()`, `fetchDonation()`, `createDonation()` | Bağış işlemleri |
| `fetchBeneficiaries()`, `fetchBeneficiaryById()`, `createBeneficiary()`, `updateBeneficiary()` | İhtiyaç sahibi |
| `fetchApplications()`, `fetchApplicationById()`, `updateApplicationStatus()` | Başvuru işlemleri |
| `fetchKumbaras()`, `fetchKumbaraByCode()`, `createKumbara()`, `collectKumbara()` | Kumbara işlemleri |
| `fetchPayments()` | Ödeme listesi |
| `fetchDashboardStats()` | Dashboard istatistikleri |

---

## 🔐 Middleware

**Route Protection:**
- `publicRoutes`: ['/giris']
- `protectedRoutes`: ['/genel', '/uyeler', '/bagis', '/sosyal-yardim', ...]
- Cookie-based auth check

---

## 🚀 Performance Optimizations (Aralık 2025)

### Lazy Loading
- `CommandPalette` - React.lazy ile yükleniyor
- `ProgressBar` - dynamic import (ssr: false)
- Grafik componentleri lazy load

### React.memo
- `StatCard` - gereksiz re-render önleme

### Next.js Config
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', '@radix-ui/react-icons']
}
```

---

## ⌨️ Command Palette (Ctrl+K)

**Dosya:** `src/components/shared/command-palette.tsx`

**Özellikler:**
- Tüm sayfalarda hızlı geçiş
- Son ziyaret edilen sayfalar (localStorage)
- Fuzzy search
- Klavye navigasyonu

**Kullanım:**
- `Ctrl+K` veya `⌘+K` ile aç
- Arrow keys ile gezin
- Enter ile seç
- Escape ile kapat

---

## 🎨 Yeni UI Components (shadcn/ui)

| Component | Dosya | Açıklama |
|-----------|-------|----------|
| `Command` | `ui/command.tsx` | cmdk tabanlı command palette |
| `Spinner` | `ui/spinner.tsx` | Loading spinner |
| `Field` | `ui/field.tsx` | Form field wrapper |
| `Empty` | `ui/empty.tsx` | Boş durum gösterimi |
| `Tooltip` | `ui/tooltip.tsx` | Tooltip component |
| `ButtonGroup` | `ui/button-group.tsx` | Buton grupları |
| `InputGroup` | `ui/input-group.tsx` | Input grupları |
| `Item` | `ui/item.tsx` | Liste öğesi |

### Button Loading Prop
```tsx
<Button loading={isSubmitting}>Kaydet</Button>
```

---

## 🪝 Yeni Hooks

| Hook | Dosya | Açıklama |
|------|-------|----------|
| `useApi` | `hooks/use-api.ts` | API çağrıları için hook |

---

## 🔗 API Altyapısı

### API Client (`src/lib/api-client.ts`)
- Axios tabanlı HTTP client
- Interceptors (auth, error handling)
- Base URL configuration

### API Service (`src/lib/api-service.ts`)
- Typed API fonksiyonları
- CRUD işlemleri

---

## 🗃️ Database

### Supabase (Önerilen)
**Dosyalar:**
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client  
- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/lib/supabase-service.ts` - CRUD operations
- `src/types/supabase.ts` - Database types
- `supabase/schema.sql` - SQL schema
- `docs/SUPABASE_SETUP.md` - Kurulum rehberi

**Tablolar:**
- users, members, donations, beneficiaries
- kumbaras, social_aid_applications, payments
- audit_logs

**Özellikler:**
- Row Level Security (RLS)
- Real-time subscriptions
- Auth entegrasyonu
- Storage (dosya yükleme)

### Prisma (Alternatif)
**Schema:** `prisma/schema.prisma`

---

## 📁 Dosya Sayıları (Güncel)

| Kategori | Sayı |
|----------|------|
| Toplam TypeScript/TSX | 95+ |
| Sayfalar | 17 |
| UI Components | 29 |
| Feature Components | 10 |
| Shared Components | 10 |
| Types/Interfaces | 50+ |
| Zod Schemas | 12 |
