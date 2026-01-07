import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemberForm } from '../member-form'
import { useCreateMember } from '@/hooks/use-api'

jest.mock('@/hooks/use-api')
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => (_data: unknown) => _data),
}))

jest.mock('@/lib/constants', () => ({
  MEMBER_TYPE_LABELS: {
    aktif: 'Aktif Üye',
    genc: 'Genç Üye',
    destekci: 'Destekçi',
    onursal: 'Onursal Üye',
  },
  TURKISH_CITIES: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'],
}))

describe('MemberForm', () => {
  const mockUseCreateMember = jest.mocked(useCreateMember)

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
    mockUseCreateMember.mockReturnValue(createMockMutation())
  })

  it('should render all form fields', () => {
    render(<MemberForm />)

    expect(screen.getByText(/TC Kimlik No/i)).toBeInTheDocument()
    expect(screen.getByText(/Ad/i)).toBeInTheDocument()
    expect(screen.getByText(/Soyad/i)).toBeInTheDocument()
    expect(screen.getByText(/Telefon/i)).toBeInTheDocument()
    expect(screen.getByText(/Cinsiyet/i)).toBeInTheDocument()
    expect(screen.getByText(/Üye Türü/i)).toBeInTheDocument()
    expect(screen.getByText(/İl/i)).toBeInTheDocument()
    expect(screen.getByText(/İlçe/i)).toBeInTheDocument()
  })

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<MemberForm />)

    const submitButton = screen.getByRole('button', { name: /Kaydet/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/zorunludur/i)).toBeInTheDocument()
    })
  })

  it('should call onSubmit with valid data', async () => {
    const onSuccess = jest.fn()
    const mockMutate = jest.fn()

    mockUseCreateMember.mockReturnValue({
      ...createMockMutation(),
      mutate: mockMutate,
    })

    const user = userEvent.setup()
    render(<MemberForm onSuccess={onSuccess} />)

    await user.type(screen.getByPlaceholderText('12345678901'), '12345678901')
    await user.type(screen.getByPlaceholderText('Ahmet'), 'Ahmet')
    await user.type(screen.getByPlaceholderText('Yılmaz'), 'Yılmaz')
    await user.type(
      screen.getByPlaceholderText(/0555 123 45 67/i),
      '05551234567'
    )

    const submitButton = screen.getByRole('button', { name: /Kaydet/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  it('should call onSuccess callback when form submitted successfully', async () => {
    const onSuccess = jest.fn()

    mockUseCreateMember.mockReturnValue({
      ...createMockMutation(),
      mutate: jest.fn(
        (_data: unknown, options: { onSuccess?: () => void } | undefined) => {
          options?.onSuccess?.()
        }
      ),
    })

    const user = userEvent.setup()
    render(<MemberForm onSuccess={onSuccess} />)

    await user.type(screen.getByPlaceholderText('12345678901'), '12345678901')
    await user.type(screen.getByPlaceholderText('Ahmet'), 'Ahmet')
    await user.type(screen.getByPlaceholderText('Yılmaz'), 'Yılmaz')
    await user.type(
      screen.getByPlaceholderText(/0555 123 45 67/i),
      '05551234567'
    )

    const submitButton = screen.getByRole('button', { name: /Kaydet/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should call onSuccess when cancel button clicked', async () => {
    const onSuccess = jest.fn()
    const user = userEvent.setup()
    render(<MemberForm onSuccess={onSuccess} />)

    const cancelButton = screen.getByRole('button', { name: /İptal/i })
    await user.click(cancelButton)

    expect(onSuccess).toHaveBeenCalled()
  })

  it('should show loading state during submission', () => {
    mockUseCreateMember.mockReturnValue(createMockMutation(true))

    render(<MemberForm />)

    const submitButton = screen.getByRole('button', { name: /Kaydediliyor/i })
    expect(submitButton).toBeDisabled()
  })

  it('should populate form with initial data', () => {
    const initialData = {
      tcKimlikNo: '12345678901',
      ad: 'Mehmet',
      soyad: 'Demir',
    }

    render(<MemberForm initialData={initialData} />)

    // Check if initial data is rendered using text content instead of getByLabelText
    expect(screen.getByDisplayValue('12345678901')).toBeTruthy()
    expect(screen.getByDisplayValue('Mehmet')).toBeTruthy()
    expect(screen.getByDisplayValue('Demir')).toBeTruthy()
  })
})
