import { useEffect, useState } from 'react'
import type { Stat } from '@/types/dashboard'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface StatCardProps {
  stat: Stat
  icon: LucideIcon
  onClick?: () => void
}

export function StatCard({ stat, icon: Icon, onClick }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Counter animation effect
  useEffect(() => {
    setIsAnimating(true)
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = stat.value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment

      if (step >= steps) {
        setDisplayValue(stat.value)
        setIsAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [stat.value])

  const getTrendIcon = () => {
    if (stat.trend === 'up') return TrendingUp
    if (stat.trend === 'down') return TrendingDown
    return Minus
  }

  const TrendIcon = getTrendIcon()

  const getTrendColor = () => {
    if (stat.trend === 'up') return 'text-green-600 dark:text-green-400'
    if (stat.trend === 'down') return 'text-red-600 dark:text-red-400'
    return 'text-slate-500 dark:text-slate-400'
  }

  const formatValue = (value: number) => {
    if (stat.currency) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: stat.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }
    return new Intl.NumberFormat('tr-TR').format(value)
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
    >
      {/* Icon */}
      <div className="absolute top-6 right-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Label */}
      <div className="mb-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {stat.label}
        </p>
      </div>

      {/* Value with counter animation */}
      <div className="mb-2">
        <p
          className={`text-3xl font-bold text-slate-900 dark:text-white ${
            isAnimating ? 'animate-pulse' : ''
          }`}
        >
          {formatValue(displayValue)}
        </p>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {stat.change > 0 ? '+' : ''}
            {stat.change}%
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {stat.description}
        </span>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
    </button>
  )
}
