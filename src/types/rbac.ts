/**
 * Role-Based Access Control (RBAC) Types
 * Dernek çalışanları için rol ve yetki yönetim sistemi tipleri
 */

// Rol isimleri
export type RoleName =
  | 'baskan'
  | 'baskan_yardimcisi'
  | 'genel_sekreter'
  | 'muhasebe'
  | 'sosyal_isler'
  | 'uye_iliskileri'
  | 'gorevli'
  | 'misafir'

// İzin modülleri
export type PermissionModule =
  | 'uyeler'
  | 'bagislar'
  | 'kumbaralar'
  | 'sosyal-yardim'
  | 'ihtiyac-sahipleri'
  | 'hastaneler'
  | 'raporlar'
  | 'dashboard'
  | 'ayarlar'

// İzin aksiyonları
export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'payment'
  | 'collect'
  | 'financial'
  | 'stats'
  | 'general'
  | 'users'
  | 'roles'
  | 'backup'
  | 'audit'

// İzin isimleri
export type PermissionName =
  // Üyeler
  | 'members.view'
  | 'members.create'
  | 'members.edit'
  | 'members.delete'
  | 'members.export'
  // Bağışlar
  | 'donations.view'
  | 'donations.create'
  | 'donations.edit'
  | 'donations.delete'
  | 'donations.export'
  // Kumbaralar
  | 'kumbaras.view'
  | 'kumbaras.create'
  | 'kumbaras.edit'
  | 'kumbaras.collect'
  | 'kumbaras.delete'
  // Sosyal Yardım
  | 'social_aid.view'
  | 'social_aid.create'
  | 'social_aid.edit'
  | 'social_aid.approve'
  | 'social_aid.payment'
  | 'social_aid.delete'
  // İhtiyaç Sahipleri
  | 'beneficiaries.view'
  | 'beneficiaries.create'
  | 'beneficiaries.edit'
  | 'beneficiaries.delete'
  // Hastaneler
  | 'hospitals.view'
  | 'hospitals.create'
  | 'hospitals.edit'
  | 'hospitals.delete'
  // Raporlar
  | 'reports.view'
  | 'reports.financial'
  | 'reports.export'
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.stats'
  // Ayarlar
  | 'settings.general'
  | 'settings.users'
  | 'settings.roles'
  | 'settings.backup'
  | 'settings.audit'

// Rol tipi
export interface Role {
  id: string
  name: RoleName
  displayName: string
  description?: string
  hierarchyLevel: number
  isSystemRole: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// İzin tipi
export interface Permission {
  id: string
  name: PermissionName
  displayName: string
  description?: string
  module: PermissionModule
  action: PermissionAction
  createdAt: Date
}

// Rol-İzin ilişkisi
export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  createdAt: Date
}

// Kullanıcı-İzin ilişkisi (özel izinler)
export interface UserPermission {
  id: string
  userId: string
  permissionId: string
  grantedBy?: string
  grantedAt: Date
  expiresAt?: Date
}

// Rol denetim logu
export interface RoleAuditLog {
  id: string
  userId?: string
  action: 'role_assigned' | 'role_removed' | 'permission_granted' | 'permission_revoked'
  targetUserId?: string
  oldRoleId?: string
  newRoleId?: string
  permissionId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// Genişletilmiş kullanıcı tipi (RBAC ile)
export interface StaffUser {
  id: string
  name: string
  email: string
  phone?: string
  title?: string // Unvan
  department?: string // Birim
  roleId?: string
  role?: Role
  hireDate?: Date
  isActive: boolean
  lastLogin?: Date
  createdBy?: string
  notes?: string
  avatarUrl?: string
  permissions?: PermissionName[] // Tüm izinler (rol + özel)
  createdAt: Date
  updatedAt: Date
}

// Rol ile birlikte izinler
export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

// Kullanıcı oluşturma/güncelleme için form data
export interface StaffUserFormData {
  name: string
  email: string
  password?: string
  phone?: string
  title?: string
  department?: string
  roleId: string
  hireDate?: string
  isActive?: boolean
  notes?: string
}

// Rol oluşturma/güncelleme için form data
export interface RoleFormData {
  name: string
  displayName: string
  description?: string
  hierarchyLevel: number
  isActive?: boolean
  permissionIds: string[]
}

// İzin kategorileri (UI gruplandırma için)
export interface PermissionCategory {
  module: PermissionModule
  displayName: string
  permissions: Permission[]
}

// Rol hiyerarşisi gösterimi için
export interface RoleHierarchy {
  role: Role
  permissions: Permission[]
  userCount: number
}

// İzin kontrol sonucu
export interface PermissionCheckResult {
  hasPermission: boolean
  source?: 'role' | 'direct' // İzin nereden geliyor
}

// Modül bazlı izin listesi
export const PERMISSION_MODULES: Record<PermissionModule, string> = {
  uyeler: 'Üyeler',
  bagislar: 'Bağışlar',
  kumbaralar: 'Kumbaralar',
  'sosyal-yardim': 'Sosyal Yardım',
  'ihtiyac-sahipleri': 'İhtiyaç Sahipleri',
  hastaneler: 'Hastaneler',
  raporlar: 'Raporlar',
  dashboard: 'Dashboard',
  ayarlar: 'Ayarlar',
}

// Rol gösterim isimleri
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  baskan: 'Dernek Başkanı',
  baskan_yardimcisi: 'Başkan Yardımcısı',
  genel_sekreter: 'Genel Sekreter',
  muhasebe: 'Muhasebe Sorumlusu',
  sosyal_isler: 'Sosyal İşler Sorumlusu',
  uye_iliskileri: 'Üye İlişkileri Sorumlusu',
  gorevli: 'Görevli',
  misafir: 'Misafir',
}

// Departman listesi
export const DEPARTMENTS = [
  'Yönetim Kurulu',
  'Muhasebe',
  'Sosyal İşler',
  'Üye İlişkileri',
  'İletişim',
  'Organizasyon',
  'Diğer',
] as const

export type Department = (typeof DEPARTMENTS)[number]
