"use client"

import * as React from "react"

import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Role } from "@packages/validator"
import { Eye, Pencil, Shield, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

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
  const [roleList, setRoleList] = React.useState<Role[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function loadRoles() {
      try {
        const roles = await api.resources.roles.list({ limit: 100 })
        if (active) setRoleList(roles)
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadRoles()

    return () => {
      active = false
    }
  }, [])

  async function handleDelete(role: Role) {
    try {
      await api.resources.roles.remove(role.id)
      setRoleList((prev) => prev.filter((item) => item.id !== role.id))
      toast.add({
        type: "success",
        title: "Role dihapus",
        description: `Role "${role.title}" berhasil dihapus.`,
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Gagal menghapus role",
        description: getErrorMessage(error, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Role>
        data={roleList}
        columns={columns}
        getRowId={(role) => role.id}
        getRowLabel={(role) => role.title}
        entityName="role"
        entityNamePlural="roles"
        title="Roles"
        icon={
          <Shield className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${roleList.length} ${
          roleList.length === 1 ? "role" : "roles"
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
            : (loadError ?? "No roles match your search.")
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
