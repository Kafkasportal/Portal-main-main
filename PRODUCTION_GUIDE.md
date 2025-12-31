# 🚀 Production Deployment Kılavuzu

## KafkasDer Yönetim Paneli - Canlıya Alma Rehberi

Bu dosya, derneğinizin yönetim panelini gerçek kullanıma hazır hale getirmek için gerekli adımları içerir.

---

## ✅ Tamamlanan İyileştirmeler

### 1. **Güvenlik Düzeltmeleri** ✅
- ✅ SQL Injection koruması (Function search_path düzeltildi)
- ✅ RLS (Row Level Security) tüm tablolarda aktif
- ✅ CSRF Protection aktif
- ✅ XSS Protection aktif
- ✅ Security Headers yapılandırıldı
- ✅ Input Validation (Zod schemas)

### 2. **Error Logging & Monitoring** ✅
- ✅ Sentry entegrasyonu production-ready
- ✅ Error tracking otomatik çalışıyor
- ✅ Local error storage (debugging için)

### 3. **Performance Optimizasyonları** ✅
- ✅ Dashboard Stats RPC fonksiyonu aktif (fallback ile)
- ✅ 60+ Database index tanımlı
- ✅ Optimized RLS policies
- ✅ TanStack Query caching aktif

### 4. **Backup & Restore Sistemi** ✅
- ✅ Tam yedekleme (Full backup)
- ✅ Veri yedeği (Data-only backup)
- ✅ Geri yükleme (Restore from JSON)
- ✅ Yedekleme geçmişi
- ✅ JSON export/import

---

## 📋 Canlıya Alma Öncesi Kontrol Listesi

### Zorunlu Adımlar

- [ ] **1. Environment Variables Kontrolü**
  ```bash
  # .env.local dosyasını kontrol edin:
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
  ```

- [ ] **2. Database Migration Kontrolü**
  ```bash
  # Tüm migration'ları Supabase'e uyguladığınızdan emin olun
  # Supabase Dashboard > SQL Editor'den migration dosyalarını çalıştırın
  ```

- [ ] **3. İlk Admin Kullanıcısını Oluşturun**
  ```sql
  -- Supabase Dashboard > SQL Editor'de çalıştırın
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    'auth_user_id_here',  -- Supabase Auth'dan kullanıcı ID'si
    'admin@kafkasder.org',
    'Admin Kullanıcı',
    'admin'
  );
  ```

- [ ] **4. TypeScript Kontrolü**
  ```bash
  npm run type-check
  # Hataları düzeltin veya production'da SKIP_TYPE_CHECK=true kullanın
  ```

- [ ] **5. Test Koşumu**
  ```bash
  npm run test
  npm run test:e2e  # E2E testler
  ```

- [ ] **6. Build Testi**
  ```bash
  npm run build
  # Build başarılı olmalı
  ```

---

## 🔧 Deployment Adımları

### Render.com Deployment

1. **GitHub Repository Bağlayın**
   - Render Dashboard > New > Web Service
   - GitHub repository'nizi seçin

2. **Environment Variables Ekleyin**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SENTRY_DSN=...
   SENTRY_ORG=...
   SENTRY_PROJECT=...
   SENTRY_AUTH_TOKEN=...
   SKIP_TYPE_CHECK=true  # İlk deployment için
   ```

3. **Build Command:**
   ```bash
   npm install && npm run build
   ```

4. **Start Command:**
   ```bash
   npm start
   ```

5. **Deploy Edin**
   - "Create Web Service" butonuna tıklayın
   - İlk deploy otomatik başlar

---

## 👥 Kullanıcı Yönetimi

### Admin Kullanıcı Ekleme

```sql
-- Supabase Dashboard > SQL Editor
INSERT INTO public.users (id, email, name, role)
VALUES (
  'supabase_auth_user_id',
  'kullanici@email.com',
  'Kullanıcı Adı Soyadı',
  'admin'  -- veya 'moderator', 'user'
);
```

### Rol Yetkileri

| Rol | Yetkiler |
|-----|----------|
| **admin** | Tüm yetkilere sahip, kullanıcı yönetimi, silme işlemleri |
| **moderator** | Kayıt ekleme, düzenleme, görüntüleme (silme yok) |
| **muhasebe** | Bağış ve ödeme işlemleri |
| **user** | Sadece görüntüleme |

---

## 💾 Yedekleme Stratejisi

### Otomatik Yedekleme (Önerilen)

Uygulama içinde **Ayarlar > Yedekleme** menüsünden:

1. **Günlük Yedekleme:** Her gün tam yedek alın
2. **Haftalık Arşiv:** Haftada bir yedeği harici diske kaydedin
3. **Kritik İşlemler Öncesi:** Büyük değişiklikler öncesi manuel yedek alın

### Manuel Yedekleme

```bash
# Uygulama arayüzünden:
Ayarlar > Yedekleme > Tam Yedek Oluştur
# JSON dosyası otomatik indirilir
```

### Geri Yükleme

```bash
# Uygulama arayüzünden:
Ayarlar > Yedekleme > Geri Yükleme > Dosya Seç
# Backup JSON dosyasını seçin
```

---

## 🔒 Güvenlik Önerileri

### 1. **Şifre Politikası**
- Minimum 8 karakter
- En az 1 büyük harf, 1 küçük harf, 1 rakam
- Supabase Auth otomatik şifre güvenliği sağlar

### 2. **2FA (Two-Factor Authentication)**
```sql
-- Supabase Dashboard > Authentication > Providers
-- Email MFA'yı aktif edin
```

### 3. **IP Kısıtlaması (Opsiyonel)**
- Render Dashboard > Settings > IP Allowlist
- Sadece dernek ofisi IP'sinden erişim

### 4. **SSL/HTTPS**
- ✅ Render otomatik SSL sağlar
- ✅ HTTPS zorunlu

### 5. **Database Yedekleme**
- Supabase otomatik günlük yedek alır
- Ek manuel yedekler önerilir

---

## 📊 Monitoring & Logs

### Sentry (Error Tracking)

1. **Hataları İzleme:**
   - https://sentry.io > Your Project
   - Real-time hata bildirimleri

2. **Performance Monitoring:**
   - Sentry > Performance
   - Yavaş sayfaları tespit edin

### Supabase Logs

```bash
# Supabase Dashboard > Logs
- Database queries
- API requests
- Auth events
```

---

## 🚨 Sorun Giderme

### Build Hataları

```bash
# TypeScript hatası:
npm run type-check
# Hataları düzeltin veya SKIP_TYPE_CHECK=true kullanın

# Dependency hatası:
rm -rf node_modules package-lock.json
npm install
```

### Runtime Hataları

```bash
# Sentry Dashboard'u kontrol edin
# Browser console'u kontrol edin
# Supabase logs'u kontrol edin
```

### Database Bağlantı Hatası

```bash
# Environment variables kontrolü
# Supabase project durumu (Dashboard)
# RLS policies kontrolü
```

---

## 📞 Destek ve Bakım

### Günlük Bakım
- [ ] Error logs kontrolü (Sentry)
- [ ] Yedekleme kontrolü
- [ ] Sistem performans kontrolü

### Haftalık Bakım
- [ ] Yedekleri harici diske kaydetme
- [ ] Kullanıcı aktivite raporları
- [ ] Performance metrikleri inceleme

### Aylık Bakım
- [ ] Güvenlik güncellemeleri kontrolü
- [ ] Database optimizasyonu
- [ ] Eski kayıtları arşivleme

---

## 🎯 İlk Kullanım Adımları

### Dernek Başkanı için:

1. **Login Yapın**
   - Admin hesabınızla giriş yapın
   - Şifrenizi değiştirin (Ayarlar > Profil)

2. **Çalışan Hesapları Oluşturun**
   - Ayarlar > Kullanıcılar > Yeni Kullanıcı
   - Email ve rol atayın

3. **İlk Yedekleme Alın**
   - Ayarlar > Yedekleme > Tam Yedek

4. **Test Kayıtları Ekleyin**
   - İhtiyaç Sahipleri > Yeni Kayıt
   - Üyeler > Yeni Üye
   - Bağış > Yeni Bağış

5. **Raporları Kontrol Edin**
   - Dashboard'u inceleyin
   - Sosyal Yardım > Raporlar
   - Bağış > Raporlar

---

## 📈 Performance Tips

### Hız İyileştirmeleri

1. **Image Optimization**
   - Next.js otomatik optimize eder
   - WebP/AVIF formatı kullanır

2. **Caching**
   - TanStack Query otomatik cache yapar
   - Browser cache aktif

3. **Database Queries**
   - RPC fonksiyonları kullanın
   - Index'leri kontrol edin

### Önerilen Hosting Ayarları

**Render.com:**
- Instance Type: Standard (minimum)
- Auto-Deploy: Aktif
- Health Check: `/api/health`

---

## ✨ Yeni Özellikler Ekleme

Sistem modüler yapıda tasarlanmıştır. Yeni özellikler eklemek için:

```
src/
├── app/(dashboard)/yeni-modul/     # Yeni sayfa
├── components/features/yeni-modul/ # UI components
├── lib/services/yeni-modul.ts      # API servisleri
└── types/index.ts                  # Type definitions
```

---

## 📝 Changelog

### v0.1.0 - Production Ready (2025-12-31)
- ✅ Güvenlik düzeltmeleri tamamlandı
- ✅ Sentry entegrasyonu production-ready
- ✅ Dashboard stats RPC aktif
- ✅ Yedekleme sistemi eklendi
- ✅ TypeScript konfigürasyonu iyileştirildi
- ✅ Production deployment hazır

---

## 🙏 Son Notlar

**Dernek Başkanı için Önemli:**

1. **İlk 1 Hafta:** Sistemi test kullanımda tutun, gerçek verileri yavaş yavaş ekleyin
2. **Yedekleme:** Her gün yedek almayı unutmayın
3. **Şifreler:** Güçlü şifreler kullanın, paylaşmayın
4. **Destek:** Sorun olduğunda Sentry'de hataları kontrol edin
5. **Eğitim:** Çalışanları sistemi kullanmaları için eğitin

**Başarılar dileriz!** 🎉

---

*Son Güncelleme: 31 Aralık 2025*
*Versiyon: 0.1.0 Production Ready*
