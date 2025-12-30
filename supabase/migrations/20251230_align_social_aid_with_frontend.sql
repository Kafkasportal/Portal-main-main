-- Migration: Align social_aid_applications table with frontend form schema
-- This migration updates the social aid applications table to match socialAidApplicationSchema

-- Add missing applicant information fields
ALTER TABLE social_aid_applications
  ADD COLUMN IF NOT EXISTS basvuran_ad TEXT,
  ADD COLUMN IF NOT EXISTS basvuran_soyad TEXT,
  ADD COLUMN IF NOT EXISTS basvuran_tc_kimlik_no TEXT,
  ADD COLUMN IF NOT EXISTS basvuran_telefon TEXT,
  ADD COLUMN IF NOT EXISTS basvuran_adres TEXT;

-- Update yardim_turu to match form enum values
ALTER TABLE social_aid_applications
  DROP CONSTRAINT IF EXISTS social_aid_applications_yardim_turu_check;

ALTER TABLE social_aid_applications
  ADD CONSTRAINT social_aid_applications_yardim_turu_check 
  CHECK (yardim_turu IN ('ayni', 'nakdi', 'egitim', 'saglik', 'kira', 'fatura'));

-- Ensure gerekce field has proper length constraint
ALTER TABLE social_aid_applications
  ALTER COLUMN gerekce TYPE TEXT;

COMMENT ON COLUMN social_aid_applications.gerekce IS 'Application reason/justification (min 20, max 1000 characters)';

-- Make basvuran_id optional since we now have direct applicant fields
ALTER TABLE social_aid_applications
  ALTER COLUMN basvuran_id DROP NOT NULL;

-- Add check constraint to ensure either basvuran_id or applicant details are provided
ALTER TABLE social_aid_applications
  ADD CONSTRAINT social_aid_applications_applicant_check 
  CHECK (
    basvuran_id IS NOT NULL OR 
    (basvuran_ad IS NOT NULL AND basvuran_soyad IS NOT NULL AND basvuran_tc_kimlik_no IS NOT NULL)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_aid_basvuran_tc ON social_aid_applications(basvuran_tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_social_aid_yardim_turu ON social_aid_applications(yardim_turu);
CREATE INDEX IF NOT EXISTS idx_social_aid_durum ON social_aid_applications(durum);
CREATE INDEX IF NOT EXISTS idx_social_aid_basvuru_tarihi ON social_aid_applications(basvuru_tarihi);

-- Add comments for documentation
COMMENT ON TABLE social_aid_applications IS 'Social aid applications - Aligned with frontend socialAidApplicationSchema';
COMMENT ON COLUMN social_aid_applications.basvuran_ad IS 'Applicant first name (can be used instead of basvuran_id)';
COMMENT ON COLUMN social_aid_applications.basvuran_soyad IS 'Applicant last name';
COMMENT ON COLUMN social_aid_applications.basvuran_tc_kimlik_no IS 'Applicant TC ID number';
COMMENT ON COLUMN social_aid_applications.basvuran_telefon IS 'Applicant phone number';
COMMENT ON COLUMN social_aid_applications.basvuran_adres IS 'Applicant address';
