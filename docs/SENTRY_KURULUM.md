# 🛡️ Sentry Kurulum ve Kullanım Rehberi

Bu dokümantasyon, KafkasDer Yönetim Paneli'nde Sentry error tracking sisteminin nasıl kurulacağını ve kullanılacağını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Sentry Hesabı Oluşturma](#sentry-hesabı-oluşturma)
3. [Environment Variables Ayarlama](#environment-variables-ayarlama)
4. [Sentry Test Etme](#sentry-test-etme)
5. [Production Deployment](#production-deployment)
6. [Kullanım Örnekleri](#kullanım-örnekleri)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

### Sentry Nedir?

**Sentry**, gerçek zamanlı hata izleme (error tracking) ve performans izleme (performance monitoring) platformudur. Projemizde:

- ✅ **Client-side errors**: Tarayıcıda oluşan hatalar
- ✅ **Server-side errors**: API route'larında ve server component'lerde oluşan hatalar
- ✅ **Edge runtime errors**: Edge functions'da oluşan hatalar
- ✅ **Performance monitoring**: Sayfa yükleme süreleri, API response time'ları
- ✅ **Release tracking**: Deploy'lar ile ilişkilendirilmiş hata takibi
- ✅ **Source maps**: Production'da okunabilir stack trace'ler

### Mevcut Yapılandırma

Projenizde Sentry **zaten yapılandırılmış** durumda:

- ✅ `@sentry/nextjs` v10.32.1 yüklü
- ✅ Client config: `sentry.client.config.ts`
- ✅ Server config: `sentry.server.config.ts`
- ✅ Edge config: `sentry.edge.config.ts`
- ✅ Next.js integration: `next.config.ts`
- ✅ Test endpoint: `/api/sentry-test`

**Tek yapmanız gereken:** Environment variables'ları ayarlamak!

---

## 🚀 Sentry Hesabı Oluşturma

### Adım 1: Hesap ve Organization Oluşturma

1. **Sentry.io'ya gidin**: [https://sentry.io/signup/](https://sentry.io/signup/)
2. **Kayıt olun**: GitHub ile veya email ile
3. **Organization oluşturun**:
   - İsim: `KafkasDer` veya `Kafkasportal`
   - URL slug: `kafkasder` (bu değeri not edin!)

### Adım 2: Proje Oluşturma

1. **Dashboard'da** → **"Create Project"** butonuna tıklayın
2. **Platform seçin**: **Next.js**
3. **Alert frequency**: `On every new issue`
4. **Proje adı**: `kafkasder-panel`
5. **Team**: Default team (veya yeni team oluşturun)
6. **"Create Project"** butonuna tıklayın

### Adım 3: DSN'i Kopyalayın

Proje oluşturulduktan sonra **DSN (Data Source Name)** gösterilir:

```
https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
```

**Örnek:**
```
https://a1b2c3d4e5f6@o123456.ingest.sentry.io/7654321
```

Bu DSN'i güvenli bir yere kaydedin! 📝

### Adım 4: Auth Token Oluşturma

#### Source Map Upload Token (Zorunlu)

1. **Profil resmi** → **Settings** → **Account** → **API** → **Auth Tokens**
2. **"Create New Token"**
3. **Token ayarları**:
   ```
   Name: kafkasder-source-maps
   Scopes:
     ✅ project:read
     ✅ project:releases (zorunlu!)
     ✅ project:write
     ✅ org:read
   ```
4. **"Create Token"** → Token'ı kopyalayın (bir daha gösterilmeyecek!)

Token formatı: `sntrys_XXXXXXXXXXXXXXXX`

#### MCP Access Token (Opsiyonel)

AI araçlarıyla (Cursor, Conductor) Sentry entegrasyonu için:

```
Name: mcp-integration
Scopes:
  ✅ project:read
  ✅ event:read
  ✅ issue:read
```

---

## ⚙️ Environment Variables Ayarlama

### Development (Local)

`.env.local` dosyasını açın ve şu değerleri doldurun:

```bash
# ============================================
# Sentry Error Tracking
# ============================================

# DSN - Sentry Dashboard → Settings → Projects → kafkasder-panel → Client Keys (DSN)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Organization slug (Sentry URL'inizden alın)
# Örnek URL: sentry.io/organizations/kafkasder/ → slug: "kafkasder"
SENTRY_ORG=kafkasder

# Project slug (Sentry URL'inizden alın)
# Örnek URL: sentry.io/organizations/kafkasder/projects/kafkasder-panel/ → slug: "kafkasder-panel"
SENTRY_PROJECT=kafkasder-panel

# Auth token - Source map upload için
SENTRY_AUTH_TOKEN=sntrys_XXXXXXXXXXXXXXXX

# MCP Access Token (opsiyonel)
SENTRY_ACCESS_TOKEN=sntrys_XXXXXXXXXXXXXXXX
```

### Production (Render.com)

`render.yaml` dosyasına **zaten eklenmiş** ama değerler eksik:

1. **Render Dashboard** → **kafkasder-panel service** → **Environment**
2. Şu environment variable'ları ekleyin:

```yaml
NEXT_PUBLIC_SENTRY_DSN: https://your-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ORG: kafkasder
SENTRY_PROJECT: kafkasder-panel
SENTRY_AUTH_TOKEN: sntrys_XXXXXXXXXXXXXXXX (sync: false!)
```

⚠️ **Önemli**: `SENTRY_AUTH_TOKEN` için `sync: false` kullanın (güvenlik için)

---

## 🧪 Sentry Test Etme

### Test Endpoint Kullanımı

Projede `/api/sentry-test` endpoint'i hazır. 3 farklı test modu var:

#### 1. Test Message (Basit)

```bash
curl http://localhost:3000/api/sentry-test?type=message
```

**Sonuç:** Sentry'ye bir bilgi mesajı gönderilir.

#### 2. Exception (Manuel Capture)

```bash
curl http://localhost:3000/api/sentry-test?type=exception
```

**Sonuç:** Manuel olarak yakalanmış exception gönderilir.

#### 3. Error (Thrown Exception)

```bash
curl http://localhost:3000/api/sentry-test?type=error
```

**Sonuç:** Throw edilen bir exception gönderilir (en gerçekçi test).

#### 4. POST Test

```bash
curl -X POST http://localhost:3000/api/sentry-test \
  -H "Content-Type: application/json" \
  -d '{"message": "Custom test error from API"}'
```

### Development Server'ı Başlatma

1. **Environment variables'ları ayarlayın** (yukarıdaki adımlar)
2. **Dev server'ı başlatın**:
   ```bash
   npm run dev
   ```
3. **Test endpoint'ini çağırın**:
   ```bash
   curl http://localhost:3000/api/sentry-test?type=error
   ```
4. **Sentry Dashboard'u kontrol edin**:
   - [Sentry Dashboard](https://sentry.io) → Projects → kafkasder-panel → Issues
   - 1-2 dakika içinde hata görünecektir

### Browser'da Test

1. **Browser'ı açın**: `http://localhost:3000/api/sentry-test?type=error`
2. **Console'u açın**: F12 → Console
3. **Sentry debug loglarını görün**:
   ```
   [Sentry] Sending event...
   [Sentry] Event sent successfully
   ```
4. **Sentry Dashboard'u kontrol edin**

---

## 🚀 Production Deployment

### Render.com'da Deployment

#### 1. Environment Variables Ekle

**Render Dashboard** → **kafkasder-panel** → **Environment**:

```
NEXT_PUBLIC_SENTRY_DSN = https://...
SENTRY_ORG = kafkasder
SENTRY_PROJECT = kafkasder-panel
SENTRY_AUTH_TOKEN = sntrys_... (sync: false)
```

#### 2. Deploy Et

```bash
git push origin master
```

Render otomatik olarak deploy edecek.

#### 3. Source Maps Upload

Build sırasında **otomatik olarak** source map'ler Sentry'ye upload edilir.

Build loglarında göreceksiniz:
```
✓ Compiled successfully
✓ Uploading source maps to Sentry...
✓ Source maps uploaded successfully
```

#### 4. Production Test

```bash
curl https://kafkasder-panel.onrender.com/api/sentry-test?type=error
```

Sentry Dashboard'da hata görünmeli.

### Release Tracking

Her deploy otomatik olarak bir "release" oluşturur:

**Format:** `kafkasder-panel@{GIT_COMMIT_SHA}`

**Sentry'de Görüntüleme:**
- Dashboard → Releases
- Her release'de commit bilgileri, deploy zamanı ve ilişkili hatalar görünür

---

## 💡 Kullanım Örnekleri

### Client-side Error Capture

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'

export default function MyComponent() {
  const handleError = () => {
    try {
      // Hatalı kod
      throw new Error('Something went wrong!')
    } catch (error) {
      // Sentry'ye gönder
      Sentry.captureException(error, {
        tags: {
          component: 'MyComponent',
          action: 'handleError',
        },
        extra: {
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  return <button onClick={handleError}>Trigger Error</button>
}
```

### Server-side Error Capture

```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // API işlemi
    const data = await fetchData()
    return NextResponse.json(data)
  } catch (error) {
    // Sentry'ye gönder
    Sentry.captureException(error, {
      tags: { endpoint: 'my-endpoint' },
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Custom Message

```typescript
import * as Sentry from '@sentry/nextjs'

// Önemli bir olayı loglama
Sentry.captureMessage('User completed donation', {
  level: 'info',
  tags: {
    action: 'donation',
    amount: '1000',
  },
})
```

### User Context

```typescript
import * as Sentry from '@sentry/nextjs'

// Kullanıcı login olduktan sonra
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Logout'ta temizle
Sentry.setUser(null)
```

### Breadcrumbs (İz Sürme)

```typescript
import * as Sentry from '@sentry/nextjs'

// Kullanıcı aksiyonlarını izle
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked donate button',
  level: 'info',
  data: {
    amount: 500,
    currency: 'TRY',
  },
})
```

---

## 🔍 Sentry Dashboard Kullanımı

### Issues (Hatalar)

**Dashboard** → **Issues** → Tüm hatalar burada görünür

**Her issue için:**
- **Stack trace**: Hatanın oluştuğu kod satırı
- **Breadcrumbs**: Hataya giden kullanıcı aksiyonları
- **User context**: Hangi kullanıcı hatayı tetikledi
- **Environment**: Production, staging, development
- **Release**: Hangi versiyonda oluştu
- **Frequency**: Ne sıklıkla oluşuyor

### Performance

**Dashboard** → **Performance** → Performans metrikleri

- **Transaction summary**: Sayfa yükleme süreleri
- **Slow transactions**: En yavaş sayfalar
- **Database queries**: Supabase query performansı
- **API endpoints**: Endpoint response time'ları

### Releases

**Dashboard** → **Releases** → Deploy geçmişi

Her release için:
- Commit bilgileri
- Deploy zamanı
- İlişkili hatalar
- Performance değişimleri

### Alerts

**Settings** → **Alerts** → Bildirim kuralları

Örnek alert:
```
When: New issue is created
If: Environment = production
Then: Send email to admin@kafkasder.org
```

---

## 🛠️ Troubleshooting

### Problem: Sentry'de Hata Görünmüyor

**Çözümler:**

1. **DSN kontrolü**:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```
   Boş ise `.env.local` dosyasını kontrol edin.

2. **Dev server'ı yeniden başlatın**:
   ```bash
   npm run dev
   ```
   Environment variable'lar sadece başlangıçta okunur.

3. **Browser console'u kontrol edin**:
   ```
   [Sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Error tracking is disabled.
   ```
   Bu uyarı varsa DSN eksik.

4. **Test endpoint'i kullanın**:
   ```bash
   curl http://localhost:3000/api/sentry-test?type=error
   ```

### Problem: Source Maps Yüklenmiyor

**Çözümler:**

1. **Auth token kontrolü**:
   ```bash
   echo $SENTRY_AUTH_TOKEN
   ```

2. **Scope kontrolü**:
   - Token'da `project:releases` scope'u olmalı

3. **Build log kontrolü**:
   ```bash
   npm run build
   ```
   "Uploading source maps" mesajı görünmeli.

### Problem: Production'da Hatalar Filtreleniyor

Sentry config'de (`sentry.server.config.ts`) bazı hatalar filtreleniyor:

- Browser extension errors
- ResizeObserver errors
- Network timeout errors (client-side)
- ECONNRESET errors (server-side)

**Çözüm:** `beforeSend` fonksiyonunu düzenleyin.

---

## 📊 Sentry MCP Entegrasyonu

AI araçlarıyla (Conductor, Cursor) Sentry'yi doğal dil komutlarıyla kullanabilirsiniz.

### Kullanım Örnekleri

```
"Show me the most recent errors in production"
"What are the top 5 error types this week?"
"Show details for error issue #12345"
"Which user is experiencing the most errors?"
```

### Kurulum

`.env.local` dosyasına ekleyin:
```bash
SENTRY_ACCESS_TOKEN=sntrys_XXXXXXXXXXXXXXXX
```

---

## 📈 Best Practices

### 1. Hassas Veri Filtreleme

Sentry config'de **otomatik olarak filtreleniyor**:
- Passwords
- Tokens
- API keys
- Authorization headers
- Cookies

### 2. Error Grouping

Benzer hataları gruplamak için `fingerprint` kullanın:

```typescript
Sentry.captureException(error, {
  fingerprint: ['database-connection-error'],
})
```

### 3. Sampling (Production'da)

%100 sampling maliyetli olabilir. Production'da azaltın:

```typescript
// sentry.client.config.ts
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

### 4. Custom Tags

Hatalar için anlamlı tag'ler kullanın:

```typescript
tags: {
  feature: 'donations',
  action: 'create',
  user_type: 'admin',
}
```

---

## 🔗 Yararlı Linkler

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry MCP](https://docs.sentry.io/product/integrations/mcp/)

---

## ✅ Kurulum Checklist

- [ ] Sentry.io hesabı oluşturuldu
- [ ] Organization oluşturuldu (`kafkasder`)
- [ ] Proje oluşturuldu (`kafkasder-panel`)
- [ ] DSN kopyalandı
- [ ] Auth token oluşturuldu (source maps için)
- [ ] `.env.local` dosyasına credentials eklendi
- [ ] Dev server başlatıldı (`npm run dev`)
- [ ] Test endpoint çalıştırıldı (`/api/sentry-test?type=error`)
- [ ] Sentry Dashboard'da hata görüldü
- [ ] Render.com'da environment variables eklendi
- [ ] Production deploy edildi
- [ ] Production'da source maps yüklendi
- [ ] Production test edildi

---

**Son Güncelleme:** 2026-01-02
**Versiyon:** 1.0
**Yazar:** KafkasDer Tech Team
