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
