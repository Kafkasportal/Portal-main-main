import { render, screen } from '@testing-library/react'
import { TopDonorsList } from './top-donors-list'
import { fetchTopDonors } from '@/lib/analytics-service'

jest.mock('@/lib/analytics-service', () => ({
  fetchTopDonors: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(({ queryFn }) => {
    queryFn()
    return {
      data: [
        {
          donor_name: 'Ahmet Yılmaz',
          total_amount: 5000,
          donation_count: 3,
          last_donation_date: '2023-12-01',
        },
      ],
      isLoading: false,
    }
  }),
}))

describe('TopDonorsList', () => {
  it('renders correctly and fetches data', () => {
    render(<TopDonorsList />)

    expect(screen.getByText('En Çok Bağış Yapanlar')).toBeInTheDocument()
    expect(fetchTopDonors).toHaveBeenCalledWith(5)
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(screen.getByText('3 Bağış')).toBeInTheDocument()
  })
})
