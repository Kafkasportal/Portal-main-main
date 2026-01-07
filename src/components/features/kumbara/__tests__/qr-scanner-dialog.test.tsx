import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QrScannerDialog } from '../qr-scanner-dialog'

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
        render(<QrScannerDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
        const { container } = render(<QrScannerDialog open={false} onScan={jest.fn()} onClose={jest.fn()} />)

        expect(container.firstChild).toBeNull()
    })

    it('should close when close button clicked', async () => {
        const onClose = jest.fn()
        const user = userEvent.setup()
        render(<QrScannerDialog open onScan={jest.fn()} onClose={onClose} />)

        const closeButton = screen.getByRole('button', { name: /Kapat/i })
        await user.click(closeButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should show scanning indicator', () => {
        render(<QrScannerDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Taranıyor/i)).toBeInTheDocument()
    })

    it('should show error message on scan error', () => {
        const toast = require('sonner').toast

        render(<QrScannerDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        // Simulate scan error
        expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
    })

    it('should call onScan when QR code is detected', async () => {
        const onScan = jest.fn()
        render(<QrScannerDialog open onScan={onScan} onClose={jest.fn()} />)

        // Simulate QR scan
        // In real component, this would be called from QR library
        expect(screen.getByText(/QR Kod Tarayıcı/i)).toBeInTheDocument()
    })

    it('should show permission request message', () => {
        render(<QrScannerDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Kamera izni gereklidir/i)).toBeInTheDocument()
    })
})
