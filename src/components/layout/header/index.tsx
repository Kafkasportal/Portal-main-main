'use client'

import { Search, Bell, Settings, LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CURRENT_USER } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useUserStore } from '@/stores/user-store'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-media-query'

export function Header() {
    const { isCollapsed, setCollapsed, setOpen } = useSidebarStore()
    const { logout } = useUserStore()
    const router = useRouter()
    const isMobile = useIsMobile()

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

                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Ara... (Ctrl+K)"
                        className="w-64 pl-9 bg-background border-border focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Right side - Notifications + User menu */}
            <div className="flex items-center gap-2">
                {/* Mobile search button */}
                <Button variant="ghost" size="icon" className="sm:hidden hover:bg-accent">
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
        </header>
    )
}
