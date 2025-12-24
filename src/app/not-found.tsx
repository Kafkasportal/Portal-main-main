import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="space-y-6 text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="text-muted/30 text-9xl leading-none font-bold">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full">
              <span className="text-5xl">🔍</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Sayfa Bulunamadı</h2>
          <p className="text-muted-foreground mx-auto max-w-md">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Link>
          </Button>
          <Button asChild>
            <Link href="/genel">
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Git
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
