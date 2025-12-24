# 🚀 KafkasDer Yönetim Paneli

[![CI](https://github.com/Kafkasportal/Portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kafkasportal/Portal/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/codeql.yml)
[![Playwright Tests](https://github.com/Kafkasportal/Portal/actions/workflows/playwright.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/playwright.yml)
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
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime

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
- **Hosting:** Vercel
- **Monitoring:** Sentry (optional)

## 📋 Kurulum

### 🔧 Gereksinimler
- Node.js 20+
- npm veya yarn
- Git

### 🚀 Hızlı Başlangıç

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/Kafkasportal/Portal.git
   cd Portal
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

4. **Veritabanını hazırlayın:**
   ```bash
   # Supabase projesi oluşturun ve bağlantı bilgilerini .env.local'a ekleyin
   npm run db:push
   ```

5. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

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

### Vercel (Önerilen)
1. [Vercel](https://vercel.com)'a bağlanın
2. Repository'yi import edin
3. Environment değişkenlerini ayarlayın
4. Deploy edin!

### Manuel Deployment
```bash
# Production build
npm run build

# Production server
npm start
```

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

- **GitHub Issues:** [Bug reports & Feature requests](https://github.com/Kafkasportal/Portal/issues)
- **Discussions:** [General questions](https://github.com/Kafkasportal/Portal/discussions)
- **Email:** info@kafkasder.org

---

<div align="center">
  <p><strong>KafkasDer Derneği © 2024</strong></p>
  <p>Yapılan her bağış, toplumumuza umut olur 🌟</p>
</div>
