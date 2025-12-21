'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface QueryErrorProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function QueryError({ 
    title = 'Veri Yüklenemedi', 
    message = 'Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
    onRetry 
}: QueryErrorProps) {
    return (
        <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{message}</span>
                {onRetry && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onRetry}
                        className="ml-4 shrink-0"
                    >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Tekrar Dene
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    )
}
