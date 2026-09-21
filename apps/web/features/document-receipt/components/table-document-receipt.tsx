"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { DocumentReceipt } from "@packages/validator"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useDocumentReceipts } from "../hooks/use-document-receipts"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<DocumentReceipt>[] = [
  ColumnSortDataTable<DocumentReceipt>({ accessorKey: "title", label: "Title" }),
  ColumnSortDataTable<DocumentReceipt>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<DocumentReceipt>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<DocumentReceipt>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataDocumentReceipt() {
  const router = useRouter()
  const { documentReceipts, isLoading, error, deleteDocumentReceipt } = useDocumentReceipts()

  const config: EntityTableConfig<DocumentReceipt> = useMemo(
    () => ({
      items: documentReceipts,
      isLoading,
      error,
      removeItem: deleteDocumentReceipt,
      columns,
      getRowId: (dr) => dr.id,
      getRowLabel: (dr) => dr.title,
      entityName: "Document Receipt",
      entityNamePlural: "document receipts",
      title: "Document Receipts",
      icon: <FileText className="size-4 text-muted-foreground" aria-hidden="true" />,
      description: `${documentReceipts.length} ${documentReceipts.length === 1 ? "document receipt" : "document receipts"} in your workspace`,
      searchColumnId: ["title", "description"],
      searchPlaceholder: "Search document receipts...",
      columnLabels: {
        title: "Title",
        description: "Deskripsi",
        createdAt: "Created",
        updatedAt: "Updated",
      },
      noResultsMessage: isLoading
        ? "Memuat document receipts..."
        : (error ?? "No document receipts match your search."),
      primaryAction: {
        title: "New Document Receipt",
        onClick: () => router.push(`${ROUTES.documentReceipt}/add`),
      },
      rowActions: (dr) => [
        { label: "View Detail", onClick: () => router.push(`${ROUTES.documentReceipt}/${dr.id}/document-receipt-detail`) },
        { label: "Edit", onClick: () => router.push(`${ROUTES.documentReceipt}/${dr.id}/edit`) },
        { label: "View", onClick: () => router.push(`${ROUTES.documentReceipt}/${dr.id}/view`) },
      ],
    }),
    [documentReceipts, isLoading, error, deleteDocumentReceipt, router]
  )

  return <EntityTable config={config} />
}
