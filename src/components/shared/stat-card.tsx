import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { memo } from 'react'

type StatCardVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'primary'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: number
  trendLabel?: string
  trendUnit?: string
  variant?: StatCardVariant
  size?: 'default' | 'compact' | 'large'
  interactive?: boolean
  onClick?: () => void
  description?: string
  className?: string
}

const variantStyles: Record<StatCardVariant, string> = {
  default: 'bg-card',
  success: 'bg-success/5 border-success/20 hover:border-success/40',
  warning: 'bg-warning/5 border-warning/20 hover:border-warning/40',
  destructive:
    'bg-destructive/5 border-destructive/20 hover:border-destructive/40',
  info: 'bg-info/5 border-info/20 hover:border-info/40',
  primary: 'bg-primary/5 border-primary/20 hover:border-primary/40',
}

const iconStyles: Record<StatCardVariant, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
  info: 'bg-info/15 text-info',
  primary: 'bg-primary/15 text-primary',
}

const trendBadgeStyles: Record<'up' | 'down' | 'neutral', string> = {
  up: 'bg-success/10 text-success',
  down: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  trendUnit = '%',
  variant = 'default',
  size = 'default',
  interactive = false,
  onClick,
  description,
  className,
}: StatCardProps) {
  const getTrendDirection = () => {
    if (!trend || trend === 0) return 'neutral'
    return trend > 0 ? 'up' : 'down'
  }

  const getTrendIcon = () => {
    const direction = getTrendDirection()
    if (direction === 'neutral') return <Minus className="size-3" />
    return direction === 'up' ? (
      <TrendingUp className="size-3" />
    ) : (
      <TrendingDown className="size-3" />
    )
  }

  const sizeStyles = {
    compact: 'p-4',
    default: 'p-5',
    large: 'p-6',
  }

  const valueSizes = {
    compact: 'text-xl',
    default: 'text-2xl',
    large: 'text-3xl',
  }

  const cardId = `stat-card-${(label || 'stat').toLowerCase().replace(/\s+/g, '-')}`

  return (
    <Card
      id={cardId}
      role={interactive ? 'button' : 'region'}
      aria-label={interactive ? `${label || 'Stat'}: ${value}` : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'transition-all duration-200',
        variantStyles[variant],
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      <CardContent className={sizeStyles[size]}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-muted-foreground truncate text-sm font-medium">
              {label || ''}
            </p>
            <p
              className={cn(
                'font-bold tracking-tight tabular-nums',
                valueSizes[size]
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {value}
            </p>

            {description && (
              <p className="text-muted-foreground line-clamp-2 text-xs">
                {description}
              </p>
            )}

            {(trend !== undefined || trendLabel) && (
              <div
                className={cn(
                  'mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  trendBadgeStyles[getTrendDirection()]
                )}
                role="status"
                aria-label={`Trend: ${getTrendDirection() === 'up' ? 'artış' : getTrendDirection() === 'down' ? 'azalış' : 'değişiklik yok'}`}
              >
                {getTrendIcon()}
                <span>
                  {trend !== undefined &&
                    `${trend > 0 ? '+' : ''}${trend.toFixed(1)}${trendUnit}`}
                  {trendLabel && ` ${trendLabel}`}
                </span>
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                'shrink-0 rounded-xl p-3 transition-transform duration-200',
                iconStyles[variant],
                interactive && 'group-hover:scale-110'
              )}
            >
              <Icon className={cn(size === 'compact' ? 'size-5' : 'size-6')} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
