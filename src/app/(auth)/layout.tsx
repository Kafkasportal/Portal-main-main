'use client'

import { Suspense } from 'react'
import { PageTransition } from '@/components/layout/page-transition'
import AuthLoading from './loading'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<AuthLoading />}>
        <PageTransition>{children}</PageTransition>
      </Suspense>
    </div>
  )
}
