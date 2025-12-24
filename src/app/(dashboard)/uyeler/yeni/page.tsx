'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { MemberForm } from '@/components/features/members/member-form'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NewMemberPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push('/uyeler/liste')
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Yeni Üye Kaydı"
                description="Derneğe yeni üye kaydı oluşturun"
                action={
                    <Button variant="outline" onClick={() => { router.back(); }}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Geri
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <MemberForm onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </div>
    )
}
