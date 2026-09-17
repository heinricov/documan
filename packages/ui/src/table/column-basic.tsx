"use client"

/** Plain (non-sortable) column builder: returns a complete column with a simple header and auto-styled cell. */

import { type RowData } from "@tanstack/react-table"

import {
  buildDataColumn,
  type ColumnBaseOptions,
} from "@packages/ui/table/column-shared"
import type { DataTableColumn } from "@packages/ui/table/table-data"

export type ColumnBasicOptions<TData extends RowData> =
  ColumnBaseOptions<TData>

export function ColumnBasic<TData extends RowData>(
  options: ColumnBasicOptions<TData>
): DataTableColumn<TData> {
  return buildDataColumn(options, { sortable: false })
}