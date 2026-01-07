import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewKumbaraDialog } from '../yeni-kumbara-dialog'

jest.mock('@/hooks/use-api', () => ({
    useCreateKumbara: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
}))

jest.mock('@/lib/constants', () => ({
    KUMBARA_TURU_LABELS: {
        sehirk: 'Şehir İçi',
        cami: 'Cami',
        okul: 'Okul',
        diger: 'Diğer',
    },
}))

jest.mock('@/lib/validators', () => ({
    kumbaraSchema: {
        parse: jest.fn((data) => data),
        safeParse: jest.fn(() => ({ success: true, data: {} })),
    },
}))

describe('NewKumbaraDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render dialog when open', () => {
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Yeni Kumbara/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Kod/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
        const { container } = render(<NewKumbaraDialog open={false} onScan={jest.fn()} onClose={jest.fn()} />)

        expect(container.firstChild).toBeNull()
    })

    it('should show validation errors for required fields', async () => {
        const user = userEvent.setup()
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Oluştur/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
        })
    })

    it('should call onScan with valid data', async () => {
        const onScan = jest.fn()
        const { useCreateKumbara } = require('@/hooks/use-api')
        const mockMutate = jest.fn()

        jest.mocked(useCreateKumbara).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        })

        const user = userEvent.setup()
        render(<NewKumbaraDialog open onScan={onScan} onClose={jest.fn()} />)

        await user.type(screen.getByLabelText(/Kod/i), 'KUM001')
        await user.type(screen.getByLabelText(/Konum/i), 'İstanbul')
        await user.select(screen.getByLabelText(/Tür/i), 'sehirk')

        const submitButton = screen.getByRole('button', { name: /Oluştur/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
        })
    })

    it('should close dialog when cancel button clicked', async () => {
        const onClose = jest.fn()
        const user = userEvent.setup()
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={onClose} />)

        const cancelButton = screen.getByRole('button', { name: /İptal/i })
        await user.click(cancelButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should show loading state during submission', () => {
        const { useCreateKumbara } = require('@/hooks/use-api')

        jest.mocked(useCreateKumbara).mockReturnValue({
            mutate: jest.fn(),
            isPending: true,
        })

        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Oluşturuluyor/i })
        expect(submitButton).toBeDisabled()
    })

    it('should show QR code input', () => {
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByLabelText(/QR Kod/i)).toBeInTheDocument()
    })

    it('should show location fields', () => {
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByLabelText(/Konum/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adres/i)).toBeInTheDocument()
    })

    it('should select correct kumbara type', async () => {
        const user = userEvent.setup()
        render(<NewKumbaraDialog open onScan={jest.fn()} onClose={jest.fn()} />)

        const typeSelect = screen.getByRole('combobox', { name: /Tür/i })
        await user.click(typeSelect)
        await user.click(screen.getByText(/Şehir İçi/i))

        expect(typeSelect).toBeInTheDocument()
    })
})
