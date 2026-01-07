import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewBeneficiaryDialog } from '../new-beneficiary-dialog'
import { useCreateBeneficiary } from '@/hooks/use-api'

jest.mock('@/hooks/use-api')

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
  const mockUseCreateBeneficiary = jest.mocked(useCreateBeneficiary)

  const createMockMutation = (isPending: boolean = false) =>
    ({
      mutate: jest.fn(),
      isPending,
      data: undefined,
      error: null,
      isError: false,
      isSuccess: false,
      status: isPending ? 'pending' : 'idle',
      isIdle: !isPending,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      reset: jest.fn(),
      isPaused: false,
      submittedAt: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCreateBeneficiary.mockReturnValue(createMockMutation())
  })

  it('should render dialog when open', () => {
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByText(/Yeni İhtiya Sahibi/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ad/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(
      <NewBeneficiaryDialog open={false} onOpenChange={jest.fn()} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    const submitButton = screen.getByRole('button', { name: /Oluştur/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
    })
  })

  it('should call onOpenChange with false when cancel button clicked', async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()
    render(<NewBeneficiaryDialog open onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /İptal/i })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should show loading state during submission', () => {
    mockUseCreateBeneficiary.mockReturnValue(createMockMutation(true))

    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    const submitButton = screen.getByRole('button', { name: /Oluşturuluyor/i })
    expect(submitButton).toBeDisabled()
  })

  it('should select beneficiary status', async () => {
    const user = userEvent.setup()
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    const statusSelect = screen.getByRole('combobox', { name: /Durum/i })
    await user.click(statusSelect)
    await user.click(screen.getByText(/Aktif/i))

    expect(statusSelect).toBeInTheDocument()
  })

  it('should show address fields', () => {
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adres/i)).toBeInTheDocument()
  })

  it('should verify phone format', async () => {
    const user = userEvent.setup()
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    await user.type(screen.getByLabelText(/Telefon/i), '05551234567')

    const phoneInput = screen.getByLabelText(/Telefon/i) as HTMLInputElement
    expect(phoneInput).toHaveValue('0555 123 45 67')
  })

  it('should show category selection', () => {
    render(<NewBeneficiaryDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByText(/Kategori/i)).toBeInTheDocument()
  })
})
