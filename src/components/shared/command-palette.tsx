'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command'
import { NAV_ITEMS } from '@/lib/constants'
import type { NavItem } from '@/types'
import {
    ArrowRight,
    Clock,
    CreditCard,
    FileText,
    Search,
    Settings,
    User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Flatten nav items for search
function flattenNavItems(items: NavItem[], parentLabel?: string): (NavItem & { parentLabel?: string })[] {
    return items.reduce<(NavItem & { parentLabel?: string })[]>((acc, item) => {
        const flatItem = { ...item, parentLabel }
        if (item.href) {
            acc.push(flatItem)
        }
        if (item.children) {
            acc.push(...flattenNavItems(item.children, item.label))
        }
        return acc
    }, [])
}

// Recent pages storage key
const RECENT_PAGES_KEY = 'kafkasder-recent-pages'
const MAX_RECENT_PAGES = 5

interface RecentPage {
    href: string
    label: string
    parentLabel?: string
    timestamp: number
}

interface CommandPaletteProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const router = useRouter()

    // Use controlled or uncontrolled mode
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            if (isControlled) {
                onOpenChange?.(typeof value === 'function' ? value(controlledOpen!) : value)
            } else {
                setInternalOpen(typeof value === 'function' ? value(internalOpen) : value)
            }
        },
        [isControlled, onOpenChange, controlledOpen, internalOpen]
    )

    // Flatten all nav items
    const allPages = useMemo(() => flattenNavItems(NAV_ITEMS), [])

    // Load recent pages from localStorage
    const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
        if (typeof window === 'undefined') return []
        try {
            const stored = localStorage.getItem(RECENT_PAGES_KEY)
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    // Save recent page
    const saveRecentPage = useCallback((page: NavItem & { parentLabel?: string }) => {
        setRecentPages(prev => {
            const filtered = prev.filter(p => p.href !== page.href)
            const newRecent: RecentPage = {
                href: page.href!,
                label: page.label,
                parentLabel: page.parentLabel,
                timestamp: Date.now()
            }
            const updated = [newRecent, ...filtered].slice(0, MAX_RECENT_PAGES)
            localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    // Keyboard shortcut - only when uncontrolled
    useEffect(() => {
        if (isControlled) return

        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(!open)
            }
        }

        document.addEventListener('keydown', down)
        return () => { document.removeEventListener('keydown', down); }
    }, [isControlled, open, setOpen])

    // Navigate to page
    const runCommand = useCallback((page: NavItem & { parentLabel?: string }) => {
        setOpen(false)
        if (page.href) {
            saveRecentPage(page)
            router.push(page.href)
        }
    }, [router, saveRecentPage, setOpen])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Sayfa ara veya komut yaz..." />
            <CommandList>
                <CommandEmpty>
                    <div className="flex flex-col items-center gap-2 py-6">
                        <Search className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Sonuç bulunamadı</p>
                    </div>
                </CommandEmpty>

                {/* Recent Pages */}
                {recentPages.length > 0 && (
                    <CommandGroup heading="Son Ziyaret Edilenler">
                        {recentPages.map((page) => {
                            const navItem = allPages.find(p => p.href === page.href)
                            const Icon = navItem?.icon || FileText
                            return (
                                <CommandItem
                                    key={page.href}
                                    value={`recent-${page.href}`}
                                    onSelect={() => { runCommand({ ...page, icon: Icon }); }}
                                    className="flex items-center gap-3"
                                >
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <span>{page.label}</span>
                                        {page.parentLabel && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                • {page.parentLabel}
                                            </span>
                                        )}
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                )}

                <CommandSeparator />

                {/* Quick Actions */}
                <CommandGroup heading="Hızlı İşlemler">
                    <CommandItem
                        onSelect={() => {
                            setOpen(false)
                            router.push('/uyeler/yeni')
                        }}
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Yeni Üye Ekle</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => {
                            setOpen(false)
                            router.push('/bagis/liste')
                        }}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Bağış Kaydet</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => {
                            setOpen(false)
                            router.push('/sosyal-yardim/basvurular')
                        }}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Başvuruları Görüntüle</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* All Pages */}
                <CommandGroup heading="Tüm Sayfalar">
                    {allPages.map((page) => {
                        const Icon = page.icon || FileText
                        return (
                            <CommandItem
                                key={page.href}
                                value={`${page.label} ${page.parentLabel || ''}`}
                                onSelect={() => { runCommand(page); }}
                                className="flex items-center gap-2"
                            >
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span>{page.label}</span>
                                {page.parentLabel && (
                                    <span className="text-xs text-muted-foreground">
                                        • {page.parentLabel}
                                    </span>
                                )}
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandSeparator />

                {/* Settings */}
                <CommandGroup heading="Ayarlar">
                    <CommandItem
                        onSelect={() => {
                            setOpen(false)
                            router.push('/ayarlar')
                        }}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Genel Ayarlar</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
