"use client"

import * as React from "react"
import {
  sortFn_datetime,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type FilterFn,
  type RowData,
  type SortingState,
  tableFeatures,
  useTable,
  createSortedRowModel,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  flexRender,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { cn } from "@packages/ui/lib/utils"
import { Button } from "@packages/ui/components/button"
import { Checkbox } from "@packages/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu"
import { Input } from "@packages/ui/components/input"
import { Toaster } from "@packages/ui/components/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/table"
import {
  ChevronLeft,
  ChevronRight,
  Columns,
  Download,
  Ellipsis,
  Search,
  Trash,
} from "lucide-react"

const DATA_TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    datetime: sortFn_datetime,
  },
})

export type DataTableFeatures = typeof DATA_TABLE_FEATURES
export type DataTableColumn<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData
>

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

export function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : dateFmt.format(parsed)
}

export interface DataTablePrimaryAction {
  /** Label of the default-styled button. */
  title: string
  onClick?: () => void
}

export type DataTablePrimaryActionInput =
  | React.ReactNode
  | DataTablePrimaryAction

export interface DataTableRowAction {
  /** Label of the default-styled dropdown item. */
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive"
  /** Render a separator above this item (ignored for the first item). */
  separatorBefore?: boolean
}

export type DataTableRowActionsResult =
  | React.ReactNode
  | DataTableRowAction[]

export interface DataTableProps<TData extends RowData> {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData) => string
  /** Human readable label for a row, used in aria-labels and toasts. Defaults to `getRowId`. */
  getRowLabel?: (row: TData) => string
  /** Singular noun used in labels and toasts, e.g. "member". Defaults to "item". */
  entityName?: string
  /** Plural noun. Defaults to `${entityName}s`. */
  entityNamePlural?: string
  title?: string
  description?: string
  icon?: React.ReactNode
  /**
   * Id(s) of the column(s) filtered by the search input. When omitted the
   * search input is hidden. Pass an array to search across multiple fields
   * (matches any field, using row values by column id/accessor key).
   */
  searchColumnId?: string | string[]
  searchPlaceholder?: string
  /** Labels used in the "Toggle Columns" menu, keyed by column id. */
  columnLabels?: Record<string, string>
  noResultsMessage?: string
  /**
   * Primary action in the header. Accepts:
   * - a string → default-styled button with that label;
   * - an object `{ title, onClick? }` → default-styled button with the label and handler;
   * - a `ReactNode` → fully custom content.
   */
  primaryAction?: DataTablePrimaryActionInput
  /**
   * Content of the built-in actions (dropdown) column. Return `DropdownMenuItem`s
   * for full control, or an array of `{ label, icon?, onClick?, variant?, separatorBefore? }`
   * to render default-styled items.
   */
  rowActions?: (row: TData) => DataTableRowActionsResult
  /** Extra batch actions rendered above Export/Remove while rows are selected. */
  bulkActions?: (rows: TData[]) => React.ReactNode
  onExport?: (rows: TData[]) => void
  /** When provided, the bulk "Remove" button and a remove toast are enabled. */
  onRemove?: (rows: TData[]) => void
  initialSorting?: SortingState
  initialPageSize?: number
  className?: string
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function renderPrimaryAction(action: DataTablePrimaryActionInput) {
  if (typeof action === "string") {
    return <Button size="sm">{action}</Button>
  }
  if (
    action !== null &&
    typeof action === "object" &&
    !React.isValidElement(action) &&
    "title" in action
  ) {
    const { title, onClick } = action as DataTablePrimaryAction
    return (
      <Button size="sm" onClick={onClick}>
        {title}
      </Button>
    )
  }
  return action as React.ReactNode
}

function isRowActionList(
  value: DataTableRowActionsResult
): value is DataTableRowAction[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        !React.isValidElement(item) &&
        "label" in item
    )
  )
}

function renderRowActionsContent(result: DataTableRowActionsResult) {
  if (!isRowActionList(result)) return result as React.ReactNode
  return result.map((action, index) => (
    <React.Fragment key={`${action.label}-${index}`}>
      {action.separatorBefore && index > 0 ? <DropdownMenuSeparator /> : null}
      <DropdownMenuItem variant={action.variant} onClick={action.onClick}>
        {action.icon}
        {action.label}
      </DropdownMenuItem>
    </React.Fragment>
  ))
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  getRowLabel,
  entityName = "item",
  entityNamePlural,
  title,
  description,
  icon,
  searchColumnId,
  searchPlaceholder = "Search...",
  columnLabels,
  noResultsMessage = "No results found.",
  primaryAction,
  rowActions,
  bulkActions,
  onExport,
  onRemove,
  initialSorting = [],
  initialPageSize = 6,
  className,
}: DataTableProps<TData>) {
  const plural = entityNamePlural ?? `${entityName}s`
  const noun = (count: number) => (count === 1 ? entityName : plural)
  const rowLabel = getRowLabel ?? ((row: TData) => getRowId(row))
  const primaryActionNode = renderPrimaryAction(primaryAction)

  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const isMultiSearch = Array.isArray(searchColumnId)
  const searchEnabled = isMultiSearch
    ? searchColumnId.length > 0
    : Boolean(searchColumnId)

  const globalFilterFn: FilterFn<DataTableFeatures, TData> = React.useCallback(
    (row, _columnId, value) => {
      const query = String(value ?? "").toLowerCase()
      if (!query) return true
      const keys = Array.isArray(searchColumnId) ? searchColumnId : []
      return keys.some((key) => {
        const raw = row.getValue(key) ?? row.original[key as keyof TData]
        return String(raw ?? "").toLowerCase().includes(query)
      })
    },
    [searchColumnId]
  )

  const renderRowActions = rowActions ?? (() => null)
  const actionsColumn: DataTableColumn<TData>[] = [
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${rowLabel(row.original)}`}
                >
                  <Ellipsis className="size-4" aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              {renderRowActionsContent(renderRowActions(row.original))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const builtInColumns: DataTableColumn<TData>[] = [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
          aria-label={`Select all ${plural} on this page`}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label={`Select ${rowLabel(row.original)}`}
        />
      ),
    },
    ...columns,
    ...(rowActions ? actionsColumn : []),
  ]

  const table = useTable<DataTableFeatures, TData>({
    features: DATA_TABLE_FEATURES,
    data,
    columns: builtInColumns,
    getRowId,
    ...(isMultiSearch
      ? { globalFilterFn, getColumnCanGlobalFilter: () => true }
      : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageIndex: 0, pageSize: initialPageSize } },
  })

  const searchValue = Array.isArray(searchColumnId)
    ? globalFilter
    : searchColumnId
      ? ((table.getColumn(searchColumnId)?.getFilterValue() as string) ?? "")
      : ""

  function handleSearchChange(value: string) {
    if (Array.isArray(searchColumnId)) {
      table.setGlobalFilter(value)
      return
    }
    if (searchColumnId) {
      table.getColumn(searchColumnId)?.setFilterValue(value)
    }
  }
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)
  const selectedCount = selectedRows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()

  function handleExport() {
    onExport?.(selectedRows)
    toast("Export started", {
      description: `Exporting ${selectedCount} ${noun(selectedCount)} to CSV.`,
    })
  }

  function handleRemove() {
    onRemove?.(selectedRows)
    toast(`${capitalize(plural)} removed`, {
      description: `${selectedCount} ${noun(selectedCount)} removed.`,
    })
    table.resetRowSelection()
  }

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {(title || description || icon) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h1 className="font-heading text-lg leading-tight font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {searchEnabled && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={searchValue}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-7 w-48 pl-8 text-sm"
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Toggle columns"
                  >
                    <Columns className="size-3.5" aria-hidden="true" />
                    View
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked === true)
                        }
                        closeOnClick={false}
                      >
                        {columnLabels?.[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {primaryActionNode}
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground tabular-nums">
              {selectedCount} Selected
            </span>
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => table.resetRowSelection()}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions?.(selectedRows)}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-3.5" aria-hidden="true" />
              Export
            </Button>
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemove}
              >
                <Trash className="size-3.5" aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9",
                      header.column.id === "select" && "w-10 pl-4",
                      header.column.id === "actions" && "w-10 pr-4"
                    )}
                  >
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-b border-border transition-colors duration-100 last:border-b-0 hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3",
                        cell.column.id === "select" && "pl-4",
                        cell.column.id === "actions" && "pr-4"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={builtInColumns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            {totalCount === 1 ? "Result" : "Results"}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            </Button>
            <span className="px-1 text-xs text-muted-foreground tabular-nums">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {Math.max(pageCount, 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}