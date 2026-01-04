/**
 * Permission Config Component
 * Kullanıcı izinlerini yapılandırma bileşeni
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, User, Users, DollarSign, FileText, Settings, Activity } from 'lucide-react'

interface PermissionConfigProps {
  permissions: Record<string, boolean>
  onPermissionChange: (permission: string, value: boolean) => void
  disabled?: boolean
}

// Permission kategorileri
const PERMISSION_CATEGORIES = {
  BASIC: {
    label: 'Temel Yetenekler',
    icon: User,
    description: 'Kullanıcının temel sistem erişimi',
    permissions: [
      { key: 'LOGIN', label: 'Giriş Yapma', description: 'Sisteme giriş yapabilir' },
      { key: 'VIEW_PROFILE', label: 'Profil Görüntüleme', description: 'Kendi profilini görebilir' },
      { key: 'UPDATE_PROFILE', label: 'Profil Güncelleme', description: 'Kendi profilini güncelleyebilir' },
    ],
  },
  USER_MANAGEMENT: {
    label: 'Kullanıcı Yönetimi',
    icon: Users,
    description: 'Diğer kullanıcıları yönetme yetkileri',
    permissions: [
      { key: 'VIEW_USERS', label: 'Kullanıcıları Görüntüleme', description: 'Tüm kullanıcıları görebilir' },
      { key: 'CREATE_USER', label: 'Kullanıcı Oluşturma', description: 'Yeni kullanıcı ekleyebilir' },
      { key: 'UPDATE_USER', label: 'Kullanıcı Güncelleme', description: 'Kullanıcı bilgilerini düzenleyebilir' },
      { key: 'DELETE_USER', label: 'Kullanıcı Silme', description: 'Kullanıcı silebilir' },
      { key: 'MANAGE_ROLES', label: 'Rol Yönetimi', description: 'Kullanıcı rollerini değiştirebilir' },
    ],
  },
  FINANCIAL: {
    label: 'Finansal İşlemler',
    icon: DollarSign,
    description: 'Finansal veri ve rapor erişimi',
    permissions: [
      { key: 'VIEW_DONATIONS', label: 'Bağışları Görüntüleme', description: 'Tüm bağışları görebilir' },
      { key: 'CREATE_DONATION', label: 'Bağış Oluşturma', description: 'Yeni bağış kaydedebilir' },
      { key: 'VIEW_FINANCIAL_REPORTS', label: 'Finansal Raporlar', description: 'Finansal raporları görebilir' },
    ],
  },
  SOCIAL_AID: {
    label: 'Sosyal Yardım',
    icon: Activity,
    description: 'Sosyal yardım başvuru ve ödemeleri',
    permissions: [
      { key: 'VIEW_APPLICATIONS', label: 'Başvuruları Görüntüleme', description: 'Tüm başvuruları görebilir' },
      { key: 'APPROVE_APPLICATION', label: 'Başvuru Onaylama', description: 'Başvuruları onaylayabilir' },
      { key: 'CREATE_PAYMENT', label: 'Ödeme Oluşturma', description: 'Ödeme oluşturabilir' },
    ],
  },
  CORPORATE: {
    label: 'Kurumsal Ayarlar',
    icon: Settings,
    description: 'Sistem ayarları ve yapılandırma',
    permissions: [
      { key: 'VIEW_SETTINGS', label: 'Ayarları Görüntüleme', description: 'Sistem ayarlarını görebilir' },
      { key: 'UPDATE_SETTINGS', label: 'Ayarları Güncelleme', description: 'Sistem ayarlarını değiştirebilir' },
    ],
  },
  ADMIN: {
    label: 'Yönetici Yetkileri',
    icon: Shield,
    description: 'Yüksek düzey sistem yetkileri',
    permissions: [
      { key: 'MANAGE_SYSTEM', label: 'Sistem Yönetimi', description: 'Tüm sistem özelliklerini yönetebilir' },
    ],
  },
}

export function PermissionConfig({ permissions, onPermissionChange, disabled }: PermissionConfigProps) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
          const CategoryIcon = category.icon
          return (
            <Card key={key} className={disabled ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{category.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {category.permissions.length} izin
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.permissions.map((permission) => {
                    const isEnabled = permissions[permission.key] === true
                    return (
                      <div
                        key={permission.key}
                        className="flex items-start justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <Switch
                            id={`perm-${permission.key}`}
                            checked={isEnabled}
                            onCheckedChange={(checked) => onPermissionChange(permission.key, checked)}
                            disabled={disabled}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={`perm-${permission.key}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

/**
 * Permission Summary Component
 * Kullanıcı izinlerinin özetini gösteren bileşen
 */
export function PermissionSummary({ permissions }: { permissions: Record<string, boolean> }) {
  const enabledPermissions = Object.entries(permissions)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key)

  const categoryCounts = {
    BASIC: enabledPermissions.filter(p =>
      ['LOGIN', 'VIEW_PROFILE', 'UPDATE_PROFILE'].includes(p)
    ).length,
    USER_MANAGEMENT: enabledPermissions.filter(p =>
      ['VIEW_USERS', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'MANAGE_ROLES'].includes(p)
    ).length,
    FINANCIAL: enabledPermissions.filter(p =>
      ['VIEW_DONATIONS', 'CREATE_DONATION', 'VIEW_FINANCIAL_REPORTS'].includes(p)
    ).length,
    SOCIAL_AID: enabledPermissions.filter(p =>
      ['VIEW_APPLICATIONS', 'APPROVE_APPLICATION', 'CREATE_PAYMENT'].includes(p)
    ).length,
    CORPORATE: enabledPermissions.filter(p =>
      ['VIEW_SETTINGS', 'UPDATE_SETTINGS'].includes(p)
    ).length,
    ADMIN: enabledPermissions.filter(p =>
      ['MANAGE_SYSTEM'].includes(p)
    ).length,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
        const CategoryIcon = category.icon
        const count = categoryCounts[key as keyof typeof categoryCounts]
        const total = category.permissions.length
        const percentage = Math.round((count / total) * 100)

        return (
          <div key={key} className="flex items-center gap-2">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{category.label}:</span>
            <span className="text-sm font-medium">{count}/{total}</span>
            <span className="text-xs text-muted-foreground">({percentage}%)</span>
          </div>
        )
      })}
    </div>
  )
}

