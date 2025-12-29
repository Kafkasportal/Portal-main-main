-- Fix RLS Policies - Add Role-Based Access Control
-- CRITICAL SECURITY FIX: Current policies allow ANY authenticated user to delete everything
-- This migration implements proper role-based security

-- First, ensure users table has role column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'muhasebe', 'user'));
    END IF;
END $$;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is moderator or above
CREATE OR REPLACE FUNCTION public.is_moderator_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is muhasebe or above
CREATE OR REPLACE FUNCTION public.is_muhasebe_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'moderator', 'muhasebe');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE - Strict Admin Control
-- ============================================================================

DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can delete users" ON public.users;

-- Everyone can view users (for dropdowns, assignments)
CREATE POLICY "Authenticated users can view users"
    ON public.users FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only admins can update other users
CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Only admins can insert/delete users
CREATE POLICY "Admins can insert users"
    ON public.users FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE
    USING (is_admin());

-- ============================================================================
-- MEMBERS TABLE - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;

CREATE POLICY "Authenticated users can view members"
    ON public.members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert members"
    ON public.members FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update members"
    ON public.members FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete members"
    ON public.members FOR DELETE
    USING (is_admin());

-- ============================================================================
-- DONATIONS TABLE - Muhasebe+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Users can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Users can update donations" ON public.donations;
DROP POLICY IF EXISTS "Users can delete donations" ON public.donations;

CREATE POLICY "Authenticated users can view donations"
    ON public.donations FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Muhasebe can insert donations"
    ON public.donations FOR INSERT
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can update donations"
    ON public.donations FOR UPDATE
    USING (is_muhasebe_or_above())
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Admins can delete donations"
    ON public.donations FOR DELETE
    USING (is_admin());

-- ============================================================================
-- BENEFICIARIES TABLE - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can insert beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can update beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can delete beneficiaries" ON public.beneficiaries;

CREATE POLICY "Authenticated users can view beneficiaries"
    ON public.beneficiaries FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert beneficiaries"
    ON public.beneficiaries FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update beneficiaries"
    ON public.beneficiaries FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete beneficiaries"
    ON public.beneficiaries FOR DELETE
    USING (is_admin());

-- ============================================================================
-- SOCIAL AID APPLICATIONS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can insert applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can update applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Users can delete applications" ON public.social_aid_applications;

CREATE POLICY "Authenticated users can view applications"
    ON public.social_aid_applications FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert applications"
    ON public.social_aid_applications FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update applications"
    ON public.social_aid_applications FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete applications"
    ON public.social_aid_applications FOR DELETE
    USING (is_admin());

-- ============================================================================
-- PAYMENTS TABLE - Muhasebe+ Only (Financial Data)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can update payments" ON public.social_aid_payments;
DROP POLICY IF EXISTS "Users can delete payments" ON public.social_aid_payments;

CREATE POLICY "Muhasebe can view payments"
    ON public.social_aid_payments FOR SELECT
    USING (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can insert payments"
    ON public.social_aid_payments FOR INSERT
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Muhasebe can update payments"
    ON public.social_aid_payments FOR UPDATE
    USING (is_muhasebe_or_above())
    WITH CHECK (is_muhasebe_or_above());

CREATE POLICY "Admins can delete payments"
    ON public.social_aid_payments FOR DELETE
    USING (is_admin());

-- ============================================================================
-- IN-KIND AIDS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can insert in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can update in-kind aids" ON public.in_kind_aids;
DROP POLICY IF EXISTS "Users can delete in-kind aids" ON public.in_kind_aids;

CREATE POLICY "Authenticated users can view in-kind aids"
    ON public.in_kind_aids FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert in-kind aids"
    ON public.in_kind_aids FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update in-kind aids"
    ON public.in_kind_aids FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete in-kind aids"
    ON public.in_kind_aids FOR DELETE
    USING (is_admin());

-- ============================================================================
-- KUMBARAS - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can insert kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can update kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Users can delete kumbaras" ON public.kumbaras;

CREATE POLICY "Authenticated users can view kumbaras"
    ON public.kumbaras FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert kumbaras"
    ON public.kumbaras FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update kumbaras"
    ON public.kumbaras FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete kumbaras"
    ON public.kumbaras FOR DELETE
    USING (is_admin());

-- ============================================================================
-- ROUTES - Moderator+ Can Modify
-- ============================================================================

DROP POLICY IF EXISTS "Users can view routes" ON public.routes;
DROP POLICY IF EXISTS "Users can insert routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete routes" ON public.routes;

CREATE POLICY "Authenticated users can view routes"
    ON public.routes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Moderators can insert routes"
    ON public.routes FOR INSERT
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can update routes"
    ON public.routes FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Admins can delete routes"
    ON public.routes FOR DELETE
    USING (is_admin());

-- ============================================================================
-- DOCUMENTS - User Can Upload, Moderator+ Can Delete
-- ============================================================================

DROP POLICY IF EXISTS "Users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents" ON public.documents;

CREATE POLICY "Authenticated users can view documents"
    ON public.documents FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (uploaded_by = auth.uid())
    WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Moderators can update any document"
    ON public.documents FOR UPDATE
    USING (is_moderator_or_above())
    WITH CHECK (is_moderator_or_above());

CREATE POLICY "Moderators can delete documents"
    ON public.documents FOR DELETE
    USING (is_moderator_or_above());

-- ============================================================================
-- AUDIT LOGS - Insert Only, Admin View
-- ============================================================================

-- Note: Assuming audit_logs table exists or will be created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
        DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

        CREATE POLICY "Admins can view audit logs"
            ON public.audit_logs FOR SELECT
            USING (is_admin());

        CREATE POLICY "System can insert audit logs"
            ON public.audit_logs FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin';
COMMENT ON FUNCTION public.is_moderator_or_above() IS 'Returns true if current user is moderator or admin';
COMMENT ON FUNCTION public.is_muhasebe_or_above() IS 'Returns true if current user is muhasebe, moderator, or admin';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify policies are in place:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
