# KafkasDer Yönetim Paneli

Kafkas Göçmenleri Derneği için geliştirilmiş modern yönetim paneli.

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
npm start
```

## 📚 Dokümantasyon

**Detaylı dokümantasyon için:** [docs/root-docs/README.md](docs/root-docs/README.md)

### Önemli Linkler

- **[Kurulum Rehberi](docs/root-docs/README.md#-kurulum)** - Adım adım kurulum
- **[Deployment](docs/RENDER.md)** - Production deployment
- **[Sentry Hata Takibi](docs/root-docs/README.md#-sentry-hata-takibi)** - Hata izleme kurulumu
- **[Katkıda Bulunma](docs/root-docs/CONTRIBUTING.md)** - Geliştirici rehberi

### Teknik Dokümantasyon

- [Backend Yapılandırma](docs/BACKEND.md)
- [Supabase Kurulum](docs/SUPABASE.md)
- [GitHub MCP Setup](docs/GITHUB_MCP_SETUP.md)
- [MCP Integration Guide](docs/MCP_INTEGRATION_GUIDE.md) - AI geliştirme araçları entegrasyonu

## 🤖 AI Development Integration

Bu proje, modern AI geliştirme araçları ile entegre çalışacak şekilde yapılandırılmıştır:

### MCP (Model Context Protocol) Desteği

- **Render MCP Server**: Infrastructure yönetimi (servisler, veritabanları, loglar)
- **GitHub MCP Server**: Repository yönetimi (issues, PRs, commits)
- **Codacy MCP Server**: Kod kalite analizi

### Kurulum

```bash
# MCP ortam değişkenlerini kontrol et
npm run mcp:check

# IDE yapılandırması (Cursor için)
npm run mcp:init:cursor

# IDE yapılandırması (VS Code için) 
npm run mcp:init:vscode
```

**Detaylı MCP kurulum için:** [docs/MCP_INTEGRATION_GUIDE.md](docs/MCP_INTEGRATION_GUIDE.md)

## 🛠️ Teknoloji Yığını

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand, TanStack Query
- **Forms**: React Hook Form + Zod
- **Error Tracking**: Sentry
- **AI Integration**: MCP (Model Context Protocol)

## 📝 Lisans

Bu proje [LICENSE](docs/root-docs/LICENSE) dosyasında belirtilen lisans altında lisanslanmıştır.
