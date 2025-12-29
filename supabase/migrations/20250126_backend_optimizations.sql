-- =============================================
-- Backend Optimizations Migration
-- Tarih: 2025-01-26
-- Amaç: Güvenlik ve performans iyileştirmeleri
-- =============================================

-- =============================================
-- 1. FUNCTION SEARCH_PATH AYARLARI (GÜVENLİK)
-- =============================================

-- update_updated_at fonksiyonuna search_path ekle
ALTER FUNCTION public.update_updated_at() 
SET search_path = public;

-- handle_new_user fonksiyonuna search_path ekle
ALTER FUNCTION public.handle_new_user() 
SET search_path = public;

-- =============================================
-- 2. FOREIGN KEY INDEX'LERİ (PERFORMANS)
-- =============================================

-- documents.uploaded_by için index
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by 
ON public.documents(uploaded_by);

-- donations.member_id için index
CREATE INDEX IF NOT EXISTS idx_donations_member_id 
ON public.donations(member_id);

-- kumbaras.sorumlu_id için index
CREATE INDEX IF NOT EXISTS idx_kumbaras_sorumlu_id 
ON public.kumbaras(sorumlu_id);

-- payments.application_id için index
CREATE INDEX IF NOT EXISTS idx_payments_application_id 
ON public.payments(application_id);

-- =============================================
-- 3. RLS POLICY OPTİMİZASYONLARI (PERFORMANS)
-- =============================================

-- Önce mevcut policy'leri sil
DROP POLICY IF EXISTS "Authenticated users can manage beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can manage kumbaras" ON public.kumbaras;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can manage applications" ON public.social_aid_applications;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Optimize edilmiş policy'leri oluştur
-- beneficiaries: ALL operations
CREATE POLICY "Authenticated users can manage beneficiaries"
ON public.beneficiaries FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- documents: ALL operations
CREATE POLICY "Authenticated users can manage documents"
ON public.documents FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- donations: ALL operations
CREATE POLICY "Authenticated users can manage donations"
ON public.donations FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- kumbaras: ALL operations
CREATE POLICY "Authenticated users can manage kumbaras"
ON public.kumbaras FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- members: ALL operations (birleştirilmiş - hem view hem manage)
CREATE POLICY "Authenticated users can manage members"
ON public.members FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- payments: ALL operations
CREATE POLICY "Authenticated users can manage payments"
ON public.payments FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- social_aid_applications: ALL operations
CREATE POLICY "Authenticated users can manage applications"
ON public.social_aid_applications FOR ALL
TO authenticated
USING ((select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'authenticated');

-- audit_logs: SELECT only for admins
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
  )
);

-- users: SELECT - birleştirilmiş policy (admin ve own profile)
CREATE POLICY "Users can view users"
ON public.users FOR SELECT
TO authenticated
USING (
  -- Admin can view all
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
  )
  OR
  -- User can view own profile
  (select auth.uid()) = id
);


