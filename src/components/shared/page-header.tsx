import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

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
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight wrap-break-word whitespace-normal">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 wrap-break-word whitespace-normal">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2" role="toolbar" aria-label="Sayfa aksiyonları">
          {action}
        </div>
      )}
    </header>
  )
}
