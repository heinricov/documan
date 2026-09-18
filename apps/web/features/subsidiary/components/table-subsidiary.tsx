"use client"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Subsidiary } from "@packages/validator"
import { Eye, Pencil, Building2, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { useSubsidiaries } from "../hooks/use-subsidiaries"

const baseUrl = ROUTES.subsidiary

const columns: DataTableColumn<Subsidiary>[] = [
  ColumnSortDataTable<Subsidiary>({
    accessorKey: "title",
    label: "Title",
  }),
  ColumnSortDataTable<Subsidiary>({
    accessorKey: "name",
    label: "Nama",
  }),
  ColumnSortDataTable<Subsidiary>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<Subsidiary>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataSubsidiary() {
  const router = useRouter()
  const { subsidiaries, isLoading, error, deleteSubsidiary } = useSubsidiaries()

  async function handleDelete(subsidiary: Subsidiary) {
    try {
      await deleteSubsidiary(subsidiary)
      toast.add({
        type: "success",
        title: "Subsidiary dihapus",
        description: `Subsidiary "${subsidiary.title}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus subsidiary",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Subsidiary>
        data={subsidiaries}
        columns={columns}
        getRowId={(subsidiary) => subsidiary.id}
        getRowLabel={(subsidiary) => subsidiary.title}
        entityName="subsidiary"
        entityNamePlural="subsidiaries"
        title="Subsidiaries"
        icon={
          <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${subsidiaries.length} ${
          subsidiaries.length === 1 ? "subsidiary" : "subsidiaries"
        } in your workspace`}
        searchColumnId={["title", "name"]}
        searchPlaceholder="Search subsidiaries..."
        columnLabels={{
          title: "Title",
          name: "Nama",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat subsidiaries..."
            : (error ?? "No subsidiaries match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Subsidiary",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(subsidiary) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${subsidiary.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${subsidiary.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(subsidiary),
          },
        ]}
      />
    </section>
  )
}