/**
 * User Types
 * User entity ve permissions için tip tanımları
 */

/**
 * User rolleri
 */
export enum Role {
  ADMIN = 'admin',           // Tüm yetkiler
  MODERATOR = 'moderator', // Kullanıcı yönetimi + finansal
  USER = 'user',            // Sadece kendi profili
}

/**
 * Yetki (Permissions)
 * Her yetki bir string enum olarak tanımlı
 */
export enum Permission {
  // Temel yetkiler
  LOGIN = 'login',
  VIEW_PROFILE = 'view_profile',
  UPDATE_PROFILE = 'update_profile',

  // Kullanıcı yönetimi
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  MANAGE_ROLES = 'manage_roles',

  // Finansal
  VIEW_DONATIONS = 'view_donations',
  CREATE_DONATION = 'create_donation',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  
  // Sosyal yardım
  VIEW_APPLICATIONS = 'view_applications',
  APPROVE_APPLICATION = 'approve_application',
  CREATE_PAYMENT = 'create_payment',

  // Sosyal yardım (diğer)
  VIEW_BENEFICIARIES = 'view_beneficiaries',
  CREATE_BENEFICIARY = 'create_beneficiary',
  UPDATE_BENEFICIARY = 'update_beneficiary',
  
  // Kurumsal
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',

  // Admin
  MANAGE_SYSTEM = 'manage_system',
}

/**
 * Rol bazlı yetki listesi
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    // Tüm yetkiler
    Permission.LOGIN,
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_ROLES,
    Permission.VIEW_DONATIONS,
    Permission.CREATE_DONATION,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_APPLICATIONS,
    Permission.APPROVE_APPLICATION,
    Permission.CREATE_PAYMENT,
    Permission.VIEW_BENEFICIARIES,
    Permission.CREATE_BENEFICIARY,
    Permission.UPDATE_BENEFICIARY,
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.MANAGE_SYSTEM,
  ],

  moderator: [
    // Kullanıcı yönetimi + finansal
    Permission.LOGIN,
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.VIEW_DONATIONS,
    Permission.CREATE_DONATION,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_APPLICATIONS,
    Permission.APPROVE_APPLICATION,
    Permission.CREATE_PAYMENT,
    Permission.VIEW_BENEFICIARIES,
    Permission.CREATE_BENEFICIARY,
    Permission.UPDATE_BENEFICIARY,
    Permission.VIEW_SETTINGS,
  ],

  user: [
    // Sadece temel yetkiler
    Permission.LOGIN,
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
  ],
}

/**
 * Kullanıcı yetki objesi
 * Supabase app_metadata JSONB formatında saklanacak
 */
export interface UserPermissions {
  LOGIN: boolean
  VIEW_PROFILE: boolean
  UPDATE_PROFILE: boolean
  VIEW_USERS: boolean
  CREATE_USER: boolean
  UPDATE_USER: boolean
  DELETE_USER: boolean
  MANAGE_ROLES: boolean
  VIEW_DONATIONS: boolean
  CREATE_DONATION: boolean
  VIEW_FINANCIAL_REPORTS: boolean
  VIEW_APPLICATIONS: boolean
  APPROVE_APPLICATION: boolean
  CREATE_PAYMENT: boolean
  VIEW_BENEFICIARIES: boolean
  CREATE_BENEFICIARY: boolean
  UPDATE_BENEFICIARY: boolean
  VIEW_SETTINGS: boolean
  UPDATE_SETTINGS: boolean
  MANAGE_SYSTEM: boolean
}

/**
 * Varsayılan kullanıcı yetkileri (Admin için)
 */
export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  LOGIN: true,
  VIEW_PROFILE: true,
  UPDATE_PROFILE: true,
  VIEW_USERS: true,
  CREATE_USER: true,
  UPDATE_USER: true,
  DELETE_USER: true,
  MANAGE_ROLES: true,
  VIEW_DONATIONS: true,
  CREATE_DONATION: true,
  VIEW_FINANCIAL_REPORTS: true,
  VIEW_APPLICATIONS: true,
  APPROVE_APPLICATION: true,
  CREATE_PAYMENT: true,
  VIEW_BENEFICIARIES: true,
  CREATE_BENEFICIARY: true,
  UPDATE_BENEFICIARY: true,
  VIEW_SETTINGS: true,
  UPDATE_SETTINGS: true,
  MANAGE_SYSTEM: true,
}

/**
 * Kullanıcı entity tipi
 * Supabase auth.users tablosu ve app_metadata'le birleştirilmiş
 */
export interface User {
  id: string
  
  // Temel bilgiler
  email: string
  name: string
  phone?: string | null
  avatar_url?: string | null
  role: Role
  
  // Durum bilgileri
  is_active: boolean
  last_login?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  
  // Kişisel bilgiler (app_metadata'den)
  ad?: string
  soyad?: string
  birim?: string | null
  yetki?: string | null  // KULLANICI/YÖNETİCİ/KURUMSAL
  gorev?: string | null
  dahili?: string | null
  kisa_kod?: string | null
  kisa_kod2?: string | null
  erisim_yetkisi?: string | null
  imza_yetkisi?: string | null
  fon_yetkisi?: string | null
  fon_yetkisi2?: string | null
  fon_yetkisi3?: string | null
  fon_bolgesi_yetkisi?: string | null
  fon_yetkisi2?: string | null
  fon_yetkisi3?: string | null
  imza_yetkisi2?: string | null
  imza_yetkisi3?: string | null
  
  // Sistem bilgileri (app_metadata'den)
  durum?: 'aktif' | 'pasif' | 'beklemede'
  permissions?: UserPermissions
}

/**
 * Kullanıcı oluşturma formu verileri
 */
export interface CreateUserData {
  email: string
  password?: string
  ad: string
  soyad: string
  name?: string
  role: Role
  phone?: string
  birim?: string
  yetki?: string
  gorev?: string
  dahili?: string
  kisa_kod?: string
  kisa_kod2?: string
  erisim_yetkisi?: string
  imza_yetkisi?: string
  fon_yetkisi?: string
  fon_bolgesi_yetkisi?: string
  fon_yetkisi2?: string
  fon_yetkisi3?: string
  imza_yetkisi2?: string
  imza_yetkisi3?: string
  isActive?: boolean
  permissions?: UserPermissions
}

/**
 * Kullanıcı güncelleme formu verileri
 */
export interface UpdateUserData {
  id: string
  email?: string
  password?: string
  name?: string
  ad?: string
  soyad?: string
  role?: Role
  phone?: string
  birim?: string
  yetki?: string
  gorev?: string
  dahili?: string
  kisa_kod?: string
  kisa_kod2?: string
  erisim_yetkisi?: string
  imza_yetkisi?: string
  fon_yetkisi?: string
  fon_bolgesi_yetkisi?: string
  fon_yetkisi2?: string
  fon_yetkisi3?: string
  imza_yetkisi2?: string
  imza_yetkisi3?: string
  is_active?: boolean
  permissions?: Partial<UserPermissions>
}

/**
 * Kullanıcı listesi için API yanıt tipi
 */
export interface UserListResponse {
  users: User[]
  total: number
  page: number
  pageSize: number
}

/**
 * Kullanıcı filtreleme seçenekleri
 */
export interface UserFilters {
  search?: string
  role?: Role
  isActive?: boolean
  created_after?: string
  created_before?: string
}

/**
 * Kullanıcı sıralama seçenekleri
 */
export type UserSortOption = 
  | 'name_asc'
  | 'name_desc'
  | 'email_asc'
  | 'email_desc'
  | 'created_at_asc'
  | 'created_at_desc'
  | 'last_login_asc'
  | 'last_login_desc'

/**
 * Rol etiketleri
 */
export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Yönetici',
  moderator: 'Moderatör',
  user: 'Kullanıcı',
} as const

/**
 * Rol variantları (UI için)
 */
export const ROLE_VARIANTS: Record<Role, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  admin: 'destructive',
  moderator: 'secondary',
  user: 'default',
} as const


