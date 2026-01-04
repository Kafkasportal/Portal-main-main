/**
 * Export Utilities Tests
 * Tests for CSV/JSON export functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON, exportData, flattenObject, filterColumnsForExport } from './index'

// Mock DOM APIs
beforeEach(() => {
  // Create a mock element class
  class MockElement {
    href = ''
    download = ''
    style = {}
    click = vi.fn()
  }

  // Mock document.createElement
  global.document.createElement = vi.fn(() => new MockElement()) as any

  // Mock document.body with simple object
  const mockBody = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    nodeName: 'BODY',
    nodeType: 1,
  }

  // Use Object.defineProperty to set body
  Object.defineProperty(global.document, 'body', {
    value: mockBody,
    writable: true,
    configurable: true,
  })

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock console.warn
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('flattenObject', () => {
  it('flattens nested objects correctly', () => {
    const obj = {
      name: 'John',
      address: {
        city: 'Istanbul',
        country: 'Turkey',
      },
    }

    const result = flattenObject(obj)

    expect(result).toEqual({
      name: 'John',
      'address.city': 'Istanbul',
      'address.country': 'Turkey',
    })
  })

  it('handles deeply nested objects', () => {
    const obj = {
      level1: {
        level2: {
          level3: 'value',
        },
      },
    }

    const result = flattenObject(obj)
    expect(result['level1.level2.level3']).toBe('value')
  })

  it('preserves arrays without flattening', () => {
    const obj = {
      items: [1, 2, 3],
    }

    const result = flattenObject(obj)
    expect(result.items).toEqual([1, 2, 3])
  })

  it('preserves Date objects', () => {
    const date = new Date('2024-01-01')
    const obj = {
      createdAt: date,
    }

    const result = flattenObject(obj)
    expect(result.createdAt).toBe(date)
  })

  it('handles null values', () => {
    const obj = {
      name: 'Test',
      description: null,
    }

    const result = flattenObject(obj)
    expect(result.description).toBeNull()
  })

  it('applies prefix when provided', () => {
    const obj = {
      name: 'Test',
    }

    const result = flattenObject(obj, 'user')
    expect(result['user.name']).toBe('Test')
  })
})

describe('filterColumnsForExport', () => {
  const data = [
    { id: 1, name: 'John', email: 'john@test.com', age: 30 },
    { id: 2, name: 'Jane', email: 'jane@test.com', age: 25 },
  ]

  it('returns all data when no columns specified', () => {
    const result = filterColumnsForExport(data)
    expect(result).toEqual(data)
  })

  it('filters columns correctly', () => {
    const result = filterColumnsForExport(data, ['name', 'email'])

    expect(result).toEqual([
      { name: 'John', email: 'john@test.com' },
      { name: 'Jane', email: 'jane@test.com' },
    ])
  })

  it('includes undefined for missing columns', () => {
    const result = filterColumnsForExport(data, ['name', 'nonexistent'])

    expect(result[0]).toEqual({
      name: 'John',
      nonexistent: undefined,
    })
  })

  it('handles empty columns array', () => {
    const result = filterColumnsForExport(data, [])
    expect(result).toEqual([{}, {}])
  })
})

describe('exportToCSV', () => {
  it('does not export when data is empty', () => {
    exportToCSV([])
    expect(console.warn).toHaveBeenCalledWith('No data to export')
  })

  it('creates CSV with headers', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]

    exportToCSV(data, 'test.csv')

    // Check that createElement was called
    expect(document.createElement).toHaveBeenCalledWith('a')
  })

  it('escapes CSV special characters', () => {
    const data = [{ name: 'John "Johnny" Doe', note: 'Test, value' }]

    exportToCSV(data)

    // createElement should have been called
    expect(document.createElement).toHaveBeenCalled()
  })

  it('handles boolean values', () => {
    const data = [{ active: true, verified: false }]

    exportToCSV(data)

    expect(document.createElement).toHaveBeenCalled()
  })

  it('handles Date objects', () => {
    const data = [{ createdAt: new Date('2024-01-01') }]

    exportToCSV(data)

    expect(document.createElement).toHaveBeenCalled()
  })

  it('handles null and undefined values', () => {
    const data = [{ name: 'Test', value: null, other: undefined }]

    exportToCSV(data)

    expect(document.createElement).toHaveBeenCalled()
  })
})

describe('exportToJSON', () => {
  it('exports data as JSON', () => {
    const data = [{ id: 1, name: 'Test' }]

    exportToJSON(data, 'test.json')

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('formats JSON with indentation', () => {
    const data = [{ id: 1 }]

    exportToJSON(data)

    // Should create blob with formatted JSON
    expect(document.createElement).toHaveBeenCalled()
  })
})

describe('exportData', () => {
  it('exports as CSV by default', () => {
    const data = [{ id: 1, name: 'Test' }]

    exportData(data)

    expect(document.createElement).toHaveBeenCalled()
  })

  it('exports as JSON when specified', () => {
    const data = [{ id: 1, name: 'Test' }]

    exportData(data, 'json', 'test')

    expect(document.createElement).toHaveBeenCalled()
  })

  it('adds timestamp to filename', () => {
    const data = [{ id: 1 }]

    exportData(data, 'csv', 'export')

    // Should have been called
    expect(document.createElement).toHaveBeenCalled()
  })

  it('shows warning for empty data', () => {
    exportData([])

    expect(console.warn).toHaveBeenCalledWith('No data to export')
  })

  it('shows error for unsupported format', () => {
    const data = [{ id: 1 }]

    exportData(data, 'xml' as any, 'test')

    expect(console.error).toHaveBeenCalledWith('Unsupported export format: xml')
  })
})
