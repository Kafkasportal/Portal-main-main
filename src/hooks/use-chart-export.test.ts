import { renderHook } from '@testing-library/react'
import { useChartExport } from './use-chart-export'
import html2canvas from 'html2canvas'

// Mock html2canvas
jest.mock('html2canvas', () => jest.fn())

const mockHtml2canvas = html2canvas as jest.MockedFunction<typeof html2canvas>

describe('useChartExport', () => {
  it('should create an export function', () => {
    const { result } = renderHook(() => useChartExport('test-chart'))
    expect(result.current.exportChart).toBeDefined()
    expect(result.current.chartRef).toBeDefined()
  })

  it('exportChart should call html2canvas when ref is current', async () => {
    const mockCanvas = document.createElement('canvas')
    mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test')
    mockHtml2canvas.mockResolvedValue(mockCanvas)

    const { result } = renderHook(() => useChartExport('test-chart'))
    
    // Mock the ref
    Object.defineProperty(result.current.chartRef, 'current', {
      value: document.createElement('div'),
      writable: true
    })

    await result.current.exportChart()

    expect(html2canvas).toHaveBeenCalled()
  })
})
