'use client'

import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePayment } from '@/hooks/use-api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentId: number
}

export function ReceiptDialog({
  open,
  onOpenChange,
  paymentId,
}: ReceiptDialogProps) {
  const { data: payment, isLoading } = usePayment(paymentId, {
    enabled: open && !!paymentId,
  })

  const handlePrint = () => {
    window.print()
  }

  if (isLoading || !payment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">Yükleniyor...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const makbuzNo = payment.makbuzNo || `MAK-${payment.id.toString().padStart(6, '0')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl print:max-w-full">
        <DialogHeader>
          <DialogTitle>Makbuz</DialogTitle>
          <DialogDescription>
            Ödeme makbuzu - {makbuzNo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Makbuz Header */}
          <div className="border-b pb-4 print:border-b-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold print:text-xl">
                  Ödeme Makbuzu
                </h2>
                <p className="text-muted-foreground text-sm">
                  Makbuz No: {makbuzNo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  Tarih: {formatDate(payment.odemeTarihi, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Beneficiary Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">İhtiyaç Sahibi</h3>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium">
                {payment.beneficiary
                  ? `${payment.beneficiary.ad} ${payment.beneficiary.soyad}`
                  : 'Bilinmiyor'}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Ödeme Detayları</h3>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutar:</span>
                <span className="font-mono font-semibold text-lg">
                  {formatCurrency(payment.tutar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme Yöntemi:</span>
                <span className="capitalize">
                  {payment.odemeYontemi === 'nakit'
                    ? 'Nakit'
                    : payment.odemeYontemi === 'havale'
                      ? 'Havale'
                      : 'Elden'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme Tarihi:</span>
                <span>{formatDate(payment.odemeTarihi, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum:</span>
                <span className="capitalize">
                  {payment.durum === 'odendi'
                    ? 'Ödendi'
                    : payment.durum === 'beklemede'
                      ? 'Beklemede'
                      : 'İptal'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {payment.notlar && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notlar</h3>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">{payment.notlar}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-center text-sm text-muted-foreground print:border-t-2">
            <p>Bu makbuz elektronik ortamda oluşturulmuştur.</p>
            <p className="mt-1">
              Oluşturulma Tarihi:{' '}
              {formatDate(payment.createdAt, 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

