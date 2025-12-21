import { Suspense } from 'react'
import AuthLoading from './loading'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Suspense fallback={<AuthLoading />}>
                {children}
            </Suspense>
        </div>
    )
}
