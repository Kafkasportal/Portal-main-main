-- Migration: Update file size limits to 10MB across all layers
-- Date: 2026-01-02
-- Description: Increases file size limit from 5MB to 10MB for documents table and storage bucket

-- Update documents table constraint
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_file_size_check;

ALTER TABLE documents
ADD CONSTRAINT documents_file_size_check
CHECK (file_size <= 10485760); -- 10MB in bytes

-- Note: Storage bucket file size limit must be updated via Supabase Dashboard or API
-- Supabase Dashboard -> Storage -> documents bucket -> Settings -> File size limit: 10485760

COMMENT ON CONSTRAINT documents_file_size_check ON documents IS
'Maximum file size: 10MB (10485760 bytes)';
