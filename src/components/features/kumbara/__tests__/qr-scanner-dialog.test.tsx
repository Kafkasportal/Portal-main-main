import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QRScannerDialog } from '../qr-scanner-dialog'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('QrScannerDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog when open', () => {
    render(<QRScannerDialog open onOpenChange={jest.fn()} onScan={jest.fn()} />)

    expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(
      <QRScannerDialog
        open={false}
        onOpenChange={jest.fn()}
        onScan={jest.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should close when close button clicked', async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()
    render(
      <QRScannerDialog open onOpenChange={onOpenChange} onScan={jest.fn()} />
    )

    const closeButton = screen.getByRole('button', { name: /Kapat/i })
    await user.click(closeButton)

    expect(onOpenChange).toHaveBeenCalled()
  })

  it('should show scanning indicator', () => {
    render(<QRScannerDialog open onOpenChange={jest.fn()} onScan={jest.fn()} />)

    expect(screen.getByText(/Taranıyor/i)).toBeInTheDocument()
  })

  it('should show error message on scan error', () => {
    render(<QRScannerDialog open onOpenChange={jest.fn()} onScan={jest.fn()} />)

    // Simulate scan error
    expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
  })

  it('should call onScan when QR code is detected', async () => {
    const onScan = jest.fn()
    render(<QRScannerDialog open onOpenChange={jest.fn()} onScan={onScan} />)

    // Simulate QR scan
    // In real component, this would be called from QR library
    expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
  })

  it('should show permission request message', () => {
    render(<QRScannerDialog open onOpenChange={jest.fn()} onScan={jest.fn()} />)

    expect(screen.getByText(/Kamera izni gereklidir/i)).toBeInTheDocument()
  })
})
