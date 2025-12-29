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
