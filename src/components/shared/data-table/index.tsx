'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { memo, useState } from 'react'

import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { DataTableToolbar } from './toolbar'
import { DataTableExportButton } from './export-button'
import { BulkActionsToolbar, type BulkAction } from './bulk-actions-toolbar'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  searchPlaceholder?: string
  searchColumn?: string
  isLoading?: boolean
  filters?: {
    column: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  }[]
  onRowClick?: (row: TData) => void
  onExport?: (filteredData: TData[]) => void
  exportFilename?: string
  enableExport?: boolean
  enableBulkActions?: boolean
  getRowId?: (row: TData) => string
  onBulkDelete?: (ids: string[]) => Promise<void>
  onStatusUpdate?: (ids: string[], status: string) => Promise<void>
  onBulkAction?: (action: string, ids: string[]) => Promise<void>
  bulkStatusOptions?: { label: string; value: string }[]
  bulkActions?: BulkAction[]
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

// Move initialState outside component to prevent recreation on every render
const INITIAL_STATE = {
  pagination: {
    pageSize: 10,
  },
}

function DataTableComponent<TData, TValue>({
  columns,
  data,
  pageCount,
  searchPlaceholder = 'Ara...',
  searchColumn,
  isLoading = false,
  filters,
  onRowClick,
  exportFilename = 'export',
  enableExport = true,
  enableBulkActions = true,
  getRowId,
  onBulkDelete,
  onStatusUpdate,
  onBulkAction,
  bulkStatusOptions = [],
  bulkActions = [],
  columnFilters: propColumnFilters,
  onColumnFiltersChange: propOnColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columnFilters = propColumnFilters ?? internalColumnFilters
  const setColumnFilters = propOnColumnFiltersChange ?? setInternalColumnFilters

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table standard usage
  const table = useReactTable({
    data,
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: INITIAL_STATE,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: !!pageCount,
    manualFiltering: !!propOnColumnFiltersChange,
  })

  // Get filtered data for export
  const filteredData = (table.getFilteredRowModel().rows.map((row) => row.original) ||
    data) as TData[]

  // Get selected row IDs for bulk operations
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => {
      const rowData = row.original
      if (getRowId) {
        return getRowId(rowData)
      }
      // Fallback to 'id' field if getRowId not provided
      return String((rowData as Record<string, any>).id || row.id)
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-62.5" />
          <Skeleton className="h-10 w-25" />
        </div>
        <div className="rounded-md border">
          <div className="bg-muted/50 h-12 border-b" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-16 items-center gap-4 border-b px-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-50" />
              <Skeleton className="h-4 w-25" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {enableBulkActions && selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onBulkDelete={onBulkDelete}
          onStatusUpdate={onStatusUpdate}
          onBulkAction={onBulkAction}
          statusOptions={bulkStatusOptions}
          customActions={bulkActions}
        />
      )}

      {/* Search and Filter Toolbar */}
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchColumn={searchColumn}
        filters={filters}
        exportButton={
          enableExport ? (
            <DataTableExportButton
              data={filteredData}
              filename={exportFilename}
            />
          ) : undefined
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  role={onRowClick ? 'button' : 'row'}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick ? `Satır ${row.index + 1} - Tıklayarak detayları görüntüleyin` : undefined}
                  className={onRowClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' : undefined}
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick?.(row.original)
                          }
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState variant="search" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export const DataTable = memo(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => React.JSX.Element
