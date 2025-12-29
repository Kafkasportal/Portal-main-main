'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageTransition } from '@/components/layout/page-transition'
import { ComponentErrorBoundary } from '@/components/shared/error-boundary'
import DashboardLoading from './loading'

// Lazy load ProgressBar - sadece client'ta gerekli
const ProgressBar = dynamic(
  () =>
    import('@/components/layout/progress-bar').then((mod) => ({
      default: mod.ProgressBar,
    })),
  { ssr: false }
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ProgressBar />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Breadcrumbs />
            <div className="min-h-[calc(100vh-12rem)]">
              <ComponentErrorBoundary>
                <Suspense fallback={<DashboardLoading />}>
                  <PageTransition>{children}</PageTransition>
                </Suspense>
              </ComponentErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
