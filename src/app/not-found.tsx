import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center space-y-6">
                {/* 404 Illustration */}
                <div className="relative">
                    <h1 className="text-[150px] font-bold text-muted/30 leading-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-5xl">🔍</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Sayfa Bulunamadı</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
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
