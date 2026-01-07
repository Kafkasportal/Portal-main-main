import { Suspense } from 'react'
import AuthLoading from './loading'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-slate-50">
        {/* Gradient Blobs */}
        <div className="bg-primary/20 animate-blob absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full blur-[100px]" />
        <div className="animate-blob animation-delay-2000 absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-teal-300/30 blur-[100px]" />
        <div className="animate-blob animation-delay-4000 absolute bottom-[-20%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-100/60 blur-[120px]" />

        {/* Mesh Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
      </div>
      <Suspense fallback={<AuthLoading />}>{children}</Suspense>
    </div>
  )
}
