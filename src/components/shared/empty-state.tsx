import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FileX, Search, AlertCircle, Inbox } from 'lucide-react'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent
} from '@/components/ui/empty'

type EmptyStateVariant = 'default' | 'search' | 'error' | 'no-data'

interface EmptyStateProps {
    variant?: EmptyStateVariant
    title?: string
    description?: string
    action?: ReactNode
    className?: string
}

const variantConfig = {
    default: {
        icon: Inbox,
        title: 'Veri bulunamadı',
        description: 'Henüz görüntülenecek veri yok.'
    },
    search: {
        icon: Search,
        title: 'Sonuç bulunamadı',
        description: 'Arama kriterlerinize uygun sonuç bulunamadı.'
    },
    error: {
        icon: AlertCircle,
        title: 'Bir hata oluştu',
        description: 'Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
    },
    'no-data': {
        icon: FileX,
        title: 'Kayıt yok',
        description: 'Bu kategoride henüz kayıt bulunmamaktadır.'
    }
}

export function EmptyState({
    variant = 'default',
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <Empty className={cn('border-0', className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle>{title || config.title}</EmptyTitle>
                <EmptyDescription>
                    {description || config.description}
                </EmptyDescription>
            </EmptyHeader>
            {action && <EmptyContent>{action}</EmptyContent>}
        </Empty>
    )
}
