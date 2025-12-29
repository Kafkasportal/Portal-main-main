# KafkasDer Panel - Proje Bilgileri

Bu proje **KafkasDer (Kafkas Göçmenleri Derneği)** için geliştirilmiş modern bir yönetim panelidir.

## Teknoloji Yığını

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Kütüphanesi**: React 19
- **Stil**: Tailwind CSS
- **UI Bileşenleri**: shadcn/ui (Radix UI tabanlı)
- **İkonlar**: Lucide React, Heroicons
- **Animasyonlar**: Framer Motion

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### State Management & Data Fetching
- **State**: Zustand
- **Server State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Diğer Araçlar
- **Error Tracking**: Sentry
- **QR Code**: react-qr-code, @zxing/library
- **Excel Export**: ExcelJS
- **Charts**: Recharts
- **Offline Storage**: IndexedDB (idb)

## Proje Yapısı

```
Portal-main-main/
├── src/
│   ├── app/              # Next.js App Router sayfaları
│   │   ├── (auth)/       # Auth layout grubu
│   │   ├── (dashboard)/  # Dashboard layout grubu
│   │   └── api/          # API routes
│   ├── components/
│   │   ├── ui/           # shadcn/ui bileşenleri
│   │   ├── shared/       # Paylaşılan bileşenler
│   │   └── [feature]/    # Özellik bazlı bileşenler
│   ├── lib/              # Yardımcı fonksiyonlar ve servisler
│   │   ├── supabase-service.ts  # Supabase işlemleri
│   │   ├── error-logger.ts      # Hata loglama
│   │   └── utils.ts             # Genel yardımcılar
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type tanımları
│   └── store/            # Zustand store'ları
├── public/               # Statik dosyalar
├── docs/                 # Proje dokümantasyonu
└── scripts/              # Build ve deployment scriptleri
```

## Stil ve Tasarım Prensipleri

### Tailwind CSS Kullanımı
- Utility-first yaklaşım
- Responsive design (mobile-first)
- Dark mode desteği (next-themes)
- Custom tema renkleri

### shadcn/ui Bileşenleri
- Proje `/components/ui/` dizininde
- Radix UI primitives kullanır
- Tam özelleştirilebilir
- Accessibility odaklı

### Bileşen Standartları
- TypeScript kullanımı zorunlu
- Props için interface tanımları
- JSDoc yorumları (Türkçe)
- 'use client' directive gerektiğinde

## Kod Standartları

### Dosya İsimlendirme
- Components: PascalCase (örn: `UserCard.tsx`)
- Utilities: kebab-case (örn: `format-date.ts`)
- Hooks: camelCase (örn: `useAuth.ts`)

### Import Sırası
1. React ve Next.js imports
2. External libraries
3. Internal components
4. Types
5. Styles

### Örnek Component Yapısı
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types'

interface UserCardProps {
  user: User
  onUpdate?: (user: User) => void
}

export function UserCard({ user, onUpdate }: UserCardProps) {
  // Component implementation
}
```

## Supabase Kullanımı

### Client Oluşturma
- Server components: `createClient()` from `@/lib/supabase/server`
- Client components: `createClient()` from `@/lib/supabase/client`

### Servis Katmanı
- Tüm Supabase işlemleri `src/lib/supabase-service.ts` içinde
- Type-safe fonksiyonlar
- Error handling dahili

### Örnek Kullanım
```typescript
import { fetchMembers, createMember } from '@/lib/supabase-service'

// Üye listesi çek
const members = await fetchMembers()

// Yeni üye oluştur
const newMember = await createMember(memberData)
```

## Test ve Kalite

### Mevcut Scriptler
- `npm run lint` - ESLint kontrolü
- `npm run format` - Prettier formatla
- `npm run type-check` - TypeScript kontrolü
- `npm test` - Jest testleri
- `npm run test:e2e` - Playwright E2E testleri

### Pre-commit Hooks
- Husky + lint-staged
- Otomatik linting ve formatting
- TypeScript hata kontrolü

## Deployment

### Environment Variables
Gerekli ortam değişkenleri:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_DSN` (opsiyonel)

### Build
```bash
npm run build
npm start
```

## Önemli Notlar

1. **Client vs Server Components**:
   - Varsayılan olarak Server Components
   - İnteraktif özellikler için 'use client' kullan

2. **Error Handling**:
   - ErrorBoundary bileşeni mevcut
   - errorLogger servisi kullan
   - Sentry entegrasyonu hazır

3. **Türkçe Destek**:
   - UI metinleri Türkçe
   - Kod yorumları Türkçe
   - Değişken isimleri İngilizce

4. **Güvenlik**:
   - RLS (Row Level Security) Supabase'de aktif
   - CSRF koruması var
   - Input validasyonu (Zod)

## Yardımcı Linkler

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
