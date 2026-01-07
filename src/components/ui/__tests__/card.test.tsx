import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../card'

describe('Card Component', () => {
  it('should render card with content', () => {
    render(
      <Card>
        <p>Card Content</p>
      </Card>
    )

    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('should render card with header', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <Card className="custom-class">
        <p>Card Content</p>
      </Card>
    )

    const card = screen.getByRole('article')
    expect(card).toHaveClass('custom-class')
  })

  it('should be clickable with onClick', () => {
    const handleClick = jest.fn()

    render(
      <Card onClick={handleClick}>
        <p>Card Content</p>
      </Card>
    )
    const { container } = render(<Card><p>Card Content</p></Card>)

    fireEvent.click(container.firstChild as HTMLElement)
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render with hover effect', () => {
    render(
      <Card className="hover:shadow-lg">
        <p>Card Content</p>
      </Card>
    )

    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:shadow-lg')
  })
})
