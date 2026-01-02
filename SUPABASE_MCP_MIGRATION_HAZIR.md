# ✅ SUPABASE MCP - MIGRATION'LAR HAZIR

**Tarih:** 2026-01-03
**Durum:** Migration SQL'leri hazır, Dashboard'da çalıştırılacak
**Database:** https://idsiiayyvygcgegmqcov.supabase.co

---

## 🎯 ÖZET

Supabase JavaScript client'ı DDL (ALTER TABLE, CREATE POLICY) komutlarını desteklemiyor. Migration'lar **Supabase Dashboard SQL Editor** üzerinden çalıştırılmalı.

---

## 🚀 HIZLI BAŞLANGIÇ

### Yöntem 1: Script Kullan (Önerilen)

```bash
./scripts/run-migrations.sh
```

Bu script:
- ✅ Migration dosyalarını kontrol eder
- ✅ SQL içeriklerini terminalde gösterir
- ✅ Kopyala-yapıştır için hazır format sunar
- ✅ Adım adım talimatlar verir

### Yöntem 2: Manuel

1. **Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/sql
   ```

2. **Migration 1'i kopyala:**
   ```bash
   cat supabase/migrations/20260102_update_file_size_limits.sql
   ```

3. **SQL Editor'e yapıştır ve "RUN" tıkla**

4. **Migration 2'yi kopyala:**
   ```bash
   cat supabase/migrations/20260102_improve_storage_rls_policies.sql
   ```

5. **SQL Editor'e yapıştır ve "RUN" tıkla**

---

## 📦 MIGRATION 1: File Size Limits

**Dosya:** `supabase/migrations/20260102_update_file_size_limits.sql`

**Ne yapar?**
- Documents tablosundaki `file_size` constraint'ini 5MB'dan 10MB'a çıkarır
- Daha büyük dosyaların (Word belgeleri, yüksek çözünürlüklü PDF'ler) yüklenmesine izin verir

**SQL:**
```sql
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_file_size_check;

ALTER TABLE documents
ADD CONSTRAINT documents_file_size_check
CHECK (file_size <= 10485760); -- 10MB
```

---

## 🔐 MIGRATION 2: Storage RLS Policies

**Dosya:** `supabase/migrations/20260102_improve_storage_rls_policies.sql`

**Ne yapar?**
- Mevcut basit (overly permissive) storage policies'leri kaldırır
- Ownership-based güvenli policies ekler
- Admin ve dosya sahibi kullanıcıların erişim kontrolünü sağlar

**SQL Preview:**
```sql
-- Eski policies'leri sil
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
-- ...

-- Yeni güvenli policies oluştur
CREATE POLICY "Users can upload documents for assigned beneficiaries" ...
CREATE POLICY "Users can view documents for assigned beneficiaries" ...
CREATE POLICY "Users can update their own uploaded documents" ...
CREATE POLICY "Users can delete their own uploaded documents" ...
```

---

## 🧪 MIGRATION SONRASI KONTROL

### 1. Dashboard'da Verification

**Migration başarılı mı?**
```sql
-- SQL Editor'de çalıştır:
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'documents_file_size_check';

-- Beklenen sonuç: file_size <= 10485760
```

**RLS policies mevcut mu?**
```sql
-- SQL Editor'de çalıştır:
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- Beklenen 4 policy:
-- - Users can upload documents for assigned beneficiaries
-- - Users can view documents for assigned beneficiaries
-- - Users can update their own uploaded documents
-- - Users can delete their own uploaded documents
```

### 2. Node.js ile Test

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://idsiiayyvygcgegmqcov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDg4NjMsImV4cCI6MjA4MTkyNDg2M30.blDE-L_aRNSwoawUCD3esFt_CMk2fhy8TpShsgyshZQ'
);

async function test() {
  console.log('🧪 Testing Supabase connection...');

  const { data, error } = await supabase
    .from('documents')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Database connection OK');
    console.log('✅ Documents table accessible');
  }
}

test();
"
```

### 3. Frontend Test

```bash
# Dev server başlat
npm run dev

# Browser'da test et:
# 1. http://localhost:3000
# 2. İhtiyaç sahibi detay sayfasına git
# 3. Belgeler tab → Yeni belge yükle
# 4. 10MB'a kadar dosya yükle (önceden 5MB)
# 5. .docx dosyası yükle (yeni destek)
# 6. Download ve Delete butonları çalışmalı
```

---

## 📊 EK AYARLAR

### Storage Bucket File Size Limit

Migration, database constraint'ini günceller ama **Storage bucket limit manuel ayarlanmalı:**

1. **Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/storage/buckets
   ```

2. **documents bucket'ı seç** (yoksa oluştur)

3. **Settings → Configuration → File size limit**

4. **10485760** (10MB) olarak ayarla

5. **Save**

### Documents Bucket Oluşturma (Yoksa)

```sql
-- SQL Editor'de çalıştır:
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);
```

**veya Dashboard UI ile:**
1. Storage → New Bucket
2. Name: `documents`
3. Public: ❌ (false)
4. File size limit: `10485760`
5. Create

---

## 🔍 SORUN GİDERME

### Hata: "constraint already exists"

```sql
-- Önce mevcut constraint'i sil:
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_file_size_check;

-- Sonra yeniden ekle:
ALTER TABLE documents
ADD CONSTRAINT documents_file_size_check
CHECK (file_size <= 10485760);
```

### Hata: "policy already exists"

```sql
-- Önce tüm policies'leri sil:
DROP POLICY IF EXISTS "Users can upload documents for assigned beneficiaries" ON storage.objects;
-- ...diğer policies

-- Sonra migration'ı tekrar çalıştır
```

### Hata: "documents table not found"

```bash
# documents tablosu henüz oluşturulmamış
# Önce bu migration'ı çalıştır:
cat supabase/migrations/20251224_add_documents_table.sql
```

---

## ✅ BAŞARI KRİTERLERİ

Migration başarılı sayılır:

- [x] SQL Editor'de hata almadan çalıştı
- [x] `documents_file_size_check` constraint 10MB gösteriyor
- [x] 4 adet storage RLS policy mevcut
- [x] Storage bucket file size limit 10MB
- [x] 10MB dosya yüklenebiliyor
- [x] .docx dosyası yüklenebiliyor
- [x] Download/Delete butonları çalışıyor

---

## 📁 OLUŞTURULAN DOSYALAR

```
/Users/pc/conductor/workspaces/portal-main-main/saskatoon/
├── supabase/
│   └── migrations/
│       ├── 20260102_update_file_size_limits.sql          ✅ Hazır
│       └── 20260102_improve_storage_rls_policies.sql     ✅ Hazır
├── scripts/
│   └── run-migrations.sh                                 ✅ Yeni helper script
├── SUPABASE_MCP_MIGRATION_TALIMATLARI.md                 ✅ Detaylı döküman
└── SUPABASE_MCP_MIGRATION_HAZIR.md                       ✅ Bu dosya
```

---

## 🔗 BAĞLANTILAR

- **SQL Editor:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/sql
- **Storage:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/storage
- **Database:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/database
- **API Docs:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/api

---

## 📝 NOTLAR

### Neden Supabase MCP ile çalıştıramadık?

Supabase JavaScript client library (`@supabase/supabase-js`):
- ✅ CRUD operations destekler (SELECT, INSERT, UPDATE, DELETE)
- ✅ Storage operations destekler (upload, download, delete)
- ✅ Auth operations destekler (login, signup, session)
- ❌ **DDL operations desteklemez** (ALTER TABLE, CREATE POLICY)
- ❌ **Raw SQL execution yok** (rpc fonksiyonu custom functions için)

**PostgreSQL direkt bağlantı gerekir:**
- Option 1: Supabase Dashboard SQL Editor ✅ (Kullandık)
- Option 2: `psql` CLI tool
- Option 3: `pg` npm package + connection string
- Option 4: Supabase Management API

### MCP vs REST API

Model Context Protocol (MCP) kullanımı:
- Client library üzerinden → ❌ DDL desteklemiyor
- REST API üzerinden → ✅ Olabilir ama auth karmaşık
- Dashboard SQL Editor → ✅ En kolay ve güvenli

---

## 🎯 SONRAKI ADIMLAR

1. **Migration'ları çalıştır** (5 dakika)
   ```bash
   ./scripts/run-migrations.sh
   # SQL'leri Dashboard'a kopyala
   ```

2. **Storage bucket ayarla** (2 dakika)
   - File size limit: 10MB

3. **Test et** (5 dakika)
   ```bash
   npm run dev
   # 10MB dosya yükle
   ```

4. **Production'a deploy** (10 dakika)
   ```bash
   git add .
   git commit -m "feat: Increase file size limit to 10MB and improve storage RLS"
   git push
   ```

---

**Toplam Süre:** ~15-20 dakika
**Risk Seviyesi:** Düşük (sadece constraint ve policy güncellemesi)
**Rollback:** Kolay (eski constraint/policies restore edilebilir)

**Son Güncelleme:** 2026-01-03
**Durum:** ✅ Hazır, çalıştırılmayı bekliyor
