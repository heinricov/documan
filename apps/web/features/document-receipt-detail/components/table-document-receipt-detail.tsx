"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { DocumentReceiptDetail } from "@packages/validator"
import { FileSpreadsheet } from "lucide-react"
import { useRouter } from "next/navigation"

import { useDocumentReceiptDetails } from "../hooks/use-document-receipt-details"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<DocumentReceiptDetail>[] = [
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorDoc", label: "No Doc" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorFaktur", label: "No Faktur" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorPl", label: "No PL" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorDo", label: "No DO" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorInv", label: "No Invoice" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorPv", label: "No PV" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "nomorNota", label: "No Nota" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<DocumentReceiptDetail>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
]

export interface TableDataDocumentReceiptDetailProps {
  documentReceiptId?: string
}

export function TableDataDocumentReceiptDetail({ documentReceiptId }: TableDataDocumentReceiptDetailProps) {
  const router = useRouter()
  const { items, isLoading, error, deleteItem } = useDocumentReceiptDetails(documentReceiptId)

  const config: EntityTableConfig<DocumentReceiptDetail> = useMemo(
    () => ({
      items,
      isLoading,
      error,
      removeItem: deleteItem,
      columns,
      getRowId: (drd) => drd.id,
      getRowLabel: (drd) => drd.nomorDoc ?? drd.nomorFaktur ?? drd.id,
      entityName: "Document Receipt Detail",
      entityNamePlural: "document receipt details",
      title: "Document Receipt Details",
      icon: <FileSpreadsheet className="size-4 text-muted-foreground" aria-hidden="true" />,
      description: `${items.length} ${items.length === 1 ? "detail" : "details"} in receipt`,
      searchColumnId: ["nomorDoc", "nomorFaktur", "nomorPl", "nomorDo", "nomorInv", "nomorPv", "nomorNota", "description"],
      searchPlaceholder: "Search document receipt details...",
      columnLabels: {
        nomorDoc: "No Doc",
        nomorFaktur: "No Faktur",
        nomorPl: "No PL",
        nomorDo: "No DO",
        nomorInv: "No Invoice",
        nomorPv: "No PV",
        nomorNota: "No Nota",
        description: "Deskripsi",
        createdAt: "Created",
      },
      noResultsMessage: isLoading
        ? "Memuat document receipt details..."
        : (error ?? "No document receipt details match your search."),
      primaryAction: documentReceiptId
        ? {
            title: "New Detail",
            onClick: () => router.push(`/dashboard/document-receipt/${documentReceiptId}/document-receipt-detail/add`),
          }
        : undefined,
      rowActions: (drd) => [
        { label: "Edit", onClick: () => router.push(`/dashboard/document-receipt/${drd.documentReceiptId}/document-receipt-detail/${drd.id}/edit`) },
        { label: "View", onClick: () => router.push(`/dashboard/document-receipt/${drd.documentReceiptId}/document-receipt-detail/${drd.id}/view`) },
      ],
    }),
    [items, isLoading, error, deleteItem, router, documentReceiptId]
  )

  return <EntityTable config={config} />
}
