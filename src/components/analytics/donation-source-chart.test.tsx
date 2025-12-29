import { render, screen } from '@testing-library/react'
import { DonationSourceChart } from './donation-source-chart'
import { fetchDonationSourceDistribution } from '@/lib/analytics-service'

jest.mock('@/lib/analytics-service', () => ({
  fetchDonationSourceDistribution: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(({ queryFn }) => {
    queryFn()
    return {
      data: [
        { source: 'Nakit', total_amount: 1000, count: 5 },
        { source: 'Havale', total_amount: 2000, count: 10 },
      ],
      isLoading: false,
    }
  }),
}))

jest.mock('@/components/shared/lazy-chart', () => ({
  PieChart: () => <div data-testid="pie-chart">PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div>Tooltip</div>,
}))

describe('DonationSourceChart', () => {
  it('renders correctly and fetches data', () => {
    render(<DonationSourceChart />)

    expect(screen.getByText('Kaynak Dağılımı')).toBeInTheDocument()
    expect(fetchDonationSourceDistribution).toHaveBeenCalled()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    // Check if legend items are rendered
    expect(screen.getByText('Nakit')).toBeInTheDocument()
    expect(screen.getByText('Havale')).toBeInTheDocument()
  })
})
