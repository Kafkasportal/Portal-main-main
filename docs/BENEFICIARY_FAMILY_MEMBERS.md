# Aile Üyeleri Yönetim Sistemi

Bu sistem, ihtiyaç sahiplerinin hanesindeki diğer kişileri yönetmek için tasarlanmıştır.

## Özellikler

### 1. Veritabanı Tablosu

**Tablo Adı:** `beneficiary_family_members`

Alanlar:
- `id` - Otomatik artan birincil anahtar
- `beneficiary_id` - İhtiyaç sahibi ID'si (yabancı anahtar)
- `ad` - Ad
- `soyad` - Soyad
- `tc_kimlik_no` - TC Kimlik Numarası (benzersiz)
- `cinsiyet` - Erkek/Kadın
- `dogum_tarihi` - Doğum tarihi
- `iliski` - İlişki türü (eş, baba, anne, çocuk, torun, kardeş, diğer)
- `medeni_durum` - Medeni durumu (bekar, evli, dul, boşanmış)
- `egitim_durumu` - Eğitim durumu
- `meslek` - Meslek
- `gelir_durumu` - Gelir durumu (çalışan, emekli, çalışmıyor, öğrenci)
- `aciklama` - Açıklama
- `created_at` - Oluşturma tarihi
- `updated_at` - Güncelleme tarihi

### 2. TypeScript Tipleri

Dosya: `src/types/index.ts`

```typescript
export type Iliski = 'eş' | 'baba' | 'anne' | 'çocuk' | 'torun' | 'kardeş' | 'diğer'
export type MedeniDurum = 'bekar' | 'evli' | 'dul' | 'boşanmış'
export type GelirDurumu = 'çalışan' | 'emekli' | 'çalışmıyor' | 'öğrenci'

export interface FamilyMember {
  id: number
  beneficiaryId: number
  ad: string
  soyad: string
  tcKimlikNo: string
  cinsiyet: 'erkek' | 'kadın'
  dogumTarihi?: Date
  iliski: Iliski
  medeniDurum: MedeniDurum
  egitimDurumu?: string
  meslek?: string
  gelirDurumu?: GelirDurumu
  aciklama?: string
  createdAt: Date
  updatedAt: Date
}
```

### 3. API Servisi

Dosya: `src/lib/services/beneficiary-family-service.ts`

**Fonksiyonlar:**

- `fetchFamilyMembers(beneficiaryId: number)` - Bir ihtiyaç sahibinin tüm aile üyelerini getir
- `fetchFamilyMember(id: number)` - Tek bir aile üyesini getir
- `searchFamilyMembers(search: string)` - Aile üyelerini arama
- `addFamilyMember(member)` - Yeni aile üyesi ekle
- `updateFamilyMember(id, updates)` - Aile üyesini güncelle
- `deleteFamilyMember(id)` - Aile üyesini sil
- `deleteAllFamilyMembers(beneficiaryId)` - Tüm aile üyelerini sil
- `batchAddFamilyMembers(members)` - Toplu aile üyesi ekle
- `getFamilyCompositionSummary(beneficiaryId)` - Aile kompozisyon özeti
- `checkDuplicateRecipients(tcKimlikNumbers)` - Tekrar alan yardımları kontrol et
- `findBeneficiariesWithMultipleAidRecipients()` - Birden fazla kişi alan ihtiyaç sahiplerini bul

### 4. Frontend Bileşenleri

#### FamilyMembersList

Dosya: `src/components/features/beneficiaries/family-members-list.tsx`

Özellikler:
- Aile üyelerini tablo halinde listeleme
- Yeni üye ekleme
- Mevcut üyeleri düzenleme/silme
- Arama fonksiyonu
- Aile kompozisyon özeti kartları
- Tekrar kontrolü butonu

#### FamilyMemberForm

Dosya: `src/components/features/beneficiaries/family-member-form.tsx`

Form alanları:
- Ad *
- Soyad *
- TC Kimlik No *
- Cinsiyet *
- Doğum Tarihi
- İlişki Türü *
- Medeni Durum *
- Eğitim Durumu
- Meslek
- Gelir Durumu
- Açıklama

### 5. İhtiyaç Sahibi Detay Sayfası

Dosya: `src/app/(dashboard)/sosyal-yardim/ihtiyac-sahipleri/[id]/page.tsx`

**Eklenen özellikler:**
- "Hane İle İlgili Kişiler" bölümü
- Bağlantılı kayıtlar listesine "Aile Üyeleri" butonu
- Quick summary kartları (Toplam Üye, Çocuk Sayısı, Yetim Sayısı)
- Sheet modal içinde aile üyelerinin tam yönetimi

## Kullanım

### Veritabanı Migrasyonunu Uygula

```bash
# Migrasyon dosyası zaten oluşturuldu
supabase/migrations/20260104_add_beneficiary_family_members_table.sql
```

Bu migrasyon:
- `beneficiary_family_members` tablosunu oluşturur
- Gerekli indeksleri ekler
- RLS politikaları tanımlar
- Otomatik zaman damgaları için trigger ekler

### Aile Üyelerini Yönetme

1. İhtiyaç sahibi detay sayfasına git
2. "Hane İle İlgili Kişiler" bölümünü bul
3. "Hane İle İlgili Kişileri Yönet" butonuna tıkla
4. Sheet modal açılacak:
   - Aile üyeleri listelenecek
   - Yeni üye ekle butonu ile ekleme yapabilirsin
   - Mevcut üyeleri düzenleyebilir veya silebilirsin

### Excel'den İçe Aktarma

Dosya: `scripts/import-beneficiary-families.js`

Kullanım:
```bash
# Normal import
node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olanlar.xlsx

# Dry run (test without importing)
node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olanlar.xlsx --dry-run
```

**Excel yapısı:**
- TC Kimlik No: İhtiyaç sahibinin TC Kimlik No'su (bağlamak için)
- Ad: Aile üyesinin adı
- Soyad: Aile üyesinin soyadı
- TC Kimlik No: Aile üyesinin TC Kimlik No'su
- Cinsiyet: Erkek/Kadın
- Doğum Tarihi: GG.AA.YYYY formatı
- İlişki: eş, baba, anne, çocuk, torun, kardeş, diğer
- Medeni Durumu: bekar, evli, dul, boşanmış
- Eğitim Durumu: Okul/Üniversite vb.
- Meslek: Meslek
- Gelir Durumu: çalışan, emekli, çalışmıyor, öğrenci
- Açıklama: Ek bilgiler

### Tekrar Kontrolü

Dosya: `scripts/check-duplicate-recipients.js`

Kullanım:
```bash
# Raporu ekrana yazdır
node scripts/check-duplicate-recipients.js

# Raporu CSV olarak dışa aktar
node scripts/check-duplicate-recipients.js --export duplicates.csv
```

**Kontrol edilen durumlar:**
1. İhtiyaç sahiplerinde aynı TC Kimlik No'lu kişiler
2. Aile üyelerinde aynı TC Kimlik No'lu kişiler
3. Aynı kişiden birden fazla yardım başvurusu
4. İhtiyaç sahipleri ile yardım başvurusu arasındaki örtüşmeler
5. Aile üyelerinin ayrıca ihtiyaç sahibi olarak kayıtlı olması

## Örnek Senaryolar

### Senaryo 1: Yeni İhtiyaç Sahibi

1. İhtiyaç sahibi formunu doldurun
2. "Aile ve Hane Bilgileri" bölümüne gidin
3. "Hane İle İlgili Kişiler" butonuna tıklayın
4. Aile üyelerini tek tek ekleyin veya Excel'den import edin
5. Her üye için TC Kimlik No ve ilişki türünü belirtin

### Senaryo 2: Mevcut İhtiyaç Sahibine Aile Üyeleri Ekleme

1. İhtiyaç sahibi detay sayfasına gidin
2. Bağlantılı kayıtlar listesinden "Aile Üyeleri" seçeneğine tıklayın
3. "Yeni Üye" butonuna tıklayın
4. Formu doldurun:
   - Ad, Soyad, TC Kimlik No (zorunlu)
   - İlişki türü: eş, baba, anne, çocuk, torun, kardeş veya diğer
   - Medeni durumu, eğitim, meslek, gelir durumu
5. "Kaydet" butonuna tıklayın

### Senaryo 3: Excel'den Toplu İçe Aktarma

1. Excel dosyanızı hazırlayın (bkz. Excel yapısı)
2. Environment variable'ları ayarlayın:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Dry run ile test edin:
   ```bash
   node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olanlar.xlsx --dry-run
   ```
4. Sonuçları kontrol edin
5. Aslı import'u çalıştırın:
   ```bash
   node scripts/import-beneficiary-families.js --file Aynı_Aileden_Olanlar.xlsx
   ```

### Senaryo 4: Tekrar Kontrolü

1. Duplicate control script'ini çalıştırın:
   ```bash
   node scripts/check-duplicate-recipients.js --export duplicates.csv
   ```
2. Raporu inceleyin
3. Duplicates.csv dosyasını açın
4. Tespit edilen sorunları çözün:
   - Duplicate'ları birleştirin veya silin
   - Aynı kişilerin birden fazla başvurusunu birleştirin
   - Aile üyeleri ve ihtiyaç sahipleri arasındaki örtüşmeleri giderin

## Güvenlik

### Row Level Security (RLS)

Migrasyon otomatik olarak aşağıdaki RLS politikalarını tanımlar:

1. **SELECT**: Tüm otantike kullanıcılar aile üyelerini görüntüleyebilir
2. **INSERT**: Otantike kullanıcılar yeni aile üyeleri ekleyebilir
3. **UPDATE**: Otantike kullanıcılar mevcut aile üyelerini güncelleyebilir
4. **DELETE**: Sadece admin kullanıcılar aile üyelerini silebilir

### İndeksler

Aşağıdaki indeksler performans için oluşturulur:
- `idx_family_members_beneficiary` - beneficiary_id sütunu üzerinde
- `idx_family_members_tc_kimlik` - tc_kimlik_no sütunu üzerinde
- `idx_family_members_ad_soyad` - ad ve soyad sütunları üzerinde
- `idx_family_members_iliski` - iliski sütunu üzerinde
- `idx_family_members_medeni` - medeni_durum sütunu üzerinde

## Sorun Giderme

### Hata: "family_members relation does not exist"

**Çözüm:** Migrasyon dosyasını Supabase'de uygulayın

### Hata: "Unique constraint violation on tc_kimlik_no"

**Çözüm:** Aynı TC Kimlik No'ya sahip başka bir aile üyesi zaten var. Duplicate'ları kontrol edin.

### Hata: "Foreign key constraint violation on beneficiary_id"

**Çözüm:** Belirtilen beneficiary_id'ye sahip ihtiyaç sahibi bulunamadı. İhtiyaç sahibi ID'sini doğrulayın.

### Hata: "Insert failed: row-level security"

**Çözüm:** Kullanıcı otantike değil. Giriş yapın ve tekrar deneyin.

## İlerideki Geliştirmeler

1. **Fotoğraf Yükleme**: Aile üyelerinin fotoğraflarını yükleme
2. **Dosya Yükleme**: Aile üyeleri için belge yükleme
3. **İstatistikler**: Aile üyeleri ile ilgili detaylı istatistikler
4. **Raporlar**: Aile kompozisyon raporları
5. **Batch Operations**: Toplu düzenleme ve silme işlemleri
6. **Validation**: TC Kimlik No doğrulama (MERNIS entegrasyonu)

## Destek

Sorularınız için lütfen issue tracker'ı kullanın veya geliştirme ekibi ile iletişime geçin.


