import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label Component', () => {
  it('should render label with text', () => {
    render(<Label>Test Label</Label>)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render label as child component', () => {
    render(
      <Label htmlFor="test-input">
        Label Text
      </Label>
    )

    const label = screen.getByText('Label Text')
    expect(label).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Label className="custom-class">Label</Label>)

    const label = screen.getByText('Label')
    expect(label).toHaveClass('custom-class')
  })

  it('should be accessible', () => {
    render(
      <Label htmlFor="test-input" required>
        Required Label
      </Label>
    )

    const label = screen.getByText('Required Label')
    expect(label).toBeInTheDocument()
  })

  it('should handle disabled state', () => {
    render(<Label disabled>Disabled Label</Label>)

    const label = screen.getByText('Disabled Label')
    expect(label).toBeInTheDocument()
  })
})
