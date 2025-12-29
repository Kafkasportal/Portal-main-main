# 🚀 Deployment Hazırlık Checklist

## ✅ Sentry Yapılandırması

### Yerel Ortam (.env.local)
- ✅ NEXT_PUBLIC_SENTRY_DSN - Yapılandırıldı
- ✅ SENTRY_ORG=kafkasder-oc
- ✅ SENTRY_PROJECT=javascript-nextjs
- ✅ SENTRY_AUTH_TOKEN - Eklendi

### Production (Render.com)
- ✅ render.yaml güncellendi
- ⚠️ Render Dashboard'da environment variables eklenmeli:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN` (gizli)

---

## 📋 Deployment Adımları

### 1. Render.com'da Blueprint Oluştur

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Repository: `Kafkasportal/Portal`
3. Branch: `main`
4. **Apply** butonuna tıklayın

### 2. Environment Variables Ekle

Render Dashboard'da servis oluşturulduktan sonra:

**Zorunlu:**
- `NEXT_PUBLIC_APP_URL` - Production URL (örn: `https://kafkasder-panel.onrender.com`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Sentry:**
- `NEXT_PUBLIC_SENTRY_DSN` = `https://cd0a14123a89b44c7b5a4e5e61f02795@o4510438396395520.ingest.de.sentry.io/4510460623192144`
- `SENTRY_ORG` = `kafkasder-oc`
- `SENTRY_PROJECT` = `javascript-nextjs`
- `SENTRY_AUTH_TOKEN` = `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`

### 3. İlk Deploy

Render otomatik olarak:
1. Repository'yi clone eder
2. `npm ci && npm run build` çalıştırır
3. `npm run db:migrate` çalıştırır (pre-deploy)
4. `npm start` ile servisi başlatır

### 4. Deployment Sonrası Kontrol

- ✅ Health check: `https://your-service.onrender.com/`
- ✅ Sentry test: Bir hata oluşturup Sentry'de göründüğünü kontrol edin
- ✅ Logs: Render Dashboard → Logs sekmesinde hata var mı kontrol edin

---

## 🔍 Sentry Production Testi

Deployment sonrası Sentry'nin çalıştığını test edin:

1. Production URL'e gidin
2. Sentry'de hata oluşturun (test sayfası production'da olmamalı)
3. Sentry Dashboard'da hatanın göründüğünü kontrol edin:
   - https://kafkasder-oc.sentry.io/projects/javascript-nextjs/

---

## ⚠️ Önemli Notlar

1. **Test Sayfası:** `/test-sentry` sayfası production'da devre dışı bırakılmalı
2. **Source Maps:** Build sonrası source map'ler otomatik upload edilecek (SENTRY_AUTH_TOKEN gerekli)
3. **Environment:** Production'da `NODE_ENV=production` olmalı
4. **Monitoring:** Sentry'de alert kuralları oluşturun

---

## 🔗 Hızlı Linkler

- **Render Dashboard:** https://dashboard.render.com
- **Sentry Dashboard:** https://kafkasder-oc.sentry.io
- **Proje:** https://kafkasder-oc.sentry.io/projects/javascript-nextjs/

