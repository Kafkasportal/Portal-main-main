-- =============================================================
-- ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
-- Dernek çalışanları için kapsamlı yetki yönetim sistemi
-- Date: 2024-12-30
-- =============================================================

-- =============================================================
-- PART 1: ROLES TABLE
-- Dernek rolleri: Başkan, Başkan Yardımcısı, Muhasebe, Görevli vb.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  hierarchy_level INTEGER NOT NULL DEFAULT 0, -- Daha düşük = daha yüksek yetki
  is_system_role BOOLEAN NOT NULL DEFAULT false, -- Sistem rolleri silinemez
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- PART 2: PERMISSIONS TABLE
-- Tüm izinler ve açıklamaları
-- =============================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL, -- uyeler, bagislar, sosyal-yardim, raporlar, ayarlar
  action VARCHAR(50) NOT NULL, -- view, create, edit, delete, approve, export
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PART 3: ROLE_PERMISSIONS (Many-to-Many)
-- Rollere atanan izinler
-- =============================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- =============================================================
-- PART 4: UPDATE USERS TABLE
-- Kullanıcıya rol ataması
-- =============================================================

-- Add role_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Add additional user fields for staff management
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS title VARCHAR(100), -- Unvan: Dernek Başkanı, Genel Sekreter vb.
ADD COLUMN IF NOT EXISTS department VARCHAR(100), -- Birim: Yönetim, Muhasebe, Sosyal İşler
ADD COLUMN IF NOT EXISTS hire_date DATE, -- İşe başlama tarihi
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =============================================================
-- PART 5: USER_PERMISSIONS (Override/Additional)
-- Kullanıcıya özel ek izinler (rol dışı)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Geçici izinler için
  UNIQUE(user_id, permission_id)
);

-- =============================================================
-- PART 6: AUDIT LOG FOR ROLE CHANGES
-- Rol ve yetki değişiklik logları
-- =============================================================

CREATE TABLE IF NOT EXISTS public.role_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(50) NOT NULL, -- role_assigned, role_removed, permission_granted, permission_revoked
  target_user_id UUID REFERENCES public.users(id),
  old_role_id UUID REFERENCES public.roles(id),
  new_role_id UUID REFERENCES public.roles(id),
  permission_id UUID REFERENCES public.permissions(id),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PART 7: INSERT DEFAULT ROLES
-- =============================================================

INSERT INTO public.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('baskan', 'Dernek Başkanı', 'Derneğin en üst yöneticisi. Tüm yetkilere sahiptir.', 1, true),
  ('baskan_yardimcisi', 'Başkan Yardımcısı', 'Başkanın yokluğunda derneği temsil eder.', 2, true),
  ('genel_sekreter', 'Genel Sekreter', 'Derneğin idari işlerinden sorumludur.', 3, true),
  ('muhasebe', 'Muhasebe Sorumlusu', 'Mali işler ve bağış yönetiminden sorumludur.', 4, true),
  ('sosyal_isler', 'Sosyal İşler Sorumlusu', 'Sosyal yardım başvuruları ve ihtiyaç sahipleri yönetimi.', 5, true),
  ('uye_iliskileri', 'Üye İlişkileri Sorumlusu', 'Üye kayıt ve takip işlemlerinden sorumludur.', 6, true),
  ('gorevli', 'Görevli', 'Temel veri görüntüleme ve giriş yetkilerine sahiptir.', 7, true),
  ('misafir', 'Misafir', 'Sadece görüntüleme yetkisi olan geçici kullanıcı.', 10, true)
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- PART 8: INSERT DEFAULT PERMISSIONS
-- =============================================================

INSERT INTO public.permissions (name, display_name, description, module, action) VALUES
  -- Üye Modülü
  ('members.view', 'Üyeleri Görüntüle', 'Üye listesini ve detaylarını görüntüleyebilir', 'uyeler', 'view'),
  ('members.create', 'Üye Ekle', 'Yeni üye kaydı oluşturabilir', 'uyeler', 'create'),
  ('members.edit', 'Üye Düzenle', 'Üye bilgilerini güncelleyebilir', 'uyeler', 'edit'),
  ('members.delete', 'Üye Sil', 'Üye kaydını silebilir', 'uyeler', 'delete'),
  ('members.export', 'Üye Dışa Aktar', 'Üye verilerini dışa aktarabilir', 'uyeler', 'export'),
  
  -- Bağış Modülü
  ('donations.view', 'Bağışları Görüntüle', 'Bağış listesini ve detaylarını görüntüleyebilir', 'bagislar', 'view'),
  ('donations.create', 'Bağış Ekle', 'Yeni bağış kaydı oluşturabilir', 'bagislar', 'create'),
  ('donations.edit', 'Bağış Düzenle', 'Bağış bilgilerini güncelleyebilir', 'bagislar', 'edit'),
  ('donations.delete', 'Bağış Sil', 'Bağış kaydını silebilir', 'bagislar', 'delete'),
  ('donations.export', 'Bağış Dışa Aktar', 'Bağış verilerini dışa aktarabilir', 'bagislar', 'export'),
  
  -- Kumbara Modülü
  ('kumbaras.view', 'Kumbaraları Görüntüle', 'Kumbara listesini görüntüleyebilir', 'kumbaralar', 'view'),
  ('kumbaras.create', 'Kumbara Ekle', 'Yeni kumbara kaydı oluşturabilir', 'kumbaralar', 'create'),
  ('kumbaras.edit', 'Kumbara Düzenle', 'Kumbara bilgilerini güncelleyebilir', 'kumbaralar', 'edit'),
  ('kumbaras.collect', 'Kumbara Topla', 'Kumbara toplama işlemi yapabilir', 'kumbaralar', 'collect'),
  ('kumbaras.delete', 'Kumbara Sil', 'Kumbara kaydını silebilir', 'kumbaralar', 'delete'),
  
  -- Sosyal Yardım Modülü
  ('social_aid.view', 'Sosyal Yardım Görüntüle', 'Başvuruları ve ihtiyaç sahiplerini görüntüleyebilir', 'sosyal-yardim', 'view'),
  ('social_aid.create', 'Başvuru Ekle', 'Yeni başvuru oluşturabilir', 'sosyal-yardim', 'create'),
  ('social_aid.edit', 'Başvuru Düzenle', 'Başvuru bilgilerini güncelleyebilir', 'sosyal-yardim', 'edit'),
  ('social_aid.approve', 'Başvuru Onayla', 'Başvuruları onaylayabilir veya reddedebilir', 'sosyal-yardim', 'approve'),
  ('social_aid.payment', 'Ödeme Yap', 'Sosyal yardım ödemesi yapabilir', 'sosyal-yardim', 'payment'),
  ('social_aid.delete', 'Başvuru Sil', 'Başvuru kaydını silebilir', 'sosyal-yardim', 'delete'),
  
  -- İhtiyaç Sahipleri Modülü
  ('beneficiaries.view', 'İhtiyaç Sahipleri Görüntüle', 'İhtiyaç sahiplerini görüntüleyebilir', 'ihtiyac-sahipleri', 'view'),
  ('beneficiaries.create', 'İhtiyaç Sahibi Ekle', 'Yeni ihtiyaç sahibi kaydı oluşturabilir', 'ihtiyac-sahipleri', 'create'),
  ('beneficiaries.edit', 'İhtiyaç Sahibi Düzenle', 'İhtiyaç sahibi bilgilerini güncelleyebilir', 'ihtiyac-sahipleri', 'edit'),
  ('beneficiaries.delete', 'İhtiyaç Sahibi Sil', 'İhtiyaç sahibi kaydını silebilir', 'ihtiyac-sahipleri', 'delete'),
  
  -- Hastane/Sevk Modülü
  ('hospitals.view', 'Hastaneleri Görüntüle', 'Hastane ve sevk bilgilerini görüntüleyebilir', 'hastaneler', 'view'),
  ('hospitals.create', 'Hastane/Sevk Ekle', 'Yeni hastane veya sevk kaydı oluşturabilir', 'hastaneler', 'create'),
  ('hospitals.edit', 'Hastane/Sevk Düzenle', 'Hastane ve sevk bilgilerini güncelleyebilir', 'hastaneler', 'edit'),
  ('hospitals.delete', 'Hastane/Sevk Sil', 'Hastane veya sevk kaydını silebilir', 'hastaneler', 'delete'),
  
  -- Rapor Modülü
  ('reports.view', 'Raporları Görüntüle', 'Temel raporları görüntüleyebilir', 'raporlar', 'view'),
  ('reports.financial', 'Mali Raporlar', 'Mali raporlara erişebilir', 'raporlar', 'financial'),
  ('reports.export', 'Rapor Dışa Aktar', 'Raporları dışa aktarabilir', 'raporlar', 'export'),
  ('reports.advanced', 'Gelişmiş Raporlar', 'Detaylı analiz raporlarına erişebilir', 'raporlar', 'advanced'),
  
  -- Dashboard
  ('dashboard.view', 'Dashboard Görüntüle', 'Ana sayfayı görüntüleyebilir', 'dashboard', 'view'),
  ('dashboard.stats', 'İstatistikler', 'Detaylı istatistikleri görüntüleyebilir', 'dashboard', 'stats'),
  
  -- Ayarlar Modülü
  ('settings.general', 'Genel Ayarlar', 'Genel ayarları görüntüleyebilir ve düzenleyebilir', 'ayarlar', 'general'),
  ('settings.users', 'Kullanıcı Yönetimi', 'Kullanıcıları yönetebilir', 'ayarlar', 'users'),
  ('settings.roles', 'Rol Yönetimi', 'Rolleri ve izinleri yönetebilir', 'ayarlar', 'roles'),
  ('settings.backup', 'Yedekleme', 'Yedekleme işlemleri yapabilir', 'ayarlar', 'backup'),
  ('settings.audit', 'Denetim Logları', 'Sistem loglarını görüntüleyebilir', 'ayarlar', 'audit')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- PART 9: ASSIGN PERMISSIONS TO ROLES
-- =============================================================

-- Başkan - Tüm yetkiler
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'baskan'
ON CONFLICT DO NOTHING;

-- Başkan Yardımcısı - Rol yönetimi hariç tüm yetkiler
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'baskan_yardimcisi' 
AND p.name NOT IN ('settings.roles')
ON CONFLICT DO NOTHING;

-- Genel Sekreter - Kullanıcı yönetimi ve temel işlemler
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'genel_sekreter' 
AND p.name IN (
  'members.view', 'members.create', 'members.edit', 'members.export',
  'donations.view', 'donations.export',
  'social_aid.view',
  'beneficiaries.view',
  'reports.view', 'reports.export',
  'dashboard.view', 'dashboard.stats',
  'settings.general', 'settings.users'
)
ON CONFLICT DO NOTHING;

-- Muhasebe - Mali işlemler
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'muhasebe' 
AND p.name IN (
  'members.view',
  'donations.view', 'donations.create', 'donations.edit', 'donations.export',
  'kumbaras.view', 'kumbaras.create', 'kumbaras.edit', 'kumbaras.collect',
  'social_aid.view', 'social_aid.payment',
  'beneficiaries.view',
  'reports.view', 'reports.financial', 'reports.export',
  'dashboard.view', 'dashboard.stats'
)
ON CONFLICT DO NOTHING;

-- Sosyal İşler - Sosyal yardım yönetimi
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'sosyal_isler' 
AND p.name IN (
  'members.view',
  'donations.view',
  'social_aid.view', 'social_aid.create', 'social_aid.edit', 'social_aid.approve',
  'beneficiaries.view', 'beneficiaries.create', 'beneficiaries.edit',
  'hospitals.view', 'hospitals.create', 'hospitals.edit',
  'reports.view',
  'dashboard.view'
)
ON CONFLICT DO NOTHING;

-- Üye İlişkileri - Üye yönetimi
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'uye_iliskileri' 
AND p.name IN (
  'members.view', 'members.create', 'members.edit', 'members.export',
  'donations.view',
  'kumbaras.view',
  'reports.view',
  'dashboard.view'
)
ON CONFLICT DO NOTHING;

-- Görevli - Temel yetkiler
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'gorevli' 
AND p.name IN (
  'members.view',
  'donations.view',
  'kumbaras.view',
  'social_aid.view',
  'beneficiaries.view',
  'dashboard.view'
)
ON CONFLICT DO NOTHING;

-- Misafir - Sadece dashboard
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'misafir' 
AND p.name = 'dashboard.view'
ON CONFLICT DO NOTHING;

-- =============================================================
-- PART 10: HELPER FUNCTIONS
-- =============================================================

-- Kullanıcının bir izne sahip olup olmadığını kontrol et
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- Check role permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.role_permissions rp ON rp.role_id = u.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE u.id = p_user_id 
    AND p.name = p_permission_name
    AND u.is_active = true
  ) INTO has_perm;
  
  IF has_perm THEN
    RETURN true;
  END IF;
  
  -- Check user-specific permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = p_user_id 
    AND p.name = p_permission_name
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$;

-- Kullanıcının tüm izinlerini getir
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name VARCHAR,
  source VARCHAR -- 'role' veya 'direct'
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  -- Role-based permissions
  SELECT DISTINCT p.name::VARCHAR, 'role'::VARCHAR as source
  FROM public.users u
  JOIN public.role_permissions rp ON rp.role_id = u.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE u.id = p_user_id AND u.is_active = true
  
  UNION
  
  -- Direct user permissions
  SELECT DISTINCT p.name::VARCHAR, 'direct'::VARCHAR as source
  FROM public.user_permissions up
  JOIN public.permissions p ON p.id = up.permission_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > NOW());
END;
$$;

-- Kullanıcının rol hiyerarşi seviyesini getir
CREATE OR REPLACE FUNCTION public.get_user_hierarchy_level(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  level INTEGER;
BEGIN
  SELECT r.hierarchy_level INTO level
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = p_user_id;
  
  RETURN COALESCE(level, 999);
END;
$$;

-- =============================================================
-- PART 11: INDEXES FOR PERFORMANCE
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user ON public.role_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_target ON public.role_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_created ON public.role_audit_logs(created_at);

-- =============================================================
-- PART 12: RLS POLICIES
-- =============================================================

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- Roles - Everyone can view, only admins can modify
CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "roles_modify_admin" ON public.roles
  FOR ALL TO authenticated
  USING (public.user_has_permission(auth.uid(), 'settings.roles'));

-- Permissions - Everyone can view
CREATE POLICY "permissions_select_all" ON public.permissions
  FOR SELECT TO authenticated USING (true);

-- Role Permissions - Everyone can view, only admins can modify
CREATE POLICY "role_permissions_select_all" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_modify_admin" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.user_has_permission(auth.uid(), 'settings.roles'));

-- User Permissions - View own or admin can view all
CREATE POLICY "user_permissions_select" ON public.user_permissions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_permission(auth.uid(), 'settings.users')
  );

CREATE POLICY "user_permissions_modify" ON public.user_permissions
  FOR ALL TO authenticated
  USING (public.user_has_permission(auth.uid(), 'settings.users'));

-- Role Audit Logs - Only admins can view
CREATE POLICY "role_audit_logs_select" ON public.role_audit_logs
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'settings.audit'));

CREATE POLICY "role_audit_logs_insert" ON public.role_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================================
-- MIGRATION COMPLETE
-- =============================================================

COMMENT ON TABLE public.roles IS 'Dernek rolleri ve yetki seviyeleri';
COMMENT ON TABLE public.permissions IS 'Sistem izinleri tanımları';
COMMENT ON TABLE public.role_permissions IS 'Rollere atanan izinler';
COMMENT ON TABLE public.user_permissions IS 'Kullanıcılara özel atanan izinler';
COMMENT ON TABLE public.role_audit_logs IS 'Rol ve yetki değişiklik logları';
