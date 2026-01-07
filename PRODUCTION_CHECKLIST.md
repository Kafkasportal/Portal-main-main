# 🚀 Production Hazırlık Kontrol Listesi

## ✅ Tamamlanan Adımlar

### 1. Temizlik
- ✅ Gereksiz dokümantasyonlar silindi (OPTIMIZATION.md, OPTIMIZATION_SUMMARY.md, ULTRA_DOCUMENTATION.md)
- ✅ Kullanılmayan component'ler silindi (accessibility, feedback, loading-state, etc.)
- ✅ Mock data dosyaları silindi (mock-data.ts, mock-service.ts)
- ✅ Yeni temiz dokümantasyon oluşturuldu (ARCHITECTURE.md, WORKFLOW.md, DATA_MODEL.md)

### 2. Supabase Entegrasyonu
- ✅ Supabase client hazır (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- ✅ Supabase service hazır (`lib/supabase-service.ts`)
- ✅ Database schema hazır (`supabase/schema.sql`)
- ✅ TanStack Query hooks hazır (`hooks/use-api.ts`)

---

## ⏳ Yapılacak Adımlar

### 1. Environment Değişkenleri

```bash
# .env.local dosyası oluşturun
cp .env.example .env.local
```

**Gerekli Değişkenler:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_APP_NAME="KafkasDer Panel"
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Supabase Projesi Kurulumu

**Adımlar:**
1. [Supabase](https://supabase.com)'da proje oluşturun
2. API keys'i `.env.local`'a ekleyin
3. SQL Editor'da `supabase/schema.sql`'ı çalıştırın
4. Authentication ayarlarını yapın:
   - Email provider'ı aktifleştirin
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### 3. Authentication Geçişi

**Mevcut Durum:** `stores/user-store.ts` - Mock auth kullanıyor

**Yapılacak:**
- Supabase Auth'a tam geçiş
- Session management
- Protected routes middleware

### 4. Production Build Test

```bash
# Build test
npm run build

# Start production server
npm start
```

**Kontrol Edilecek:**
- ✅ Build hatası yok
- ✅ Environment değişkenleri yüklendi
- ✅ Supabase bağlantısı çalışıyor
- ✅ Sayfalar yükleniyor

### 5. Deployment

**Vercel (Önerilen):**
1. Vercel'e bağlanın
2. Repository import edin
3. Environment değişkenlerini ekleyin
4. Deploy edin

**Environment Değişkenleri (Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## 🔧 Teknik Kontroller

### Database
- [ ] Supabase projesi oluşturuldu
- [ ] Schema uygulandı
- [ ] RLS politikaları etkin
- [ ] Test verileri eklendi (opsiyonel)

### Authentication
- [ ] Email provider aktif
- [ ] Site URL ayarlandı
- [ ] Redirect URLs ayarlandı
- [ ] Session management çalışıyor

### API
- [ ] Supabase bağlantısı test edildi
- [ ] CRUD operasyonları çalışıyor
- [ ] Error handling tamamlandı
- [ ] Loading states çalışıyor

### Build
- [ ] `npm run build` başarılı
- [ ] Bundle size kontrol edildi
- [ ] TypeScript hatası yok
- [ ] ESLint hatası yok

---

## 📋 Production Checklist

### Öncelik: Yüksek
- [ ] Supabase projesi oluşturuldu
- [ ] Environment değişkenleri ayarlandı
- [ ] Database schema uygulandı
- [ ] Authentication çalışıyor
- [ ] Production build başarılı

### Öncelik: Orta
- [ ] RLS politikaları yapılandırıldı
- [ ] Error boundaries test edildi
- [ ] Loading states optimize edildi
- [ ] SEO metadata ayarlandı

### Öncelik: Düşük
- [ ] Analytics entegrasyonu (opsiyonel)
- [ ] Monitoring (Sentry - opsiyonel)
- [ ] PWA manifest ayarlandı
- [ ] Performance monitoring

---

## 🚨 Kritik Noktalar

### 1. Supabase URL ve Keys
```bash
# Yanlış ❌
SUPABASE_URL=https://supabase.com/project/xxx

# Doğru ✅
SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### 2. Environment Değişkenleri
- `.env.local` → Git'e eklenmez (`.gitignore`'da)
- `.env.example` → Git'e eklenir (template)

### 3. Database Schema
- Schema SQL'i çalıştırmadan önce backup alın
- Migration'lar sırayla çalıştırın

### 4. Authentication
- Production'da mock auth KAPALI olmalı
- Session güvenliği kontrol edin
- CSRF protection etkin

---

## 📞 Destek

**Sorun yaşarsanız:**
1. Supabase Dashboard → Logs
2. Browser Console → Network tab
3. Vercel Dashboard → Logs

**Dokümantasyon:**
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [WORKFLOW.md](./WORKFLOW.md)
- [DATA_MODEL.md](./DATA_MODEL.md)
- [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)
