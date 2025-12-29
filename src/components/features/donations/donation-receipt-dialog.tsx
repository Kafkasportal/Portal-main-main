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
import { useDonation } from '@/hooks/use-api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DONATION_PURPOSE_LABELS } from '@/lib/constants'

interface DonationReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  donationId: string | number
}

export function DonationReceiptDialog({
  open,
  onOpenChange,
  donationId,
}: DonationReceiptDialogProps) {
  const { data: donation, isLoading } = useDonation(donationId.toString(), {
    enabled: open && !!donationId,
  })

  const handlePrint = () => {
    window.print()
  }

  if (isLoading || !donation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">Yükleniyor...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const makbuzNo =
    donation.makbuzNo || `BAG-${donation.id.toString().padStart(6, '0')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl print:max-w-full print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Bağış Makbuzu</DialogTitle>
          <DialogDescription>Bağış makbuzu - {makbuzNo}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Makbuz Header */}
          <div className="border-primary flex items-center justify-between border-b-2 pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-lg">
                <span className="text-primary text-2xl font-bold">KD</span>
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase">
                  Kafkasder Yönetim Paneli
                </h2>
                <p className="text-muted-foreground text-xs">
                  Bağış ve Yardımlaşma Platformu
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-primary text-2xl font-bold">BAĞIŞ MAKBUZU</h2>
              <p className="font-mono text-sm">No: {makbuzNo}</p>
            </div>
          </div>

          {/* Donor & Date Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Bağışçı
              </span>
              <p className="border-muted border-b pb-1 text-lg font-bold">
                {donation.bagisci.ad} {donation.bagisci.soyad}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Bağış Tarihi
              </span>
              <p className="border-muted border-b pb-1 text-lg font-bold">
                {formatDate(donation.createdAt, 'dd/MM/yyyy')}
              </p>
            </div>
          </div>

          {/* Donation Details */}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-medium">
                  Bağış Amacı:
                </span>
                <span className="font-bold">
                  {DONATION_PURPOSE_LABELS[donation.amac] || donation.amac}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground font-medium">
                  Ödeme Yöntemi:
                </span>
                <span className="font-bold capitalize">
                  {donation.odemeYontemi.replace('-', ' ')}
                </span>
              </div>
              <div className="bg-primary/5 flex items-center justify-between rounded-lg p-4">
                <span className="text-primary text-xl font-bold">
                  TOPLAM TUTAR
                </span>
                <span className="text-primary font-mono text-3xl font-black">
                  {formatCurrency(donation.tutar)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {donation.aciklama && (
            <div className="bg-muted/30 space-y-1 rounded-lg p-4 text-sm italic">
              <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase not-italic">
                Açıklama
              </span>
              &ldquo;{donation.aciklama}&rdquo;
            </div>
          )}

          {/* Signature Area */}
          <div className="grid grid-cols-2 gap-12 pt-8">
            <div className="space-y-12 text-center">
              <p className="text-muted-foreground text-xs font-bold uppercase">
                Teslim Eden
              </p>
              <div className="border-muted border-t pt-2 text-sm italic">
                İmza
              </div>
            </div>
            <div className="space-y-12 text-center">
              <p className="text-muted-foreground text-xs font-bold uppercase">
                Teslim Alan (Dernek Yetkilisi)
              </p>
              <div className="border-muted border-t pt-2 text-sm italic">
                İmza / Mühür
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-muted-foreground border-t pt-4 text-center text-[10px]">
            <p>
              Bu belge derneğimiz tarafından elektronik ortamda tanzim
              edilmiştir.
            </p>
            <p className="mt-1">
              Referans ID: {donation.id} | Yazdırılma:{' '}
              {formatDate(new Date(), 'dd/MM/yyyy HH:mm')}
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
