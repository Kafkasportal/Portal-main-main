import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationForm } from '../donation-form'

jest.mock('@hookform/resolvers/zod', () => ({
    zodResolver: jest.fn((schema) => (data: any) => data),
}))

jest.mock('@/hooks/use-api', () => ({
    useCreateDonation: () => ({
        mutate: jest.fn(),
        isPending: false,
    }),
}))

jest.mock('@/lib/constants', () => ({
    DONATION_PURPOSE_LABELS: {
        genel: 'Genel Yardım',
        eğitim: 'Eğitim Desteği',
        sağlık: 'Sağlık Desteği',
        gıda: 'Gıda Yardımı',
    },
    PAYMENT_METHOD_LABELS: {
        nakit: 'Nakit',
        havale: 'Havale/EFT',
        'kredi-karti': 'Kredi Kartı',
        'mobil-odeme': 'Mobil Ödeme',
        kumbara: 'Kumbara',
    },
}))

describe('DonationForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render all form fields', () => {
        render(<DonationForm />)

        expect(screen.getByText(/Ad \*/i)).toBeInTheDocument()
        expect(screen.getByText(/Soyad \*/i)).toBeInTheDocument()
        expect(screen.getByText(/Telefon/i)).toBeInTheDocument()
        expect(screen.getByText(/E-posta/i)).toBeInTheDocument()
        expect(screen.getByText(/Tutar \*/i)).toBeInTheDocument()
        expect(screen.getByText(/Para Birimi/i)).toBeInTheDocument()
        expect(screen.getByText(/Ödeme Yöntemi/i)).toBeInTheDocument()
        expect(screen.getByText(/Bağış Amacı/i)).toBeInTheDocument()
    })

    it('should show validation errors for required fields', async () => {
        const user = userEvent.setup()
        render(<DonationForm />)

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
        })
    })

    it('should call onSubmit with valid data', async () => {
        const onSuccess = jest.fn()
        const { useCreateDonation } = require('@/hooks/use-api')
        const mockMutate = jest.fn()

        const originalUseCreateDonation = require('@/hooks/use-api').useCreateDonation
        require('@/hooks/use-api').useCreateDonation = jest.fn(() => ({
            mutate: mockMutate,
            isPending: false,
        }))

        const user = userEvent.setup()
        render(<DonationForm onSuccess={onSuccess} />)

        await user.type(screen.getByPlaceholderText('Ahmet'), 'Ahmet')
        await user.type(screen.getByPlaceholderText('Yılmaz'), 'Yılmaz')
        await user.type(screen.getByPlaceholderText('0.00'), '1000')

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
        })
    })

    it('should call onSuccess callback when form submitted successfully', async () => {
        const onSuccess = jest.fn()
        const { useCreateDonation } = require('@/hooks/use-api')

        const originalUseCreateDonation = require('@/hooks/use-api').useCreateDonation
        require('@/hooks/use-api').useCreateDonation = jest.fn(() => ({
            mutate: jest.fn((data, { onSuccess: mutationSuccess }) => {
                mutationSuccess?.()
            }),
            isPending: false,
        }))

        const user = userEvent.setup()
        render(<DonationForm onSuccess={onSuccess} />)

        await user.type(screen.getByPlaceholderText('Ahmet'), 'Ahmet')
        await user.type(screen.getByPlaceholderText('Yılmaz'), 'Yılmaz')
        await user.type(screen.getByPlaceholderText('0.00'), '1000')

        const submitButton = screen.getByRole('button', { name: /Kaydet/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled()
        })
    })

    it('should call onSuccess when cancel button clicked', async () => {
        const onSuccess = jest.fn()
        const user = userEvent.setup()
        render(<DonationForm onSuccess={onSuccess} />)

        const cancelButton = screen.getByRole('button', { name: /İptal/i })
        await user.click(cancelButton)

        expect(onSuccess).toHaveBeenCalled()
    })

    it('should show loading state during submission', () => {
        const { useCreateDonation } = require('@/hooks/use-api')

        const originalUseCreateDonation = require('@/hooks/use-api').useCreateDonation
        require('@/hooks/use-api').useCreateDonation = jest.fn(() => ({
            mutate: jest.fn(),
            isPending: true,
        }))

        render(<DonationForm />)

        const submitButton = screen.getByRole('button', { name: /Kaydediliyor/i })
        expect(submitButton).toBeDisabled()
    })

    it('should handle amount input correctly', async () => {
        const user = userEvent.setup()
        render(<DonationForm />)

        // Find all inputs and look for one with type="number" or containing 'tutar' in name/placeholder
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
        const amountInput = inputs.find(input => 
          input.type === 'number' || 
          input.placeholder?.toLowerCase().includes('tutar') ||
          input.name?.toLowerCase().includes('tutar')
        )

        expect(amountInput).toBeDefined()

        if (amountInput) {
            await user.type(amountInput, '1000.50')
            expect(amountInput.value).toBe('1000.50')
        }
    })

    it('should show payment method options', () => {
        render(<DonationForm />)

        const paymentMethodLabel = screen.getByText(/Ödeme Yöntemi/i)
        expect(paymentMethodLabel).toBeInTheDocument()
    })

    it('should show donation purpose options', () => {
        render(<DonationForm />)

        const purposeLabel = screen.getByText(/Bağış Amacı/i)
        expect(purposeLabel).toBeInTheDocument()
    })
})
