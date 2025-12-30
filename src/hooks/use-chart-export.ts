import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'

export function useChartExport(fileName: string) {
  const chartRef = useRef<HTMLDivElement>(null)

  const exportChart = useCallback(async () => {
    if (!chartRef.current) return

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff', // Ensure white background
      })

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Chart export failed:', error)
    }
  }, [fileName])

  return { chartRef, exportChart }
}
