-- =============================================
-- ENHANCE AUDIT LOGGING SYSTEM
-- =============================================

-- Add additional columns to audit_logs for better tracking
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'access_denied')),
ADD COLUMN IF NOT EXISTS entity_name TEXT,
ADD COLUMN IF NOT EXISTS change_summary TEXT,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'attempted'));

-- Create an audit_log_config table for retention policies
CREATE TABLE IF NOT EXISTS public.audit_log_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an audit events table for structured event tracking
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'attempted')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at TIMESTAMPTZ DEFAULT NULL
);

-- Create table for tracking user login/logout events
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'logged_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR AUDIT TABLES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON public.audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_events_status ON public.audit_events(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_request ON public.audit_events(request_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_login ON public.user_sessions(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.user_sessions(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.audit_log_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify audit config
CREATE POLICY "Admins can view audit config" ON public.audit_log_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update audit config" ON public.audit_log_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit config" ON public.audit_log_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can view audit events (more detailed)
CREATE POLICY "Admins can view audit events" ON public.audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User sessions - users can view their own, admins can view all
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- AUDIT LOGGING FUNCTION FOR GENERIC OPERATIONS
-- =============================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_before_data JSONB DEFAULT NULL,
  p_after_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.audit_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data,
    metadata,
    ip_address,
    user_agent,
    severity,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_event_type,
    p_entity_type,
    p_entity_id,
    p_action,
    p_before_data,
    p_after_data,
    p_metadata,
    p_ip_address,
    p_user_agent,
    p_severity,
    p_status,
    p_error_message
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUDIT TRIGGERS FOR KEY TABLES
-- =============================================

-- Function to create audit log on any table change
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_change_summary TEXT;
BEGIN
  -- Build change summary
  IF TG_OP = 'INSERT' THEN
    v_change_summary := 'New record created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_change_summary := 'Record updated';
  ELSIF TG_OP = 'DELETE' THEN
    v_change_summary := 'Record deleted';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    action_type,
    entity_name,
    change_summary,
    severity
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    LOWER(TG_OP),
    TG_TABLE_NAME,
    v_change_summary,
    CASE WHEN TG_OP = 'DELETE' THEN 'warning' ELSE 'info' END
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for key tables
DROP TRIGGER IF EXISTS audit_members_trigger ON public.members;
CREATE TRIGGER audit_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_donations_trigger ON public.donations;
CREATE TRIGGER audit_donations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_beneficiaries_trigger ON public.beneficiaries;
CREATE TRIGGER audit_beneficiaries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_social_aid_apps_trigger ON public.social_aid_applications;
CREATE TRIGGER audit_social_aid_apps_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.social_aid_applications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_audit_trail(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  action_type TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_logs.id,
    audit_logs.user_id,
    audit_logs.action,
    audit_logs.action_type,
    audit_logs.old_data,
    audit_logs.new_data,
    audit_logs.created_at
  FROM public.audit_logs
  WHERE table_name = p_table_name
    AND record_id = p_record_id
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  v_retention_days INTEGER := 90;
  v_deleted_count INTEGER;
BEGIN
  -- Get retention policy from config
  SELECT (value->>'days')::INTEGER INTO v_retention_days
  FROM public.audit_log_config
  WHERE key = 'retention_days';
  
  -- Default to 90 days if not configured
  IF v_retention_days IS NULL THEN
    v_retention_days := 90;
  END IF;
  
  -- Delete old records
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_events BIGINT,
  events_by_type JSONB,
  events_by_user JSONB,
  critical_events BIGINT,
  failed_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    jsonb_object_agg(action_type, count)
      FROM (SELECT action_type, COUNT(*) as count 
            FROM public.audit_logs 
            WHERE created_at > NOW() - (p_days || ' days')::INTERVAL 
            GROUP BY action_type),
    jsonb_object_agg(user_id::TEXT, count)
      FROM (SELECT user_id, COUNT(*) as count 
            FROM public.audit_logs 
            WHERE created_at > NOW() - (p_days || ' days')::INTERVAL 
            GROUP BY user_id),
    (SELECT COUNT(*)::BIGINT FROM public.audit_logs 
     WHERE severity = 'critical' 
     AND created_at > NOW() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*)::BIGINT FROM public.audit_logs 
     WHERE status = 'failure' 
     AND created_at > NOW() - (p_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIALIZE RETENTION POLICY
-- =============================================

INSERT INTO public.audit_log_config (key, value, description)
VALUES 
  ('retention_days', '{"days": 90}'::JSONB, 'Number of days to retain audit logs'),
  ('log_sensitive_fields', '{"enabled": false}'::JSONB, 'Whether to log sensitive fields'),
  ('critical_tables', '["payments", "social_aid_applications", "users"]'::JSONB, 'Tables to log with critical severity')
ON CONFLICT (key) DO NOTHING;
