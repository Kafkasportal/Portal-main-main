/**
 * Admin Users Page
 * Kullanıcı Yönetimi Ana Sayfası
 */

import { Suspense } from 'react'
import { Shield, UserPlus, Search, Filter, Download, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserTable } from '@/components/admin/users/user-table'
import { UserFilters } from '@/types/users'
import { useUserCount } from '@/hooks/use-users'

export default function AdminUsersPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">
            Dernek çalışanlarını ve kullanıcıları yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            İçe Aktar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-2xl font-bold">...</div>}>
              <UserCountCard />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adminler</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-2xl font-bold">...</div>}>
              <UserCountCard role="admin" />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderatörler</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-2xl font-bold">...</div>}>
              <UserCountCard role="moderator" />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standart Kullanıcılar</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-2xl font-bold">...</div>}>
              <UserCountCard role="user" />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="inactive">Pasif</TabsTrigger>
          <TabsTrigger value="admins">Adminler</TabsTrigger>
          <TabsTrigger value="moderators">Moderatörler</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserTableContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserTableContent isActive={true} />
          </Suspense>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserTableContent isActive={false} />
          </Suspense>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserTableContent role="admin" />
          </Suspense>
        </TabsContent>

        <TabsContent value="moderators" className="space-y-4">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserTableContent role="moderator" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * User Count Component
 * Kullanıcı sayısını gösteren kart bileşeni
 */
function UserCountCard({ role }: { role?: string }) {
  const { data: count, isLoading } = useUserCount(role)

  if (isLoading) {
    return <div className="text-2xl font-bold">...</div>
  }

  return (
    <div className="text-2xl font-bold">
      {count ?? 0}
    </div>
  )
}

/**
 * User Table Content Component
 * Filtreleme ve arama özellikleri ile kullanıcı tablosu
 */
function UserTableContent({ role, isActive }: { role?: string; isActive?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                className="pl-8 w-[300px]"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderatör</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Toplam kullanıcıları görüntüleyin, düzenleyin ve yönetin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable filters={{ role, isActive } as UserFilters} />
      </CardContent>
    </Card>
  )
}

