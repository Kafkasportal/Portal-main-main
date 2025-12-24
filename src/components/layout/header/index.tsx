'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-media-query'
import { CURRENT_USER } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useUserStore } from '@/stores/user-store'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { lazy, Suspense, useEffect, useState } from 'react'

// Lazy load Command Palette - only needed when user opens it
const CommandPalette = lazy(() => 
    import('@/components/shared/command-palette').then(mod => ({ default: mod.CommandPalette }))
)

export function Header() {
    const { isCollapsed, setCollapsed, setOpen } = useSidebarStore()
    const { logout } = useUserStore()
    const router = useRouter()
    const isMobile = useIsMobile()
    const [commandOpen, setCommandOpen] = useState(false)

    // Keyboard shortcut for command palette
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setCommandOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => { document.removeEventListener('keydown', down); }
    }, [])

    const handleLogout = () => {
        logout()
        router.push('/giris')
    }

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shadow-sm">
            {/* Left side - Mobile menu + Search */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-accent"
                    onClick={() => setOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menü</span>
                </Button>

                {/* Desktop collapse toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex hover:bg-accent"
                    onClick={() => setCollapsed(!isCollapsed)}
                    title="Menüyü daralt/genişlet"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search - Command Palette Trigger */}
                <Button
                    variant="outline"
                    className="hidden sm:flex items-center gap-2 w-64 justify-start text-muted-foreground bg-background border-border hover:bg-accent/50 hover:text-foreground transition-all"
                    onClick={() => { setCommandOpen(true); }}
                >
                    <Search className="h-4 w-4" />
                    <span className="flex-1 text-left">Ara...</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
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
                    className="sm:hidden hover:bg-accent"
                    onClick={() => setCommandOpen(true)}
                >
                    <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse shadow-sm" />
                    <span className="sr-only">Bildirimler</span>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
                            <Avatar className="h-8 w-8 ring-2 ring-primary/20 shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                                    {getInitials(CURRENT_USER.name)}
                                </AvatarFallback>
                            </Avatar>
                            {!isMobile && (
                                <span className="text-sm font-medium max-w-[100px] truncate">
                                    {CURRENT_USER.name}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-lg border-border/50">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold">{CURRENT_USER.name}</p>
                                <p className="text-xs text-muted-foreground">{CURRENT_USER.email}</p>
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
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
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
