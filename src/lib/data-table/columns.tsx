/**
 * Data Table Column Utilities
 * Helper functions for managing DataTable columns
 */

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * Creates a checkbox column for row selection
 * Should be the first column in the columns array
 */
export function createCheckboxColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tüm öğeleri seç"
        className="mt-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Öğe ${row.index + 1} seç`}
        className="mt-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Prepends checkbox column to existing columns
 */
export function addCheckboxColumn<TData, TValue>(
  columns: ColumnDef<TData, TValue>[]
): ColumnDef<TData, TValue>[] {
  return [createCheckboxColumn<TData>() as ColumnDef<TData, TValue>, ...columns]
}
