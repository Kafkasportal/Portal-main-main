import { render, screen } from '@testing-library/react'
import type { Column } from '@tanstack/react-table'
import { DataTableFacetedFilter } from './faceted-filter'

// Mock Column from tanstack/react-table
const mockSetFilterValue = jest.fn()
const mockGetFacetedUniqueValues = jest.fn(() => new Map())
const mockGetFilterValue = jest.fn<string[] | undefined, []>(() => [])

const mockColumn = {
  getFacetedUniqueValues: mockGetFacetedUniqueValues,
  getFilterValue: mockGetFilterValue,
  setFilterValue: mockSetFilterValue,
} as unknown as Column<unknown, unknown>

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
]

describe('DataTableFacetedFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with title', () => {
    render(
      <DataTableFacetedFilter
        column={mockColumn}
        title="Test Filter"
        options={options}
      />
    )

    expect(screen.getByText('Test Filter')).toBeInTheDocument()
  })

  it('shows selected count when items are selected', () => {
    mockGetFilterValue.mockReturnValue(['opt1'])

    render(
      <DataTableFacetedFilter
        column={mockColumn}
        title="Test Filter"
        options={options}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('shows selected count when multiple items are selected', () => {
    mockGetFilterValue.mockReturnValue(['opt1', 'opt2', 'opt3'])

    render(
      <DataTableFacetedFilter
        column={mockColumn}
        title="Test Filter"
        options={options}
      />
    )

    expect(screen.getByText('3 seçildi')).toBeInTheDocument()
  })
})
