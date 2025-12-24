'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Construction } from 'lucide-react'

interface ConstructionPageProps {
  title: string
  description?: string
}

export function ConstructionPage({
  title,
  description,
}: ConstructionPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="bg-muted/10 animate-in fade-in-50 flex min-h-100 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
        <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Construction className="text-primary h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Yapım Aşamasında</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Bu sayfa henüz geliştirme aşamasındadır. Yakında kullanıma
          açılacaktır.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            window.history.back()
          }}
        >
          Geri Dön
        </Button>
      </div>
    </div>
  )
}
