import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickRegisterDialog } from '../quick-register-dialog'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('QuickRegisterDialog', () => {
  it('should render dialog trigger button', () => {
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText(/Yeni İhtiyaç Sahibi/i)).toBeInTheDocument()
  })

  it('should show form fields when dialog is open', async () => {
    const user = userEvent.setup()
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByLabelText(/TC Kimlik No/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Soyad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument()
  })

  it('should format phone number correctly', async () => {
    const user = userEvent.setup()
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    const phoneInput = screen.getByLabelText(/Telefon/i)
    await user.type(phoneInput, '05551234567')

    expect(phoneInput).toHaveValue('0555 123 45 67')
  })

  it('should show submit button', async () => {
    const user = userEvent.setup()
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByRole('button', { name: /Kaydet/i })).toBeInTheDocument()
  })

  it('should show cancel button', async () => {
    const user = userEvent.setup()
    render(
      <QuickRegisterDialog>
        <button type="button">Open Dialog</button>
      </QuickRegisterDialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByRole('button', { name: /İptal/i })).toBeInTheDocument()
  })
})
