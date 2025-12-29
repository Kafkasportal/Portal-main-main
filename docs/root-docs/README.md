# 🚀 KafkasDer Yönetim Paneli

[![CI](https://github.com/Kafkasportal/Portal-main/actions/workflows/ci.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kafkasportal/Portal-main/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/codeql.yml)
[![Playwright Tests](https://github.com/Kafkasportal/Portal-main/actions/workflows/playwright.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/playwright.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

KafkasDer için geliştirilmiş modern, hızlı ve kullanıcı dostu yönetim paneli. Next.js 16, TypeScript ve Tailwind CSS v4 ile geliştirilmiştir.

## ✨ Özellikler

### 🎯 Ana Özellikler
- **📊 Dashboard:** Verilerin görselleştirilmesi ve genel durum takibi
- **📋 Veri Yönetimi:** TanStack Table ile gelişmiş filtreleme ve sıralama
- **📄 Excel Entegrasyonu:** Veri içe/dışa aktarma
- **📱 Responsive Tasarım:** Mobil ve masaüstü uyumlu arayüz
- **🌙 Dark Mode:** Otomatik tema desteği
- **🔍 Komut Paleti:** Hızlı navigasyon ve arama
- **📷 QR Kod Tarayıcı:** Kumbara kod tarama
- **🔔 Bildirim Sistemi:** Real-time notifications

### 👥 Kullanıcı Yönetimi
- **👤 Üye Yönetimi:** Aktif, onursal ve genç üyeler
- **📊 Sosyal Yardım:** Başvurular, ödemeler ve istatistikler
- **💰 Bağış Yönetimi:** Nakit, havale ve kart ödemeleri
- **🏦 Kumbara Sistemi:** QR kod entegrasyonu

### 🔧 Teknik Özellikler
- **⚡ Performans:** Turbopack ile hızlı build
- **🔒 Güvenlik:** CodeQL güvenlik taraması
- **🧪 Test:** Unit ve E2E testler
- **📱 PWA:** Progressive Web App desteği
- **♿ Erişilebilirlik:** WCAG 2.1 uyumlu

## 🛠️ Teknoloji Yığını

### 🎨 Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI / Shadcn UI
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

### 🗄️ Backend & Database
- **Database:** Supabase (PostgreSQL 17)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime
- **RLS:** Row Level Security (optimized)
- **Migrations:** Supabase migrations

### 🧪 Testing & Quality
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript

### 🚀 DevOps & Deployment
- **CI/CD:** GitHub Actions
- **Security:** CodeQL Analysis
- **Dependencies:** Dependabot
- **Hosting:** Render.com (Production)
- **Database:** Supabase (PostgreSQL)
- **MCP Integration:** Supabase & GitHub MCP servers
- **Monitoring:** Sentry (optional)

## 📋 Kurulum

### 🔧 Gereksinimler
- Node.js 20+
- npm veya yarn
- Git

### 🚀 Hızlı Başlangıç

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/Kafkasportal/Portal-main.git
   cd Portal-main
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env.local
   # .env.local dosyasını düzenleyin
   ```
   
   Gerekli değişkenler:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Veritabanını hazırlayın:**
   ```bash
   # Supabase projesi oluşturun ve bağlantı bilgilerini .env.local'a ekleyin
   npm run db:migrate
   ```

5. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   
   Uygulama http://localhost:3000 adresinde çalışacak.

6. **Test verilerini yükleyin (opsiyonel):**
   ```bash
   npm run db:seed
   ```

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client
│   ├── mock-data.ts      # Mock data for development
│   └── validators.ts     # Zod validation schemas
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🧪 Testler

### 🏃‍♂️ Çalıştırma
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### 📊 Coverage Raporu
Test coverage raporları `coverage/` klasöründe oluşturulur.

## 🚀 Deployment

### Render.com (Production)
1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. **New** → **Blueprint** seçin
3. Repository'yi bağlayın: `https://github.com/Kafkasportal/Portal-main`
4. `render.yaml` dosyası otomatik algılanacak
5. Environment değişkenlerini ayarlayın (Supabase keys)
6. Deploy edin!

Detaylı kurulum için: [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)

### Manuel Deployment
```bash
# Production build
npm run build

# Production server
npm start
```

### Supabase Migration
```bash
# Migration'ları uygula
npm run db:migrate

# Test verilerini yükle (development)
npm run db:seed
```

## 🔍 Sentry Hata Takibi

Bu proje [Sentry](https://sentry.io) ile entegre edilmiştir. Sentry, production ortamında oluşan hataları otomatik olarak yakalar ve raporlar.

### Özellikler

- ✅ Otomatik hata yakalama (client & server)
- ✅ Kullanıcı bağlamı (login olan kullanıcı bilgisi hatalara eklenir)
- ✅ Source map desteği (production hatalarında orijinal kaynak kodu satırları görünür)
- ✅ PII koruması (hassas veriler filtrelenir)
- ✅ Ortam ayrımı (development/production)

### Kurulum

1. **Sentry Hesabı Oluşturma**
   - [sentry.io](https://sentry.io) adresine gidin
   - Hesap oluşturun ve yeni bir proje oluşturun (Next.js seçin)
   - Proje ayarlarından DSN değerini kopyalayın

2. **Ortam Değişkenlerini Yapılandırma**

   `.env.local` dosyasına ekleyin:
   ```bash
   # Sentry Yapılandırması
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
   SENTRY_ORG=your-organization-slug
   SENTRY_PROJECT=your-project-slug
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

   | Değişken | Açıklama | Nerede Bulunur |
   |----------|----------|----------------|
   | `NEXT_PUBLIC_SENTRY_DSN` | Sentry proje DSN'i | Sentry → Project Settings → Client Keys |
   | `SENTRY_ORG` | Organizasyon slug'ı | Sentry → Settings → Organization |
   | `SENTRY_PROJECT` | Proje slug'ı | Sentry → Settings → Projects |
   | `SENTRY_AUTH_TOKEN` | Auth token (source map upload için) | Sentry → Settings → Auth Tokens (project:releases scope) |

3. **Production Deployment (Render/GitHub Actions)**

   GitHub repository secrets'a ekleyin:
   - `SENTRY_AUTH_TOKEN`

   Render environment variables'a ekleyin:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`

### Hata Takibini Test Etme

Development ortamında hata takibini test etmek için:

```bash
npm run dev
# Tarayıcıda http://localhost:3000/test-sentry adresine gidin
```

Test sayfasında farklı hata türlerini tetikleyebilirsiniz:
- Client-side error
- Manual Sentry capture
- Unhandled promise rejection
- Type error
- Async error
- Test message

### Sentry Dashboard

Hataları görüntülemek için [Sentry Dashboard](https://sentry.io)'a gidin:
- **Issues** → Yakalanan hatalar
- **Performance** → Performans metrikleri
- **Alerts** → Uyarı kuralları

### Yapılandırma Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `sentry.client.config.ts` | Client-side Sentry yapılandırması |
| `sentry.server.config.ts` | Server-side Sentry yapılandırması |
| `sentry.edge.config.ts` | Edge runtime Sentry yapılandırması |
| `instrumentation.ts` | Next.js instrumentation hook |

### Notlar

- **DSN olmadan**: DSN yapılandırılmamışsa Sentry sessizce devre dışı kalır
- **Development**: Development ortamında %100 sample rate
- **Production**: Production ortamında %10 sample rate (performans için)
- **Kullanıcı bağlamı**: Giriş yapan kullanıcının ID, email ve rolü otomatik olarak hatalara eklenir

## 🤝 Katkıda Bulunma

Katkıda bulunmak için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

### 📋 Hızlı Başlangıç
1. Issue oluşturun veya mevcut bir issue'ya assign olun
2. Branch oluşturun: `git checkout -b feature/your-feature`
3. Değişikliklerinizi yapın
4. Testlerin geçtiğinden emin olun: `npm run test`
5. Pull Request oluşturun

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkür

- [Next.js](https://nextjs.org/) ekibine
- [Supabase](https://supabase.com/) ekibine
- [shadcn/ui](https://ui.shadcn.com/) ekibine
- Tüm katkıda bulunanlara 🚀

## 📞 İletişim

- **GitHub Issues:** [Bug reports & Feature requests](https://github.com/Kafkasportal/Portal-main/issues)
- **Discussions:** [General questions](https://github.com/Kafkasportal/Portal-main/discussions)
- **Email:** info@kafkasder.org

## 📚 Dokümantasyon

- [Backend Configuration Report](docs/BACKEND_CONFIG_REPORT.md)
- [Backend Optimization Results](docs/BACKEND_OPTIMIZATION_RESULTS.md)
- [GitHub MCP Setup](docs/GITHUB_MCP_SETUP.md)
- [Render Deployment Guide](docs/RENDER_DEPLOYMENT.md)
- [Supabase Setup](docs/SUPABASE_SETUP.md)

---

<div align="center">
  <p><strong>KafkasDer Derneği © 2024</strong></p>
  <p>Yapılan her bağış, toplumumuza umut olur 🌟</p>
</div>
