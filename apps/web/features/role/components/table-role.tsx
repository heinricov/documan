"use client"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Role } from "@packages/validator"
import { Eye, Pencil, Shield, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { useRoles } from "../hooks/use-roles"

const baseUrl = ROUTES.role

const columns: DataTableColumn<Role>[] = [
  ColumnSortDataTable<Role>({
    accessorKey: "title",
    label: "Role",
    subtitleKey: "description",
  }),
  ColumnSortDataTable<Role>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<Role>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataRole() {
  const router = useRouter()
  const { roles, isLoading, error, deleteRole } = useRoles()

  async function handleDelete(role: Role) {
    try {
      await deleteRole(role)
      toast.add({
        type: "success",
        title: "Role dihapus",
        description: `Role "${role.title}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus role",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Role>
        data={roles}
        columns={columns}
        getRowId={(role) => role.id}
        getRowLabel={(role) => role.title}
        entityName="role"
        entityNamePlural="roles"
        title="Roles"
        icon={
          <Shield className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${roles.length} ${
          roles.length === 1 ? "role" : "roles"
        } managing access to your workspace`}
        searchColumnId={["title", "description"]}
        searchPlaceholder="Search roles..."
        columnLabels={{
          title: "Role",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat roles..."
            : (error ?? "No roles match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Role",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(role) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${role.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${role.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(role),
          },
        ]}
      />
    </section>
  )
}
