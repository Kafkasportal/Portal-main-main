# Test Dokümantasyonu

Bu proje **Vitest** kullanarak test edilmektedir.

## 🚀 Kurulum

Test bağımlılıklarını yükleyin:

```bash
npm install
```

## 📝 Test Komutları

### Test Çalıştırma

```bash
# Tüm testleri çalıştır (watch mode)
npm test

# Testleri bir kez çalıştır (CI için)
npm run test:run

# UI ile testleri çalıştır
npm run test:ui

# Coverage raporu ile testleri çalıştır
npm run test:coverage
```

## 📊 Mevcut Test Kapsamı

### ✅ Test Edilmiş Modüller

1. **Validators** (`src/lib/validators.test.ts`)
   - 19 test case
   - Kapsam: Phone, Email, TC Kimlik, Donation, Member schemas

2. **Utilities** (`src/lib/utils.test.ts`)
   - 34 test case
   - Kapsam: formatCurrency, formatPhoneNumber, generateId, truncate, getInitials

### 📈 Toplam İstatistik

- **Toplam Test:** 53
- **Test Dosyası:** 2
- **Hedef Coverage:** %70+

## 🧪 Test Yazma Rehberi

### Yeni Test Dosyası Oluşturma

Test dosyaları, test edilecek dosyanın yanına `.test.ts` veya `.test.tsx` uzantısı ile oluşturulur:

```
src/
  lib/
    utils.ts
    utils.test.ts  ← Test dosyası
```

### Test Örneği

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should return expected output', () => {
    expect(myFunction('input')).toBe('expected')
  })

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toThrow()
  })
})
```

### Component Testi Örneği

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

## 📦 Gelecek Test Planı

### Öncelik 1 (Haftaya)
- [ ] Service layer testleri (donations, members, beneficiaries)
- [ ] Mapper testleri (database transformations)
- [ ] Hook testleri (useApi, useScanSync)

### Öncelik 2 (2 Hafta)
- [ ] Component testleri (UI components, forms)
- [ ] Integration testleri (full workflows)

### Öncelik 3 (Uzun Vade)
- [ ] E2E testleri (Playwright)
- [ ] Visual regression testleri
- [ ] Performance testleri

## 🎯 Test Coverage Hedefleri

| Kategori | Mevcut | Hedef |
|----------|--------|-------|
| Validators | %95 | %95 ✅ |
| Utilities | %90 | %90 ✅ |
| Services | %0 | %80 |
| Hooks | %0 | %70 |
| Components | %0 | %60 |
| **TOPLAM** | **~5%** | **70%** |

## 🐛 Hata Ayıklama

### Test başarısız oluyor

```bash
# Detaylı log ile çalıştır
npm test -- --reporter=verbose

# Tek bir test dosyasını çalıştır
npm test validators.test.ts

# Tek bir test case çalıştır
npm test -t "validates Turkish phone numbers"
```

### Coverage raporu göremiyorum

```bash
# Coverage HTML raporu oluştur
npm run test:coverage

# Raporu aç
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## 📚 Kaynaklar

- [Vitest Dokümantasyonu](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## ✅ CI/CD Entegrasyonu

Test'ler GitHub Actions veya CI/CD pipeline'ında şu şekilde çalıştırılabilir:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

---

**Not:** Test yazmaya devam ettikçe bu dokümantasyon güncellenecektir.
