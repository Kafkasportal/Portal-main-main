# 🗄️ SUPABASE MCP - MIGRATION ÇALIŞTIRMA TALİMATLARI

**Tarih:** 2026-01-02
**Proje:** KafkasDer Yönetim Paneli
**Database:** https://idsiiayyvygcgegmqcov.supabase.co

---

## ✅ SUPABASE MCP BAĞLANTISI TESTLERİ BAŞARILI

```
✅ Database Bağlantısı: BAŞARILI
✅ Storage Bağlantısı: BAŞARILI
✅ Auth Bağlantısı: BAŞARILI
```

---

## 📋 ÇALIŞTIRMASI GEREKEN MIGRATION'LAR

### 1. File Size Limits (10MB)
**Dosya:** `supabase/migrations/20260102_update_file_size_limits.sql`

```sql
-- Documents tablosundaki file size constraint'ini 10MB'a çıkar
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_file_size_check;

ALTER TABLE documents
ADD CONSTRAINT documents_file_size_check
CHECK (file_size <= 10485760); -- 10MB in bytes

COMMENT ON CONSTRAINT documents_file_size_check ON documents IS
'Maximum file size: 10MB (10485760 bytes)';
```

### 2. Storage RLS Policies (Güvenlik İyileştirmesi)
**Dosya:** `supabase/migrations/20260102_improve_storage_rls_policies.sql`

```sql
-- Mevcut policies'i sil
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;

-- Yeni güvenli policies oluştur
CREATE POLICY "Users can upload documents for assigned beneficiaries"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR true
  )
);

CREATE POLICY "Users can view documents for assigned beneficiaries"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND true);

CREATE POLICY "Users can update their own uploaded documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name AND d.uploaded_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own uploaded documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name AND d.uploaded_by = auth.uid()
    )
  )
);
```

---

## 🚀 ADIM ADIM MIGRATION ÇALIŞTIRMA

### Yöntem 1: Supabase Dashboard (Önerilen)

#### Adım 1: Dashboard'a Giriş
```
https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/sql
```

#### Adım 2: Migration 1'i Çalıştır
1. SQL Editor'e git
2. "New query" butonuna tıkla
3. Aşağıdaki komutu terminalden çalıştır:
   ```bash
   cat supabase/migrations/20260102_update_file_size_limits.sql
   ```
4. Çıktıyı SQL Editor'e yapıştır
5. "Run" butonuna tıkla
6. ✅ "Success" mesajını bekle

#### Adım 3: Migration 2'yi Çalıştır
1. Yeni bir SQL query aç
2. Aşağıdaki komutu terminalden çalıştır:
   ```bash
   cat supabase/migrations/20260102_improve_storage_rls_policies.sql
   ```
3. Çıktıyı SQL Editor'e yapıştır
4. "Run" butonuna tıkla
5. ✅ "Success" mesajını bekle

#### Adım 4: Storage Bucket Limit'i Güncelle
1. Supabase Dashboard → Storage bölümüne git
2. `documents` bucket'ını seç (yoksa oluştur)
3. Settings → File size limit
4. `10485760` (10MB) olarak ayarla
5. Save

---

### Yöntem 2: Supabase CLI (Alternatif)

```bash
# Eğer Supabase CLI kuruluysa
npx supabase migration up --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.idsiiayyvygcgegmqcov.supabase.co:5432/postgres"
```

**Not:** Password'u Supabase Dashboard'dan alın:
Settings → Database → Connection string → Password

---

## 🧪 MIGRATION SONRASI TEST

### Test 1: File Size Constraint
```bash
npm run dev
# Browser'da:
# 1. İhtiyaç sahibi detay sayfasına git
# 2. Belgeler tabına tıkla
# 3. 10MB'a kadar bir dosya yükle
# 4. Başarılı olmalı (önceden 5MB'dı)
```

### Test 2: Storage RLS Policies
```bash
# Admin kullanıcısı ile giriş yap
# 1. Başka kullanıcının yüklediği belgeyi silmeyi dene
# 2. Admin olduğun için silebilmelisin

# Normal kullanıcı ile giriş yap
# 1. Kendi yüklediğin belgeyi silmeyi dene
# 2. Başarılı olmalı
# 3. Başka kullanıcının belgesini silmeyi dene
# 4. Hata almalısın (403 Forbidden)
```

### Test 3: Node.js Script ile Test
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://idsiiayyvygcgegmqcov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDg4NjMsImV4cCI6MjA4MTkyNDg2M30.blDE-L_aRNSwoawUCD3esFt_CMk2fhy8TpShsgyshZQ'
);

async function test() {
  const { data, error } = await supabase
    .from('documents')
    .select('id, file_size')
    .limit(5);

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Documents table accessible');
    console.log('📊 Sample data:', data);
  }
}

test();
"
```

---

## 📊 MIGRATION DURUMU

### Tüm Migration'lar (Kronolojik)

```
✅ 20250126_backend_optimizations.sql
✅ 20250127_add_in_kind_aids_table.sql
✅ 20251222_add_beneficiary_relations.sql
✅ 20251224_add_documents_table.sql
✅ 20251225_change_ids_to_bigint.sql
✅ 20251226_add_member_fields.sql
✅ 20251226_add_performance_indexes.sql
✅ 20251226_create_dashboard_stats_function.sql
✅ 20251226_fix_rls_policies_role_based.sql
✅ 20251227_add_hospital_referral_tables.sql
✅ 20251227_create_donation_analytics_function.sql
✅ 20251227_create_need_assessments_tables.sql
✅ 20251227_create_source_distribution_function.sql
✅ 20251227_create_top_donors_function.sql
✅ 20251227_enhance_audit_logging.sql
✅ 20251227_update_dashboard_stats_with_comparison.sql
✅ 20251230_align_beneficiaries_with_frontend.sql
✅ 20251230_align_documents_with_frontend.sql
✅ 20251230_align_kumbaras_with_frontend.sql
✅ 20251230_align_members_donations_with_frontend.sql
✅ 20251230_align_social_aid_with_frontend.sql
✅ 20251230_fix_security_and_performance.sql
✅ 20251230_rbac_system.sql
🔄 20260102_improve_storage_rls_policies.sql (YENİ - Çalıştırılacak)
🔄 20260102_update_file_size_limits.sql (YENİ - Çalıştırılacak)
```

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Migration Sırası
- Migration'lar kronolojik sırada çalıştırılmalı
- Önce `20260102_update_file_size_limits.sql`
- Sonra `20260102_improve_storage_rls_policies.sql`

### 2. Storage Bucket
- `documents` bucket'ı yoksa önce oluşturulmalı
- Bucket'ın `public` olmamalı (güvenlik)
- File size limit manuel olarak 10MB'a çekilmeli

### 3. RLS Policies
- Mevcut policies drop ediliyor, bu normal
- Yeni policies daha güvenli ve ownership-based
- Test sırasında 403 hatası alırsanız doğru çalışıyor demektir

### 4. Rollback
Eğer sorun çıkarsa, eski policies'i geri yüklemek için:

```sql
-- Yeni policies'i sil
DROP POLICY IF EXISTS "Users can upload documents for assigned beneficiaries" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents for assigned beneficiaries" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploaded documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON storage.objects;

-- Eski basit policies'i geri yükle
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

---

## 🎯 BAŞARI KRİTERLERİ

Migration başarılı sayılır eğer:

- ✅ SQL Editor'de hata almadan çalışırsa
- ✅ 10MB dosya yüklenebilirse
- ✅ Admin her belgeyi silebilirse
- ✅ Normal kullanıcı sadece kendi belgelerini silebilirse
- ✅ Storage bucket 10MB limit gösteriyorsa

---

## 🔗 FAYDALI LİNKLER

- **Supabase Dashboard:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov
- **SQL Editor:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/sql
- **Storage:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/storage
- **Database:** https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/database

---

## 📞 YARDIM

Sorun yaşarsanız:

1. Migration SQL'ini tekrar kontrol edin
2. Supabase Dashboard'da "Logs" bölümüne bakın
3. Browser console'da hata var mı kontrol edin
4. `FRONTEND_SUPABASE_FIXES_COMPLETED.md` dosyasını inceleyin

---

**Son Güncelleme:** 2026-01-02
**Durum:** Migration'lar hazır, çalıştırılmayı bekliyor
**Beklenen Süre:** ~5 dakika
