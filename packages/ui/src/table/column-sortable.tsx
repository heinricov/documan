"use client"

/** Sortable column builder: returns a complete column with sortable header, auto-styled cell and search filterFn. */

import { type RowData } from "@tanstack/react-table"

import {
  buildDataColumn,
  type ColumnBaseOptions,
} from "@packages/ui/table/column-shared"
import type { DataTableColumn } from "@packages/ui/table/table-data"

export { SortIcon } from "@packages/ui/table/column-shared"

export interface ColumnSortDataTableOptions<TData extends RowData>
  extends ColumnBaseOptions<TData> {
  sortFn?: "datetime"
}

export function ColumnSortDataTable<TData extends RowData>(
  options: ColumnSortDataTableOptions<TData>
): DataTableColumn<TData> {
  const { sortFn, ...rest } = options
  return buildDataColumn(rest, { sortable: true, sortFn })
}