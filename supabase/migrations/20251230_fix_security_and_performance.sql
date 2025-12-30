-- =============================================================
-- PRODUCTION READINESS MIGRATION
-- Fixes all critical security and performance issues
-- Date: 2024-12-30
-- =============================================================

-- =============================================================
-- PART 1: SECURITY FIXES - Function Search Path
-- =============================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Fix is_moderator_or_above function
CREATE OR REPLACE FUNCTION public.is_moderator_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$;

-- Fix is_muhasebe_or_above function
CREATE OR REPLACE FUNCTION public.is_muhasebe_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'muhasebe')
  );
END;
$$;

-- Fix get_dashboard_stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalMembers', (SELECT COUNT(*) FROM public.members),
    'totalDonations', (SELECT COALESCE(SUM(tutar), 0) FROM public.donations),
    'totalBeneficiaries', (SELECT COUNT(*) FROM public.beneficiaries WHERE durum = 'aktif'),
    'pendingApplications', (SELECT COUNT(*) FROM public.social_aid_applications WHERE durum = 'beklemede'),
    'monthlyDonations', (
      SELECT COALESCE(SUM(tutar), 0) 
      FROM public.donations 
      WHERE tarih >= date_trunc('month', CURRENT_DATE)
    ),
    'monthlyPayments', (
      SELECT COALESCE(SUM(tutar), 0) 
      FROM public.payments 
      WHERE odeme_tarihi >= date_trunc('month', CURRENT_DATE)
      AND durum = 'odendi'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- =============================================================
-- PART 2: PERFORMANCE FIXES - RLS Policy Optimization
-- =============================================================

-- Drop and recreate optimized policies for USERS table
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Users can view users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins and moderators can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert for users" ON public.users;

-- Optimized users policies (using subquery for auth functions)
CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY "users_insert_admin_mod" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

-- Drop and recreate optimized policies for MEMBERS table
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Moderators can insert members" ON public.members;
DROP POLICY IF EXISTS "Moderators can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
DROP POLICY IF EXISTS "Allow anon select for members" ON public.members;
DROP POLICY IF EXISTS "Allow anon insert for members" ON public.members;
DROP POLICY IF EXISTS "Allow anon update for members" ON public.members;
DROP POLICY IF EXISTS "Allow anon delete for members" ON public.members;

CREATE POLICY "members_select" ON public.members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "members_insert" ON public.members
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

CREATE POLICY "members_update" ON public.members
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "members_delete" ON public.members
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for DONATIONS table
DROP POLICY IF EXISTS "Authenticated users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Muhasebe can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Muhasebe can update donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;
DROP POLICY IF EXISTS "Allow anon select for donations" ON public.donations;
DROP POLICY IF EXISTS "Allow anon insert for donations" ON public.donations;
DROP POLICY IF EXISTS "Allow anon update for donations" ON public.donations;
DROP POLICY IF EXISTS "Allow anon delete for donations" ON public.donations;

CREATE POLICY "donations_select" ON public.donations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "donations_insert" ON public.donations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_muhasebe_or_above()));

CREATE POLICY "donations_update" ON public.donations
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_muhasebe_or_above()));

CREATE POLICY "donations_delete" ON public.donations
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for BENEFICIARIES table
DROP POLICY IF EXISTS "Authenticated users can view beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Moderators can insert beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Moderators can update beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins can delete beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow anon select for beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow anon insert for beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow anon update for beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow anon delete for beneficiaries" ON public.beneficiaries;

CREATE POLICY "beneficiaries_select" ON public.beneficiaries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "beneficiaries_insert" ON public.beneficiaries
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

CREATE POLICY "beneficiaries_update" ON public.beneficiaries
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "beneficiaries_delete" ON public.beneficiaries
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for SOCIAL_AID_APPLICATIONS table
DROP POLICY IF EXISTS "Authenticated users can view applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Authenticated users can manage applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Moderators can update applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Allow anon select for applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Allow anon insert for applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Allow anon update for applications" ON public.social_aid_applications;

CREATE POLICY "applications_select" ON public.social_aid_applications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "applications_insert" ON public.social_aid_applications
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

CREATE POLICY "applications_update" ON public.social_aid_applications
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "applications_delete" ON public.social_aid_applications
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for PAYMENTS table
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Muhasebe can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Muhasebe can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon select for payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon insert for payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon update for payments" ON public.payments;

CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_muhasebe_or_above()));

CREATE POLICY "payments_update" ON public.payments
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_muhasebe_or_above()));

CREATE POLICY "payments_delete" ON public.payments
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for DOCUMENTS table
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Moderators can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;

CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for IN_KIND_AIDS table
DROP POLICY IF EXISTS "Authenticated users can view in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Moderators can insert in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Moderators can update in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Admins can delete in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Allow anon select for in_kind_aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Allow anon insert for in_kind_aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Allow anon update for in_kind_aids" ON public.in_kind_aids;

CREATE POLICY "in_kind_aids_select" ON public.in_kind_aids
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "in_kind_aids_insert" ON public.in_kind_aids
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

CREATE POLICY "in_kind_aids_update" ON public.in_kind_aids
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "in_kind_aids_delete" ON public.in_kind_aids
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for KUMBARAS table
DROP POLICY IF EXISTS "Authenticated users can view kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Moderators can insert kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Moderators can update kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Admins can delete kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Allow anon select for kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Allow anon insert for kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Allow anon update for kumbaras" ON public.kumbaras;

CREATE POLICY "kumbaras_select" ON public.kumbaras
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "kumbaras_insert" ON public.kumbaras
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_moderator_or_above()));

CREATE POLICY "kumbaras_update" ON public.kumbaras
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_moderator_or_above()));

CREATE POLICY "kumbaras_delete" ON public.kumbaras
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Drop and recreate optimized policies for AUDIT_LOGS table
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================================
-- PART 3: CLEANUP - Remove Duplicate Indexes
-- =============================================================

-- Remove duplicate indexes
DROP INDEX IF EXISTS idx_inkind_yardim_turu;
DROP INDEX IF EXISTS idx_social_aid_durum;

-- =============================================================
-- PART 4: ADD MISSING INDEXES
-- =============================================================

-- Add missing index for documents.verified_by
CREATE INDEX IF NOT EXISTS idx_documents_verified_by ON public.documents(verified_by);

-- Add additional performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_members_tc_kimlik ON public.members(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tc_kimlik ON public.beneficiaries(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_donations_tarih ON public.donations(tarih);
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary ON public.payments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_applications_basvuran ON public.social_aid_applications(basvuran_id);

-- =============================================================
-- PART 5: COMMENTS AND DOCUMENTATION
-- =============================================================

COMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to auto-update updated_at column - SECURITY FIXED';
COMMENT ON FUNCTION public.get_user_role IS 'Returns the role of the current user - SECURITY FIXED';
COMMENT ON FUNCTION public.is_admin IS 'Checks if current user is admin - SECURITY FIXED';
COMMENT ON FUNCTION public.is_moderator_or_above IS 'Checks if current user is moderator or admin - SECURITY FIXED';
COMMENT ON FUNCTION public.is_muhasebe_or_above IS 'Checks if current user is muhasebe, moderator, or admin - SECURITY FIXED';
COMMENT ON FUNCTION public.get_dashboard_stats IS 'Returns dashboard statistics as JSON - SECURITY FIXED';

-- =============================================================
-- MIGRATION COMPLETE
-- =============================================================
