'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import React, { useState } from 'react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  showDetails?: boolean
  details?: string
}

interface ToastContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id'>) => void
  hideNotification: (id: string) => void
  hideAllNotifications: () => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    iconBg: 'bg-green-100 dark:bg-green-900',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  error: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 dark:bg-destructive/20',
    iconBg: 'bg-destructive/20 dark:bg-destructive/30',
    borderColor: 'border-destructive/20 dark:border-destructive/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID()
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    if (notification.duration !== 0) {
      setTimeout(() => {
        hideNotification(id)
      }, notification.duration || 5000)
    }
  }

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const hideAllNotifications = () => {
    setNotifications([])
  }

  return (
    <ToastContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        hideAllNotifications,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { notifications, hideNotification } = useToast()

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-80"
          >
            <Toast
              notification={notification}
              onClose={() => hideNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const config = notificationConfig[notification.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 shadow-lg',
        config.bgColor,
        config.borderColor
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
            config.iconBg
          )}
        >
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>

        <div className="flex-1 space-y-1">
          <p className={cn('text-sm font-semibold', config.color)}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-muted-foreground text-sm">
              {notification.message}
            </p>
          )}

          {notification.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={notification.action.onClick}
              className="mt-2 h-7 text-xs"
            >
              {notification.action.label}
            </Button>
          )}

          {notification.showDetails && notification.details && (
            <details className="mt-2">
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer list-none text-xs">
                Detaylar göster
              </summary>
              <pre className="bg-muted mt-2 max-h-32 overflow-auto rounded p-2 font-mono text-xs">
                {notification.details}
              </pre>
            </details>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-6 w-6 shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
