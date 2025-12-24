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
