'use client'

import { Table } from '@tanstack/react-table'
import { X, SlidersHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from '@/components/ui/input-group'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchPlaceholder?: string
    searchColumn?: string
    filters?: {
        column: string
        title: string
        options: { label: string; value: string }[]
    }[]
}

export function DataTableToolbar<TData>({
    table,
    searchPlaceholder = 'Ara...',
    searchColumn,
    filters
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            {/* Search Field with InputGroup */}
            <InputGroup className="flex-1 w-full sm:max-w-sm">
                <InputGroupAddon>
                    <Search className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder={searchPlaceholder}
                    value={
                        searchColumn
                            ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
                            : ''
                    }
                    onChange={(event) => {
                        if (searchColumn) {
                            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                        }
                    }}
                />
            </InputGroup>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {filters?.map((filter) => {
                    const column = table.getColumn(filter.column)
                    const selectedValue = column?.getFilterValue() as string | undefined

                    return (
                        <Select
                            key={filter.column}
                            value={selectedValue ?? 'all'}
                            onValueChange={(value) => {
                                column?.setFilterValue(value === 'all' ? undefined : value)
                            }}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder={filter.title} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tümü</SelectItem>
                                {filter.options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                {/* Column visibility */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Görünüm
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Sütunları Göster</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllColumns()
                            .filter(
                                (column) =>
                                    typeof column.accessorFn !== 'undefined' && column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
