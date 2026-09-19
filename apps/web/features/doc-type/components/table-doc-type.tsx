"use client"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { DocType } from "@packages/validator"
import { Eye, Pencil, FileText, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { useDocTypes } from "../hooks/use-doc-types"

const baseUrl = ROUTES.docType

const columns: DataTableColumn<DocType>[] = [
  ColumnSortDataTable<DocType>({
    accessorKey: "title",
    label: "Title",
  }),
  ColumnSortDataTable<DocType>({
    accessorKey: "description",
    label: "Deskripsi",
  }),
  ColumnSortDataTable<DocType>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<DocType>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataDocType() {
  const router = useRouter()
  const { docTypes, isLoading, error, deleteDocType } = useDocTypes()

  async function handleDelete(docType: DocType) {
    try {
      await deleteDocType(docType)
      toast.add({
        type: "success",
        title: "Doc Type dihapus",
        description: `Doc Type "${docType.title}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus doc type",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<DocType>
        data={docTypes}
        columns={columns}
        getRowId={(docType) => docType.id}
        getRowLabel={(docType) => docType.title}
        entityName="doc type"
        entityNamePlural="doc types"
        title="Doc Types"
        icon={
          <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${docTypes.length} ${
          docTypes.length === 1 ? "doc type" : "doc types"
        } in your workspace`}
        searchColumnId={["title", "description"]}
        searchPlaceholder="Search doc types..."
        columnLabels={{
          title: "Title",
          description: "Deskripsi",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat doc types..."
            : (error ?? "No doc types match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Doc Type",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(docType) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${docType.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${docType.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(docType),
          },
        ]}
      />
    </section>
  )
}