# 🚀 Sentry Hızlı Başlangıç

Bu dosya, Sentry'yi **5 dakikada** kurmak için adım adım rehberdir.

---

## ⚡ HIZLI KURULUM (5 Dakika)

### 1️⃣ Sentry Hesabı Oluştur (2 dakika)

1. **Git**: [https://sentry.io/signup/](https://sentry.io/signup/)
2. **Kayıt ol**: GitHub ile veya email
3. **Organization oluştur**: `KafkasDer` veya `Kafkasportal`
4. **Proje oluştur**:
   - Platform: **Next.js**
   - İsim: `kafkasder-panel`
5. **DSN'i kopyala** (otomatik gösterilecek):
   ```
   https://XXXX@XXXX.ingest.sentry.io/XXXX
   ```

---

### 2️⃣ Auth Token Al (1 dakika)

1. **Profil** → **Settings** → **Account** → **API** → **Auth Tokens**
2. **Create New Token**:
   - Name: `source-maps`
   - Scopes: ✅ `project:releases`, ✅ `project:write`
3. **Token'ı kopyala**: `sntrys_XXXXXXXX`

---

### 3️⃣ Environment Variables Ayarla (1 dakika)

`.env.local` dosyasını aç ve şunları doldur:

```bash
# Sentry DSN (adım 1'den)
NEXT_PUBLIC_SENTRY_DSN=https://XXXX@XXXX.ingest.sentry.io/XXXX

# Organization slug (Sentry URL'den: sentry.io/organizations/{ORG}/)
SENTRY_ORG=kafkasder

# Project slug (Sentry URL'den: .../projects/{PROJECT}/)
SENTRY_PROJECT=kafkasder-panel

# Auth token (adım 2'den)
SENTRY_AUTH_TOKEN=sntrys_XXXXXXXX
```

**Kaydet!** 💾

---

### 4️⃣ Test Et (1 dakika)

```bash
# Dev server'ı başlat
npm run dev

# Yeni terminal aç ve test et
curl http://localhost:3000/api/sentry-test?type=error
```

**Sonuç:**
```json
{
  "success": true,
  "message": "Test error triggered"
}
```

**Sentry Dashboard'u kontrol et**: [https://sentry.io](https://sentry.io)
→ Projects → kafkasder-panel → Issues

1-2 dakika içinde hata görünecek! ✅

---

## ✅ BAŞARILI KURULUM KONTROL

### Test 1: Browser Test
1. Git: `http://localhost:3000/api/sentry-test?type=message`
2. Console'da göreceksin: `[Sentry] Event sent successfully`

### Test 2: Sentry Dashboard
1. [Sentry Dashboard](https://sentry.io) → Issues
2. "Test API error from sentry-test endpoint" hatası görünmeli

### Test 3: Source Maps (Production'da)
```bash
npm run build
```
Build log'da göreceksin:
```
✓ Uploading source maps to Sentry...
```

---

## 🚀 Production Deployment

### Render.com'da

1. **Render Dashboard** → **kafkasder-panel** → **Environment**
2. **Ekle**:
   ```
   NEXT_PUBLIC_SENTRY_DSN = https://...
   SENTRY_ORG = kafkasder
   SENTRY_PROJECT = kafkasder-panel
   SENTRY_AUTH_TOKEN = sntrys_... (sync: false)
   ```
3. **Deploy**:
   ```bash
   git push origin master
   ```

---

## 🎯 Kullanım Örnekleri

### Client-side
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // kod
} catch (error) {
  Sentry.captureException(error)
}
```

### Server-side
```typescript
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // API kod
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için: **`docs/SENTRY_KURULUM.md`**

---

## 🆘 Sorun mu var?

### Sentry'de hata görünmüyor?

1. **DSN kontrolü**:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```
   Boş ise `.env.local` dosyasını kontrol et.

2. **Server'ı yeniden başlat**:
   ```bash
   npm run dev
   ```

3. **Test et**:
   ```bash
   curl http://localhost:3000/api/sentry-test?type=error
   ```

4. **Console log kontrol**:
   Browser console'da `[Sentry]` logları görmen gerekiyor.

### Hala çalışmıyor?

- `docs/SENTRY_KURULUM.md` dosyasını oku (detaylı troubleshooting)
- Sentry docs: [https://docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Kurulum tamamlandı!** 🎉

Sentry artık tüm hataları izliyor ve production'da source map'lerle birlikte okunabilir stack trace'ler sunuyor.
