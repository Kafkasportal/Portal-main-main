# 🚀 KafkasDer Yönetim Paneli

Modern, hızlı ve kullanıcı dostu yönetim paneli. Next.js 16, TypeScript ve Tailwind CSS v4 ile geliştirilmiştir.

[![CI](https://github.com/Kafkasportal/Portal-main/actions/workflows/ci.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kafkasportal/Portal-main/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/codeql.yml)
[![Playwright Tests](https://github.com/Kafkasportal/Portal-main/actions/workflows/playwright.yml/badge.svg)](https://github.com/Kafkasportal/Portal-main/actions/workflows/playwright.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Özellikler

### 🎯 Ana Özellikler
- **📊 Dashboard:** Verilerin görselleştirilmesi ve genel durum takibi
- **📋 Veri Yönetimi:** TanStack Table ile gelişmiş filtreleme ve sıralama
- **📄 Excel Entegrasyonu:** Veri içe/dışa aktarma
- **📱 Responsive Tasarım:** Mobil ve masaüstü uyumlu arayüz
- **🌙 Dark Mode:** Otomatik tema desteği
- **🔍 Komut Paleti:** Hızlı navigasyon ve arama (Ctrl+K)
- **📷 QR Kod Tarayıcı:** Kumbara kod tarama
- **🔔 Bildirim Sistemi:** Real-time bildirimler

### 👥 Kullanıcı Yönetimi
- **👤 Üye Yönetimi:** Aktif, onursal ve genç üyeler
- **📊 Sosyal Yardım:** Başvurular, ödemeler ve istatistikler
- **💰 Bağış Yönetimi:** Nakit, havale ve kart ödemeleri
- **🏦 Kumbara Sistemi:** QR kod ile konum ve doluluk takibi
- **🏥 Hastane Sevk:** Tedavi takibi ve randevu yönetimi

### 🔧 Teknik Özellikler
- **⚡ Performans:** Turbopack ile hızlı build
- **🔒 Güvenlik:** CodeQL güvenlik taraması, RLS, CSRF koruması
- **🧪 Test:** Vitest (unit) ve Playwright (E2E) testleri
- **📱 PWA:** Progressive Web App desteği
- **♿ Erişilebilirlik:** WCAG 2.1 uyumlu
- **📊 Monitoring:** Sentry ile hata takibi
- **🔄 MCP Entegrasyonu:** Supabase, GitHub, Filesystem ve Sentry MCP server'ları

---

## 🛠️ Teknoloji Yığını

### 🎨 Frontend
- **Framework:** Next.js 16 (App Router)  
- **Language:** TypeScript 5.9
- **UI Library:** React 19, shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS v4
- **State (Client):** Zustand 5.0.9
- **State (Server):** TanStack Query 5.90.12
- **State (URL):** nuqs
- **Forms:** React Hook Form 7.69.0 + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

### 🗄️ Backend & Database
- **BaaS:** Supabase 2.89.0
- **Database:** PostgreSQL 17.6.1
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime
- **RLS:** Row Level Security (tüm tablolarda aktif)
- **Migrations:** Supabase migrations (26+ migration dosyası)

### 🧪 Testing & Quality
- **Unit Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript (strict mode)
- **Code Quality:** SonarCloud
- **Security Scanning:** SonarCloud + CodeQL

### 🚀 DevOps & Deployment
- **CI/CD:** GitHub Actions
- **Hosting:** Render.com (Production)
- **Monitoring:** Sentry (Error tracking & performance)
- **Secret Management:** Environment variables
- **MCP Servers:** Supabase, GitHub, Filesystem, Sentry

---

## 📋 Kurulum

### 🔧 Gereksinimler
- Node.js 20+
- npm v10+ veya pnpm
- Git
- Supabase hesabı (ücretsiz)

### 🚀 Hızlı Başlangıç

#### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/Kafkasportal/Portal-main.git
cd Portal-main
```

#### 2. Bağımlılıkları Yükleyin

```bash
npm install
# veya
pnpm install
```

#### 3. Environment Değişkenlerini Ayarlayın

```bash
# Environment template'ı kopyalayın
cp .env.example .env.local

# .env.local dosyasını düzenleyin
nano .env.local
```

Gerekli değişkenler:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sentry (opsiyonel ama önerilir)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=false
```

#### 4. Veritabanını Hazırlayın

```bash
# Tüm migration'ları Supabase'e uygulayın
npm run db:migrate

# Test verilerini yükleyin (opsiyonel)
npm run db:seed
```

#### 5. MCP Sunucularını Yapılandırın (Opsiyonel)

MCP (Model Context Protocol) AI agent'lerinin dış kaynaklara erişimini sağlar.

```bash
# GitHub Token oluşturun (GitHub MCP için)
# https://github.com/settings/tokens → Generate new token (classic)
# İzinler: repo, workflow, read:org

# .env.local dosyasına ekleyin
GITHUB_TOKEN=ghp_your_token_here

# Sentry Auth Token (Sentry MCP için - opsiyonel)
# https://sentry.io/settings/auth-tokens/
SENTRY_AUTH_TOKEN=your_sentry_token_here
```

Detaylı MCP kurulumu için: [docs/MCP.md](docs/MCP.md)

#### 6. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacak.

---

## 📁 Proje Yapısı

```
Portal-main-main/
├── docs/                          # 📘 Dokümantasyon
│   ├── AGENTS.md                # AI Agent rehberi
│   ├── CONTRIBUTING.md           # Katılım kılavuzu
│   ├── DEVELOPMENT.md            # Geliştirici rehberi
│   ├── PRODUCTION.md             # Deployment rehberi
│   ├── SECURITY.md               # Güvenlik kılavuzu
│   ├── TESTING.md                # Test rehberi
│   └── USER_GUIDE.md            # Kullanıcı kılavuzu
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Public auth routes (giris, kayit)
│   │   ├── (dashboard)/         # Protected routes (sidebar layout)
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React bileşenleri
│   │   ├── analytics/            # Analytics components
│   │   ├── features/            # Modül bazlı bileşenler
│   │   ├── layout/              # Layout bileşenleri
│   │   ├── shared/              # Yeniden kullanılabilirler
│   │   └── ui/                 # shadcn/ui bileşenleri
│   │
│   ├── hooks/                    # Özel React hooks
│   ├── lib/                      # Utility ve configuration
│   │   ├── services/            # İş mantığı servisleri
│   │   ├── supabase/            # Supabase client/server
│   │   └── utils.ts             # Genel utility'ler
│   │
│   ├── stores/                   # Zustand store'ları
│   ├── types/                    # TypeScript tipleri
│   └── providers/                # React provider'ları
│
├── supabase/
│   ├── migrations/               # Database migrations (26+ files)
│   └── functions/                # Edge functions
│
├── tests/                       # Playwright E2E tests
├── scripts/                      # Utility scripts
├── public/                      # Static assets
├── .env.example                 # Environment template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── package.json                 # Dependencies
└── LICENSE                      # MIT License
```

---

## 🧪 Testler

### Çalıştırma

```bash
# Unit tests
npm test

# Unit tests (CI mode)
npm run test:run

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests (debug)
npm run test:e2e:debug
```

### Test Kapsamı

| Kategori | Mevcut | Hedef |
|----------|---------|-------|
| Validators | 95% | 95% ✅ |
| Utilities | 90% | 90% ✅ |
| Services | 0% | 80% |
| Hooks | 0% | 70% |
| Components | 0% | 60% |
| **TOPLAM** | ~5% | **70%** |

---

## 📚 Dokümantasyon

### Geliştiriciler İçin
- **[Agent Guide](docs/AGENTS.md)** - AI agent'leri için rehber
- **[MCP Guide](docs/MCP.md)** - Model Context Protocol entegrasyonu
- **[Contributing](docs/CONTRIBUTING.md)** - Katılım kılavuzu
- **[Development](docs/DEVELOPMENT.md)** - Geliştirici rehberi (detaylı)
- **[Security](docs/SECURITY.md)** - Güvenlik best practices
- **[Testing](docs/TESTING.md)** - Test stratejileri
- **[Production](docs/PRODUCTION.md)** - Deployment ve monitoring

### Kullanıcılar İçin
- **[User Guide](docs/USER_GUIDE.md)** - Kullanım kılavuzu (Türkçe)

---

## 🚀 Deployment

### Render.com (Production)

```bash
# GitHub Actions ile otomatik deployment
# .github/workflows/deploy.yml dosyasını kontrol edin
```

Manual deployment için:

1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. **New** → **Blueprint** seçin
3. Repository'yi bağlayın: `https://github.com/Kafkasportal/Portal-main`
4. `render.yaml` dosyası otomatik algılanacak
5. Environment değişkenlerini ayarlayın
6. Deploy edin!

Environment değişkenleri:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug
SENTRY_AUTH_TOKEN=your_auth_token
```

Detaylı kurulum için: [docs/PRODUCTION.md](docs/PRODUCTION.md)

---

## 🛡️ Güvenlik

- ✅ **Row Level Security (RLS)** - Tüm tablolarda aktif
- ✅ **CSRF Protection** - Token tabanlı CSRF validasyonu
- ✅ **XSS Protection** - React XSS koruması + CSP headers
- ✅ **Input Validation** - Zod schemas ile validasyon
- ✅ **Secret Management** - Environment variables kullanımı
- ✅ **SQL Injection Protection** - Prepared statements
- ✅ **Security Headers** - CSP, XSS protection, frame options
- ✅ **Automated Scanning** - SonarCloud + CodeQL

Güvenlik detayları için: [docs/SECURITY.md](docs/SECURITY.md)

---

## 🤝 Katkıda Bulunma

Katkıda bulunmak için [CONTRIBUTING.md](docs/CONTRIBUTING.md) dosyasını okuyun.

### Hızlı Başlangıç
1. Issue oluşturun veya mevcut bir issue'ya assign olun
2. Branch oluşturun: `git checkout -b feature/your-feature`
3. Değişikliklerinizi yapın
4. Testleri geçtiğinden emin olun: `npm run test`
5. Pull Request oluşturun

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

## 🙏 Teşekkür

- [Next.js](https://nextjs.org/) ekibine
- [Supabase](https://supabase.com/) ekibine
- [shadcn/ui](https://ui.shadcn.com/) ekibine
- Tüm katkıda bulunanlara 🚀

---

## 📞 İletişim

- **GitHub Issues:** [Bug reports & Feature requests](https://github.com/Kafkasportal/Portal-main/issues)
- **Discussions:** [General questions](https://github.com/Kafkasportal/Portal-main/discussions)
- **Email:** info@kafkasder.org

---

## 🚨 Destek & Hata Raporlama

### Production Hataları

Production ortamında oluşan hatalar otomatik olarak [Sentry](https://sentry.io) üzerinden takip edilir.

Sentry Dashboard:
- **Issues**: Yakalanan hatalar
- **Performance**: Performans metrikleri
- **Alerts**: Uyarı kuralları

### Sorun Giderme

Sorun yaşadığınızda:
1. [Dokümantasyonu](docs) inceleyin
2. [GitHub Issues](https://github.com/Kafkasportal/Portal-main/issues) arayın
3. Sentry dashboard'ı kontrol edin
4. System yöneticinize bildirin

---

<div align="center">
  <p><strong>KafkasDer Derneği © 2025</strong></p>
  <p>Yapılan her bağış, toplumumuza umut olur 🌟</p>
  <p>
    <a href="https://github.com/Kafkasportal/Portal-main/issues">Report Bug</a> •
    <a href="https://github.com/Kafkasportal/Portal-main/discussions">Ask Question</a> •
    <a href="docs/USER_GUIDE.md">User Guide</a>
  </p>
</div>
