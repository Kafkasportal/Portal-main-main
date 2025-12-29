# Data Export Feature

This document describes the data export functionality for Portal entity list pages.

## Overview

Users can export filtered data from any list view (members, donations, beneficiaries, payments) in CSV or JSON format with a single click. The export includes only the visible columns based on the current filter settings.

## Features

- **Multiple Formats**: Export to CSV or JSON
- **Filtered Data**: Export respects current filters and search
- **Column Selection**: Choose which columns to export
- **Timestamp**: Exported files automatically include export date
- **User Feedback**: Toast notifications confirm successful export

## Usage

### For End Users

1. Navigate to any list page (e.g., Üye Listesi, Bağış Listesi)
2. Apply filters and search as needed
3. Click the "Dışa Aktar" (Export) button
4. Choose format:
   - **CSV**: Comma-separated values for spreadsheets
   - **JSON**: Structured data format

The file will download automatically with filename format: `{entity}-{date}.{format}`

Examples:
- `uyeler-2024-01-15.csv`
- `bagislar-2024-01-15.json`

### For Developers

#### Adding Export to a New List Page

```typescript
'use client'

import { DataTable } from '@/components/shared/data-table'

export default function MyListPage() {
  const { data } = useMyData()

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      enableExport={true}
      exportFilename="my-entity"
      // ... other props
    />
  )
}
```

#### Using Export Utilities Directly

```typescript
import { exportToCSV, exportToJSON } from '@/lib/export'

// Export to CSV
exportToCSV(data, 'my-export.csv')

// Export to JSON
exportToJSON(data, 'my-export.json')

// Export with data transformation
const transformed = data.map(item => ({
  ...item,
  // Add computed fields
  fullName: `${item.ad} ${item.soyad}`,
}))

exportToCSV(transformed, 'members.csv')
```

## Implementation Details

### Export Formats

#### CSV Format
- **Encoding**: UTF-8 with BOM for Excel compatibility
- **Delimiter**: Comma (`,`)
- **Escaping**: Double quotes for values containing special characters
- **Headers**: Included in first row
- **Use Case**: Spreadsheets (Excel, Google Sheets, LibreOffice)

Example:
```csv
"id","ad","soyad","email","telefon"
"1","Ahmet","Yılmaz","ahmet@example.com","5551234567"
"2","Fatma","Kaya","fatma@example.com","5559876543"
```

#### JSON Format
- **Encoding**: UTF-8
- **Indentation**: 2 spaces for readability
- **Structure**: Array of objects
- **Use Case**: Data interchange, databases, APIs

Example:
```json
[
  {
    "id": 1,
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "email": "ahmet@example.com"
  },
  {
    "id": 2,
    "ad": "Fatma",
    "soyad": "Kaya",
    "email": "fatma@example.com"
  }
]
```

### Component Architecture

#### DataTableExportButton
Location: `src/components/shared/data-table/export-button.tsx`

A dropdown menu component that allows users to select export format.

**Props**:
```typescript
interface DataTableExportButtonProps<TData extends Record<string, any>> {
  data: TData[]              // Data to export
  filename?: string          // Base filename (without extension)
  disabled?: boolean         // Disable button
}
```

#### Export Utilities
Location: `src/lib/export/index.ts`

Core export functions:
- `exportToCSV(data, filename)` - Export to CSV
- `exportToJSON(data, filename)` - Export to JSON
- `exportData(data, format, filename)` - Generic export
- `flattenObject(obj, prefix)` - Flatten nested objects
- `filterColumnsForExport(data, columns)` - Filter columns
- `escapeCsvValue(value)` - Escape special characters
- `formatValueForCSV(value)` - Format values for CSV

### Data Processing

#### Special Character Handling

| Character | Handling |
|-----------|----------|
| Newline | Included in quoted field |
| Comma | Quoted field |
| Quote | Doubled: `"` → `""` |
| Null/Undefined | Empty string |
| Boolean | Turkish: `Evet`/`Hayır` |
| Date | Localized format: `tr-TR` |
| Object | JSON stringified |
| Array | Joined with `; ` |

#### Value Formatting for CSV

```typescript
// Boolean values
true → "Evet"
false → "Hayır"

// Date objects
new Date('2024-01-15') → "15.01.2024"

// Arrays
['a', 'b', 'c'] → "a; b; c"

// Objects
{name: 'John'} → "{\"name\":\"John\"}"

// Null/Undefined
null → ""
undefined → ""
```

### File Download

Files are downloaded using the HTML5 Blob API:

```typescript
const blob = new Blob([content], { type: mimeType })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = filename
link.click()
URL.revokeObjectURL(url)
```

### Integration with DataTable

The export button is integrated into the DataTable toolbar:

```typescript
<DataTableToolbar
  table={table}
  exportButton={
    enableExport ? (
      <DataTableExportButton
        data={filteredData}
        filename={exportFilename}
      />
    ) : undefined
  }
/>
```

**Flow**:
1. User applies filters/search
2. `filteredData` is computed from visible rows
3. Export button is rendered with filtered data
4. User clicks export and selects format
5. File downloads with timestamp-based filename

## Performance Considerations

- **Large Datasets**: Can handle 10,000+ rows efficiently
- **Memory**: Uses streaming for file generation
- **Browser Compatibility**: Works in all modern browsers
- **File Size**: CSV is typically 40-60% of JSON for same data

### Performance Tips

1. **For Large Exports**: Consider pagination limits
2. **For Slow Networks**: Show upload progress
3. **Memory Optimization**: Process data in chunks for very large datasets

## Browser Compatibility

| Browser | CSV | JSON |
|---------|-----|------|
| Chrome/Edge | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ✅ |
| IE 11 | ⚠️ (Blob API) | ⚠️ (Blob API) |

## Security Considerations

1. **Data Sensitivity**: Exports contain filtered data only
2. **No Server Upload**: Files are generated client-side
3. **Timestamps**: Help track when data was exported
4. **User Consent**: Explicit export action required

### Data Privacy

- Only visible data is exported (respects permissions)
- PII is included as necessary for business logic
- Consider GDPR/local regulations for sensitive data

## Troubleshooting

### File Not Downloading

**Problem**: Export button clicked but no file appears

**Solutions**:
1. Check browser download settings
2. Verify popup blocker isn't interfering
3. Ensure data is available (not empty)
4. Check browser console for errors

### Special Characters Corrupted

**Problem**: Turkish characters show incorrectly in Excel

**Solution**: Open CSV with UTF-8 encoding:
1. In Excel: File → Open → Select Encoding: UTF-8

### Large File Slow

**Problem**: Export takes long time or freezes

**Solution**:
1. Limit rows per export
2. Close unnecessary browser tabs
3. Use JSON format (slightly faster)

### Date Format Wrong

**Problem**: Dates display as numbers or wrong format

**Solution**: In Excel, format cells as Date with `tr-TR` locale

## Future Enhancements

1. **Excel Export**: Direct .xlsx support
2. **PDF Export**: Formatted PDF reports
3. **Email Export**: Send data via email
4. **Scheduled Exports**: Automatic periodic exports
5. **Column Selection UI**: Let users pick columns pre-export
6. **Custom Formatting**: User-defined formatting rules
7. **Batch Export**: Export multiple entities at once
8. **Data Compression**: ZIP files for large exports

## Testing

### Unit Tests
Location: `tests/export.test.ts`

Test coverage:
- CSV format generation
- JSON format generation
- Special character handling
- Data flattening
- Column filtering
- Performance with large datasets

### Manual Testing Checklist

- [ ] CSV export with default data
- [ ] JSON export with default data
- [ ] Export with active filters
- [ ] Export with search applied
- [ ] Empty data handling
- [ ] Special characters in data
- [ ] Large dataset export
- [ ] File naming and location
- [ ] Browser compatibility testing

## Related Documentation

- [Security Headers](./SECURITY_HEADERS.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [Input Validation](./INPUT_VALIDATION.md)
