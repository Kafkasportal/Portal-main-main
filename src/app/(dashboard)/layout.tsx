import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ProgressBar } from '@/components/layout/progress-bar'

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
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}
