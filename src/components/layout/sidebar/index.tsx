'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-media-query'
import { NAV_ITEMS } from '@/lib/constants'
import { cn, getInitials } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useUserStore } from '@/stores/user-store'
import type { NavItem } from '@/types'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Nav Item Component with Tooltip support
function NavItemComponent({
  item,
  depth = 0,
}: {
  item: NavItem
  depth?: number
}) {
  const pathname = usePathname()
  const { openMenus, toggleMenu, isCollapsed } = useSidebarStore()

  const isOpen = openMenus.includes(item.label)
  const isActive = item.href === pathname
  const hasChildren = item.children && item.children.length > 0

  const Icon = item.icon

  if (hasChildren) {
    const buttonElement = (
      <button
        onClick={() => toggleMenu(item.label)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
          'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          'transition-colors duration-150',
          isOpen && 'bg-sidebar-accent text-sidebar-foreground'
        )}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                !isOpen && '-rotate-90'
              )}
            />
          </>
        )}
      </button>
    )

    return (
      <div className="w-full">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          buttonElement
        )}

        {isOpen && !isCollapsed && (
          <div 
            id={`submenu-${item.label}`}
            role="menu"
            className="border-sidebar-primary/30 animate-in slide-in-from-top-2 mt-1 ml-4 space-y-1 border-l-2 pl-4 duration-200"
          >
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.label}
                item={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const linkElement = (
    <Link
      href={item.href || '#'}
      prefetch={true}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
        'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
        'active:bg-sidebar-accent/80 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive &&
          'bg-sidebar-accent text-sidebar-primary border-sidebar-primary border-l-2'
      )}
      aria-label={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && (
        <Icon
          className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')}
        />
      )}
      {!isCollapsed && <span>{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className="bg-sidebar-primary/20 text-sidebar-primary ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
          {item.badge}
        </span>
      )}
    </Link>
  )

  return isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.label}
      </TooltipContent>
    </Tooltip>
  ) : (
    linkElement
  )
}

// User Section Component
function UserSection() {
  const { isCollapsed } = useSidebarStore()
  const { user } = useUserStore()

  return (
    <div
      className={cn(
        'border-sidebar-border/50 bg-sidebar-accent/30 flex items-center gap-3 border-t p-4',
        isCollapsed && 'justify-center'
      )}
    >
      <Avatar className="ring-sidebar-primary/40 h-10 w-10 shadow-md ring-2">
        <AvatarFallback className="from-sidebar-primary to-warning text-sidebar-primary-foreground bg-linear-to-br text-sm font-semibold">
          {getInitials(user?.name || 'Kullanıcı')}
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-sidebar-foreground truncate text-sm font-semibold">
            {user?.name || 'Kullanıcı'}
          </p>
          <p className="text-sidebar-foreground/50 truncate text-xs">
            {user?.email}
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
    const activeParent = NAV_ITEMS.find((item) =>
      item.children?.some((child) => child.href === pathname)
    )
    if (activeParent && !openMenus.includes(activeParent.label)) {
      toggleMenu(activeParent.label)
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'bg-sidebar border-sidebar-border hidden h-screen flex-col border-r transition-all duration-300 lg:flex',
          isCollapsed ? 'w-18' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'border-sidebar-border flex h-16 items-center border-b px-4',
            isCollapsed && 'justify-center'
          )}
        >
          {!isCollapsed ? (
            <Link
              href="/genel"
              className="group flex items-center gap-3"
              aria-label="Kafkasder Yönetim Paneli - Ana Sayfa"
            >
              <div className="from-sidebar-primary to-warning flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br shadow-md transition-shadow group-hover:shadow-lg">
                <span
                  className="text-sidebar-primary-foreground text-xl font-bold tracking-wider"
                  aria-hidden="true"
                >
                  K
                </span>
              </div>
              <div className="flex flex-col" aria-hidden="true">
                <span className="text-sidebar-foreground text-lg font-bold tracking-tight whitespace-nowrap">
                  Kafkasder
                </span>
                <span className="text-sidebar-foreground/60 text-2.5 tracking-wide whitespace-nowrap uppercase">
                  Yönetim Paneli
                </span>
              </div>
            </Link>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/genel"
                  className="from-sidebar-primary to-warning flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br shadow-md transition-shadow hover:shadow-lg"
                >
                  <span className="text-sidebar-primary-foreground text-xl font-bold tracking-wider">
                    K
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Ana Sayfa</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <nav 
          className="scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent flex-1 space-y-1 overflow-y-auto p-3"
          aria-label="Ana navigasyon menüsü"
        >
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
              className="from-sidebar-primary to-warning border-background absolute top-20 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-linear-to-br transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={isCollapsed ? 'Sidebar\'ı genişlet' : 'Sidebar\'ı daralt'}
              aria-expanded={!isCollapsed}
            >
              <ChevronRight
                className={cn(
                  'text-sidebar-primary-foreground h-4 w-4 transition-transform duration-200',
                  !isCollapsed && 'rotate-180'
                )}
              />
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
      <SheetContent
        side="left"
        className="bg-sidebar border-sidebar-border w-72 p-0"
      >
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/genel"
            className="group flex items-center gap-3"
            onClick={() => setOpen(false)}
            aria-label="Kafkasder Yönetim Paneli - Ana Sayfa"
          >
            <div className="from-sidebar-primary to-warning flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br shadow-md">
              <span
                className="text-sidebar-primary-foreground text-xl font-bold tracking-wider"
                aria-hidden="true"
              >
                K
              </span>
            </div>
            <div className="flex flex-col" aria-hidden="true">
              <span className="text-sidebar-foreground text-lg font-bold tracking-tight whitespace-nowrap">
                Kafkasder
              </span>
              <span className="text-sidebar-foreground/60 text-2.5 tracking-wide whitespace-nowrap uppercase">
                Yönetim Paneli
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
