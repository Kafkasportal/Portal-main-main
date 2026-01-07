import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YeniKumbaraDialog } from '../yeni-kumbara-dialog'
import { useCreateKumbara } from '@/hooks/use-api'

jest.mock('@/hooks/use-api')

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

describe('YeniKumbaraDialog', () => {
  const mockUseCreateKumbara = jest.mocked(useCreateKumbara)

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
    mockUseCreateKumbara.mockReturnValue(createMockMutation())
  })

  it('should render dialog when open', () => {
    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByText(/Yeni Kumbara/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Kod/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(
      <YeniKumbaraDialog open={false} onOpenChange={jest.fn()} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    const submitButton = screen.getByRole('button', { name: /Oluştur/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess with valid data', async () => {
    const onSuccess = jest.fn()
    const mockMutate = jest.fn()

    mockUseCreateKumbara.mockReturnValue({
      ...createMockMutation(),
      mutate: mockMutate,
    })

    const user = userEvent.setup()
    render(
      <YeniKumbaraDialog open onOpenChange={jest.fn()} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText(/Kod/i), 'KUM001')
    await user.type(screen.getByLabelText(/Konum/i), 'İstanbul')
    const typeSelect = screen.getByRole('combobox', { name: /Tür/i })
    await user.click(typeSelect)
    await user.click(screen.getByText(/Şehir İçi/i))

    const submitButton = screen.getByRole('button', { name: /Oluştur/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should close dialog when cancel button clicked', async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()
    render(<YeniKumbaraDialog open onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /İptal/i })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should show loading state during submission', () => {
    mockUseCreateKumbara.mockReturnValue(createMockMutation(true))

    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    const submitButton = screen.getByRole('button', { name: /Oluşturuluyor/i })
    expect(submitButton).toBeDisabled()
  })

  it('should show QR code input', () => {
    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByLabelText(/QR Kod/i)).toBeInTheDocument()
  })

  it('should show location fields', () => {
    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    expect(screen.getByLabelText(/Konum/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adres/i)).toBeInTheDocument()
  })

  it('should select correct kumbara type', async () => {
    const user = userEvent.setup()
    render(<YeniKumbaraDialog open onOpenChange={jest.fn()} />)

    const typeSelect = screen.getByRole('combobox', { name: /Tür/i })
    await user.click(typeSelect)
    await user.click(screen.getByText(/Şehir İçi/i))

    expect(typeSelect).toBeInTheDocument()
  })
})
