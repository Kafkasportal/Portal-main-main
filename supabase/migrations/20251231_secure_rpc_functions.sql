-- Secure RPC functions by setting search_path
-- Vulnerability: Search Path Hijacking in SECURITY DEFINER functions
-- Fix: Explicitly set search_path to public, pg_catalog

-- 1. get_donation_source_distribution
ALTER FUNCTION public.get_donation_source_distribution()
SET search_path = public, pg_catalog;

-- 2. get_top_donors
ALTER FUNCTION public.get_top_donors(INT)
SET search_path = public, pg_catalog;

-- 3. get_dashboard_stats
ALTER FUNCTION public.get_dashboard_stats()
SET search_path = public, pg_catalog;

-- 4. get_donation_trends
ALTER FUNCTION public.get_donation_trends(TEXT)
SET search_path = public, pg_catalog;

-- 5. log_audit_event
ALTER FUNCTION public.log_audit_event(UUID, TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT)
SET search_path = public, pg_catalog;
