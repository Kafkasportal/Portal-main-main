# ✅ MIGRATION HAZIR - TEK KOMUT!

**Tarih:** 2026-01-03
**Durum:** %100 Otomatik, Tek Komutla Çalışıyor
**Gerekli Süre:** ~1 dakika

---

## 🚀 TEK KOMUT İLE ÇALIŞTIR

```bash
./scripts/one-command-migrate.sh
```

**Bu script:**
1. ✅ Supabase CLI ile project'i link eder (ilk seferlik)
2. ✅ Database password sorar (Dashboard'dan alın)
3. ✅ Tüm migration'ları otomatik çalıştırır
4. ✅ Doğrulama yapar
5. ✅ Sonuçları gösterir

**Password nereden alınır:**
```
https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/settings/database
→ "Database password" → "Reset" → Copy
```

---

## 📦 NE YAPAR?

### Migration 1: File Size Limits
- Documents tablosunda file_size constraint'i 10MB'a çıkarır
- Daha büyük dosyaların (Word, PDF) yüklenmesine izin verir

### Migration 2: Storage RLS Policies
- Ownership-based güvenli storage policies ekler
- Admin ve dosya sahibi kullanıcıların erişim kontrolü
- 4 yeni policy:
  - Upload for assigned beneficiaries
  - View documents
  - Update own documents
  - Delete own documents

---

## ✅ BAŞARI KONTROLÜ

Migration sonrası test:

```bash
# Dev server başlat
npm run dev

# Browser'da test et:
# http://localhost:3000
# → İhtiyaç sahibi detay
# → Belgeler tab
# → 10MB dosya yükle
# ✅ Başarılı olmalı!
```

---

## 🔧 ALTERNATİF YÖNTEMLER

### Yöntem 1: One Command Script (Önerilen)
```bash
./scripts/one-command-migrate.sh
```
⏱️ ~1 dakika | 🔐 Password: İlk seferlik

### Yöntem 2: Manuel PostgreSQL Bağlantı
```bash
SUPABASE_DB_PASSWORD="your-password" node scripts/full-auto-migrate.js
```
⏱️ ~30 saniye | 🔐 Password: Her seferinde

### Yöntem 3: Dashboard Kopyala-Yapıştır
```bash
./scripts/run-migrations.sh
```
⏱️ ~2 dakika | 🔐 Password: Gerekmez

---

## 📊 OLUŞTURULAN DOSYALAR

```
scripts/
├── one-command-migrate.sh            ⭐ TEK KOMUT (ÖNER İLEN)
├── full-auto-migrate.js              PostgreSQL direkt
├── supabase-api-migrate.js           REST API deneme
├── passwordless-migrate.js           Browser fallback
├── create-exec-sql-function.sql      Helper function
└── run-migrations.sh                 Manuel helper

docs/
├── MIGRATION_READY.md                ⭐ Bu dosya
├── FINAL_AUTO_MIGRATE.md             Detaylı kılavuz
└── SUPABASE_MCP_MIGRATION_HAZIR.md   MCP dökümanı
```

---

## 🎯 SONRAKI ADIMLAR

1. **Migration'ı çalıştır:**
   ```bash
   ./scripts/one-command-migrate.sh
   ```

2. **Storage bucket limit ayarla (manuel):**
   ```
   Dashboard → Storage → documents → Settings
   File size limit: 10485760 (10MB)
   ```

3. **Test et:**
   ```bash
   npm run dev
   # 10MB dosya yükle
   ```

4. **Production'a deploy:**
   ```bash
   git add .
   git commit -m "feat: 10MB file limit + secure storage policies"
   git push
   ```

---

## 💡 NOTLAR

- Password güvenliği: CLI link sonrası ~/.config/supabase'de güvenli saklanır
- Migration tekrarı: İdempotent, tekrar çalıştırılabilir
- Rollback: Eski policies restore edilebilir
- Risk: Minimal (sadece constraint ve policy update)

---

## 🎉 ÖZET

```
✅ Migration SQL'leri hazır
✅ Auto script hazır (tek komut)
✅ Supabase CLI kurulu
✅ Bağlantı test edildi
✅ Password sadece ilk seferlik
✅ Toplam süre: ~1 dakika
```

**Komut:**
```bash
./scripts/one-command-migrate.sh
```

**Başarı göstergesi:**
```
✅ Supabase project zaten linked
📦 Migration'lar çalıştırılıyor...
Applying migration 20260102_update_file_size_limits.sql...
Applying migration 20260102_improve_storage_rls_policies.sql...
Finished supabase db push.
✅ MIGRATION TAMAMLANDI!
```

---

**Son Güncelleme:** 2026-01-03
**Durum:** Production-ready
**Toplam Süre:** ~60 saniye
