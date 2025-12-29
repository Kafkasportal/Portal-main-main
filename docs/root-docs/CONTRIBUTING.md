# 🤝 Contributing to Kafkasder Yönetim Paneli

Teşekkürler katkıda bulunmak istediğiniz için! Bu belge, projeye katkıda bulunma sürecini açıklar.

## 📋 Ön Koşullar

- Node.js 20+
- npm veya yarn
- Git
- VS Code (önerilen)

## 🚀 Başlangıç

1. **Repository'yi forklayın**
   ```bash
   git clone https://github.com/your-username/Portal.git
   cd Portal
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

4. **Kod kalitesi kontrolü**
   ```bash
   npm run lint
   npm run build
   ```

## 🛠️ Development Workflow

### 🔄 Branch Strategy
- `main`: Production branch
- `feature/`: Yeni özellikler için
- `bugfix/`: Bug fix'ler için
- `hotfix/`: Acil düzeltmeler için

### 📝 Commit Convention
```bash
type(scope): description

# Örnekler:
feat(auth): add login functionality
fix(ui): resolve sidebar collapse issue
docs(readme): update installation instructions
refactor(api): optimize database queries
test(e2e): add user registration tests
```

### 🎯 Pull Request Process

1. **Branch oluşturun**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Değişikliklerinizi yapın**
   - Kod yazın
   - Testler ekleyin
   - Dokümantasyon güncelleyin

3. **Test edin**
   ```bash
   npm run lint
   npm run build
   npm run test
   ```

4. **Commit yapın**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push yapın**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Pull Request oluşturun**
   - GitHub'da PR oluşturun
   - PR template'ını doldurun
   - Review için bekleyin

## 📏 Code Standards

### 🎨 TypeScript
- Strict mode enabled
- Explicit types kullanın, `any` kullanmayın
- Interface'leri PascalCase ile adlandırın

### ⚛️ React
- Functional components ve hooks kullanın
- Component isimlerini PascalCase ile adlandırın
- Props'ları interface ile tanımlayın

### 🧪 Testing
- Unit testler için Jest
- E2E testler için Playwright
- Test coverage %80+ hedefleyin

### 📚 Documentation
- JSDoc comments kullanın
- README dosyalarını güncel tutun
- API değişikliklerini dokümante edin

## 🔧 Scripts

```bash
# Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server

# Quality
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript check

# Testing
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run test:ui      # Visual regression tests

# Database
npm run db:generate  # Prisma generate
npm run db:push      # Database schema push
npm run db:migrate   # Database migration
```

## 🎭 Environment Variables

Development için `.env.local` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_USE_MOCK_API="true"
```

## 🐛 Bug Reports

Bug bildirirken:
- Adım adım reproduction steps verin
- Environment bilgilerini ekleyin
- Screenshots ekleyin
- Console log'larını ekleyin

## ✨ Feature Requests

Yeni özellik önerileri için:
- Kullanım senaryosunu açıklayın
- Mockup'lar ekleyin
- Teknik gereksinimleri belirtin

## 📞 Communication

- **Issues**: Bug reports ve feature requests
- **Discussions**: Genel sorular ve tartışmalar
- **Pull Requests**: Code review ve contributions

## 📜 License

Bu proje MIT lisansı altında lisanslanmıştır. Katkıda bulunarak, kodunuzun aynı lisans altında yayınlanacağını kabul etmiş olursunuz.

## 🙏 Acknowledgments

Katkıda bulunan tüm geliştiricilere teşekkürler! 🚀