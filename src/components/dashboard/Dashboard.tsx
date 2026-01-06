import { useCallback } from 'react'
import type { DashboardProps } from '@/types/dashboard'
import { StatCard } from './StatCard'
import { FinancialChart } from './FinancialChart'
import { PendingApplicationsList } from './PendingApplicationsList'
import { QuickActions } from './QuickActions'
import { Users, Heart, FileText } from 'lucide-react'

// Static icon map - defined outside component to avoid recreating on every render
const STAT_ICON_MAP: Record<string, typeof Users> = {
  'total-members': Users,
  'monthly-donations': Heart,
  'active-applications': FileText,
}

/**
 * Dashboard - Main overview screen showing key metrics, trends, and pending items
 *
 * Design Tokens:
 * - Primary: blue (trust, professionalism)
 * - Neutral: slate (clean, modern)
 * - Typography: DM Sans (readable, professional)
 */
export function Dashboard({
  stats,
  financialTrend,
  pendingApplications,
  quickActions,
  onStatClick,
  onApplicationClick,
  onQuickActionClick,
  onCommandPaletteOpen,
}: DashboardProps) {
  // Memoized icon lookup using static map
  const getStatIcon = useCallback((statId: string) => {
    return STAT_ICON_MAP[statId] || Users
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                KafkasDer Yönetim Paneli&apos;ne hoş geldiniz
              </p>
            </div>
            <button
              onClick={onCommandPaletteOpen}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                K
              </kbd>
              <span className="ml-2">Hızlı Arama</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Staggered fade-in animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              style={{
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <StatCard
                stat={stat}
                icon={getStatIcon(stat.id)}
                onClick={() => onStatClick?.(stat.id)}
              />
            </div>
          ))}
        </div>

        {/* Financial Chart */}
        <div
          style={{
            animation: 'fadeInUp 0.6s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          }}
          className="mb-8"
        >
          <FinancialChart data={financialTrend} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Applications - Takes 2 columns */}
          <div
            style={{
              animation: 'fadeInUp 0.6s ease-out forwards',
              animationDelay: '0.4s',
              opacity: 0,
            }}
            className="lg:col-span-2"
          >
            <PendingApplicationsList
              applications={pendingApplications}
              onApplicationClick={onApplicationClick}
            />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div
            style={{
              animation: 'fadeInUp 0.6s ease-out forwards',
              animationDelay: '0.5s',
              opacity: 0,
            }}
          >
            <QuickActions
              actions={quickActions}
              onActionClick={onQuickActionClick}
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
