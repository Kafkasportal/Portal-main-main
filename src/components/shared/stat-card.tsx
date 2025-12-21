import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
    label: string
    value: string | number
    icon?: LucideIcon
    trend?: number
    trendLabel?: string
    variant?: 'default' | 'success' | 'warning' | 'destructive'
    className?: string
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendLabel,
    variant = 'default',
    className
}: StatCardProps) {
    const variantStyles = {
        default: 'bg-card',
        success: 'bg-success/10 border-success/20',
        warning: 'bg-warning/10 border-warning/20',
        destructive: 'bg-destructive/10 border-destructive/20'
    }

    const iconStyles = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-success/20 text-success',
        warning: 'bg-warning/20 text-warning',
        destructive: 'bg-destructive/20 text-destructive'
    }

    const getTrendIcon = () => {
        if (!trend || trend === 0) return <Minus className="h-3 w-3" />
        return trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
    }

    const getTrendColor = () => {
        if (!trend || trend === 0) return 'text-muted-foreground'
        return trend > 0 ? 'text-success' : 'text-destructive'
    }

    return (
        <Card className={cn(
            'hover-glow transition-all duration-300',
            variantStyles[variant],
            className
        )}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">{label}</p>
                        <p className="text-2xl font-bold tracking-tight">{value}</p>

                        {(trend !== undefined || trendLabel) && (
                            <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
                                {getTrendIcon()}
                                <span>
                                    {trend !== undefined && `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`}
                                    {trendLabel && ` ${trendLabel}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {Icon && (
                        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
