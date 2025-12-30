-- =============================================
-- PORTAL DATABASE SCHEMA FOR SUPABASE
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- MEMBERS TABLE (Üyeler)
-- =============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tc_kimlik_no TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  email TEXT,
  telefon TEXT NOT NULL,
  cinsiyet TEXT NOT NULL CHECK (cinsiyet IN ('erkek', 'kadin')),
  dogum_tarihi DATE,
  adres TEXT,
  uye_turu TEXT NOT NULL DEFAULT 'standart' CHECK (uye_turu IN ('standart', 'onursal', 'fahri')),
  kayit_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  aidat_durumu TEXT NOT NULL DEFAULT 'beklemede' CHECK (aidat_durumu IN ('odendi', 'beklemede', 'gecikti')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- DONATIONS TABLE (Bağışlar)
-- =============================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bagisci_adi TEXT NOT NULL,
  tutar DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'EUR', 'USD')),
  amac TEXT NOT NULL,
  odeme_yontemi TEXT NOT NULL CHECK (odeme_yontemi IN ('nakit', 'havale', 'kredi_karti', 'kumbara')),
  makbuz_no TEXT,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  aciklama TEXT,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- BENEFICIARIES TABLE (İhtiyaç Sahipleri)
-- =============================================
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tc_kimlik_no TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  telefon TEXT NOT NULL,
  email TEXT,
  adres TEXT,
  il TEXT,
  ilce TEXT,
  cinsiyet TEXT NOT NULL CHECK (cinsiyet IN ('erkek', 'kadin')),
  dogum_tarihi DATE,
  medeni_hal TEXT,
  egitim_durumu TEXT,
  meslek TEXT,
  aylik_gelir DECIMAL(12, 2),
  hane_buyuklugu INTEGER,
  durum TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'beklemede')),
  ihtiyac_durumu TEXT NOT NULL DEFAULT 'orta' CHECK (ihtiyac_durumu IN ('acil', 'yuksek', 'orta', 'dusuk')),
  kategori TEXT,
  parent_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  relationship_type TEXT CHECK (relationship_type IN ('İhtiyaç Sahibi Kişi', 'Bakmakla Yükümlü Olunan Kişi')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- KUMBARAS TABLE (Kumbaralar)
-- =============================================
CREATE TABLE IF NOT EXISTS public.kumbaras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kod TEXT NOT NULL UNIQUE,
  konum TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'toplandi', 'kayip')),
  sorumlu_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  son_toplama_tarihi TIMESTAMPTZ,
  toplam_toplanan DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SOCIAL AID APPLICATIONS TABLE (Yardım Başvuruları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.social_aid_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basvuran_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  yardim_turu TEXT NOT NULL,
  talep_edilen_tutar DECIMAL(12, 2),
  onaylanan_tutar DECIMAL(12, 2),
  durum TEXT NOT NULL DEFAULT 'beklemede' CHECK (durum IN ('beklemede', 'inceleniyor', 'onaylandi', 'reddedildi')),
  basvuru_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  degerlendirme_tarihi DATE,
  gerekce TEXT,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE (Ödemeler)
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.social_aid_applications(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  tutar DECIMAL(12, 2) NOT NULL,
  odeme_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  odeme_yontemi TEXT NOT NULL CHECK (odeme_yontemi IN ('nakit', 'havale', 'elden')),
  durum TEXT NOT NULL DEFAULT 'beklemede' CHECK (durum IN ('beklemede', 'odendi', 'iptal')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- DOCUMENTS TABLE (Dosya Metadata)
-- =============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('kimlik', 'ikamet', 'saglik', 'gelir', 'diger')),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AUDIT LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_members_tc_kimlik ON public.members(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_members_ad_soyad ON public.members(ad, soyad);
CREATE INDEX IF NOT EXISTS idx_donations_tarih ON public.donations(tarih DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amac ON public.donations(amac);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tc_kimlik ON public.beneficiaries(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_durum ON public.beneficiaries(durum);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_ihtiyac ON public.beneficiaries(ihtiyac_durumu);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_parent_id ON public.beneficiaries(parent_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_relationship_type ON public.beneficiaries(relationship_type);
CREATE INDEX IF NOT EXISTS idx_kumbaras_kod ON public.kumbaras(kod);
CREATE INDEX IF NOT EXISTS idx_kumbaras_durum ON public.kumbaras(durum);
CREATE INDEX IF NOT EXISTS idx_applications_durum ON public.social_aid_applications(durum);
CREATE INDEX IF NOT EXISTS idx_applications_basvuran ON public.social_aid_applications(basvuran_id);
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary ON public.payments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_beneficiary ON public.documents(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_logs(table_name);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kumbaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_aid_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can view members
CREATE POLICY "Authenticated users can view members" ON public.members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can manage members
CREATE POLICY "Authenticated users can manage members" ON public.members
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage donations
CREATE POLICY "Authenticated users can manage donations" ON public.donations
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage beneficiaries
CREATE POLICY "Authenticated users can manage beneficiaries" ON public.beneficiaries
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage kumbaras
CREATE POLICY "Authenticated users can manage kumbaras" ON public.kumbaras
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage applications
CREATE POLICY "Authenticated users can manage applications" ON public.social_aid_applications
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage payments
CREATE POLICY "Authenticated users can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated users can view/manage documents
CREATE POLICY "Authenticated users can manage documents" ON public.documents
  FOR ALL USING (auth.role() = 'authenticated');

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_kumbaras_updated_at
  BEFORE UPDATE ON public.kumbaras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.social_aid_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- =============================================
-- Backend Optimizations Migration
-- Tarih: 2025-01-26
-- Amaç: Güvenlik ve performans iyileştirmeleri
-- =============================================

-- =============================================
-- 1. FUNCTION SEARCH_PATH AYARLARI (GÜVENLİK)
-- =============================================

-- update_updated_at fonksiyonuna search_path ekle
ALTER FUNCTION public.update_updated_at() 
SET search_path = public;

-- handle_new_user fonksiyonuna search_path ekle
ALTER FUNCTION public.handle_new_user() 
SET search_path = public;

-- =============================================
-- 2. FOREIGN KEY INDEX'LERİ (PERFORMANS)
-- =============================================

-- documents.uploaded_by için index
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by 
ON public.documents(uploaded_by);

-- donations.member_id için index
CREATE INDEX IF NOT EXISTS idx_donations_member_id 
ON public.donations(member_id);

-- kumbaras.sorumlu_id için index
CREATE INDEX IF NOT EXISTS idx_kumbaras_sorumlu_id 
ON public.kumbaras(sorumlu_id);

-- payments.application_id için index
CREATE INDEX IF NOT EXISTS idx_payments_application_id 
ON public.payments(application_id);

-- =============================================
-- 3. RLS POLICY OPTİMİZASYONLARI (PERFORMANS)
-- =============================================

-- Önce mevcut policy'leri sil
DROP POLICY IF EXISTS "Authenticated users can manage beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can manage kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can manage applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Optimize edilmiş policy'leri oluştur
-- beneficiaries: ALL operations
CREATE POLICY "Authenticated users can manage beneficiaries"
ON public.beneficiaries FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- documents: ALL operations
CREATE POLICY "Authenticated users can manage documents"
ON public.documents FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- donations: ALL operations
CREATE POLICY "Authenticated users can manage donations"
ON public.donations FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- kumbaras: ALL operations
CREATE POLICY "Authenticated users can manage kumbaras"
ON public.kumbaras FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- members: ALL operations (birleştirilmiş - hem view hem manage)
CREATE POLICY "Authenticated users can manage members"
ON public.members FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- payments: ALL operations
CREATE POLICY "Authenticated users can manage payments"
ON public.payments FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- social_aid_applications: ALL operations
CREATE POLICY "Authenticated users can manage applications"
ON public.social_aid_applications FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- audit_logs: SELECT only for admins
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
  )
);

-- users: SELECT - birleştirilmiş policy (admin ve own profile)
CREATE POLICY "Users can view users"
ON public.users FOR SELECT
TO authenticated
USING (
  -- Admin can view all
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
  )
  OR
  -- User can view own profile
  (select auth.uid()) = id
);


-- =============================================
-- MIGRATION: Add in_kind_aids table for ayni yardım
-- =============================================

CREATE TABLE IF NOT EXISTS public.in_kind_aids (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  beneficiary_id BIGINT NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  yardim_turu TEXT NOT NULL CHECK (yardim_turu IN ('gida', 'giyim', 'yakacak', 'diger')),
  miktar DECIMAL(10, 2) NOT NULL,
  birim TEXT NOT NULL CHECK (birim IN ('adet', 'kg', 'paket', 'kutu', 'takim', 'diger')),
  dagitim_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_in_kind_aids_beneficiary ON public.in_kind_aids(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_in_kind_aids_tarih ON public.in_kind_aids(dagitim_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_in_kind_aids_turu ON public.in_kind_aids(yardim_turu);

-- RLS
ALTER TABLE public.in_kind_aids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view in_kind_aids" ON public.in_kind_aids
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert in_kind_aids" ON public.in_kind_aids
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update in_kind_aids" ON public.in_kind_aids
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete in_kind_aids" ON public.in_kind_aids
  FOR DELETE
  USING (true);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_in_kind_aids_updated_at
  BEFORE UPDATE ON public.in_kind_aids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration: Add parent_id and relationship_type to beneficiaries
-- Description: Enables linking beneficiaries to their dependents (baktığı kişiler)
-- Date: 2025-12-22

-- Add parent_id column for self-referencing relationship
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL;

-- Add relationship_type column
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS relationship_type TEXT CHECK (relationship_type IN ('İhtiyaç Sahibi Kişi', 'Bakmakla Yükümlü Olunan Kişi'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_beneficiaries_parent_id ON beneficiaries(parent_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_relationship_type ON beneficiaries(relationship_type);

-- Set default for existing main beneficiaries (those without parent)
UPDATE beneficiaries 
SET relationship_type = 'İhtiyaç Sahibi Kişi' 
WHERE parent_id IS NULL AND relationship_type IS NULL;

-- Comment
COMMENT ON COLUMN beneficiaries.parent_id IS 'References the main beneficiary this person is dependent on';
COMMENT ON COLUMN beneficiaries.relationship_type IS 'Indicates if this is a main beneficiary or a dependent person';
-- =============================================
-- DOCUMENTS TABLE MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- Check if documents table exists, create if not
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('kimlik', 'ikamet', 'saglik', 'gelir', 'diger')),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_beneficiary ON public.documents(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can manage documents
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.documents;
CREATE POLICY "Authenticated users can manage documents" ON public.documents
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKET SETUP (Run in SQL Editor)
-- =============================================
-- Note: Storage bucket creation needs Dashboard or CLI

-- Storage policies for 'documents' bucket
-- These will be applied after bucket creation

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  false,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- =============================================
-- COMMENT
-- =============================================
COMMENT ON TABLE public.documents IS 'Dosya metadata tablosu - ihtiyaç sahiplerine ait belgeler';
COMMENT ON COLUMN public.documents.document_type IS 'Belge türü: kimlik, ikamet, saglik, gelir, diger';
COMMENT ON COLUMN public.documents.file_path IS 'Storage bucket içindeki dosya yolu';
-- =============================================
-- MIGRATION: Change IDs from UUID to BIGINT
-- =============================================

-- Disable RLS temporarily to allow dropping tables if needed (though DROP TABLE usually ignores RLS)
-- We will drop tables in reverse order of dependencies

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.social_aid_applications CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.kumbaras CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.beneficiaries CASCADE;

-- Note: users and audit_logs are preserved (partially)
-- We need to modify audit_logs to handle BIGINT record_ids (by storing as TEXT)
ALTER TABLE public.audit_logs ALTER COLUMN record_id TYPE TEXT;

-- =============================================
-- MEMBERS TABLE (Üyeler) - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.members (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  tc_kimlik_no TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  email TEXT,
  telefon TEXT NOT NULL,
  cinsiyet TEXT NOT NULL CHECK (cinsiyet IN ('erkek', 'kadin')),
  dogum_tarihi DATE,
  adres TEXT,
  uye_turu TEXT NOT NULL DEFAULT 'standart' CHECK (uye_turu IN ('standart', 'onursal', 'fahri')),
  kayit_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  aidat_durumu TEXT NOT NULL DEFAULT 'beklemede' CHECK (aidat_durumu IN ('odendi', 'beklemede', 'gecikti')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- DONATIONS TABLE (Bağışlar) - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.donations (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  bagisci_adi TEXT NOT NULL,
  tutar DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'EUR', 'USD')),
  amac TEXT NOT NULL,
  odeme_yontemi TEXT NOT NULL CHECK (odeme_yontemi IN ('nakit', 'havale', 'kredi_karti', 'kumbara')),
  makbuz_no TEXT,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  aciklama TEXT,
  member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- BENEFICIARIES TABLE (İhtiyaç Sahipleri) - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  tc_kimlik_no TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  telefon TEXT NOT NULL,
  email TEXT,
  adres TEXT,
  il TEXT,
  ilce TEXT,
  cinsiyet TEXT NOT NULL CHECK (cinsiyet IN ('erkek', 'kadin')),
  dogum_tarihi DATE,
  medeni_hal TEXT,
  egitim_durumu TEXT,
  meslek TEXT,
  aylik_gelir DECIMAL(12, 2),
  hane_buyuklugu INTEGER,
  durum TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'beklemede')),
  ihtiyac_durumu TEXT NOT NULL DEFAULT 'orta' CHECK (ihtiyac_durumu IN ('acil', 'yuksek', 'orta', 'dusuk')),
  kategori TEXT,
  parent_id BIGINT REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  relationship_type TEXT CHECK (relationship_type IN ('İhtiyaç Sahibi Kişi', 'Bakmakla Yükümlü Olunan Kişi')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- KUMBARAS TABLE (Kumbaralar) - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.kumbaras (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  kod TEXT NOT NULL UNIQUE,
  konum TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'toplandi', 'kayip')),
  sorumlu_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
  son_toplama_tarihi TIMESTAMPTZ,
  toplam_toplanan DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SOCIAL AID APPLICATIONS TABLE - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.social_aid_applications (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  basvuran_id BIGINT NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  yardim_turu TEXT NOT NULL,
  talep_edilen_tutar DECIMAL(12, 2),
  onaylanan_tutar DECIMAL(12, 2),
  durum TEXT NOT NULL DEFAULT 'beklemede' CHECK (durum IN ('beklemede', 'inceleniyor', 'onaylandi', 'reddedildi')),
  basvuru_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  degerlendirme_tarihi DATE,
  gerekce TEXT,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES public.social_aid_applications(id) ON DELETE CASCADE,
  beneficiary_id BIGINT NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  tutar DECIMAL(12, 2) NOT NULL,
  odeme_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  odeme_yontemi TEXT NOT NULL CHECK (odeme_yontemi IN ('nakit', 'havale', 'elden')),
  durum TEXT NOT NULL DEFAULT 'beklemede' CHECK (durum IN ('beklemede', 'odendi', 'iptal')),
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- DOCUMENTS TABLE - BIGINT ID
-- =============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  beneficiary_id BIGINT NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('kimlik', 'ikamet', 'saglik', 'gelir', 'diger')),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- RE-APPLY INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_members_tc_kimlik ON public.members(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_members_ad_soyad ON public.members(ad, soyad);
CREATE INDEX IF NOT EXISTS idx_donations_tarih ON public.donations(tarih DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amac ON public.donations(amac);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tc_kimlik ON public.beneficiaries(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_durum ON public.beneficiaries(durum);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_ihtiyac ON public.beneficiaries(ihtiyac_durumu);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_parent_id ON public.beneficiaries(parent_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_relationship_type ON public.beneficiaries(relationship_type);
CREATE INDEX IF NOT EXISTS idx_kumbaras_kod ON public.kumbaras(kod);
CREATE INDEX IF NOT EXISTS idx_kumbaras_durum ON public.kumbaras(durum);
CREATE INDEX IF NOT EXISTS idx_applications_durum ON public.social_aid_applications(durum);
CREATE INDEX IF NOT EXISTS idx_applications_basvuran ON public.social_aid_applications(basvuran_id);
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary ON public.payments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_beneficiary ON public.documents(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);

-- =============================================
-- RE-ENABLE RLS
-- =============================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kumbaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_aid_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RE-APPLY POLICIES
-- =============================================

-- Members
CREATE POLICY "Authenticated users can view members" ON public.members
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage members" ON public.members
  FOR ALL USING (auth.role() = 'authenticated');

-- Donations
CREATE POLICY "Authenticated users can manage donations" ON public.donations
  FOR ALL USING (auth.role() = 'authenticated');

-- Beneficiaries
CREATE POLICY "Authenticated users can manage beneficiaries" ON public.beneficiaries
  FOR ALL USING (auth.role() = 'authenticated');

-- Kumbaras
CREATE POLICY "Authenticated users can manage kumbaras" ON public.kumbaras
  FOR ALL USING (auth.role() = 'authenticated');

-- Applications
CREATE POLICY "Authenticated users can manage applications" ON public.social_aid_applications
  FOR ALL USING (auth.role() = 'authenticated');

-- Payments
CREATE POLICY "Authenticated users can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Documents
CREATE POLICY "Authenticated users can manage documents" ON public.documents
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- RE-APPLY TRIGGERS
-- =============================================
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_kumbaras_updated_at BEFORE UPDATE ON public.kumbaras FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.social_aid_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Add missing fields to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS kan_grubu TEXT,
ADD COLUMN IF NOT EXISTS meslek TEXT,
ADD COLUMN IF NOT EXISTS il TEXT,
ADD COLUMN IF NOT EXISTS ilce TEXT;

-- Add indexes for the new fields to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_members_kan_grubu ON public.members(kan_grubu);
CREATE INDEX IF NOT EXISTS idx_members_meslek ON public.members(meslek);
CREATE INDEX IF NOT EXISTS idx_members_il ON public.members(il);
-- Add Performance Indexes
-- HIGH PRIORITY: Improves query performance for common operations
-- Based on query analysis and missing index detection

-- ============================================================================
-- MEMBERS TABLE INDEXES
-- ============================================================================

-- Registration date filtering (used in reports)
CREATE INDEX IF NOT EXISTS idx_members_kayit_tarihi
ON public.members(kayit_tarihi DESC);

-- Created timestamp for recent members
CREATE INDEX IF NOT EXISTS idx_members_created_at
ON public.members(created_at DESC);

-- Membership status filtering
CREATE INDEX IF NOT EXISTS idx_members_uyelik_durumu
ON public.members(uyelik_durumu)
WHERE uyelik_durumu IS NOT NULL;

-- ============================================================================
-- DONATIONS TABLE INDEXES
-- ============================================================================

-- Created timestamp for recent donations (critical for dashboard)
CREATE INDEX IF NOT EXISTS idx_donations_created_at
ON public.donations(created_at DESC);

-- Composite index for member donations sorted by date (N+1 query fix)
CREATE INDEX IF NOT EXISTS idx_donations_member_date
ON public.donations(member_id, tarih DESC)
WHERE member_id IS NOT NULL;

-- Purpose and date for filtered reports
CREATE INDEX IF NOT EXISTS idx_donations_purpose_date
ON public.donations(amac, tarih DESC)
WHERE amac IS NOT NULL;

-- ============================================================================
-- BENEFICIARIES TABLE INDEXES
-- ============================================================================

-- Recent registrations
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at
ON public.beneficiaries(created_at DESC);

-- Active beneficiaries sorted by date (most common query)
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status_date
ON public.beneficiaries(durum, created_at DESC);

-- Gender filtering (if used in reports)
CREATE INDEX IF NOT EXISTS idx_beneficiaries_cinsiyet
ON public.beneficiaries(cinsiyet)
WHERE cinsiyet IS NOT NULL;

-- Parent-child relationship queries
CREATE INDEX IF NOT EXISTS idx_beneficiaries_parent_relationship
ON public.beneficiaries(parent_id, relationship_type)
WHERE parent_id IS NOT NULL;

-- City/district filtering
CREATE INDEX IF NOT EXISTS idx_beneficiaries_location
ON public.beneficiaries(il, ilce)
WHERE il IS NOT NULL;

-- ============================================================================
-- SOCIAL AID APPLICATIONS INDEXES
-- ============================================================================

-- Application date range queries (critical for reports)
CREATE INDEX IF NOT EXISTS idx_applications_basvuru_tarihi
ON public.social_aid_applications(basvuru_tarihi DESC);

-- Aid type filtering
CREATE INDEX IF NOT EXISTS idx_applications_yardim_turu
ON public.social_aid_applications(yardim_turu)
WHERE yardim_turu IS NOT NULL;

-- Status and date composite (active applications)
CREATE INDEX IF NOT EXISTS idx_applications_status_date
ON public.social_aid_applications(durum, basvuru_tarihi DESC);

-- Applicant's applications
CREATE INDEX IF NOT EXISTS idx_applications_basvuran
ON public.social_aid_applications(basvuran_id, basvuru_tarihi DESC)
WHERE basvuran_id IS NOT NULL;

-- ============================================================================
-- PAYMENTS TABLE INDEXES (CRITICAL - Financial Data)
-- ============================================================================

-- Payment date range queries (most common)
CREATE INDEX IF NOT EXISTS idx_payments_odeme_tarihi
ON public.social_aid_payments(odeme_tarihi DESC)
WHERE odeme_tarihi IS NOT NULL;

-- Payment status filtering
CREATE INDEX IF NOT EXISTS idx_payments_durum
ON public.social_aid_payments(durum);

-- Composite: date and status for filtered reports
CREATE INDEX IF NOT EXISTS idx_payments_date_status
ON public.social_aid_payments(odeme_tarihi DESC, durum)
WHERE odeme_tarihi IS NOT NULL;

-- Beneficiary's payment history
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary_date
ON public.social_aid_payments(beneficiary_id, odeme_tarihi DESC);

-- Application payments
CREATE INDEX IF NOT EXISTS idx_payments_application
ON public.social_aid_payments(application_id)
WHERE application_id IS NOT NULL;

-- Payment method analysis
CREATE INDEX IF NOT EXISTS idx_payments_odeme_yontemi
ON public.social_aid_payments(odeme_yontemi)
WHERE odeme_yontemi IS NOT NULL;

-- ============================================================================
-- IN-KIND AIDS INDEXES
-- ============================================================================

-- Distribution date for recent aids
CREATE INDEX IF NOT EXISTS idx_inkind_dagitim_tarihi
ON public.in_kind_aids(dagitim_tarihi DESC)
WHERE dagitim_tarihi IS NOT NULL;

-- Aid type filtering
CREATE INDEX IF NOT EXISTS idx_inkind_yardim_turu
ON public.in_kind_aids(yardim_turu);

-- Beneficiary's aid history
CREATE INDEX IF NOT EXISTS idx_inkind_beneficiary_date
ON public.in_kind_aids(beneficiary_id, dagitim_tarihi DESC);

-- Created date for recent records
CREATE INDEX IF NOT EXISTS idx_inkind_created_at
ON public.in_kind_aids(created_at DESC);

-- ============================================================================
-- KUMBARAS TABLE INDEXES
-- ============================================================================

-- Last collection date
CREATE INDEX IF NOT EXISTS idx_kumbaras_son_toplama
ON public.kumbaras(son_toplama_tarihi DESC)
WHERE son_toplama_tarihi IS NOT NULL;

-- Active kumbaras
CREATE INDEX IF NOT EXISTS idx_kumbaras_aktif
ON public.kumbaras(durum, son_toplama_tarihi DESC)
WHERE durum = 'aktif';

-- Responsible person's kumbaras
CREATE INDEX IF NOT EXISTS idx_kumbaras_sorumlu
ON public.kumbaras(sorumlu_id)
WHERE sorumlu_id IS NOT NULL;

-- ============================================================================
-- ROUTES TABLE INDEXES
-- ============================================================================

-- Route date
CREATE INDEX IF NOT EXISTS idx_routes_tarih
ON public.routes(tarih DESC);

-- Active routes
CREATE INDEX IF NOT EXISTS idx_routes_aktif
ON public.routes(aktif);

-- ============================================================================
-- DOCUMENTS TABLE INDEXES
-- ============================================================================

-- Document type filtering (already exists but verify)
CREATE INDEX IF NOT EXISTS idx_documents_type_date
ON public.documents(document_type, created_at DESC);

-- Uploader's documents
CREATE INDEX IF NOT EXISTS idx_documents_uploader
ON public.documents(uploaded_by, created_at DESC)
WHERE uploaded_by IS NOT NULL;

-- Recent uploads (verify exists)
CREATE INDEX IF NOT EXISTS idx_documents_recent
ON public.documents(created_at DESC);

-- ============================================================================
-- TEXT SEARCH INDEXES (for Turkish characters)
-- ============================================================================

-- Install pg_trgm extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Members name search (Turkish characters)
CREATE INDEX IF NOT EXISTS idx_members_name_trgm
ON public.members USING gin(ad gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_members_surname_trgm
ON public.members USING gin(soyad gin_trgm_ops);

-- Beneficiaries name search
CREATE INDEX IF NOT EXISTS idx_beneficiaries_name_trgm
ON public.beneficiaries USING gin(ad gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_surname_trgm
ON public.beneficiaries USING gin(soyad gin_trgm_ops);

-- Combined name search (for full name searches)
CREATE INDEX IF NOT EXISTS idx_members_fullname_trgm
ON public.members USING gin((ad || ' ' || soyad) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_fullname_trgm
ON public.beneficiaries USING gin((ad || ' ' || soyad) gin_trgm_ops);

-- ============================================================================
-- PARTIAL INDEXES (for specific conditions)
-- ============================================================================

-- Only active members
CREATE INDEX IF NOT EXISTS idx_members_active
ON public.members(created_at DESC)
WHERE uyelik_durumu = 'aktif';

-- Only pending applications
CREATE INDEX IF NOT EXISTS idx_applications_pending
ON public.social_aid_applications(basvuru_tarihi DESC)
WHERE durum = 'beklemede';

-- Only unpaid payments
CREATE INDEX IF NOT EXISTS idx_payments_unpaid
ON public.social_aid_payments(odeme_tarihi DESC)
WHERE durum = 'beklemede';

-- ============================================================================
-- VERIFICATION & MAINTENANCE
-- ============================================================================

-- Analyze tables to update statistics
ANALYZE public.members;
ANALYZE public.donations;
ANALYZE public.beneficiaries;
ANALYZE public.social_aid_applications;
ANALYZE public.social_aid_payments;
ANALYZE public.in_kind_aids;
ANALYZE public.kumbaras;
ANALYZE public.routes;
ANALYZE public.documents;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_members_kayit_tarihi IS 'Improves member registration date filtering';
COMMENT ON INDEX idx_donations_member_date IS 'Fixes N+1 query for member donations';
COMMENT ON INDEX idx_beneficiaries_status_date IS 'Optimizes active beneficiaries query (most common)';
COMMENT ON INDEX idx_payments_date_status IS 'Critical for payment reports and dashboard';
COMMENT ON INDEX idx_members_fullname_trgm IS 'Fast Turkish text search on full names';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify indexes:
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;
-- Create Optimized Dashboard Stats Function
-- HIGH PRIORITY: Reduces 10+ queries to 1 RPC call
-- Performance improvement: ~80% faster dashboard load

-- ============================================================================
-- DASHBOARD STATS RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  active_members_count INT;
  pending_applications_count INT;
  monthly_aid_total NUMERIC;
  aid_distribution JSON;
  recent_applications JSON;
  recent_members JSON;
  beneficiary_counts JSON;
BEGIN
  -- Active members count
  SELECT COUNT(*)::INT INTO active_members_count
  FROM public.members
  WHERE uyelik_durumu = 'aktif';

  -- Pending applications count
  SELECT COUNT(*)::INT INTO pending_applications_count
  FROM public.social_aid_applications
  WHERE durum = 'beklemede';

  -- Monthly aid total (current month)
  SELECT COALESCE(SUM(tutar), 0) INTO monthly_aid_total
  FROM public.social_aid_payments
  WHERE odeme_tarihi >= DATE_TRUNC('month', CURRENT_DATE)
    AND odeme_tarihi < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    AND durum = 'odendi';

  -- Aid distribution by category (for pie chart)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', CASE yardim_turu
        WHEN 'egitim' THEN 'Eğitim'
        WHEN 'saglik' THEN 'Sağlık'
        WHEN 'gida' THEN 'Gıda'
        WHEN 'barinma' THEN 'Barınma'
        WHEN 'diger' THEN 'Diğer'
        ELSE yardim_turu
      END,
      'value', total_amount,
      'count', payment_count,
      'color', CASE yardim_turu
        WHEN 'egitim' THEN '#3b82f6'
        WHEN 'saglik' THEN '#10b981'
        WHEN 'gida' THEN '#f59e0b'
        WHEN 'barinma' THEN '#8b5cf6'
        ELSE '#6b7280'
      END
    )
  ) INTO aid_distribution
  FROM (
    SELECT
      yardim_turu,
      SUM(tutar) as total_amount,
      COUNT(*) as payment_count
    FROM public.social_aid_payments
    WHERE odeme_tarihi >= CURRENT_DATE - INTERVAL '6 months'
      AND durum = 'odendi'
    GROUP BY yardim_turu
    ORDER BY total_amount DESC
  ) subquery;

  -- Recent pending applications (last 5)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', a.id,
      'basvuranKisi', JSON_BUILD_OBJECT(
        'ad', b.ad,
        'soyad', b.soyad
      ),
      'talepEdilenTutar', a.talep_edilen_tutar,
      'durum', a.durum,
      'createdAt', a.created_at
    )
    ORDER BY a.created_at DESC
  ) INTO recent_applications
  FROM public.social_aid_applications a
  INNER JOIN public.beneficiaries b ON a.basvuran_id = b.id
  WHERE a.durum = 'beklemede'
  ORDER BY a.created_at DESC
  LIMIT 5;

  -- Recent members (last 5)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', id,
      'ad', ad,
      'soyad', soyad,
      'uyeNo', uye_no,
      'uyeTuru', uye_turu,
      'createdAt', created_at
    )
    ORDER BY created_at DESC
  ) INTO recent_members
  FROM public.members
  ORDER BY created_at DESC
  LIMIT 5;

  -- Beneficiary counts by status
  SELECT JSON_BUILD_OBJECT(
    'aktif', COALESCE(SUM(CASE WHEN durum = 'aktif' THEN 1 ELSE 0 END), 0),
    'pasif', COALESCE(SUM(CASE WHEN durum = 'pasif' THEN 1 ELSE 0 END), 0),
    'tamamlandi', COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN 1 ELSE 0 END), 0)
  ) INTO beneficiary_counts
  FROM public.beneficiaries;

  -- Build final result
  result := JSON_BUILD_OBJECT(
    'activeMembers', active_members_count,
    'pendingApplications', pending_applications_count,
    'monthlyAid', monthly_aid_total,
    'aidDistribution', COALESCE(aid_distribution, '[]'::JSON),
    'recentApplications', COALESCE(recent_applications, '[]'::JSON),
    'recentMembers', COALESCE(recent_members, '[]'::JSON),
    'beneficiaryCounts', beneficiary_counts
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_dashboard_stats() IS 'Optimized dashboard statistics - reduces 10+ queries to 1 RPC call';

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================

/*
-- In your React Query hook:
const { data } = useQuery({
  queryKey: ['dashboardStats'],
  queryFn: async () => {
    const { data } = await supabase.rpc('get_dashboard_stats')
    return data
  }
})

-- Returns:
{
  activeMembers: 150,
  pendingApplications: 12,
  monthlyAid: 45000,
  aidDistribution: [
    { name: 'Eğitim', value: 25000, count: 50, color: '#3b82f6' },
    { name: 'Sağlık', value: 15000, count: 30, color: '#10b981' }
  ],
  recentApplications: [...],
  recentMembers: [...],
  beneficiaryCounts: { aktif: 85, pasif: 20, tamamlandi: 10 }
}
*/
-- Fix RLS Policies - Add Role-Based Access Control
-- CRITICAL SECURITY FIX: Current policies allow ANY authenticated user to delete everything
-- This migration implements proper role-based security

-- First, ensure users table has role column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'muhasebe', 'user'));
    END IF;
END $$;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is moderator or above
CREATE OR REPLACE FUNCTION public.is_moderator_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is muhasebe or above
CREATE OR REPLACE FUNCTION public.is_muhasebe_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'moderator', 'muhasebe');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE - Strict Admin Control
-- ============================================================================

DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can delete users" ON public.users;

-- Everyone can view users (for dropdowns, assignments)
CREATE POLICY "Authenticated users can view users"
    ON public.users FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only admins can update other users
CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only admins can insert/delete users
CREATE POLICY "Admins can insert users"
    ON public.users FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE
    USING (is_admin());

-- ============================================================================
-- MEMBERS TABLE - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;

CREATE POLICY "Authenticated users can view members"
    ON public.members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert members"
    ON public.members FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update members"
    ON public.members FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete members"
    ON public.members FOR DELETE
    USING (is_admin());

-- ============================================================================
-- DONATIONS TABLE - Muhasebe+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Users can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Users can update donations" ON public.donations;
DROP POLICY IF EXISTS "Users can delete donations" ON public.donations;

CREATE POLICY "Authenticated users can view donations"
    ON public.donations FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Muhasebe can insert donations"
    ON public.donations FOR INSERT
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can update donations"
    ON public.donations FOR UPDATE
    USING (is_muhasebe_or_above())
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Admins can delete donations"
    ON public.donations FOR DELETE
    USING (is_admin());

-- ============================================================================
-- BENEFICIARIES TABLE - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can insert beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can update beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can delete beneficiaries" ON public.beneficiaries;

CREATE POLICY "Authenticated users can view beneficiaries"
    ON public.beneficiaries FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert beneficiaries"
    ON public.beneficiaries FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update beneficiaries"
    ON public.beneficiaries FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete beneficiaries"
    ON public.beneficiaries FOR DELETE
    USING (is_admin());

-- ============================================================================
-- SOCIAL AID APPLICATIONS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can insert applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can update applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can delete applications" ON public.social_aid_applications;

CREATE POLICY "Authenticated users can view applications"
    ON public.social_aid_applications FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert applications"
    ON public.social_aid_applications FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update applications"
    ON public.social_aid_applications FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete applications"
    ON public.social_aid_applications FOR DELETE
    USING (is_admin());

-- ============================================================================
-- PAYMENTS TABLE - Muhasebe+ Only (Financial Data)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can update payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can delete payments" ON public.social_aid_payments;

CREATE POLICY "Muhasebe can view payments"
    ON public.social_aid_payments FOR SELECT
    USING (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can insert payments"
    ON public.social_aid_payments FOR INSERT
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can update payments"
    ON public.social_aid_payments FOR UPDATE
    USING (is_muhasebe_or_above())
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Admins can delete payments"
    ON public.social_aid_payments FOR DELETE
    USING (is_admin());

-- ============================================================================
-- IN-KIND AIDS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can insert in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can update in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can delete in-kind aids" ON public.in_kind_aids;

CREATE POLICY "Authenticated users can view in-kind aids"
    ON public.in_kind_aids FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert in-kind aids"
    ON public.in_kind_aids FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update in-kind aids"
    ON public.in_kind_aids FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete in-kind aids"
    ON public.in_kind_aids FOR DELETE
    USING (is_admin());

-- ============================================================================
-- KUMBARAS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can insert kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can update kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can delete kumbaras" ON public.kumbaras;

CREATE POLICY "Authenticated users can view kumbaras"
    ON public.kumbaras FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert kumbaras"
    ON public.kumbaras FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update kumbaras"
    ON public.kumbaras FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete kumbaras"
    ON public.kumbaras FOR DELETE
    USING (is_admin());

-- ============================================================================
-- ROUTES - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view routes" ON public.routes;
DROP POLICY IF EXISTS "Users can insert routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete routes" ON public.routes;

CREATE POLICY "Authenticated users can view routes"
    ON public.routes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert routes"
    ON public.routes FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update routes"
    ON public.routes FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete routes"
    ON public.routes FOR DELETE
    USING (is_admin());

-- ============================================================================
-- DOCUMENTS - User Can Upload, Moderator+ Can Delete
-- ============================================================================

DROP POLICY IF EXISTS "Users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents" ON public.documents;

CREATE POLICY "Authenticated users can view documents"
    ON public.documents FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (uploaded_by = auth.uid())
    WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Moderators can update any document"
    ON public.documents FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can delete documents"
    ON public.documents FOR DELETE
    USING (is_moderator_or_above());

-- ============================================================================
-- AUDIT LOGS - Insert Only, Admin View
-- ============================================================================

-- Note: Assuming audit_logs table exists or will be created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
        DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

        CREATE POLICY "Admins can view audit logs"
            ON public.audit_logs FOR SELECT
            USING (is_admin());

        CREATE POLICY "System can insert audit logs"
            ON public.audit_logs FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin';
COMMENT ON FUNCTION public.is_moderator_or_above() IS 'Returns true if current user is moderator or admin';
COMMENT ON FUNCTION public.is_muhasebe_or_above() IS 'Returns true if current user is muhasebe, moderator, or admin';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify policies are in place:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
-- Hospital Referral and Treatment Tracking Tables

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[], -- Array of medical specialties
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'referred' CHECK (status IN ('referred', 'scheduled', 'treated', 'follow-up', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.hospital_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  location TEXT, -- Specific department or room
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TREATMENT COSTS TABLE
CREATE TABLE IF NOT EXISTS public.treatment_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'EUR', 'USD')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('nakit', 'havale', 'elden')),
  incurred_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS public.treatment_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.hospital_appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  treatment_received TEXT,
  outcome_notes TEXT,
  follow_up_needed BOOLEAN NOT NULL DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON public.hospitals(name);
CREATE INDEX IF NOT EXISTS idx_referrals_beneficiary ON public.referrals(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_referrals_hospital ON public.referrals(hospital_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_appointments_referral ON public.hospital_appointments(referral_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.hospital_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_costs_referral ON public.treatment_costs(referral_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_referral ON public.treatment_outcomes(referral_id);

-- RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_outcomes ENABLE ROW LEVEL SECURITY;

-- POLICIES (Full access for authenticated users for now, matching other tables)
CREATE POLICY "Authenticated users can manage hospitals" ON public.hospitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage referrals" ON public.referrals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage appointments" ON public.hospital_appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage costs" ON public.treatment_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage outcomes" ON public.treatment_outcomes FOR ALL USING (auth.role() = 'authenticated');

-- TRIGGERS
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.hospital_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_costs_updated_at BEFORE UPDATE ON public.treatment_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_outcomes_updated_at BEFORE UPDATE ON public.treatment_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Create Donation Analytics Function
-- Purpose: Aggregated donation trends by time period

CREATE OR REPLACE FUNCTION public.get_donation_trends(period_type TEXT)
RETURNS JSON AS $$
DECLARE
  trunc_period TEXT;
  result JSON;
BEGIN
  -- Determine date truncation period
  CASE period_type
    WHEN 'monthly' THEN trunc_period := 'month';
    WHEN 'quarterly' THEN trunc_period := 'quarter';
    WHEN 'yearly' THEN trunc_period := 'year';
    ELSE RAISE EXCEPTION 'Invalid period type: %', period_type;
  END CASE;

  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'period', TO_CHAR(DATE_TRUNC(trunc_period, tarih), 'YYYY-MM-DD'),
      'total_amount', total_amount,
      'count', donation_count
    )
    ORDER BY period_date DESC
  ) INTO result
  FROM (
    SELECT
      DATE_TRUNC(trunc_period, tarih) as period_date,
      SUM(tutar) as total_amount,
      COUNT(*) as donation_count
    FROM public.donations
    WHERE tarih IS NOT NULL
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 24 -- Limit to last 24 periods
  ) subquery;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_donation_trends(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_donation_trends(TEXT) IS 'Returns aggregated donation trends (total amount, count) grouped by the specified period (monthly, quarterly, yearly).';
-- =============================================
-- NEED ASSESSMENTS TABLE (İhtiyaç Değerlendirmesi)
-- =============================================

CREATE TABLE IF NOT EXISTS public.need_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  
  -- Assessment Metadata
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  assessment_type TEXT NOT NULL DEFAULT 'initial' CHECK (assessment_type IN ('initial', 'follow-up', 'review', 'updated')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
  
  -- Family Composition
  household_size INTEGER NOT NULL,
  dependent_count INTEGER NOT NULL DEFAULT 0,
  children_count INTEGER NOT NULL DEFAULT 0,
  elderly_count INTEGER NOT NULL DEFAULT 0,
  disabled_count INTEGER NOT NULL DEFAULT 0,
  orphans_count INTEGER NOT NULL DEFAULT 0,
  
  -- Income Documentation
  monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  income_sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of income sources
  income_verified BOOLEAN DEFAULT FALSE,
  income_documentation TEXT, -- Path or reference to income docs
  
  -- Expense Documentation
  monthly_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  rent_expense DECIMAL(12, 2) DEFAULT 0,
  utilities_expense DECIMAL(12, 2) DEFAULT 0,
  food_expense DECIMAL(12, 2) DEFAULT 0,
  health_expense DECIMAL(12, 2) DEFAULT 0,
  education_expense DECIMAL(12, 2) DEFAULT 0,
  other_expenses DECIMAL(12, 2) DEFAULT 0,
  
  -- Housing & Living Situation
  housing_type TEXT NOT NULL DEFAULT 'rented' CHECK (housing_type IN ('owned', 'rented', 'shared', 'shelter', 'informal')),
  housing_condition TEXT DEFAULT 'fair' CHECK (housing_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  has_utilities BOOLEAN DEFAULT FALSE,
  
  -- Specific Needs & Challenges
  health_issues TEXT[] DEFAULT ARRAY[]::TEXT[], -- Health challenges
  education_needs TEXT[] DEFAULT ARRAY[]::TEXT[], -- Educational support needs
  employment_status TEXT DEFAULT 'unemployed' CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'student', 'retired', 'disabled')),
  specific_needs JSONB DEFAULT '{}'::JSONB, -- Flexible field for specific needs
  
  -- Priority Scoring
  priority_score INTEGER DEFAULT 0, -- Calculated based on criteria (0-100)
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
  
  -- Recommendations
  recommended_aid_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_aid_amount DECIMAL(12, 2) DEFAULT 0,
  assessment_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- NEED ASSESSMENT DEPENDENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_dependents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Dependent Information
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- e.g., 'child', 'parent', 'sibling', 'spouse'
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- Status
  health_status TEXT DEFAULT 'healthy', -- e.g., 'healthy', 'chronic-illness', 'disabled', 'elderly'
  education_status TEXT DEFAULT 'not-applicable', -- e.g., 'student', 'not-attending', 'completed'
  employment_status TEXT DEFAULT 'none', -- e.g., 'employed', 'student', 'unemployed', 'none'
  
  -- Support Needs
  support_needs TEXT[] DEFAULT ARRAY[]::TEXT[],
  monthly_cost DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ASSESSMENT DOCUMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Document Info
  document_type TEXT NOT NULL, -- e.g., 'income-proof', 'expense-proof', 'health-record', 'housing-photo'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ASSESSMENT HISTORY VIEW
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.need_assessments(id) ON DELETE CASCADE,
  
  -- Historical tracking
  assessment_date DATE NOT NULL,
  priority_level TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  household_size INTEGER NOT NULL,
  monthly_income DECIMAL(12, 2) NOT NULL,
  monthly_expenses DECIMAL(12, 2) NOT NULL,
  recommended_aid_amount DECIMAL(12, 2),
  assessor_name TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_assessments_beneficiary ON public.need_assessments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON public.need_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.need_assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_priority ON public.need_assessments(priority_level);
CREATE INDEX IF NOT EXISTS idx_assessments_assessor ON public.need_assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_dependents_assessment ON public.assessment_dependents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_documents_assessment ON public.assessment_documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_history_beneficiary ON public.assessment_history(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON public.assessment_history(assessment_date DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.need_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view/manage assessments
CREATE POLICY "Authenticated users can manage assessments" ON public.need_assessments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment dependents" ON public.assessment_dependents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment documents" ON public.assessment_documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view assessment history" ON public.assessment_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.need_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCTION: Calculate Priority Score
-- =============================================

CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_household_size INTEGER,
  p_monthly_income DECIMAL,
  p_monthly_expenses DECIMAL,
  p_dependent_count INTEGER,
  p_disabled_count INTEGER,
  p_health_issues_count INTEGER,
  p_housing_condition TEXT
)
RETURNS TABLE(score INTEGER, priority_level TEXT) AS $$
DECLARE
  v_score INTEGER := 0;
  v_priority_level TEXT;
BEGIN
  -- Income-to-expense ratio (base: 30 points)
  IF p_monthly_expenses > 0 THEN
    v_score := v_score + LEAST(30, (p_monthly_expenses::DECIMAL / NULLIF(p_monthly_income, 0))::INTEGER * 15);
  ELSE
    v_score := v_score + 30;
  END IF;
  
  -- Household size (base: 20 points)
  v_score := v_score + LEAST(20, p_household_size * 4);
  
  -- Dependents (base: 20 points)
  v_score := v_score + LEAST(20, p_dependent_count * 5);
  
  -- Disabled/health issues (base: 15 points)
  v_score := v_score + (p_disabled_count * 5) + (p_health_issues_count * 2);
  
  -- Housing condition (base: 15 points)
  CASE p_housing_condition
    WHEN 'critical' THEN v_score := v_score + 15
    WHEN 'poor' THEN v_score := v_score + 12
    WHEN 'fair' THEN v_score := v_score + 8
    WHEN 'good' THEN v_score := v_score + 3
    ELSE v_score := v_score + 0
  END CASE;
  
  -- Cap at 100
  v_score := LEAST(v_score, 100);
  
  -- Determine priority level
  IF v_score >= 80 THEN
    v_priority_level := 'critical';
  ELSIF v_score >= 60 THEN
    v_priority_level := 'high';
  ELSIF v_score >= 40 THEN
    v_priority_level := 'medium';
  ELSE
    v_priority_level := 'low';
  END IF;
  
  RETURN QUERY SELECT v_score, v_priority_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- Create Donation Source Distribution Function
-- Purpose: Aggregated donation stats by source (Donations + Kumbara)

CREATE OR REPLACE FUNCTION public.get_donation_source_distribution()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'source', source_name,
      'total_amount', total_amount,
      'count', tx_count
    )
    ORDER BY total_amount DESC
  ) INTO result
  FROM (
    -- Donations grouped by payment method
    SELECT
      CASE odeme_yontemi
        WHEN 'havale' THEN 'Havale/EFT'
        WHEN 'kredi_karti' THEN 'Kredi Kartı'
        WHEN 'nakit' THEN 'Elden/Nakit'
        WHEN 'mobil_odeme' THEN 'Mobil Ödeme'
        ELSE COALESCE(odeme_yontemi, 'Diğer')
      END as source_name,
      SUM(tutar) as total_amount,
      COUNT(*) as tx_count
    FROM public.donations
    WHERE tutar > 0
    GROUP BY 1

    UNION ALL

    -- Kumbara collections
    SELECT
      'Kumbara' as source_name,
      COALESCE(SUM(toplam_toplanan), 0) as total_amount,
      COUNT(*) as tx_count
    FROM public.kumbaras
    WHERE durum = 'toplandi'
      AND toplam_toplanan > 0
    GROUP BY 1
  ) combined_stats;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_donation_source_distribution() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_donation_source_distribution() IS 'Returns donation statistics grouped by source (Payment Method and Kumbara).';
-- Create Top Donors Function
-- Purpose: Get top donors by total donation amount

CREATE OR REPLACE FUNCTION public.get_top_donors(limit_count INT DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'donor_name', COALESCE(bagisci_adi, 'İsimsiz'),
      'total_amount', total_amount,
      'donation_count', donation_count,
      'last_donation_date', last_donation
    )
    ORDER BY total_amount DESC
  ) INTO result
  FROM (
    SELECT
      bagisci_adi,
      SUM(tutar) as total_amount,
      COUNT(*) as donation_count,
      MAX(tarih) as last_donation
    FROM public.donations
    WHERE tutar > 0
    GROUP BY bagisci_adi
    ORDER BY total_amount DESC
    LIMIT limit_count
  ) subquery;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_top_donors(INT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_top_donors(INT) IS 'Returns the top donors ranked by total donation amount.';
-- =============================================
-- ENHANCE AUDIT LOGGING SYSTEM
-- =============================================

-- Add additional columns to audit_logs for better tracking
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'access_denied')),
ADD COLUMN IF NOT EXISTS entity_name TEXT,
ADD COLUMN IF NOT EXISTS change_summary TEXT,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'attempted'));

-- Create an audit_log_config table for retention policies
CREATE TABLE IF NOT EXISTS public.audit_log_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an audit events table for structured event tracking
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'attempted')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at TIMESTAMPTZ DEFAULT NULL
);

-- Create table for tracking user login/logout events
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'logged_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR AUDIT TABLES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON public.audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_events_status ON public.audit_events(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_request ON public.audit_events(request_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_login ON public.user_sessions(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.user_sessions(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.audit_log_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify audit config
CREATE POLICY "Admins can view audit config" ON public.audit_log_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update audit config" ON public.audit_log_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit config" ON public.audit_log_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can view audit events (more detailed)
CREATE POLICY "Admins can view audit events" ON public.audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User sessions - users can view their own, admins can view all
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- AUDIT LOGGING FUNCTION FOR GENERIC OPERATIONS
-- =============================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_before_data JSONB DEFAULT NULL,
  p_after_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.audit_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data,
    metadata,
    ip_address,
    user_agent,
    severity,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_event_type,
    p_entity_type,
    p_entity_id,
    p_action,
    p_before_data,
    p_after_data,
    p_metadata,
    p_ip_address,
    p_user_agent,
    p_severity,
    p_status,
    p_error_message
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUDIT TRIGGERS FOR KEY TABLES
-- =============================================

-- Function to create audit log on any table change
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_change_summary TEXT;
BEGIN
  -- Build change summary
  IF TG_OP = 'INSERT' THEN
    v_change_summary := 'New record created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_change_summary := 'Record updated';
  ELSIF TG_OP = 'DELETE' THEN
    v_change_summary := 'Record deleted';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    action_type,
    entity_name,
    change_summary,
    severity
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    LOWER(TG_OP),
    TG_TABLE_NAME,
    v_change_summary,
    CASE WHEN TG_OP = 'DELETE' THEN 'warning' ELSE 'info' END
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for key tables
DROP TRIGGER IF EXISTS audit_members_trigger ON public.members;
CREATE TRIGGER audit_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_donations_trigger ON public.donations;
CREATE TRIGGER audit_donations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_beneficiaries_trigger ON public.beneficiaries;
CREATE TRIGGER audit_beneficiaries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_social_aid_apps_trigger ON public.social_aid_applications;
CREATE TRIGGER audit_social_aid_apps_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.social_aid_applications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_audit_trail(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  action_type TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_logs.id,
    audit_logs.user_id,
    audit_logs.action,
    audit_logs.action_type,
    audit_logs.old_data,
    audit_logs.new_data,
    audit_logs.created_at
  FROM public.audit_logs
  WHERE table_name = p_table_name
    AND record_id = p_record_id
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  v_retention_days INTEGER := 90;
  v_deleted_count INTEGER;
BEGIN
  -- Get retention policy from config
  SELECT (value->>'days')::INTEGER INTO v_retention_days
  FROM public.audit_log_config
  WHERE key = 'retention_days';
  
  -- Default to 90 days if not configured
  IF v_retention_days IS NULL THEN
    v_retention_days := 90;
  END IF;
  
  -- Delete old records
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_events BIGINT,
  events_by_type JSONB,
  events_by_user JSONB,
  critical_events BIGINT,
  failed_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    jsonb_object_agg(action_type, count)
      FROM (SELECT action_type, COUNT(*) as count 
            FROM public.audit_logs 
            WHERE created_at > NOW() - (p_days || ' days')::INTERVAL 
            GROUP BY action_type),
    jsonb_object_agg(user_id::TEXT, count)
      FROM (SELECT user_id, COUNT(*) as count 
            FROM public.audit_logs 
            WHERE created_at > NOW() - (p_days || ' days')::INTERVAL 
            GROUP BY user_id),
    (SELECT COUNT(*)::BIGINT FROM public.audit_logs 
     WHERE severity = 'critical' 
     AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::BIGINT FROM public.audit_logs 
     WHERE status = 'failure' 
     AND created_at > NOW() - (p_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIALIZE RETENTION POLICY
-- =============================================

INSERT INTO public.audit_log_config (key, value, description)
VALUES 
  ('retention_days', '{"days": 90}'::JSONB, 'Number of days to retain audit logs'),
  ('log_sensitive_fields', '{"enabled": false}'::JSONB, 'Whether to log sensitive fields'),
  ('critical_tables', '["payments", "social_aid_applications", "users"]'::JSONB, 'Tables to log with critical severity')
ON CONFLICT (key) DO NOTHING;
-- Update Dashboard Stats Function with Comparison Data
-- Purpose: Add growth rates and previous period comparisons

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  
  -- Current stats
  active_members_count INT;
  pending_applications_count INT;
  monthly_aid_total NUMERIC;
  monthly_donation_total NUMERIC;
  
  -- Previous stats for comparison
  prev_members_count INT;
  prev_month_aid_total NUMERIC;
  prev_month_donation_total NUMERIC;
  
  -- Growth rates
  members_growth NUMERIC;
  aid_growth NUMERIC;
  donation_growth NUMERIC;
  
  aid_distribution JSON;
  recent_applications JSON;
  recent_members JSON;
  beneficiary_counts JSON;
  
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  prev_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
BEGIN
  -- 1. MEMBERS
  -- Current active members
  SELECT COUNT(*)::INT INTO active_members_count
  FROM public.members
  WHERE uyelik_durumu = 'aktif';
  
  -- Previous active members (approximate by created_at for simplicity, ideally needs historical snapshot)
  -- For now, we compare new members this month vs last month as a proxy for growth momentum
  SELECT COUNT(*)::INT INTO members_growth
  FROM public.members
  WHERE created_at >= current_month_start;
  
  SELECT COUNT(*)::INT INTO prev_members_count
  FROM public.members
  WHERE created_at >= prev_month_start AND created_at < current_month_start;

  -- 2. PENDING APPLICATIONS
  SELECT COUNT(*)::INT INTO pending_applications_count
  FROM public.social_aid_applications
  WHERE durum = 'beklemede';

  -- 3. MONTHLY AID
  -- Current month
  SELECT COALESCE(SUM(tutar), 0) INTO monthly_aid_total
  FROM public.social_aid_payments
  WHERE odeme_tarihi >= current_month_start
    AND odeme_tarihi < current_month_start + INTERVAL '1 month'
    AND durum = 'odendi';
    
  -- Previous month
  SELECT COALESCE(SUM(tutar), 0) INTO prev_month_aid_total
  FROM public.social_aid_payments
  WHERE odeme_tarihi >= prev_month_start
    AND odeme_tarihi < current_month_start
    AND durum = 'odendi';

  -- 4. MONTHLY DONATIONS
  -- Current month
  SELECT COALESCE(SUM(tutar), 0) INTO monthly_donation_total
  FROM public.donations
  WHERE tarih >= current_month_start
    AND tarih < current_month_start + INTERVAL '1 month';
    
  -- Previous month
  SELECT COALESCE(SUM(tutar), 0) INTO prev_month_donation_total
  FROM public.donations
  WHERE tarih >= prev_month_start
    AND tarih < current_month_start;

  -- CALCULATE GROWTH RATES
  -- Aid Growth
  IF prev_month_aid_total > 0 THEN
    aid_growth := ((monthly_aid_total - prev_month_aid_total) / prev_month_aid_total) * 100;
  ELSE
    aid_growth := 0;
  END IF;
  
  -- Donation Growth
  IF prev_month_donation_total > 0 THEN
    donation_growth := ((monthly_donation_total - prev_month_donation_total) / prev_month_donation_total) * 100;
  ELSE
    donation_growth := 0;
  END IF;

  -- 5. AID DISTRIBUTION (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', CASE yardim_turu
        WHEN 'egitim' THEN 'Eğitim'
        WHEN 'saglik' THEN 'Sağlık'
        WHEN 'gida' THEN 'Gıda'
        WHEN 'barinma' THEN 'Barınma'
        WHEN 'diger' THEN 'Diğer'
        ELSE yardim_turu
      END,
      'value', total_amount,
      'count', payment_count,
      'color', CASE yardim_turu
        WHEN 'egitim' THEN '#3b82f6'
        WHEN 'saglik' THEN '#10b981'
        WHEN 'gida' THEN '#f59e0b'
        WHEN 'barinma' THEN '#8b5cf6'
        ELSE '#6b7280'
      END
    )
  ) INTO aid_distribution
  FROM (
    SELECT
      yardim_turu,
      SUM(tutar) as total_amount,
      COUNT(*) as payment_count
    FROM public.social_aid_payments
    WHERE odeme_tarihi >= CURRENT_DATE - INTERVAL '6 months'
      AND durum = 'odendi'
    GROUP BY yardim_turu
    ORDER BY total_amount DESC
  ) subquery;

  -- 6. RECENT APPLICATIONS (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', a.id,
      'basvuranKisi', JSON_BUILD_OBJECT(
        'ad', b.ad,
        'soyad', b.soyad
      ),
      'talepEdilenTutar', a.talep_edilen_tutar,
      'durum', a.durum,
      'createdAt', a.created_at
    )
    ORDER BY a.created_at DESC
  ) INTO recent_applications
  FROM public.social_aid_applications a
  INNER JOIN public.beneficiaries b ON a.basvuran_id = b.id
  WHERE a.durum = 'beklemede'
  ORDER BY a.created_at DESC
  LIMIT 5;

  -- 7. RECENT MEMBERS (unchanged)
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', id,
      'ad', ad,
      'soyad', soyad,
      'uyeNo', uye_no,
      'uyeTuru', uye_turu,
      'createdAt', created_at
    )
    ORDER BY created_at DESC
  ) INTO recent_members
  FROM public.members
  ORDER BY created_at DESC
  LIMIT 5;

  -- 8. BENEFICIARY COUNTS (unchanged)
  SELECT JSON_BUILD_OBJECT(
    'aktif', COALESCE(SUM(CASE WHEN durum = 'aktif' THEN 1 ELSE 0 END), 0),
    'pasif', COALESCE(SUM(CASE WHEN durum = 'pasif' THEN 1 ELSE 0 END), 0),
    'tamamlandi', COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN 1 ELSE 0 END), 0)
  ) INTO beneficiary_counts
  FROM public.beneficiaries;

  -- Build final result with comparison data
  result := JSON_BUILD_OBJECT(
    'activeMembers', active_members_count,
    'membersGrowth', members_growth, -- New members count this month
    'pendingApplications', pending_applications_count,
    'monthlyAid', monthly_aid_total,
    'aidGrowth', ROUND(aid_growth, 1),
    'monthlyDonations', monthly_donation_total,
    'donationGrowth', ROUND(donation_growth, 1),
    'aidDistribution', COALESCE(aid_distribution, '[]'::JSON),
    'recentApplications', COALESCE(recent_applications, '[]'::JSON),
    'recentMembers', COALESCE(recent_members, '[]'::JSON),
    'beneficiaryCounts', beneficiary_counts
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
