-- Migration: Fine-tune members and donations tables to match frontend forms
-- These tables are mostly aligned but need some minor adjustments

-- ============================================
-- MEMBERS TABLE ADJUSTMENTS
-- ============================================

-- Add missing fields from memberSchema
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS kan_grubu TEXT CHECK (kan_grubu IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-')),
  ADD COLUMN IF NOT EXISTS meslegi TEXT;

-- Update uye_turu to include all form values (aktif, onursal, genc, destekci)
-- Note: Form maps these to DB values (aktif->standart, genc->standart, destekci->fahri, onursal->onursal)
-- So DB enum is correct, but we add a comment for clarity
COMMENT ON COLUMN members.uye_turu IS 'Member type: standart (aktif/genc), onursal, fahri (destekci)';

-- Ensure email is optional (form has it as optional)
ALTER TABLE members
  ALTER COLUMN email DROP NOT NULL;

-- Add constraint for phone format (form validates Turkish phone format)
ALTER TABLE members
  ADD CONSTRAINT members_telefon_format_check 
  CHECK (telefon ~ '^(0|\\+90)?5[0-9]{9}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_uye_turu ON members(uye_turu);
CREATE INDEX IF NOT EXISTS idx_members_aidat_durumu ON members(aidat_durumu);
CREATE INDEX IF NOT EXISTS idx_members_kayit_tarihi ON members(kayit_tarihi);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_kan_grubu ON members(kan_grubu) WHERE kan_grubu IS NOT NULL;

-- Add full-text search for member names
CREATE INDEX IF NOT EXISTS idx_members_name_search ON members USING GIN(to_tsvector('turkish', ad || ' ' || soyad));

-- ============================================
-- DONATIONS TABLE ADJUSTMENTS
-- ============================================

-- Ensure currency enum matches form (TRY, USD, EUR)
ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_currency_check;

ALTER TABLE donations
  ADD CONSTRAINT donations_currency_check 
  CHECK (currency IN ('TRY', 'USD', 'EUR'));

-- Ensure odeme_yontemi matches form mapping
-- Form: nakit, havale, kredi-karti, mobil-odeme
-- DB: nakit, havale, kredi_karti, kumbara
-- Form maps kredi-karti -> kredi_karti, mobil-odeme -> havale
ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_odeme_yontemi_check;

ALTER TABLE donations
  ADD CONSTRAINT donations_odeme_yontemi_check 
  CHECK (odeme_yontemi IN ('nakit', 'havale', 'kredi_karti', 'kumbara'));

-- Add amac field to match form (genel, egitim, saglik, insani-yardim, kurban, fitre-zekat)
ALTER TABLE donations
  ALTER COLUMN amac TYPE TEXT;

COMMENT ON COLUMN donations.amac IS 'Donation purpose: genel, egitim, saglik, insani-yardim, kurban, fitre-zekat';

-- Ensure member_id is optional (donations can be anonymous)
ALTER TABLE donations
  ALTER COLUMN member_id DROP NOT NULL;

-- Add donor contact fields (from form's bagisci object)
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS bagisci_telefon TEXT,
  ADD COLUMN IF NOT EXISTS bagisci_email TEXT,
  ADD COLUMN IF NOT EXISTS bagisci_adres TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_currency ON donations(currency);
CREATE INDEX IF NOT EXISTS idx_donations_odeme_yontemi ON donations(odeme_yontemi);
CREATE INDEX IF NOT EXISTS idx_donations_tarih ON donations(tarih);
CREATE INDEX IF NOT EXISTS idx_donations_member_id ON donations(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_tutar ON donations(tutar);

-- Add full-text search for donor names
CREATE INDEX IF NOT EXISTS idx_donations_bagisci_search ON donations USING GIN(to_tsvector('turkish', bagisci_adi));

-- ============================================
-- PAYMENTS TABLE ADJUSTMENTS
-- ============================================

-- Ensure odeme_yontemi matches form exactly (nakit, havale, elden)
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_odeme_yontemi_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_odeme_yontemi_check 
  CHECK (odeme_yontemi IN ('nakit', 'havale', 'elden'));

-- Ensure durum matches form (beklemede, odendi, iptal)
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_durum_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_durum_check 
  CHECK (durum IN ('beklemede', 'odendi', 'iptal'));

-- Add makbuz_no field from form
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS makbuz_no TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_durum ON payments(durum);
CREATE INDEX IF NOT EXISTS idx_payments_odeme_tarihi ON payments(odeme_tarihi);
CREATE INDEX IF NOT EXISTS idx_payments_makbuz_no ON payments(makbuz_no) WHERE makbuz_no IS NOT NULL;

-- ============================================
-- USERS TABLE ADJUSTMENTS
-- ============================================

-- Ensure role enum includes muhasebe (from DB schema)
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'moderator', 'muhasebe', 'user'));

-- Add phone field from userSchema
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comments
COMMENT ON TABLE members IS 'Members (Üyeler) - Aligned with frontend memberSchema';
COMMENT ON TABLE donations IS 'Donations (Bağışlar) - Aligned with frontend donationSchema';
COMMENT ON TABLE payments IS 'Payments (Ödemeler) - Aligned with frontend paymentSchema';
COMMENT ON TABLE users IS 'Users - Aligned with frontend userSchema';
