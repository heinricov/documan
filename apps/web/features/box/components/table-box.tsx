"use client"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Box } from "@packages/validator"
import { Eye, Pencil, Archive, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { useBoxes } from "../hooks/use-boxes"

const baseUrl = ROUTES.box

const columns: DataTableColumn<Box>[] = [
  ColumnSortDataTable<Box>({
    accessorKey: "noBox",
    label: "No Box",
  }),
  ColumnSortDataTable<Box>({
    accessorKey: "title",
    label: "Title",
  }),
  ColumnSortDataTable<Box>({
    accessorKey: "description",
    label: "Deskripsi",
  }),
  ColumnSortDataTable<Box>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<Box>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataBox() {
  const router = useRouter()
  const { boxes, isLoading, error, deleteBox } = useBoxes()

  async function handleDelete(box: Box) {
    try {
      await deleteBox(box)
      toast.add({
        type: "success",
        title: "Box dihapus",
        description: `Box "${box.noBox}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus box",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Box>
        data={boxes}
        columns={columns}
        getRowId={(box) => box.id}
        getRowLabel={(box) => box.noBox}
        entityName="box"
        entityNamePlural="boxes"
        title="Boxes"
        icon={
          <Archive className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${boxes.length} ${
          boxes.length === 1 ? "box" : "boxes"
        } in your workspace`}
        searchColumnId={["noBox", "title", "description"]}
        searchPlaceholder="Search boxes..."
        columnLabels={{
          noBox: "No Box",
          title: "Title",
          description: "Deskripsi",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat boxes..."
            : (error ?? "No boxes match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Box",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(box) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${box.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${box.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(box),
          },
        ]}
      />
    </section>
  )
}
