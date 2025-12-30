'use client'

import { useState } from 'react'
import { useRoles, useAllPermissions, useRolePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Users, Lock, Eye } from 'lucide-react'
import type { Role, Permission } from '@/types/rbac'
import { PERMISSION_MODULES } from '@/types/rbac'

export default function RollerPage() {
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: allPermissions } = useAllPermissions()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: rolePermissions } = useRolePermissions(selectedRole?.id)

  // Group permissions by module
  const groupedPermissions = allPermissions?.reduce((acc, perm) => {
    const module = perm.module
    if (!acc[module]) {
      acc[module] = []
    }
    acc[module].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role)
    setDetailsOpen(true)
  }

  const hasPermission = (permId: string) => {
    return rolePermissions?.some((p) => p.id === permId)
  }

  if (rolesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rol Yönetimi</h1>
          <p className="text-muted-foreground">
            Dernek personeli için rol ve yetki tanımlamalarını görüntüleyin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rol</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İzin</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPermissions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modül Sayısı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedPermissions || {}).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roller</CardTitle>
          <CardDescription>
            Sistemde tanımlı tüm roller ve yetki seviyeleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-center">Yetki Seviyesi</TableHead>
                <TableHead className="text-center">Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">{role.displayName}</span>
                      {role.isSystemRole && (
                        <Badge variant="secondary" className="text-xs">
                          Sistem
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        role.hierarchyLevel <= 2
                          ? 'destructive'
                          : role.hierarchyLevel <= 4
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      Seviye {role.hierarchyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={role.isActive ? 'default' : 'outline'}>
                      {role.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(role)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      İzinleri Gör
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedRole?.displayName} - İzinler
            </DialogTitle>
            <DialogDescription>
              {selectedRole?.description || 'Bu role ait tüm izinler aşağıda listelenmiştir.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {groupedPermissions &&
                Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {PERMISSION_MODULES[module as keyof typeof PERMISSION_MODULES] || module}
                    </h4>
                    <div className="grid gap-2">
                      {permissions.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center space-x-3 rounded-lg border p-3"
                        >
                          <Checkbox
                            id={perm.id}
                            checked={hasPermission(perm.id)}
                            disabled
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={perm.id}
                              className="text-sm font-medium leading-none"
                            >
                              {perm.displayName}
                            </label>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {perm.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {perm.action}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
