import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewBeneficiaryDialog } from '../new-beneficiary-dialog'

jest.mock('@/hooks/use-api', () => ({
    useCreateBeneficiary: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
}))

jest.mock('@/lib/validators', () => ({
    basicBeneficiarySchema: {
        parse: jest.fn((data) => data),
        safeParse: jest.fn(() => ({ success: true, data: {} })),
    },
}))

jest.mock('@/lib/constants', () => ({
    IHTIYAC_DURUMU_LABELS: {
        aktif: 'Aktif',
        pasif: 'Pasif',
        askida: 'Askıda',
        tamamlandi: 'Tamamlandı',
    },
}))

describe('NewBeneficiaryDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render dialog when open', () => {
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Yeni İhtiya Sahibi/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Ad/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
        const { container } = render(<NewBeneficiaryDialog open={false} onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(container.firstChild).toBeNull()
    })

    it('should show validation errors for required fields', async () => {
        const user = userEvent.setup()
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Oluştur/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
        })
    })

    it('should call onSuccess with valid data', async () => {
        const onSuccess = jest.fn()
        const { useCreateBeneficiary } = require('@/hooks/use-api')
        const mockMutate = jest.fn()

        jest.mocked(useCreateBeneficiary).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        })

        const user = userEvent.setup()
        render(<NewBeneficiaryDialog open onSuccess={onSuccess} onClose={jest.fn()} />)

        await user.type(screen.getByLabelText(/Ad/i), 'Fatma')
        await user.type(screen.getByLabelText(/Soyad/i), 'Demir')
        await user.type(screen.getByLabelText(/Telefon/i), '05559876543')

        const submitButton = screen.getByRole('button', { name: /Oluştur/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
            expect(onSuccess).toHaveBeenCalled()
        })
    })

    it('should close dialog when cancel button clicked', async () => {
        const onClose = jest.fn()
        const user = userEvent.setup()
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={onClose} />)

        const cancelButton = screen.getByRole('button', { name: /İptal/i })
        await user.click(cancelButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should show loading state during submission', () => {
        const { useCreateBeneficiary } = require('@/hooks/use-api')

        jest.mocked(useCreateBeneficiary).mockReturnValue({
            mutate: jest.fn(),
            isPending: true,
        })

        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Oluşturuluyor/i })
        expect(submitButton).toBeDisabled()
    })

    it('should select beneficiary status', async () => {
        const user = userEvent.setup()
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const statusSelect = screen.getByRole('combobox', { name: /Durum/i })
        await user.click(statusSelect)
        await user.click(screen.getByText(/Aktif/i))

        expect(statusSelect).toBeInTheDocument()
    })

    it('should show address fields', () => {
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adres/i)).toBeInTheDocument()
    })

    it('should verify phone format', async () => {
        const user = userEvent.setup()
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        await user.type(screen.getByLabelText(/Telefon/i), '05551234567')

        const phoneInput = screen.getByLabelText(/Telefon/i) as HTMLInputElement
        expect(phoneInput).toHaveValue('0555 123 45 67')
    })

    it('should show category selection', () => {
        render(<NewBeneficiaryDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Kategori/i)).toBeInTheDocument()
    })
})
