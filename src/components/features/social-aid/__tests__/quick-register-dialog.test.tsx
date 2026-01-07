import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickRegisterDialog } from '../quick-register-dialog'

jest.mock('@/hooks/use-api', () => ({
    useQuickRegister: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
}))

jest.mock('@/lib/validators', () => ({
    memberSchema: {
        parse: jest.fn((data) => data),
        safeParse: jest.fn(() => ({ success: true, data: {} })),
    },
}))

describe('QuickRegisterDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render dialog when open', () => {
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/Hızlı Kayıt/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/TC Kimlik No/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
        const { container } = render(<QuickRegisterDialog open={false} onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(container.firstChild).toBeNull()
    })

    it('should show validation errors for required fields', async () => {
        const user = userEvent.setup()
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
        })
    })

    it('should call onSuccess with valid data', async () => {
        const onSuccess = jest.fn()
        const { useQuickRegister } = require('@/hooks/use-api')
        const mockMutate = jest.fn()

        jest.mocked(useQuickRegister).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        })

        const user = userEvent.setup()
        render(<QuickRegisterDialog open onSuccess={onSuccess} onClose={jest.fn()} />)

        await user.type(screen.getByLabelText(/TC Kimlik No/i), '12345678901')
        await user.type(screen.getByLabelText(/Ad/i), 'Ahmet')
        await user.type(screen.getByLabelText(/Soyad/i), 'Yılmaz')
        await user.type(screen.getByLabelText(/Telefon/i), '05551234567')

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
            expect(onSuccess).toHaveBeenCalled()
        })
    })

    it('should close dialog when cancel button clicked', async () => {
        const onClose = jest.fn()
        const user = userEvent.setup()
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={onClose} />)

        const cancelButton = screen.getByRole('button', { name: /İptal/i })
        await user.click(cancelButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should show loading state during submission', () => {
        const { useQuickRegister } = require('@/hooks/use-api')

        jest.mocked(useQuickRegister).mockReturnValue({
            mutate: jest.fn(),
            isPending: true,
        })

        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const submitButton = screen.getByRole('button', { name: /Kaydediliyor/i })
        expect(submitButton).toBeDisabled()
    })

    it('should format phone number correctly', async () => {
        const user = userEvent.setup()
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        const phoneInput = screen.getByLabelText(/Telefon/i)
        await user.type(phoneInput, '05551234567')

        expect(phoneInput).toHaveValue('0555 123 45 67')
    })

    it('should show beneficiary details section', () => {
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        expect(screen.getByText(/İhtiya Sahibi Bilgileri/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adres/i)).toBeInTheDocument()
    })

    it('should verify TC kimlik format', async () => {
        const user = userEvent.setup()
        render(<QuickRegisterDialog open onSuccess={jest.fn()} onClose={jest.fn()} />)

        await user.type(screen.getByLabelText(/TC Kimlik No/i), '123')

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/11 haneli/i)).toBeInTheDocument()
        })
    })
})
