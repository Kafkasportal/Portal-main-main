import { render, screen } from '@testing-library/react'
import { DonationTrendsChart } from './donation-trends-chart'
import { fetchDonationTrends } from '@/lib/analytics-service'

// Mock the service
jest.mock('@/lib/analytics-service', () => ({
  fetchDonationTrends: jest.fn(),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(({ queryFn }) => {
    // Execute queryFn to ensure it calls the service
    queryFn()
    return {
      data: [
        { period: '2023-01', total_amount: 1000, count: 5 },
        { period: '2023-02', total_amount: 2000, count: 10 },
      ],
      isLoading: false,
    }
  }),
}))

// Mock Recharts components
jest.mock('@/components/shared/lazy-chart', () => ({
  AreaChart: () => <div data-testid="area-chart">AreaChart</div>,
  Area: () => <div>Area</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div>Tooltip</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
}))

describe('DonationTrendsChart', () => {
  it('renders correctly and fetches data', () => {
    render(<DonationTrendsChart />)

    expect(screen.getByText('Bağış Trendleri')).toBeInTheDocument()
    expect(screen.getByText('Aylık')).toBeInTheDocument() // Default select value
    expect(fetchDonationTrends).toHaveBeenCalledWith('monthly')
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })
})
