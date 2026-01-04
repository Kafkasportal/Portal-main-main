-- =============================================
-- BENEFICIARY FAMILY MEMBERS TABLE
-- Aile Üyeleri Tablosu - İhtiyaç sahiplerine bağlı kişileri yönetmek için
-- =============================================

CREATE TABLE IF NOT EXISTS public.beneficiary_family_members (
  id BIGSERIAL PRIMARY KEY,
  beneficiary_id BIGINT NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  
  -- Temel Bilgiler
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  tc_kimlik_no TEXT UNIQUE,
  cinsiyet TEXT CHECK (cinsiyet IN ('erkek', 'kadın')),
  dogum_tarihi DATE,
  
  -- İlişki Türü
  iliski TEXT NOT NULL CHECK (iliski IN ('eş', 'baba', 'anne', 'çocuk', 'torun', 'kardeş', 'diğer')),
  
  -- Medeni Durum
  medeni_durum TEXT CHECK (medeni_durum IN ('bekar', 'evli', 'dul', 'boşanmış')),
  
  -- Eğitim Durumu
  egitim_durumu TEXT,
  
  -- Meslek ve Gelir
  meslek TEXT,
  gelir_durumu TEXT CHECK (gelir_durumu IN ('çalışan', 'emekli', 'çalışmıyor', 'öğrenci')),
  
  -- Açıklama
  aciklama TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_family_members_beneficiary ON public.beneficiary_family_members(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_family_members_tc_kimlik ON public.beneficiary_family_members(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_family_members_ad_soyad ON public.beneficiary_family_members(ad, soyad);
CREATE INDEX IF NOT EXISTS idx_family_members_iliski ON public.beneficiary_family_members(iliski);
CREATE INDEX IF NOT EXISTS idx_family_members_medeni ON public.beneficiary_family_members(medeni_durum);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.beneficiary_family_members ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view family members
CREATE POLICY "Authenticated users can view family members" 
ON public.beneficiary_family_members 
FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can add family members
CREATE POLICY "Authenticated users can add family members" 
ON public.beneficiary_family_members 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Authenticated users can update family members
CREATE POLICY "Authenticated users can update family members" 
ON public.beneficiary_family_members 
FOR UPDATE 
USING (
  auth.role() = 'authenticated'
);

-- Only admin or creator can delete family members
CREATE POLICY "Admins can delete family members" 
ON public.beneficiary_family_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp on modify
CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON public.beneficiary_family_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.beneficiary_family_members IS 
'Bu tablo ihtiyaç sahiplerine bağlı aile üyelerini yönetmek için kullanılır. 
Her kayıt bir ihtiyaç sahibine (beneficiary_id) bağlanır ve 
eş, baba, anne, çocuk, torun veya kardeş olabilir.';

COMMENT ON COLUMN public.beneficiary_family_members.iliski IS 
'İlişki türü: eş, baba, anne, çocuk, torun, kardeş veya diğer';

COMMENT ON COLUMN public.beneficiary_family_members.medeni_durum IS 
'Medeni durumu: bekar, evli, dul veya boşanmış';

COMMENT ON COLUMN public.beneficiary_family_members.gelir_durumu IS 
'Gelir durumu: çalışan, emekli, çalışmıyor veya öğrenci';


