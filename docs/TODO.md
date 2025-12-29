# KafkasDer Panel - TODO Tracking

Bu dosya, projede kalan TODO öğelerini ve gelecekte yapılması gereken iyileştirmeleri takip eder.

## 🔴 Yüksek Öncelikli (Production Öncesi)

### 1. Error Logging Integration
**Dosya**: `src/lib/error-logger.ts`
**Satırlar**: 30, 37
**Açıklama**: Sentry ve LogRocket entegrasyonları tamamlanmalı
**Durum**: ⏳ Beklemede
**Tahmini Süre**: 2-3 saat

**Adımlar**:
- [ ] Sentry SDK'yı entegre et
- [ ] LogRocket SDK'yı entegre et (opsiyonel)
- [ ] Error context mapping'i test et
- [ ] Production'da test et

**Örnek Implementation**:
```typescript
// Sentry integration
if (this.isProduction && typeof window !== 'undefined') {
  Sentry.captureException(error, {
    contexts: { react: context }
  })
}
```

### 2. Supabase RPC Migration
**Dosya**: `src/lib/supabase-service.ts`
**Satır**: 1384
**Açıklama**: Dashboard stats için RPC fonksiyonu oluştur
**Durum**: ⏳ Beklemede
**Tahmini Süre**: 4-6 saat
**Öncelik**: Orta (Performance iyileştirmesi)

**Adımlar**:
- [ ] Supabase'de `get_dashboard_stats` RPC fonksiyonu oluştur
- [ ] SQL fonksiyonunu yaz ve test et
- [ ] TypeScript type definitions güncelle
- [ ] Fallback mekanizmasını test et
- [ ] Migration dosyası oluştur

**SQL Template**:
```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Dashboard stats calculation
  SELECT json_build_object(
    'activeMembers', (SELECT COUNT(*) FROM members WHERE status = 'active'),
    -- ... diğer stats
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🟡 Orta Öncelikli (Post-Production İyileştirmeler)

### 3. Backup Implementation
**Dosya**: `src/app/(dashboard)/ayarlar/yedekleme/page.tsx`
**Satırlar**: 64, 91
**Açıklama**: Gerçek backup oluşturma ve indirme fonksiyonları
**Durum**: ⏳ Beklemede
**Tahmini Süre**: 8-10 saat
**Not**: Şu an mockup olarak çalışıyor

**Adımlar**:
- [ ] Supabase Management API araştır
- [ ] Backend endpoint oluştur (serverless function)
- [ ] Backup oluşturma fonksiyonu
- [ ] Backup storage (Supabase Storage veya S3)
- [ ] Backup download fonksiyonu
- [ ] Backup restore fonksiyonu (opsiyonel)
- [ ] Scheduled backups (cron job)

**Alternatifler**:
1. Supabase CLI ile otomatik backup
2. pg_dump kullanarak manuel backup
3. Third-party backup servisleri (dbacked.com vb.)

### 4. Custom Analytics Endpoint
**Dosya**: `src/app/web-vitals.tsx`
**Satır**: 52
**Açıklama**: Özel analytics endpoint entegrasyonu
**Durum**: ⏳ Beklemede
**Tahmini Süre**: 3-4 saat
**Öncelik**: Düşük (Google Analytics şu an aktif)

**Adımlar**:
- [ ] `/api/analytics` endpoint oluştur
- [ ] Metrics storage tasarla (Supabase table veya external service)
- [ ] Rate limiting ekle
- [ ] Dashboard için metrics visualization

## 🟢 Düşük Öncelikli (İyileştirmeler)

### 5. Code Refactoring

#### 5.1 Supabase Service Modüler Hale Getirme
**Dosya**: `src/lib/supabase-service.ts` (2307 satır - ÇOK BÜYÜK!)
**Öncelik**: Orta
**Tahmini Süre**: 12-16 saat

**Bölümleme Planı**:
```
src/lib/services/
├── members-service.ts       # Üye işlemleri
├── donations-service.ts     # Bağış işlemleri
├── kumbara-service.ts       # Kumbara işlemleri
├── beneficiary-service.ts   # İhtiyaç sahibi işlemleri
├── payments-service.ts      # Ödeme işlemleri
├── auth-service.ts          # Kimlik doğrulama
├── storage-service.ts       # Dosya yönetimi
└── index.ts                 # Re-export all
```

**Adımlar**:
- [ ] Servis dosyalarını oluştur
- [ ] Fonksiyonları kategorilere göre taşı
- [ ] Import'ları güncelle
- [ ] Testleri çalıştır ve doğrula
- [ ] Type definitions'ları düzenle

#### 5.2 API Hooks Refactoring
**Dosya**: `src/hooks/use-api.ts` (1105 satır - BÜYÜK!)
**Öncelik**: Orta
**Tahmini Süre**: 8-10 saat

**Bölümleme Planı**:
```
src/hooks/api/
├── use-members-api.ts
├── use-donations-api.ts
├── use-beneficiaries-api.ts
├── use-payments-api.ts
└── index.ts
```

#### 5.3 Large Page Components
**Dosya**: `src/app/(dashboard)/sosyal-yardim/ihtiyac-sahipleri/[id]/page.tsx` (2220 satır!)
**Öncelik**: Orta
**Tahmini Süre**: 6-8 saat

**Sub-component Extraction**:
- BeneficiaryHeader
- BeneficiaryInfo
- FamilyMembers
- ApplicationHistory
- PaymentSchedule
- Documents

#### 5.4 Type Definitions Consolidation
**Dosya**: `src/types/index.ts` (1057 satır)
**Öncelik**: Düşük
**Tahmini Süre**: 4-6 saat

**Bölümleme Planı**:
```
src/types/
├── member.ts
├── donation.ts
├── beneficiary.ts
├── payment.ts
├── kumbara.ts
└── index.ts
```

### 6. Test Coverage Artırma
**Mevcut Coverage**: %50
**Hedef Coverage**: %70+
**Tahmini Süre**: 20-30 saat

**Öncelikli Test Alanları**:
- [ ] Critical business logic (payment calculations, etc.)
- [ ] Supabase service fonksiyonları
- [ ] Custom hooks
- [ ] Utility functions
- [ ] Form validations

### 7. Security Improvements

#### 7.1 TypeScript Build Errors
**Dosya**: `next.config.ts`
**Satır**: 77 (`ignoreBuildErrors: true`)
**Açıklama**: Build errors ignore ediliyor, production öncesi düzeltilmeli
**Öncelik**: Yüksek

**Adımlar**:
- [ ] `npm run type-check` çalıştır
- [ ] Tüm TypeScript hatalarını düzelt
- [ ] `ignoreBuildErrors: false` yap
- [ ] CI/CD'de type-check ekle

#### 7.2 CSP Policy Review
**Dosya**: `middleware.ts`
**Satır**: 54 (`unsafe-inline`, `unsafe-eval` allowed)
**Öncelik**: Düşük (Next.js requirement)

**Review**:
- [ ] Next.js 16'da CSP strict mode kullanılabilir mi araştır
- [ ] Nonce-based CSP implementasyonu değerlendir

## ✅ Tamamlanan TODO'lar

### ✓ Error Boundary Logging (Tamamlandı: 2025-12-29)
**Dosya**: `src/components/shared/error-boundary.tsx:55`
**Tamamlayan**: Claude AI
**Commit**: `a8d0e86`

## 📊 İstatistikler

- **Toplam TODO**: 7 ana görev
- **Yüksek Öncelikli**: 2
- **Orta Öncelikli**: 3
- **Düşük Öncelikli**: 2
- **Tamamlanan**: 1

## 🎯 Sprint Planlaması

### Sprint 1 (Production Öncesi) - 1-2 Hafta
- [ ] Error logging integration (Sentry)
- [ ] TypeScript build errors düzeltme
- [ ] Test coverage artırma (critical paths)

### Sprint 2 (Performance) - 2-3 Hafta
- [ ] Supabase RPC migration
- [ ] Large file refactoring (supabase-service.ts)
- [ ] Page component extraction

### Sprint 3 (Features) - 3-4 Hafta
- [ ] Backup implementation
- [ ] Custom analytics endpoint
- [ ] Remaining refactoring tasks

## 📝 Notlar

### Production Deployment Checklist
Tüm yüksek öncelikli TODO'lar tamamlanmalı:
- [x] Credentials güvenliği (.env.example temizlendi)
- [ ] Error logging production-ready
- [ ] TypeScript errors düzeltildi
- [ ] Test coverage %70+
- [ ] Build başarılı (no errors)
- [ ] E2E tests passing

### Maintenance
- TODO listesini her sprint sonunda güncelle
- Yeni TODO'ları eklerken öncelik ve tahmini süre ekle
- Tamamlanan TODO'ları "Tamamlanan" bölümüne taşı

---

**Son Güncelleme**: 2025-12-29
**Güncelleyen**: Claude AI
**Proje Versiyonu**: 0.1.0
