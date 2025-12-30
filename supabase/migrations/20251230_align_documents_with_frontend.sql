-- Migration: Align documents table with frontend file upload requirements
-- This migration ensures documents table matches fileUploadSchema and best practices

-- Add file validation fields
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update file_size constraint to match form (max 10MB)
ALTER TABLE documents
  ADD CONSTRAINT documents_file_size_check 
  CHECK (file_size <= 10485760); -- 10MB in bytes

-- Update file_type to match allowed types from form
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_file_type_check;

ALTER TABLE documents
  ADD CONSTRAINT documents_file_type_check 
  CHECK (
    file_type IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  );

-- Ensure document_type enum is correct
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE documents
  ADD CONSTRAINT documents_document_type_check 
  CHECK (document_type IN ('kimlik', 'ikamet', 'saglik', 'gelir', 'diger'));

-- Add storage bucket reference
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'documents',
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Make beneficiary_id optional (documents can be for other entities too)
ALTER TABLE documents
  ALTER COLUMN beneficiary_id DROP NOT NULL;

-- Add polymorphic relationship fields
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('beneficiary', 'member', 'application', 'payment', 'other')),
  ADD COLUMN IF NOT EXISTS entity_id BIGINT;

-- Add check to ensure either beneficiary_id or entity relationship is set
ALTER TABLE documents
  ADD CONSTRAINT documents_entity_check 
  CHECK (
    beneficiary_id IS NOT NULL OR 
    (entity_type IS NOT NULL AND entity_id IS NOT NULL)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_beneficiary ON documents(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(is_verified);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- Add full-text search index for file names
CREATE INDEX IF NOT EXISTS idx_documents_file_name_search ON documents USING GIN(to_tsvector('turkish', file_name));

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Document storage metadata - Aligned with frontend fileUploadSchema';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes (max 10MB)';
COMMENT ON COLUMN documents.file_type IS 'MIME type (PDF, JPEG, PNG, DOC, DOCX only)';
COMMENT ON COLUMN documents.document_type IS 'Document category: kimlik, ikamet, saglik, gelir, diger';
COMMENT ON COLUMN documents.mime_type IS 'Actual MIME type from file';
COMMENT ON COLUMN documents.is_verified IS 'Whether document has been verified by staff';
COMMENT ON COLUMN documents.entity_type IS 'Type of entity this document belongs to';
COMMENT ON COLUMN documents.entity_id IS 'ID of the entity this document belongs to';
COMMENT ON COLUMN documents.storage_bucket IS 'Supabase storage bucket name';
COMMENT ON COLUMN documents.storage_path IS 'Full path in storage bucket';
COMMENT ON COLUMN documents.tags IS 'Document tags for categorization';
