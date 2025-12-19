'use client'

import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

interface ConstructionPageProps {
    title: string
    description?: string
}

export function ConstructionPage({ title, description }: ConstructionPageProps) {
    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                description={description}
            />

            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/10 p-8 text-center animate-in fade-in-50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Construction className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Yapım Aşamasında</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    Bu sayfa henüz geliştirme aşamasındadır. Yakında kullanıma açılacaktır.
                </p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Geri Dön
                </Button>
            </div>
        </div>
    )
}
