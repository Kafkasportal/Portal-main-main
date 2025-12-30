-- Migration: Align kumbaras table with frontend form schema
-- This migration ensures kumbaras table matches kumbaraSchema

-- Kumbaras table already has most fields, just need to verify constraints

-- Ensure kod has minimum length (form requires min 3 characters)
ALTER TABLE kumbaras
  ADD CONSTRAINT kumbaras_kod_length_check 
  CHECK (LENGTH(kod) >= 3);

-- Ensure konum has minimum length (form requires min 5 characters)
ALTER TABLE kumbaras
  ADD CONSTRAINT kumbaras_konum_length_check 
  CHECK (LENGTH(konum) >= 5);

-- Ensure notlar has maximum length (form allows max 500 characters)
ALTER TABLE kumbaras
  ADD CONSTRAINT kumbaras_notlar_length_check 
  CHECK (notlar IS NULL OR LENGTH(notlar) <= 500);

-- Verify durum enum values match
ALTER TABLE kumbaras
  DROP CONSTRAINT IF EXISTS kumbaras_durum_check;

ALTER TABLE kumbaras
  ADD CONSTRAINT kumbaras_durum_check 
  CHECK (durum IN ('aktif', 'pasif', 'toplandi', 'kayip'));

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_kumbaras_kod ON kumbaras(kod);
CREATE INDEX IF NOT EXISTS idx_kumbaras_durum ON kumbaras(durum);
CREATE INDEX IF NOT EXISTS idx_kumbaras_sorumlu ON kumbaras(sorumlu_id);
CREATE INDEX IF NOT EXISTS idx_kumbaras_konum ON kumbaras(konum);

-- Add comments for documentation
COMMENT ON TABLE kumbaras IS 'Donation boxes (Kumbaras) - Aligned with frontend kumbaraSchema';
COMMENT ON COLUMN kumbaras.kod IS 'Kumbara code (min 3 characters)';
COMMENT ON COLUMN kumbaras.konum IS 'Location (min 5 characters)';
COMMENT ON COLUMN kumbaras.notlar IS 'Notes (max 500 characters)';
