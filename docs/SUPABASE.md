# 🔐 Supabase Kurulum ve Yapılandırma

Bu rehber Portal projesinde Supabase veritabanı kurulumunu ve Render.com entegrasyonunu açıklar.

## 📋 İçindekiler

1. [Supabase Hesabı ve Proje Oluşturma](#supabase-hesabı-ve-proje-oluşturma)
2. [API Anahtarlarını Alma](#api-anahtarlarını-alma)
3. [Ortam Değişkenlerini Ayarlama](#ortam-değişkenlerini-ayarlama)
4. [Veritabanı Şemasını Oluşturma](#veritabanı-şemasını-oluşturma)
5. [Authentication Ayarları](#authentication-ayarları)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Storage (Dosya Yükleme)](#storage-dosya-yükleme)
8. [Render.com Entegrasyonu](#rendercom-entegrasyonu)
9. [MCP Entegrasyonu](#mcp-entegrasyonu)

---

## 1. Supabase Hesabı ve Proje Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" ile giriş yapın (GitHub ile önerilir)
3. "New project" butonuna tıklayın
4. Proje ayarları:
   - **Name**: `kafkasder-portal`
   - **Database Password**: Güçlü bir şifre oluşturun (saklayın!)
   - **Region**: `Frankfurt (eu-central-1)` veya `Amsterdam`
5. "Create new project" ile projeyi oluşturun

---

## 2. API Anahtarlarını Alma

Proje oluşturulduktan sonra:

1. **Settings** → **API** bölümüne gidin
2. Aşağıdaki değerleri kopyalayın:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Mevcut Proje Bilgileri

**Proje URL:**
```
https://idsiiayyvygcgegmqcov.supabase.co
```

**Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0ODg2MywiZXhwIjoyMDgxOTI0ODYzfQ.Wv-s1d65uagiS6d0SCnfZKL3AGKQJelVWo13x5B4SZ4
```

**⚠️ Anon Key Gerekli:**
Anon key'i Supabase Dashboard'dan almanız gerekiyor:
1. [Supabase Dashboard](https://supabase.com/dashboard) → Projeniz
2. **Settings** → **API**
3. **Project API keys** bölümünden **anon/public** key'i kopyalayın

---

## 3. Ortam Değişkenlerini Ayarlama

### Local Development (`.env.local`)

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

---

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

### Migration'ları Uygulama

```bash
# Tüm migration'ları uygula
npm run db:migrate
```

---

## 5. Authentication Ayarları

1. **Authentication** → **Settings** bölümüne gidin
2. **Email** provider'ı aktifleştirin
3. **Site URL**: `http://localhost:3000`
4. **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `https://your-domain.com/**`

### Leaked Password Protection

**⚠️ Önemli:** Güvenlik için mutlaka aktifleştirin!

1. **Authentication** → **Settings** → **Password Security**
2. "Leaked Password Protection" özelliğini aktifleştirin
3. Bu özellik HaveIBeenPwned.org ile şifre kontrolü yapar

---

## 6. Row Level Security (RLS)

Şema dosyasında RLS politikaları tanımlı. Ek güvenlik için:

1. **Table Editor** → İlgili tablo
2. **RLS** sekmesinde politikaları kontrol edin
3. Gerekirse özelleştirin

**Not:** Tüm tablolarda RLS aktif ve optimize edilmiş durumda. Detaylar için [BACKEND.md](./BACKEND.md) dosyasına bakın.

---

## 7. Storage (Dosya Yükleme)

Belge/fotoğraf yüklemesi için:

1. **Storage** → "New bucket"
2. Bucket adı: `documents`
3. Public: Hayır (private)
4. RLS politikası ekleyin

---

## 8. Render.com Entegrasyonu

### Adım 1: Render Dashboard'a Git

1. [Render Dashboard](https://dashboard.render.com) → Servisiniz (`kafkasder-panel`)
2. **Environment** sekmesine tıklayın

### Adım 2: Environment Variables Ekle

Aşağıdaki environment variable'ları ekleyin:

#### 1. Supabase URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://idsiiayyvygcgegmqcov.supabase.co`
- **Add** butonuna tıklayın

#### 2. Supabase Anon Key
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (Supabase Dashboard'dan anon key'i yapıştırın)
- **Add** butonuna tıklayın

#### 3. Supabase Service Role Key
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0ODg2MywiZXhwIjoyMDgxOTI0ODYzfQ.Wv-s1d65uagiS6d0SCnfZKL3AGKQJelVWo13x5B4SZ4`
- **Add** butonuna tıklayın

#### 4. Application URL (Production için)
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://kafkasder-panel.onrender.com` (veya custom domain'iniz)
- **Add** butonuna tıklayın

### Adım 3: Deploy

Environment variable'ları ekledikten sonra:
1. **Save Changes** butonuna tıklayın
2. **Manual Deploy** → **Deploy latest commit** ile yeniden deploy edin

### Doğrulama

Deploy tamamlandıktan sonra:
1. **Logs** sekmesinden log'ları kontrol edin
2. Uygulamanın Supabase'e bağlanabildiğini test edin
3. Health check endpoint'i (`/`) çalışıyor mu kontrol edin

---

## 9. MCP Entegrasyonu

VS Code'da Supabase MCP kullanmak için:

1. `.vscode/mcp.json` dosyası zaten yapılandırılmış
2. `.env.local` dosyasında anahtarları ayarlayın
3. VS Code'u yeniden başlatın

---

## 📁 Dosya Yapısı

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
├── schema.sql    # Database schema
└── migrations/   # Migration files
```

---

## 💻 Kullanım Örnekleri

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

---

## 🔒 Güvenlik Notları

### Service Role Key Gizli Tutulmalı
- Bu key'i asla commit etmeyin
- Sadece Render Dashboard'da saklayın
- Public repository'lerde paylaşmayın

### Anon Key
- Anon key public olabilir ama yine de dikkatli olun
- RLS (Row Level Security) politikalarınızın doğru olduğundan emin olun

### Environment Variables
- Production ve staging için farklı Supabase projeleri kullanın (önerilir)
- Her environment için ayrı key'ler kullanın

---

## 🐛 Troubleshooting

### "Invalid API key" hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Sunucuyu yeniden başlatın

### RLS politikası hatası
- Kullanıcının oturum açtığından emin olun
- Table Editor'da RLS politikalarını kontrol edin

### CORS hatası
- Supabase Dashboard → Settings → API → CORS
- `localhost:3000` ekleyin

---

## 📝 Checklist

- [ ] Supabase projesi oluşturuldu
- [ ] API anahtarları alındı
- [ ] `.env.local` dosyası oluşturuldu
- [ ] Veritabanı şeması uygulandı
- [ ] Migration'lar çalıştırıldı
- [ ] Authentication ayarları yapıldı
- [ ] Leaked password protection aktifleştirildi
- [ ] RLS politikaları kontrol edildi
- [ ] Storage bucket'ları oluşturuldu
- [ ] Render.com environment variable'ları ayarlandı
- [ ] Deploy test edildi

---

## 🔗 Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

**Son Güncelleme:** 26 Aralık 2025

