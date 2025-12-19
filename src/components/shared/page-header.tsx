import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    action,
    className
}: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {action && (
                <div className="flex items-center gap-2 shrink-0">
                    {action}
                </div>
            )}
        </div>
    )
}
