# 🚀 KafkasDer Yönetim Paneli

[![CI](https://github.com/Kafkasportal/Portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Kafkasportal/Portal/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/codeql.yml)
[![Playwright Tests](https://github.com/Kafkasportal/Portal/actions/workflows/playwright.yml/badge.svg)](https://github.com/Kafkasportal/Portal/actions/workflows/playwright.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

KafkasDer için geliştirilmiş modern yönetim paneli. Next.js 16, TypeScript ve Tailwind CSS v4 ile geliştirilmiştir.

## ✨ Özellikler

- **📊 Dashboard** - İstatistikler ve genel durum takibi
- **👥 Üye Yönetimi** - Dernek üyelerinin profili ve aidat takibi
- **💰 Bağış Yönetimi** - Nakit, havale ve kredi kartı bağışları
- **🏦 Kumbara Sistemi** - QR kodlu akıllı kumbara yönetimi
- **🤲 Sosyal Yardım** - İhtiyaç sahipleri, başvurular ve ödemeler
- **📈 Raporlama** - Detaylı istatistikler ve Excel export
- **🔐 Rol Tabanlı Yetkilendirme** - Admin, muhasebe, görevli, üye

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4.0 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **State:** Zustand + TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Excel:** ExcelJS
- **QR Code:** @zxing/library

## 📋 Kurulum

### Gereksinimler
- Node.js 20+
- npm veya yarn

### Hızlı Başlangıç

```bash
# 1. Repository'yi klonlayın
git clone https://github.com/Kafkasportal/Portal.git
cd Portal

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment değişkenlerini ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# 4. Supabase'i kurun
# Detaylı bilgi için: docs/SUPABASE_SETUP.md

# 5. Geliştirme sunucusunu başlatın
npm run dev
```

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Dashboard pages
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Sidebar, Header
│   ├── shared/           # DataTable, StatCard
│   └── features/         # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client
│   └── supabase-service.ts # CRUD operations
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

## 🧪 Testler

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Komutlar

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run build:analyze    # Bundle analysis

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript check

# Database
npm run db:push          # Push schema to Supabase
npm run db:seed          # Seed test data
```

## 📚 Dokümantasyon

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Teknik mimari, proje yapısı
- **[WORKFLOW.md](./WORKFLOW.md)** - İş akışları, kullanıcı senaryoları
- **[DATA_MODEL.md](./DATA_MODEL.md)** - Veri modelleri, entity'ler
- **[docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)** - Supabase kurulumu
- **[CLAUDE.md](./CLAUDE.md)** - Geliştirme rehberi
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performans optimizasyonları

## 🚀 Deployment

### Vercel (Önerilen)

1. [Vercel](https://vercel.com)'a bağlanın
2. Repository'yi import edin
3. Environment değişkenlerini ayarlayın
4. Deploy edin

### Manuel Deployment

```bash
npm run build
npm start
```

## 🤝 Katkıda Bulunma

1. Issue oluşturun
2. Branch oluşturun: `git checkout -b feature/your-feature`
3. Değişikliklerinizi yapın
4. Testleri çalıştırın: `npm run test`
5. Pull Request oluşturun

## 📜 Lisans

MIT License - [LICENSE](LICENSE)

## 📞 İletişim

- **GitHub Issues:** [Bug reports & Feature requests](https://github.com/Kafkasportal/Portal/issues)
- **Email:** info@kafkasder.org

---

<div align="center">
  <p><strong>KafkasDer Derneği © 2024</strong></p>
  <p>Yapılan her bağış, toplumumuza umut olur 🌟</p>
</div>
