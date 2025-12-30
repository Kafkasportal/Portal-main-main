# Frontend-Database Alignment Migrations

Bu migration'lar frontend formlarını veritabanı şeması ile tam uyumlu hale getirir.

## 📋 Oluşturulan Migration'lar

### 1. `20251230_align_beneficiaries_with_frontend.sql`
**Beneficiaries (İhtiyaç Sahipleri) tablosunu genişletir**

#### Eklenen Alanlar:
- **Temel Bilgiler**: uyruk, yabanci_kimlik_no, fon_bolgesi, dosya_baglantisi, mernis_dogrulama
- **İletişim**: cep_telefonu, cep_telefonu_operator, sabit_telefon, yurtdisi_telefon
- **Adres**: ulke, sehir, mahalle
- **Kimlik Bilgileri**: baba_adi, anne_adi, belge_turu, belge_gecerlilik_tarihi, seri_numarasi, onceki_uyruk, onceki_isim
- **Pasaport/Vize**: pasaport_turu, pasaport_numarasi, pasaport_gecerlilik_tarihi, vize_giris_turu, vize_bitis_tarihi
- **Sağlık**: kan_grubu, kronik_hastalik, engel_durumu, engel_orani, surekli_ilac
- **Ekonomik**: calisma_durumu, konut_durumu, kira_tutari
- **Aile**: es_adi, es_telefon, ailedeki_kisi_sayisi, cocuk_sayisi, yetim_sayisi, calisan_sayisi, bakmakla_yukumlu_sayisi
- **Sponsorluk**: sponsorluk_tipi, riza_beyani_durumu

#### Değişiklikler:
- `tc_kimlik_no` artık optional (yabancı kimlik için)
- `durum` enum güncellendi: aktif, pasif, arsiv, beklemede
- `yabanci_kimlik_no` için unique constraint eklendi
- TC veya yabancı kimlik kontrolü eklendi

### 2. `20251230_align_social_aid_with_frontend.sql`
**Social Aid Applications tablosunu günceller**

#### Eklenen Alanlar:
- basvuran_ad, basvuran_soyad
- basvuran_tc_kimlik_no
- basvuran_telefon, basvuran_adres

#### Değişiklikler:
- `yardim_turu` enum güncellendi: ayni, nakdi, egitim, saglik, kira, fatura
- `basvuran_id` artık optional (direkt başvuran bilgileri kullanılabilir)
- Başvuran bilgisi kontrolü eklendi

### 3. `20251230_align_kumbaras_with_frontend.sql`
**Kumbaras tablosunu form ile uyumlu hale getirir**

#### Eklenen Constraint'ler:
- `kod` minimum 3 karakter
- `konum` minimum 5 karakter
- `notlar` maksimum 500 karakter
- `durum` enum doğrulandı: aktif, pasif, toplandi, kayip

### 4. `20251230_align_documents_with_frontend.sql`
**Documents tablosunu genişletir**

#### Eklenen Alanlar:
- mime_type, is_verified, verification_date, verified_by
- description, tags
- storage_bucket, storage_path
- entity_type, entity_id (polymorphic relationship)

#### Değişiklikler:
- `file_size` max 10MB constraint
- `file_type` sadece izin verilen MIME type'lar (PDF, JPEG, PNG, DOC, DOCX)
- `beneficiary_id` artık optional
- Polymorphic entity ilişkisi eklendi

### 5. `20251230_align_members_donations_with_frontend.sql`
**Members, Donations, Payments, Users tablolarını ince ayar yapar**

#### Members:
- Eklenen: kan_grubu, meslegi
- Telefon format kontrolü
- Email artık optional

#### Donations:
- Eklenen: bagisci_telefon, bagisci_email, bagisci_adres
- Currency enum doğrulandı
- Ödeme yöntemi enum güncellendi
- member_id artık optional

#### Payments:
- Eklenen: makbuz_no
- Ödeme yöntemi enum: nakit, havale, elden
- Durum enum: beklemede, odendi, iptal

#### Users:
- Eklenen: phone
- Role enum: admin, moderator, muhasebe, user

## 🚀 Migration'ları Uygulama

### Yerel Geliştirme:
```bash
# Supabase CLI ile
npx supabase db push

# Veya manuel olarak
psql -h localhost -U postgres -d postgres -f supabase/migrations/20251230_align_beneficiaries_with_frontend.sql
psql -h localhost -U postgres -d postgres -f supabase/migrations/20251230_align_social_aid_with_frontend.sql
psql -h localhost -U postgres -d postgres -f supabase/migrations/20251230_align_kumbaras_with_frontend.sql
psql -h localhost -U postgres -d postgres -f supabase/migrations/20251230_align_documents_with_frontend.sql
psql -h localhost -U postgres -d postgres -f supabase/migrations/20251230_align_members_donations_with_frontend.sql
```

### Production (Supabase Dashboard):
1. Supabase Dashboard'a giriş yapın
2. SQL Editor'e gidin
3. Her migration dosyasını sırayla çalıştırın
4. Hataları kontrol edin

### Supabase MCP ile:
```javascript
// Her migration'ı tek tek uygula
await mcp2_apply_migration({
  project_id: "idsiiayyvygcgegmqcov",
  name: "align_beneficiaries_with_frontend",
  query: "-- migration içeriği --"
})
```

## ✅ Migration Sonrası Kontroller

### 1. Tablo Yapılarını Kontrol Et:
```sql
-- Beneficiaries
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'beneficiaries' 
ORDER BY ordinal_position;

-- Social Aid Applications
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'social_aid_applications' 
ORDER BY ordinal_position;
```

### 2. Constraint'leri Kontrol Et:
```sql
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'beneficiaries'::regclass;
```

### 3. Index'leri Kontrol Et:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('beneficiaries', 'social_aid_applications', 'documents', 'members', 'donations');
```

## 📊 Değişiklik Özeti

| Tablo | Eklenen Kolon | Güncellenen Constraint | Eklenen Index |
|-------|---------------|------------------------|---------------|
| beneficiaries | 40+ | 5 | 6 |
| social_aid_applications | 5 | 2 | 4 |
| kumbaras | 0 | 4 | 4 |
| documents | 8 | 3 | 8 |
| members | 2 | 2 | 6 |
| donations | 3 | 2 | 6 |
| payments | 1 | 2 | 3 |
| users | 1 | 1 | 1 |

## ⚠️ Önemli Notlar

1. **Veri Kaybı Riski YOK**: Tüm migration'lar `ADD COLUMN IF NOT EXISTS` kullanır
2. **Geriye Uyumlu**: Mevcut veriler korunur
3. **Performans**: Yeni index'ler sorgu performansını artırır
4. **Validasyon**: Form validasyonları artık DB seviyesinde de kontrol edilir

## 🔄 Rollback

Eğer migration'ları geri almak isterseniz:

```sql
-- Beneficiaries için örnek rollback
ALTER TABLE beneficiaries DROP COLUMN IF EXISTS uyruk;
ALTER TABLE beneficiaries DROP COLUMN IF EXISTS yabanci_kimlik_no;
-- ... diğer kolonlar

-- Constraint'leri geri al
ALTER TABLE beneficiaries DROP CONSTRAINT IF EXISTS beneficiaries_identity_check;
```

## 📝 Sonraki Adımlar

1. ✅ Migration'ları uygula
2. ✅ Frontend formlarını test et
3. ✅ Veri girişlerini kontrol et
4. ✅ API endpoint'lerini güncelle (gerekirse)
5. ✅ TypeScript type'larını güncelle (gerekirse)

## 🎯 Beklenen Sonuç

Tüm migration'lar uygulandıktan sonra:

- ✅ Beneficiaries formu tüm alanları DB'ye kaydedebilecek
- ✅ Social Aid Applications formu tam çalışacak
- ✅ Kumbaras formu validasyonları DB'de kontrol edilecek
- ✅ Documents upload tam özellikli olacak
- ✅ Tüm formlar DB ile %100 uyumlu olacak

## 📞 Destek

Sorun yaşarsanız:
1. Migration loglarını kontrol edin
2. Constraint hatalarını inceleyin
3. Supabase Dashboard'dan tablo yapısını kontrol edin
