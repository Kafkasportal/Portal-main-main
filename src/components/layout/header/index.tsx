'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-media-query'
import { getInitials } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useUserStore } from '@/stores/user-store'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, lazy, useEffect, useState } from 'react'

// Lazy load Command Palette - only needed when user opens it
const CommandPalette = lazy(() =>
  import('@/components/shared/command-palette').then((mod) => ({
    default: mod.CommandPalette,
  }))
)

export function Header() {
  const { isCollapsed, setCollapsed, setOpen } = useSidebarStore()
  const { user, logout } = useUserStore()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [commandOpen, setCommandOpen] = useState(false)

  // Keyboard shortcut for command palette
  useEffect(() => {
    if (typeof window === 'undefined') return

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => {
      document.removeEventListener('keydown', down)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/giris')
  }

  return (
    <header className="border-border bg-card/80 flex h-16 items-center justify-between border-b px-4 shadow-sm backdrop-blur-sm lg:px-6">
      {/* Left side - Mobile menu + Search */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü</span>
        </Button>

        {/* Desktop collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent hidden lg:flex"
          onClick={() => setCollapsed(!isCollapsed)}
          title="Menüyü daralt/genişlet"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - Command Palette Trigger */}
        <Button
          variant="outline"
          className="text-muted-foreground bg-background border-border hover:bg-accent/50 hover:text-foreground hidden w-64 max-w-full items-center justify-start gap-2 transition-all sm:flex"
          onClick={() => {
            setCommandOpen(true)
          }}
          aria-label="Arama yap (⌘K)"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">Ara...</span>
          <kbd className="bg-muted text-muted-foreground text-2.5 pointer-events-none inline-flex h-5 shrink-0 items-center gap-1 rounded border px-1.5 font-mono font-medium select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right side - Notifications + User menu */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent sm:hidden"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent relative transition-colors"
          aria-label="Bildirimler"
        >
          <Bell className="h-5 w-5" />
          <span
            className="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 animate-pulse rounded-full shadow-sm"
            aria-hidden="true"
          />
          <span className="sr-only">Bildirimler</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-accent flex items-center gap-2 px-2"
              aria-label={`Kullanıcı menüsü: ${user?.name || 'Kullanıcı'}`}
            >
              <Avatar
                className="ring-primary/20 h-8 w-8 shrink-0 shadow-sm ring-2"
                aria-hidden="true"
              >
                <AvatarFallback className="from-primary to-accent text-primary-foreground bg-gradient-to-br text-xs font-semibold">
                  {getInitials(user?.name || 'Kullanıcı')}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <span
                  className="max-w-25 truncate text-sm font-medium whitespace-nowrap"
                  title={user?.name || 'Kullanıcı'}
                >
                  {user?.name || 'Kullanıcı'}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/50 w-56 shadow-lg"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">
                  {user?.name || 'Kullanıcı'}
                </p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Command Palette - Lazy loaded */}
      {commandOpen && (
        <Suspense fallback={null}>
          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </Suspense>
      )}
    </header>
  )
}
