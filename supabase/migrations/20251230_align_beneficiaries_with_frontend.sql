-- Migration: Align beneficiaries table with frontend form schema
-- This migration adds all missing columns from the beneficiarySchema to match the frontend form

-- Add missing basic fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS uyruk TEXT DEFAULT 'Türkiye',
  ADD COLUMN IF NOT EXISTS yabanci_kimlik_no TEXT,
  ADD COLUMN IF NOT EXISTS fon_bolgesi TEXT,
  ADD COLUMN IF NOT EXISTS dosya_baglantisi TEXT,
  ADD COLUMN IF NOT EXISTS mernis_dogrulama BOOLEAN DEFAULT false;

-- Add communication fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS cep_telefonu TEXT,
  ADD COLUMN IF NOT EXISTS cep_telefonu_operator TEXT,
  ADD COLUMN IF NOT EXISTS sabit_telefon TEXT,
  ADD COLUMN IF NOT EXISTS yurtdisi_telefon TEXT;

-- Add address fields (rename existing il/ilce to match form)
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS ulke TEXT DEFAULT 'Türkiye',
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS mahalle TEXT;

-- Update existing data to use new fields
UPDATE beneficiaries SET sehir = il WHERE sehir IS NULL AND il IS NOT NULL;

-- Add identity information fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS baba_adi TEXT,
  ADD COLUMN IF NOT EXISTS anne_adi TEXT,
  ADD COLUMN IF NOT EXISTS belge_turu TEXT,
  ADD COLUMN IF NOT EXISTS belge_gecerlilik_tarihi DATE,
  ADD COLUMN IF NOT EXISTS seri_numarasi TEXT,
  ADD COLUMN IF NOT EXISTS onceki_uyruk TEXT,
  ADD COLUMN IF NOT EXISTS onceki_isim TEXT;

-- Add passport and visa fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS pasaport_turu TEXT,
  ADD COLUMN IF NOT EXISTS pasaport_numarasi TEXT,
  ADD COLUMN IF NOT EXISTS pasaport_gecerlilik_tarihi DATE,
  ADD COLUMN IF NOT EXISTS vize_giris_turu TEXT,
  ADD COLUMN IF NOT EXISTS vize_bitis_tarihi DATE;

-- Add health information fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS kan_grubu TEXT,
  ADD COLUMN IF NOT EXISTS kronik_hastalik TEXT,
  ADD COLUMN IF NOT EXISTS engel_durumu TEXT,
  ADD COLUMN IF NOT EXISTS engel_orani INTEGER CHECK (engel_orani >= 0 AND engel_orani <= 100),
  ADD COLUMN IF NOT EXISTS surekli_ilac TEXT;

-- Add economic status fields (expand existing)
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS calisma_durumu TEXT,
  ADD COLUMN IF NOT EXISTS konut_durumu TEXT,
  ADD COLUMN IF NOT EXISTS kira_tutari NUMERIC(10, 2);

-- Add family and household fields (expand existing)
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS es_adi TEXT,
  ADD COLUMN IF NOT EXISTS es_telefon TEXT,
  ADD COLUMN IF NOT EXISTS ailedeki_kisi_sayisi INTEGER,
  ADD COLUMN IF NOT EXISTS cocuk_sayisi INTEGER,
  ADD COLUMN IF NOT EXISTS yetim_sayisi INTEGER,
  ADD COLUMN IF NOT EXISTS calisan_sayisi INTEGER,
  ADD COLUMN IF NOT EXISTS bakmakla_yukumlu_sayisi INTEGER;

-- Add sponsorship and status fields
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS sponsorluk_tipi TEXT CHECK (sponsorluk_tipi IN ('bireysel', 'kurumsal', 'yok')),
  ADD COLUMN IF NOT EXISTS riza_beyani_durumu TEXT CHECK (riza_beyani_durumu IN ('alinmadi', 'alindi', 'reddetti'));

-- Update existing durum column to match form enum
ALTER TABLE beneficiaries
  DROP CONSTRAINT IF EXISTS beneficiaries_durum_check;

ALTER TABLE beneficiaries
  ADD CONSTRAINT beneficiaries_durum_check 
  CHECK (durum IN ('aktif', 'pasif', 'arsiv', 'beklemede'));

-- Update kategori to be more flexible (remove strict enum, allow form values)
COMMENT ON COLUMN beneficiaries.kategori IS 'Beneficiary category: yetiskin, cocuk, yetim, saglik, egitim, engelli, or custom';

-- Make tc_kimlik_no optional (since form has both TC and foreign ID)
ALTER TABLE beneficiaries
  ALTER COLUMN tc_kimlik_no DROP NOT NULL;

-- Add unique constraint for yabanci_kimlik_no
ALTER TABLE beneficiaries
  ADD CONSTRAINT beneficiaries_yabanci_kimlik_no_unique UNIQUE (yabanci_kimlik_no);

-- Add check constraint to ensure either TC or foreign ID is provided
ALTER TABLE beneficiaries
  ADD CONSTRAINT beneficiaries_identity_check 
  CHECK (
    (tc_kimlik_no IS NOT NULL AND tc_kimlik_no != '') OR 
    (yabanci_kimlik_no IS NOT NULL AND yabanci_kimlik_no != '')
  );

-- Update relationship_type to match form if needed
ALTER TABLE beneficiaries
  DROP CONSTRAINT IF EXISTS beneficiaries_relationship_type_check;

ALTER TABLE beneficiaries
  ADD CONSTRAINT beneficiaries_relationship_type_check 
  CHECK (relationship_type IN ('İhtiyaç Sahibi Kişi', 'Bakmakla Yükümlü Olunan Kişi'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beneficiaries_uyruk ON beneficiaries(uyruk);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_yabanci_kimlik ON beneficiaries(yabanci_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_kategori ON beneficiaries(kategori);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_sponsorluk ON beneficiaries(sponsorluk_tipi);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_ulke ON beneficiaries(ulke);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_sehir ON beneficiaries(sehir);

-- Add comments for documentation
COMMENT ON TABLE beneficiaries IS 'Beneficiaries (İhtiyaç Sahipleri) - Aligned with frontend beneficiarySchema';
COMMENT ON COLUMN beneficiaries.uyruk IS 'Nationality/citizenship';
COMMENT ON COLUMN beneficiaries.yabanci_kimlik_no IS 'Foreign ID number (for non-Turkish citizens)';
COMMENT ON COLUMN beneficiaries.fon_bolgesi IS 'Fund region';
COMMENT ON COLUMN beneficiaries.dosya_baglantisi IS 'File/document link';
COMMENT ON COLUMN beneficiaries.mernis_dogrulama IS 'MERNIS verification status';
COMMENT ON COLUMN beneficiaries.sponsorluk_tipi IS 'Sponsorship type: bireysel, kurumsal, yok';
COMMENT ON COLUMN beneficiaries.riza_beyani_durumu IS 'Consent statement status';
