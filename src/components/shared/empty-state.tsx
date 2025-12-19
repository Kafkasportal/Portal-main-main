import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FileX, Search, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <div className={cn(
            'flex flex-col items-center justify-center py-12 px-4 text-center',
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
                {title || config.title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {description || config.description}
            </p>
            {action}
        </div>
    )
}
