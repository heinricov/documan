"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Box } from "@packages/validator"
import { Archive } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useBoxes } from "../hooks/use-boxes"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Box>[] = [
  ColumnSortDataTable<Box>({ accessorKey: "noBox", label: "No Box" }),
  ColumnSortDataTable<Box>({ accessorKey: "title", label: "Title" }),
  ColumnSortDataTable<Box>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<Box>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Box>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataBox() {
  const router = useRouter()
  const { boxes, isLoading, error, deleteBox } = useBoxes()

  const config: EntityTableConfig<Box> = useMemo(() => ({
    items: boxes,
    isLoading,
    error,
    removeItem: deleteBox,
    columns,
    getRowId: (b) => b.id,
    getRowLabel: (b) => b.noBox,
    entityName: "Box",
    entityNamePlural: "boxes",
    title: "Boxes",
    icon: <Archive className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${boxes.length} ${boxes.length === 1 ? "box" : "boxes"} in your workspace`,
    searchColumnId: ["noBox", "title", "description"],
    searchPlaceholder: "Search boxes...",
    columnLabels: { noBox: "No Box", title: "Title", description: "Deskripsi", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat boxes..." : (error ?? "No boxes match your search."),
    primaryAction: { title: "New Box", onClick: () => router.push(`${ROUTES.box}/add`) },
    rowActions: (box) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.box}/${box.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.box}/${box.id}/view`) },
    ],
  }), [boxes, isLoading, error, deleteBox, router])

  return <EntityTable config={config} />
}
