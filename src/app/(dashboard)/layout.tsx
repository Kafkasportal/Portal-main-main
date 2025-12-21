'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import DashboardLoading from './loading'

// Lazy load ProgressBar - sadece client'ta gerekli
const ProgressBar = dynamic(
    () => import('@/components/layout/progress-bar').then(mod => ({ default: mod.ProgressBar })),
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
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <Breadcrumbs />
                        <Suspense fallback={<DashboardLoading />}>
                            {children}
                        </Suspense>
                    </main>
                </div>
            </div>
        </>
    )
}
