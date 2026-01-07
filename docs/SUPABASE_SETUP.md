# Supabase Kurulum Rehberi

Bu rehber Portal projesinde Supabase veritabanı kurulumunu açıklar.

## 1. Supabase Hesabı ve Proje Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" ile giriş yapın (GitHub ile önerilir)
3. "New project" butonuna tıklayın
4. Proje ayarları:
   - **Name**: `kafkasder-portal`
   - **Database Password**: Güçlü bir şifre oluşturun (saklayın!)
   - **Region**: `Frankfurt (eu-central-1)` veya `Amsterdam`
5. "Create new project" ile projeyi oluşturun

## 2. API Anahtarlarını Alma

Proje oluşturulduktan sonra:

1. **Settings** → **API** bölümüne gidin
2. Aşağıdaki değerleri kopyalayın:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Ortam Değişkenlerini Ayarlama

`.env.local` dosyası oluşturun:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js public keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Veritabanı Şemasını Oluşturma

### Seçenek A: SQL Editor (Önerilen)

1. Supabase Dashboard → **SQL Editor**
2. "New query" butonuna tıklayın
3. `supabase/schema.sql` dosyasının içeriğini yapıştırın
4. "Run" butonuna tıklayın

### Seçenek B: Supabase CLI

```bash
# Supabase CLI yükle
npm install -g supabase

# Login
supabase login

# Projeye bağlan
supabase link --project-ref your-project-id

# Şemayı uygula
supabase db push
```

## 5. Authentication Ayarları

1. **Authentication** → **Settings** bölümüne gidin
2. **Email** provider'ı aktifleştirin
3. **Site URL**: `http://localhost:3000`
4. **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `https://your-domain.com/**`

## 6. Row Level Security (RLS)

Şema dosyasında RLS politikaları tanımlı. Ek güvenlik için:

1. **Table Editor** → İlgili tablo
2. **RLS** sekmesinde politikaları kontrol edin
3. Gerekirse özelleştirin

## 7. Storage (Dosya Yükleme)

Belge/fotoğraf yüklemesi için:

1. **Storage** → "New bucket"
2. Bucket adı: `documents`
3. Public: Hayır (private)
4. RLS politikası ekleyin

## Dosya Yapısı

```
src/lib/supabase/
├── client.ts     # Browser-side client
├── server.ts     # Server-side client (API routes)
├── middleware.ts # Auth middleware
└── index.ts      # Exports

src/lib/
└── supabase-service.ts # CRUD operations

src/types/
└── supabase.ts   # Database types

supabase/
└── schema.sql    # Database schema
```

## Kullanım Örnekleri

### Client-side (React Component)

```tsx
import { getSupabaseClient } from '@/lib/supabase'

function MyComponent() {
  const supabase = getSupabaseClient()
  
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
    
    if (error) console.error(error)
    return data
  }
}
```

### Server-side (Server Action)

```tsx
import { createClient } from '@/lib/supabase/server'

async function getMembers() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('members')
    .select('*')
    
  return data
}
```

### Service Functions

```tsx
import { fetchMembers, createMember } from '@/lib/supabase-service'

// Fetch with pagination
const { data, count } = await fetchMembers({ page: 1, limit: 10 })

// Create new member
const newMember = await createMember({
  tc_kimlik_no: '12345678901',
  ad: 'Ali',
  soyad: 'Yılmaz',
  telefon: '05321234567',
  cinsiyet: 'erkek'
})
```

## Troubleshooting

### "Invalid API key" hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Sunucuyu yeniden başlatın

### RLS politikası hatası
- Kullanıcının oturum açtığından emin olun
- Table Editor'da RLS politikalarını kontrol edin

### CORS hatası
- Supabase Dashboard → Settings → API → CORS
- `localhost:3000` ekleyin

## Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
