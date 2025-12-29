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
