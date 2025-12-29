import { render, screen } from '@testing-library/react'
import { DonationReceiptDialog } from './donation-receipt-dialog'
import { useDonation } from '@/hooks/use-api'

// Mock the hook
jest.mock('@/hooks/use-api', () => ({
  useDonation: jest.fn(),
}))

describe('DonationReceiptDialog', () => {
  it('renders loading state when fetching donation', () => {
    ;(useDonation as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(
      <DonationReceiptDialog
        open={true}
        onOpenChange={() => {}}
        donationId="123"
      />
    )

    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument()
  })

  it('renders donation details correctly', () => {
    ;(useDonation as jest.Mock).mockReturnValue({
      data: {
        id: 123,
        bagisci: { ad: 'Ahmet', soyad: 'Yılmaz' },
        tutar: 1000,
        currency: 'TRY',
        amac: 'genel',
        odemeYontemi: 'nakit',
        createdAt: new Date('2023-01-01'),
      },
      isLoading: false,
    })

    render(
      <DonationReceiptDialog
        open={true}
        onOpenChange={() => {}}
        donationId="123"
      />
    )

    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(screen.getByText('₺1.000,00')).toBeInTheDocument()
    expect(screen.getByText('No: BAG-000123')).toBeInTheDocument()
  })
})
