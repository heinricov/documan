"use client"

/** Shared cell rendering + column-building logic for the table column helpers. */

import type { ReactNode } from "react"
import {
  type CellContext,
  type Column,
  type ColumnDefTemplate,
  type FilterFn,
  type HeaderContext,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@packages/ui/lib/utils"
import {
  type DataTableColumn,
  type DataTableFeatures,
  formatDate,
} from "@packages/ui/table/table-data"

export type ColumnFormat = "text" | "number" | "date"

export interface ColumnBaseOptions<TData extends RowData> {
  accessorKey: (keyof TData & string) | (string & {})
  /** Optional explicit column id. Defaults to `accessorKey`. */
  id?: string
  label: string
  align?: "start" | "end"
  format?: ColumnFormat
  /** Secondary field rendered as a muted line under the primary value. */
  subtitleKey?: keyof TData & string
  /** Keys searched by the table search input. Defaults to `accessorKey` + `subtitleKey`. */
  searchKeys?: (keyof TData & string)[]
  enableHiding?: boolean
  /** Overrides the auto-styled cell. */
  cell?: (props: CellContext<DataTableFeatures, TData>) => ReactNode
}

export function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ArrowUp className="size-3.5" aria-hidden="true" />
  if (sorted === "desc")
    return <ArrowDown className="size-3.5" aria-hidden="true" />
  return (
    <ChevronsUpDown
      className="size-3.5 text-muted-foreground/60"
      aria-hidden="true"
    />
  )
}

function SortHeaderButton<TData extends RowData>({
  column,
  label,
  align,
}: {
  column: Column<DataTableFeatures, TData>
  label: string
  align?: "start" | "end"
}) {
  const button = (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
    >
      {label}
      <SortIcon sorted={column.getIsSorted()} />
    </button>
  )
  if (align === "end") {
    return <div className="flex w-full justify-end">{button}</div>
  }
  return button
}

function buildHeader<TData extends RowData>({
  sortable,
  label,
  align,
}: {
  sortable: boolean
  label: string
  align: "start" | "end"
}): ColumnDefTemplate<HeaderContext<DataTableFeatures, TData>> {
  if (sortable) {
    const SortableHeaderTemplate = ({
      column,
    }: HeaderContext<DataTableFeatures, TData>) => (
      <SortHeaderButton column={column} label={label} align={align} />
    )
    return SortableHeaderTemplate
  }
  const span = (
    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {label}
    </span>
  )
  const PlainHeaderTemplate = () =>
    align === "end" ? (
      <div className="flex w-full justify-end">{span}</div>
    ) : (
      span
    )
  return PlainHeaderTemplate
}

function renderDefaultCell<TData extends RowData>(
  row: Row<DataTableFeatures, TData>,
  options: {
    accessorKey: keyof TData & string
    align: "start" | "end"
    format: ColumnFormat
    subtitleKey?: keyof TData & string
  }
): ReactNode {
  const { accessorKey, align, format, subtitleKey } = options
  const value = String(row.original[accessorKey] ?? "")

  if (format === "date") {
    return (
      <span
        className={cn(
          "text-xs text-muted-foreground tabular-nums",
          align === "end" && "block text-right"
        )}
      >
        {formatDate(value)}
      </span>
    )
  }

  if (format === "number") {
    return (
      <span
        className={cn(
          "text-sm text-muted-foreground tabular-nums",
          align === "end" && "block text-right"
        )}
      >
        {value}
      </span>
    )
  }

  if (subtitleKey) {
    const subtitle = String(row.original[subtitleKey] ?? "")
    return (
      <div className="min-w-0">
        <p className="truncate text-sm leading-tight font-medium text-foreground">
          {value}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    )
  }

  return (
    <span
      className={cn(
        "truncate text-sm text-foreground",
        align === "end" && "block text-right"
      )}
    >
      {value}
    </span>
  )
}

export function buildDataColumn<TData extends RowData>(
  options: ColumnBaseOptions<TData>,
  { sortable, sortFn }: { sortable: boolean; sortFn?: "datetime" }
): DataTableColumn<TData> {
  const {
    accessorKey,
    id,
    label,
    align = "start",
    format = "text",
    subtitleKey,
    searchKeys,
    enableHiding = true,
    cell,
  } = options

  const keys: (keyof TData & string)[] = searchKeys ? [...searchKeys] : []
  if (!keys.length) {
    keys.push(accessorKey as keyof TData & string)
    if (subtitleKey && !keys.includes(subtitleKey as keyof TData & string)) {
      keys.push(subtitleKey as keyof TData & string)
    }
  }

  const searchFilter: FilterFn<DataTableFeatures, TData> = (
    row,
    _columnId,
    value
  ) => {
    const q = String(value ?? "").toLowerCase()
    if (!q) return true
    return keys.some((key) =>
      String(row.original[key]).toLowerCase().includes(q)
    )
  }

  const defaultCell = (
    props: CellContext<DataTableFeatures, TData>
  ): ReactNode =>
    renderDefaultCell(props.row, {
      accessorKey: accessorKey as keyof TData & string,
      align,
      format,
      subtitleKey: subtitleKey as keyof TData & string | undefined,
    })

  return {
    accessorKey,
    ...(id ? { id } : {}),
    enableSorting: sortable,
    enableHiding,
    header: buildHeader<TData>({
      sortable,
      label,
      align,
    }),
    ...(sortFn ? { sortFn } : {}),
    ...(keys.length ? { filterFn: searchFilter } : {}),
    cell: cell ?? defaultCell,
  }
}