"use client"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Partner } from "@packages/validator"
import { Eye, Pencil, Building2, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { usePartners } from "../hooks/use-partners"

const baseUrl = ROUTES.partner

const columns: DataTableColumn<Partner>[] = [
  ColumnSortDataTable<Partner>({
    accessorKey: "name",
    label: "Nama",
  }),
  ColumnSortDataTable<Partner>({
    accessorKey: "type",
    label: "Tipe",
  }),
  ColumnSortDataTable<Partner>({
    accessorKey: "description",
    label: "Deskripsi",
  }),
  ColumnSortDataTable<Partner>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<Partner>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataPartner() {
  const router = useRouter()
  const { partners, isLoading, error, deletePartner } = usePartners()

  async function handleDelete(partner: Partner) {
    try {
      await deletePartner(partner)
      toast.add({
        type: "success",
        title: "Partner dihapus",
        description: `Partner "${partner.name}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus partner",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Partner>
        data={partners}
        columns={columns}
        getRowId={(partner) => partner.id}
        getRowLabel={(partner) => partner.name}
        entityName="partner"
        entityNamePlural="partners"
        title="Partners"
        icon={
          <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${partners.length} ${
          partners.length === 1 ? "partner" : "partners"
        } in your workspace`}
        searchColumnId={["name", "type", "description"]}
        searchPlaceholder="Search partners..."
        columnLabels={{
          name: "Nama",
          type: "Tipe",
          description: "Deskripsi",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat partners..."
            : (error ?? "No partners match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Partner",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(partner) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${partner.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${partner.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(partner),
          },
        ]}
      />
    </section>
  )
}