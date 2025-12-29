# Bulk Operations Feature

This document describes the bulk operations functionality for Portal data tables.

## Overview

Users can select multiple records in data tables and perform bulk operations (delete, status update, custom actions) on them. The checkbox selection column and bulk action toolbar provide an intuitive interface for managing multiple items at once.

## Features

- **Checkbox Selection**: Select multiple rows with checkboxes
- **Select All**: Header checkbox to select/deselect all visible rows
- **Bulk Delete**: Delete multiple records with confirmation dialog
- **Bulk Status Update**: Update status for multiple records
- **Custom Actions**: Extensible system for adding custom bulk operations
- **User Feedback**: Toast notifications for operation results
- **Confirmation Dialogs**: Safety checks for destructive operations

## Usage

### For End Users

1. Navigate to a list page with bulk operations enabled
2. Use checkboxes to select records:
   - Individual checkboxes select single rows
   - Header checkbox selects all visible rows
3. The Bulk Actions toolbar appears automatically
4. Choose an action:
   - **Status Update**: Change status for all selected items
   - **Delete**: Remove selected items (with confirmation)
   - **Custom Actions**: Any custom actions defined for the page
5. Confirm the action
6. Receive confirmation notification

### For Developers

#### Adding Bulk Operations to a List Page

```typescript
'use client'

import { DataTable } from '@/components/shared/data-table'
import { addCheckboxColumn } from '@/lib/data-table/columns'

interface Member {
  id: string
  ad: string
  soyad: string
  aidatDurumu: 'guncel' | 'gecmis' | 'muaf'
  // ... other fields
}

// Define status options for bulk update
const statusOptions = [
  { label: 'Güncel', value: 'guncel' },
  { label: 'Gecikmiş', value: 'gecmis' },
  { label: 'Muaf', value: 'muaf' },
]

export default function MembersListPage() {
  const { data } = useMembers()

  // Add checkbox column to columns
  const columns = addCheckboxColumn(memberColumns)

  // Handle bulk delete
  const handleBulkDelete = async (ids: string[]) => {
    await deleteMembersAPI(ids)
    // Refetch data
    queryClient.invalidateQueries({ queryKey: ['members'] })
  }

  // Handle bulk status update
  const handleStatusUpdate = async (ids: string[], status: string) => {
    await updateMembersStatusAPI(ids, status)
    // Refetch data
    queryClient.invalidateQueries({ queryKey: ['members'] })
  }

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      enableBulkActions={true}
      getRowId={(row) => row.id}
      onBulkDelete={handleBulkDelete}
      onStatusUpdate={handleStatusUpdate}
      bulkStatusOptions={statusOptions}
    />
  )
}
```

#### Custom Bulk Actions

```typescript
import { BulkAction } from '@/components/shared/data-table/bulk-actions-toolbar'
import { Mail } from 'lucide-react'

const customBulkActions: BulkAction[] = [
  {
    id: 'send-email',
    label: 'E-mail Gönder',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirm: true,
    confirmMessage: 'Seçili üyelere e-mail göndermek istediğinizden emin misiniz?',
  },
]

const handleBulkAction = async (action: string, ids: string[]) => {
  if (action === 'send-email') {
    await sendBulkEmailAPI(ids)
  }
}

return (
  <DataTable
    // ... other props
    onBulkAction={handleBulkAction}
    bulkActions={customBulkActions}
  />
)
```

## Implementation Details

### Component Architecture

#### BulkActionsToolbar
Location: `src/components/shared/data-table/bulk-actions-toolbar.tsx`

**Props**:
```typescript
interface BulkActionsToolbarProps {
  selectedCount: number                    // Number of selected items
  selectedIds: string[]                    // Array of selected row IDs
  onBulkDelete?: (ids: string[]) => Promise<void>
  onStatusUpdate?: (ids: string[], status: string) => Promise<void>
  onBulkAction?: (action: string, ids: string[]) => Promise<void>
  statusOptions?: { label: string; value: string }[]
  customActions?: BulkAction[]
  disabled?: boolean
}
```

#### Checkbox Column
Location: `src/lib/data-table/columns.tsx`

Creates a checkbox column using TanStack Table's built-in row selection feature.

```typescript
export function createCheckboxColumn<TData>(): ColumnDef<TData>
export function addCheckboxColumn<TData, TValue>(
  columns: ColumnDef<TData, TValue>[]
): ColumnDef<TData, TValue>[]
```

### Row Selection Mechanism

The DataTable uses TanStack Table's built-in row selection:

```typescript
const table = useReactTable({
  // ... other config
  onRowSelectionChange: setRowSelection,
  state: {
    // ... other state
    rowSelection,
  },
})

// Get selected row IDs
const selectedIds = table
  .getSelectedRowModel()
  .rows.map((row) => getRowId(row.original))
```

### Selection Flow

```
User clicks checkbox
  ↓
Row selection state updates
  ↓
Table re-renders with updated selection
  ↓
Selected IDs computed
  ↓
Bulk actions toolbar shown/updated
  ↓
User selects action
  ↓
Action handler called with selected IDs
  ↓
API call made
  ↓
UI updated with result
  ↓
Confirmation toast shown
```

### API Integration

#### Bulk Delete Example

```typescript
// API call
async function deleteMembersAPI(ids: string[]) {
  const response = await fetch('/api/members/bulk-delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    throw new Error('Delete failed')
  }

  return response.json()
}

// Usage in component
const handleBulkDelete = async (ids: string[]) => {
  try {
    await deleteMembersAPI(ids)
    // Refetch updated data
    await refetch()
  } catch (error) {
    throw error // Let toast handle error display
  }
}
```

#### Bulk Status Update Example

```typescript
async function updateMembersStatusAPI(
  ids: string[],
  status: string
) {
  const response = await fetch('/api/members/bulk-update-status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  })

  if (!response.ok) {
    throw new Error('Update failed')
  }

  return response.json()
}
```

### Error Handling

The toolbar includes built-in error handling with user-friendly messages:

```typescript
try {
  await onBulkDelete(selectedIds)
  toast.success('Başarıyla silindi', {
    description: `${selectedIds.length} öğe silindi.`,
  })
} catch (error) {
  console.error('Bulk delete failed:', error)
  toast.error('Silme başarısız', {
    description: 'Lütfen tekrar deneyiniz.',
  })
}
```

### State Management

Selection state is managed locally in the DataTable:

```typescript
const [rowSelection, setRowSelection] = useState({})

// TanStack Table manages row selection internally
const table = useReactTable({
  // ...
  onRowSelectionChange: setRowSelection,
  state: {
    rowSelection,
  },
})
```

The selected IDs are computed on each render from the row selection state.

## UI/UX Design

### Selection States

1. **No Selection**: Toolbar hidden
2. **Partial Selection**: Header checkbox shows indeterminate state
3. **All Selected**: Header checkbox fully checked
4. **Some Selected**: Shows "N items selected" message

### Toolbar Layout

```
┌─────────────────────────────────────────────┐
│ ✓ 5 items selected  [Status ▼] [Update]  [×] [Delete] │
└─────────────────────────────────────────────┘
```

- Left: Selection count with icon
- Center: Status dropdown and apply button (if enabled)
- Center: Custom actions
- Right: Delete button (if enabled)

### Delete Confirmation Dialog

```
┌────────────────────────────────────────────┐
│ Silmeyi Onayla                             │
│ ─────────────────────────────────────────  │
│                                            │
│ 5 öğeyi silmek istediğinizden emin        │
│ misiniz? Bu işlem geri alınamaz.          │
│                                            │
│ ⚠️ Uyarı: Bu işlem tüm seçili öğeleri    │
│    kalıcı olarak silecektir.              │
│                                            │
│                          [İptal]  [Sil]   │
└────────────────────────────────────────────┘
```

## Accessibility

- **Keyboard Navigation**: Checkboxes work with Tab key
- **Screen Reader Labels**:
  - Select button: "Öğe 1 seç"
  - Header checkbox: "Tüm öğeleri seç"
- **ARIA Attributes**: Proper roles and labels
- **Focus Management**: Clear focus indicators

## Performance Considerations

- **Selection State**: Minimal impact on re-renders
- **ID Computation**: Memoized to prevent unnecessary recalculation
- **Confirmation Dialogs**: Lazy rendered (only shown when needed)

### Large Datasets

For tables with 1000+ rows:
1. Keep toolbar renders minimal
2. Consider server-side operations for very large batches
3. Show progress indicator for long-running operations

## Security Considerations

1. **CSRF Protection**: Implement CSRF tokens for API calls
2. **Authorization**: Verify user permissions server-side
3. **Input Validation**: Validate IDs and status values
4. **Audit Logging**: Log all bulk operations
5. **Rate Limiting**: Prevent bulk operation abuse

## Testing

### Unit Tests
Location: `tests/bulk-operations.test.ts` (to be created)

### Manual Testing Checklist

- [ ] Single row selection
- [ ] Multiple row selection
- [ ] Select all checkbox
- [ ] Deselect all checkbox
- [ ] Indeterminate state display
- [ ] Toolbar visibility
- [ ] Status update operation
- [ ] Bulk delete with confirmation
- [ ] Bulk delete cancellation
- [ ] Custom action execution
- [ ] Error handling
- [ ] Toast notifications
- [ ] API error scenarios
- [ ] Large dataset selection
- [ ] Keyboard navigation

## Related Features

- [Data Export](./DATA_EXPORT.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [Input Validation](./INPUT_VALIDATION.md)

## API Endpoint Examples

### Delete Endpoint

```typescript
// POST /api/members/bulk-delete
{
  "ids": ["id1", "id2", "id3"]
}

// Response
{
  "success": true,
  "deleted": 3,
  "failed": 0
}
```

### Status Update Endpoint

```typescript
// PATCH /api/members/bulk-update-status
{
  "ids": ["id1", "id2", "id3"],
  "status": "guncel"
}

// Response
{
  "success": true,
  "updated": 3,
  "failed": 0
}
```

### Custom Action Endpoint

```typescript
// POST /api/members/bulk-action
{
  "ids": ["id1", "id2", "id3"],
  "action": "send-email"
}

// Response
{
  "success": true,
  "processed": 3,
  "failed": 0
}
```
