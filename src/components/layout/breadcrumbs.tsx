'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// Map route segments to Turkish labels
const routeLabels: Record<string, string> = {
    genel: 'Genel Bakış',
    bagis: 'Bağışlar',
    liste: 'Liste',
    kumbara: 'Kumbara Yönetimi',
    'gelir-gider': 'Gelir-Gider',
    raporlar: 'Raporlar',
    uyeler: 'Üyeler',
    yeni: 'Yeni Ekle',
    'sosyal-yardim': 'Sosyal Yardım',
    basvurular: 'Başvurular',
    odemeler: 'Ödemeler',
    istatistikler: 'İstatistikler',
    etkinlikler: 'Etkinlikler',
    dokumanlar: 'Dokümanlar',
    ayarlar: 'Ayarlar',
    kullanicilar: 'Kullanıcılar',
    yedekleme: 'Yedekleme'
}

export function Breadcrumbs() {
    const pathname = usePathname()

    // Skip breadcrumbs for home/dashboard
    if (pathname === '/' || pathname === '/genel') {
        return null
    }

    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean)

    // Build breadcrumb items
    const items = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        const isLast = index === segments.length - 1

        return {
            href,
            label,
            isLast
        }
    })

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                {/* Home */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/genel" className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">Ana Sayfa</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Dynamic segments */}
                {items.map((item) => (
                    <Fragment key={item.href}>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            {item.isLast ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
