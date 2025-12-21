'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useIsMobile } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { CURRENT_USER } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils'
import type { NavItem } from '@/types'

// Nav Item Component with Tooltip support
function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
    const pathname = usePathname()
    const { openMenus, toggleMenu, isCollapsed } = useSidebarStore()

    const isOpen = openMenus.includes(item.label)
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0

    const Icon = item.icon

    // Collapsed modda tooltip wrapper
    const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
        if (!isCollapsed) return <>{children}</>
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        )
    }

    if (hasChildren) {
        return (
            <div className="w-full">
                <TooltipWrapper>
                    <button
                        onClick={() => toggleMenu(item.label)}
                        className={cn(
                            'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                            'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                            'transition-colors duration-150',
                            isOpen && 'bg-sidebar-accent text-sidebar-foreground'
                        )}
                    >
                        {Icon && <Icon className="h-5 w-5 shrink-0" />}
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronDown className={cn(
                                    'h-4 w-4 shrink-0 transition-transform duration-200',
                                    !isOpen && '-rotate-90'
                                )} />
                            </>
                        )}
                    </button>
                </TooltipWrapper>

                {isOpen && !isCollapsed && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-sidebar-primary/30 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children!.map((child) => (
                            <NavItemComponent key={child.label} item={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <TooltipWrapper>
            <Link
                href={item.href || '#'}
                prefetch={true}
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                    'active:bg-sidebar-accent/80 transition-colors duration-150',
                    isActive && 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary'
                )}
            >
                {Icon && <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />}
                {!isCollapsed && <span>{item.label}</span>}
                {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-sidebar-primary/20 text-sidebar-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                    </span>
                )}
            </Link>
        </TooltipWrapper>
    )
}

// User Section Component
function UserSection() {
    const { isCollapsed } = useSidebarStore()

    return (
        <div className={cn(
            'flex items-center gap-3 p-4 border-t border-sidebar-border/50 bg-sidebar-accent/30',
            isCollapsed && 'justify-center'
        )}>
            <Avatar className="h-10 w-10 ring-2 ring-sidebar-primary/40 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-warning text-sidebar-primary-foreground text-sm font-semibold">
                    {getInitials(CURRENT_USER.name)}
                </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {CURRENT_USER.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                        {CURRENT_USER.email}
                    </p>
                </div>
            )}
        </div>
    )
}

// Desktop Sidebar
function DesktopSidebar() {
    const pathname = usePathname()
    const { isCollapsed, setCollapsed, openMenus, toggleMenu } = useSidebarStore()

    // Aktif sayfaya göre ilgili menüyü otomatik aç
    useEffect(() => {
        const activeParent = NAV_ITEMS.find(item => 
            item.children?.some(child => child.href === pathname)
        )
        if (activeParent && !openMenus.includes(activeParent.label)) {
            toggleMenu(activeParent.label)
        }
    }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <TooltipProvider>
            <aside
                className={cn(
                    'hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
                    isCollapsed ? 'w-[72px]' : 'w-64'
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'flex items-center h-16 px-4 border-b border-sidebar-border',
                    isCollapsed && 'justify-center'
                )}>
                    {!isCollapsed ? (
                        <Link href="/genel" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-warning flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                <span className="text-sidebar-primary-foreground font-bold text-xl tracking-wider">K</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Kafkasder</span>
                                <span className="text-[10px] text-sidebar-foreground/60 tracking-wide uppercase">Yönetim Paneli</span>
                            </div>
                        </Link>
                    ) : (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link href="/genel" className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-warning flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                                    <span className="text-sidebar-primary-foreground font-bold text-xl tracking-wider">K</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Ana Sayfa</TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
                    {NAV_ITEMS.map((item) => (
                        <NavItemComponent key={item.label} item={item} />
                    ))}
                </nav>

                {/* User Section */}
                <UserSection />

                {/* Collapse Toggle */}
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-20 w-7 h-7 bg-gradient-to-br from-sidebar-primary to-warning border-2 border-background rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-110"
                        >
                            <ChevronRight className={cn(
                                'h-4 w-4 text-sidebar-primary-foreground transition-transform duration-200',
                                !isCollapsed && 'rotate-180'
                            )} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {isCollapsed ? 'Genişlet' : 'Daralt'}
                    </TooltipContent>
                </Tooltip>
            </aside>
        </TooltipProvider>
    )
}

// Mobile Sidebar (Sheet)
function MobileSidebar() {
    const { isOpen, setOpen } = useSidebarStore()

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                    <Link href="/genel" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-warning flex items-center justify-center shadow-md">
                            <span className="text-sidebar-primary-foreground font-bold text-xl tracking-wider">K</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Kafkasder</span>
                            <span className="text-[10px] text-sidebar-foreground/60 tracking-wide uppercase">Yönetim Paneli</span>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    <TooltipProvider>
                        {NAV_ITEMS.map((item) => (
                            <NavItemComponent key={item.label} item={item} />
                        ))}
                    </TooltipProvider>
                </nav>

                {/* User Section */}
                <UserSection />
            </SheetContent>
        </Sheet>
    )
}

// Main Sidebar Export
export function Sidebar() {
    const isMobile = useIsMobile()
    const { setMobile } = useSidebarStore()

    useEffect(() => {
        setMobile(isMobile)
    }, [isMobile, setMobile])

    return (
        <>
            <DesktopSidebar />
            {isMobile && <MobileSidebar />}
        </>
    )
}

export { MobileSidebar }
