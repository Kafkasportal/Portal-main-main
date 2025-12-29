import { render, screen } from '@testing-library/react'
import { StatCard } from './stat-card'
import { Users } from 'lucide-react'

describe('StatCard', () => {
  it('renders basic information correctly', () => {
    render(
      <StatCard
        label="Total Members"
        value="1,234"
        icon={Users}
      />
    )

    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('renders trend with default percentage unit', () => {
    render(
      <StatCard
        label="Growth"
        value="500"
        trend={12.5}
      />
    )

    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('renders trend with custom trendUnit', () => {
    render(
      <StatCard
        label="New Members"
        value="100"
        trend={5}
        trendUnit=" yeni"
      />
    )

    expect(screen.getByText('+5.0 yeni')).toBeInTheDocument()
  })

  it('renders trendLabel when provided', () => {
    render(
      <StatCard
        label="Stats"
        value="10"
        trend={2}
        trendLabel="test label"
      />
    )

    expect(screen.getByText(/test label/)).toBeInTheDocument()
  })
})
