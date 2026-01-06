import type { QuickAction } from '@/types/dashboard'
import { Heart, UserPlus, FileText, BarChart3, LucideIcon } from 'lucide-react'

interface QuickActionsProps {
  actions: QuickAction[]
  onActionClick?: (actionId: string) => void
}

export function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  // Map icon names to components
  const getIcon = (iconName: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      Heart,
      UserPlus,
      FileText,
      BarChart3,
    }
    return icons[iconName] || FileText
  }

  const colors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-purple-500 to-purple-600',
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Hızlı Erişim
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Sık kullanılan işlemler
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = getIcon(action.icon)
          const colorClass = colors[index % colors.length]

          return (
            <button
              key={action.id}
              onClick={() => onActionClick?.(action.id)}
              className="group relative overflow-hidden rounded-lg p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-90 group-hover:opacity-100 transition-opacity`}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                      {action.label}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </button>
          )
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>İpucu:</strong> Herhangi bir sayfadan hızlı arama için{' '}
          <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono">
            Ctrl+K
          </kbd>{' '}
          tuşlarına basın
        </p>
      </div>
    </div>
  )
}
