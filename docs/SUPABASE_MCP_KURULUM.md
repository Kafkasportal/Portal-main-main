# 🗄️ Supabase MCP Kurulum ve Kullanım Rehberi

Bu dokümantasyon, KafkasDer Yönetim Paneli'nde Supabase MCP entegrasyonunun nasıl kurulacağını ve kullanılacağını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Supabase API Key'lerini Alma](#supabase-api-keylerini-alma)
3. [Environment Variables Ayarlama](#environment-variables-ayarlama)
4. [Supabase MCP Kullanımı](#supabase-mcp-kullanımı)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Güvenlik](#güvenlik)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

### Supabase MCP Nedir?

**Supabase MCP**, AI araçlarının (Conductor, Cursor, Claude Desktop) Supabase veritabanınızı doğal dil komutlarıyla yönetmesini sağlayan bir protokoldür.

### Özellikler

- ✅ **Database Queries**: SQL sorgularını doğal dilde çalıştırma
- ✅ **Schema Management**: Tablo yapılarını görüntüleme ve düzenleme
- ✅ **Migration Management**: Database migration'larını yönetme
- ✅ **Project Management**: Supabase projelerini yönetme
- ✅ **Real-time**: Real-time subscription'ları yönetme
- ✅ **Storage**: File storage işlemleri

### Mevcut Supabase Projesi

```
URL: https://idsiiayyvygcgegmqcov.supabase.co
Region: Unknown (likely eu-west or eu-central)
Project ID: idsiiayyvygcgegmqcov
```

---

## 🔑 Supabase API Key'lerini Alma

### Adım 1: Supabase Dashboard'a Gidin

1. **Git**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Giriş yapın** (Google veya GitHub ile)
3. **Projenizi seçin**: KafkasDer veya ilgili proje

### Adım 2: Project Settings'e Gidin

1. **Sol menü** → **Settings** (Alt kısım)
2. **API** sekmesine tıklayın

### Adım 3: API Keys'i Kopyalayın

**Project API keys** bölümünde 3 key göreceksiniz:

#### 1. Project URL
```
https://idsiiayyvygcgegmqcov.supabase.co
```
✅ **Zaten var** (.env.local'de)

#### 2. anon public (Public Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU...
```
- **Kullanım**: Client-side (browser)
- **Güvenli**: Public'te paylaşılabilir
- **İzinler**: RLS (Row Level Security) policy'lere göre sınırlı

#### 3. service_role (Secret Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTAy...
```
- **Kullanım**: Server-side only
- **GİZLİ**: ⚠️ ASLA public'te paylaşmayın!
- **İzinler**: RLS'i bypass eder, tam admin erişimi

**⚠️ ÖNEMLİ:** Service role key'i kopyaladıktan sonra **güvenli bir yerde saklayın**. Bu key'i kaybederseniz yeniden oluşturmanız gerekir.

---

## ⚙️ Environment Variables Ayarlama

### .env.local Dosyasını Güncelleyin

`.env.local` dosyasını açın ve Supabase key'lerini doldurun:

```bash
# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://idsiiayyvygcgegmqcov.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTAy...
```

### Production (Render.com)

Render.com'da da aynı key'leri ekleyin:

**Render Dashboard** → **kafkasder-panel** → **Environment**:

```
NEXT_PUBLIC_SUPABASE_URL = https://idsiiayyvygcgegmqcov.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ... (sync: false!)
```

⚠️ **Güvenlik:** `SUPABASE_SERVICE_ROLE_KEY` için `sync: false` kullanın!

---

## 🔧 Supabase MCP Kullanımı

### Conductor'da Kullanım

Conductor'da Supabase MCP otomatik olarak kullanılabilir. Doğal dil komutlarıyla veritabanınızı yönetebilirsiniz:

```
"Show me the members table schema"
"Query: SELECT COUNT(*) FROM donations WHERE created_at > '2024-01-01'"
"What are the columns in the social_aid_applications table?"
"Show me the last 5 beneficiaries added"
"Create a new migration to add email column to members table"
```

### Cursor'da Kullanım

Cursor'da Supabase MCP server'ı yapılandırmanız gerekir:

#### 1. Cursor Settings

**Cursor** → **Settings** → **Features** → **Model Context Protocol**

#### 2. MCP Config

`~/.cursor/mcp.json` dosyasını oluşturun:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN"
      }
    }
  }
}
```

**NOT:** Supabase Access Token için Supabase Dashboard → Settings → API → Service Role Key kullanın.

### Claude Desktop'ta Kullanım

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.supabase.com/mcp",
        "--header",
        "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
      ],
      "env": {
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

---

## 💡 Kullanım Örnekleri

### Database Queries

#### Basit SELECT
```
"Show me all members from Istanbul"
→ Çalıştırır: SELECT * FROM members WHERE city = 'Istanbul'
```

#### Aggregate Queries
```
"How many donations were made in the last month?"
→ Çalıştırır: SELECT COUNT(*) FROM donations WHERE created_at > NOW() - INTERVAL '1 month'
```

#### JOIN Queries
```
"Show me donations with member names"
→ Çalıştırır:
SELECT d.*, m.name FROM donations d
LEFT JOIN members m ON d.member_id = m.id
```

### Schema Management

```
"What tables do I have in my database?"
→ Gösterir: members, donations, beneficiaries, social_aid_applications, etc.

"Show me the schema for the donations table"
→ Gösterir: Tüm kolonlar, tipler, constraints

"What indexes are on the members table?"
→ Gösterir: Tüm index'ler
```

### Migrations

```
"Create a migration to add phone_number to members"
→ Migration dosyası oluşturur

"Show me recent migrations"
→ Migration geçmişini gösterir

"Apply pending migrations"
→ Pending migration'ları çalıştırır
```

### Real-time

```
"Show me active real-time subscriptions"
→ Aktif subscription'ları listeler

"Create a real-time subscription for donations table"
→ Real-time listener oluşturur
```

---

## 🔒 Güvenlik

### Service Role Key Güvenliği

⚠️ **KRİTİK:** Service role key **ASLA** client-side'da kullanılmamalı!

**Doğru Kullanım:**
```typescript
// ✅ Server-side (API route)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-side only!
)
```

**Yanlış Kullanım:**
```typescript
// ❌ Client-side (browser) - ASLA YAPMAYIN!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Tehlikeli!
)
```

### RLS (Row Level Security)

Projenizde RLS **tüm tablolarda aktif**:

```sql
-- members tablosu için RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
ON members FOR SELECT
USING (auth.uid() = user_id);
```

Anon key ile yapılan istekler RLS policy'lerine tabidir.
Service role key ile yapılan istekler RLS'i bypass eder.

---

## 🛠️ Troubleshooting

### Problem: Supabase MCP bağlanamıyor

**Çözümler:**

1. **Environment variables kontrolü:**
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Key'lerin geçerliliği:**
   - Supabase Dashboard → Settings → API
   - Key'leri yeniden kopyalayın

3. **Network bağlantısı:**
   ```bash
   curl -I https://idsiiayyvygcgegmqcov.supabase.co
   ```

### Problem: "Invalid API key" hatası

**Çözüm:**

1. **Key formatını kontrol edin:**
   - Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24i...`
   - Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSI...`

2. **Key'i yeniden kopyalayın** (boşluk veya satır atlama olmadan)

3. **.env.local'i yeniden yükleyin:**
   ```bash
   # Dev server'ı yeniden başlatın
   npm run dev
   ```

### Problem: RLS policy hatası

**Hata:**
```
new row violates row-level security policy for table "members"
```

**Çözüm:**

1. **Service role key kullanın** (RLS'i bypass eder)
2. **Veya RLS policy'yi düzenleyin:**
   ```sql
   -- Supabase Dashboard → SQL Editor
   CREATE POLICY "Allow insert with service role"
   ON members FOR INSERT
   USING (true);
   ```

### Problem: Migration uygulanamıyor

**Çözüm:**

1. **Supabase CLI'yi güncelleyin:**
   ```bash
   npm install -g supabase
   ```

2. **Manually migrate:**
   - Supabase Dashboard → SQL Editor
   - Migration SQL'i kopyalayıp çalıştırın

---

## 📊 Supabase Proje Bilgileri

### Mevcut Konfigürasyon

```
Project URL: https://idsiiayyvygcgegmqcov.supabase.co
Project ID: idsiiayyvygcgegmqcov
Region: EU (muhtemelen)
Database: PostgreSQL 17
```

### Tablolar (Tahmin)

Projenizde muhtemelen şu tablolar var:

- `users` - Sistem kullanıcıları
- `members` - Dernek üyeleri
- `donations` - Bağışlar
- `kumbaras` - Kumbara cihazları
- `beneficiaries` (ihtiyac_sahipleri) - Faydalanıcılar
- `social_aid_applications` - Başvurular
- `payments` - Ödemeler
- `documents` - Belgeler
- `backup_history` - Yedeklemeler

### Features

Projenizde aktif olan Supabase özellikleri:

- ✅ **Authentication**: Supabase Auth (JWT)
- ✅ **Database**: PostgreSQL 17 with RLS
- ✅ **Storage**: File storage (belki)
- ✅ **Real-time**: Subscriptions (belki)
- ✅ **Edge Functions**: (Kullanılmıyor olabilir)

---

## 📚 Dokümantasyon

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase MCP**: [https://supabase.com/docs/guides/integrations/mcp](https://supabase.com/docs/guides/integrations/mcp)
- **MCP Protocol**: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Project Dashboard**: [https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov](https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov)

---

## ✅ Kurulum Checklist

- [ ] Supabase Dashboard'a giriş yapıldı
- [ ] Project Settings → API açıldı
- [ ] anon public key kopyalandı
- [ ] service_role key kopyalandı
- [ ] `.env.local` dosyasına key'ler eklendi
- [ ] Dev server yeniden başlatıldı
- [ ] Supabase bağlantısı test edildi
- [ ] MCP ile test query çalıştırıldı
- [ ] Production'a key'ler eklendi (Render.com)

---

**Son Güncelleme:** 2026-01-02
**Versiyon:** 1.0
**Yazar:** KafkasDer Tech Team
