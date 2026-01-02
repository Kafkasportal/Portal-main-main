/**
 * Data Export Utilities
 * Provides functions to export data in CSV and JSON formats
 */

export type ExportFormat = 'csv' | 'json'

/**
 * Converts data to CSV format
 * @param data - Array of objects to export
 * @param filename - Output filename
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  )

  // Create CSV header
  const header = keys.map((key) => `"${escapeCsvValue(key)}"`).join(',')

  // Create CSV rows
  const rows = data.map((obj) =>
    keys.map((key) => {
      const value = obj[key]
      return `"${escapeCsvValue(formatValueForCSV(value))}"`
    }).join(',')
  )

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Download file
  downloadFile(csv, filename, 'text/csv;charset=utf-8;')
}

/**
 * Converts data to JSON format
 * @param data - Array of objects to export
 * @param filename - Output filename
 */
export function exportToJSON<T>(
  data: T[],
  filename: string = 'export.json'
): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, filename, 'application/json;charset=utf-8;')
}

/**
 * Exports data in the specified format
 * @param data - Array of objects to export
 * @param format - Export format ('csv' or 'json')
 * @param filename - Output filename (without extension)
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  format: ExportFormat = 'csv',
  filename: string = 'export'
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  const timestamp = new Date().toISOString().split('T')[0]
  const fullFilename = `${filename}-${timestamp}.${format}`

  if (format === 'csv') {
    exportToCSV(data, fullFilename)
  } else if (format === 'json') {
    exportToJSON(data, fullFilename)
  } else {
    console.error(`Unsupported export format: ${format}`)
  }
}

/**
 * Escapes special characters in CSV values
 */
function escapeCsvValue(value: string): string {
  if (typeof value !== 'string') {
    return String(value)
  }
  // Escape double quotes by doubling them
  return value.replace(/"/g, '""')
}

/**
 * Formats values for CSV export
 */
function formatValueForCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Evet' : 'Hayır'
  }

  if (typeof value === 'object') {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toLocaleDateString('tr-TR')
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return value.join('; ')
    }
    // Handle objects
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Downloads a file to the user's device
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const element = document.createElement('a')
  const file = new Blob([content], { type: mimeType })

  element.href = URL.createObjectURL(file)
  element.download = filename
  element.style.display = 'none'

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  // Clean up the object URL
  URL.revokeObjectURL(element.href)
}

/**
 * Flattens nested objects for CSV export
 * @param obj - Object to flatten
 * @param prefix - Current key prefix
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else {
        flattened[newKey] = value
      }
    }
  }

  return flattened
}

/**
 * Filters columns for export
 * @param data - Array of objects
 * @param columnsToExport - Column names to include (undefined = all)
 */
export function filterColumnsForExport<T extends Record<string, any>>(
  data: T[],
  columnsToExport?: string[]
): Record<string, any>[] {
  if (!columnsToExport) {
    return data
  }

  return data.map((obj) => {
    const filtered: Record<string, any> = {}
    columnsToExport.forEach((col) => {
      filtered[col] = obj[col]
    })
    return filtered
  })
}
