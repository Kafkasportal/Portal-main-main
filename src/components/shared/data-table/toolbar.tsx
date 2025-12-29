'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useDebounce } from '@/hooks/use-debounce'
import { Table } from '@tanstack/react-table'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DataTableFacetedFilter } from './faceted-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchColumn?: string
  filters?: {
    column: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  exportButton?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Ara...',
  searchColumn,
  filters,
  exportButton,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Get the current filter value from the table state
  const filterValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
    : ''

  // Local state for the input
  const [value, setValue] = useState(filterValue)

  // Debounce the local state value
  const debouncedValue = useDebounce(value, 300)

  // Sync local state when external filter changes (e.g. Reset button)
  useEffect(() => {
    setValue(filterValue)
  }, [filterValue])

  // Update table filter when debounced value changes
  useEffect(() => {
    if (searchColumn && debouncedValue !== filterValue) {
      table.getColumn(searchColumn)?.setFilterValue(debouncedValue)
    }
  }, [debouncedValue, searchColumn, table, filterValue])

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      {/* Search Field with InputGroup */}
      <InputGroup className="w-full flex-1 sm:max-w-sm">
        <InputGroupAddon>
          <Search className="text-muted-foreground h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={searchPlaceholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </InputGroup>

      {/* Filters */}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {filters?.map((filter) => {
          const column = table.getColumn(filter.column)
          if (!column) return null

          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          )
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3"
          >
            Temizle
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Export button */}
        {exportButton}

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Görünüm
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuLabel>Sütunları Göster</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== 'undefined' &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
