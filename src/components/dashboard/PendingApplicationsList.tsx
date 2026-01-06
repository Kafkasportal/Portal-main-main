import type { PendingApplication } from '@/types/dashboard'
import { Clock, AlertCircle } from 'lucide-react'

interface PendingApplicationsListProps {
  applications: PendingApplication[]
  onApplicationClick?: (id: string) => void
}

export function PendingApplicationsList({
  applications,
  onApplicationClick,
}: PendingApplicationsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beklemede':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'inceleniyor':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'onaylandı':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'reddedildi':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'acil':
        return 'border-l-4 border-l-red-500'
      case 'yüksek':
        return 'border-l-4 border-l-orange-500'
      case 'orta':
        return 'border-l-4 border-l-yellow-500'
      case 'düşük':
        return 'border-l-4 border-l-blue-500'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const formatAmount = (amount: number, currency: string) => {
    if (amount === 0) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Bekleyen Başvurular
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            İnceleme gereken {applications.length} başvuru
          </p>
        </div>
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Bekleyen başvuru bulunmuyor
            </p>
          </div>
        ) : (
          applications.map((app) => (
            <button
              key={app.id}
              onClick={() => onApplicationClick?.(app.id)}
              className={`group w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all ${getPriorityBorder(
                app.priority
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Applicant Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {app.applicantName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                      {app.applicationType}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {app.note}
                    </p>
                  )}
                </div>

                {/* Right: Amount & Date */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatAmount(app.requestedAmount, app.currency)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(app.applicationDate)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
