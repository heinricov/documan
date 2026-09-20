"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { DocType } from "@packages/validator"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useDocTypes } from "../hooks/use-doc-types"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<DocType>[] = [
  ColumnSortDataTable<DocType>({ accessorKey: "title", label: "Title" }),
  ColumnSortDataTable<DocType>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<DocType>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<DocType>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataDocType() {
  const router = useRouter()
  const { docTypes, isLoading, error, deleteDocType } = useDocTypes()

  const config: EntityTableConfig<DocType> = useMemo(() => ({
    items: docTypes,
    isLoading,
    error,
    removeItem: deleteDocType,
    columns,
    getRowId: (d) => d.id,
    getRowLabel: (d) => d.title,
    entityName: "Doc Type",
    entityNamePlural: "doc types",
    title: "Doc Types",
    icon: <FileText className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${docTypes.length} ${docTypes.length === 1 ? "doc type" : "doc types"} in your workspace`,
    searchColumnId: ["title", "description"],
    searchPlaceholder: "Search doc types...",
    columnLabels: { title: "Title", description: "Deskripsi", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat doc types..." : (error ?? "No doc types match your search."),
    primaryAction: { title: "New Doc Type", onClick: () => router.push(`${ROUTES.docType}/add`) },
    rowActions: (docType) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.docType}/${docType.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.docType}/${docType.id}/view`) },
    ],
  }), [docTypes, isLoading, error, deleteDocType, router])

  return <EntityTable config={config} />
}
