"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Role } from "@packages/validator"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useRoles } from "../hooks/use-roles"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Role>[] = [
  ColumnSortDataTable<Role>({ accessorKey: "title", label: "Role", subtitleKey: "description" }),
  ColumnSortDataTable<Role>({ accessorKey: "userCount", label: "Users", align: "end" }),
  ColumnSortDataTable<Role>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Role>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataRole() {
  const router = useRouter()
  const { roles, isLoading, error, deleteRole } = useRoles()

  const config: EntityTableConfig<Role> = useMemo(() => ({
    items: roles,
    isLoading,
    error,
    removeItem: deleteRole,
    columns,
    getRowId: (r) => r.id,
    getRowLabel: (r) => r.title,
    entityName: "Role",
    entityNamePlural: "roles",
    title: "Roles",
    icon: <Shield className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${roles.length} ${roles.length === 1 ? "role" : "roles"} managing access to your workspace`,
    searchColumnId: ["title", "description"],
    searchPlaceholder: "Search roles...",
    columnLabels: { title: "Role", userCount: "Users", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat roles..." : (error ?? "No roles match your search."),
    primaryAction: { title: "New Role", onClick: () => router.push(`${ROUTES.role}/add`) },
    rowActions: (role) => [
      { label: "Edit", icon: undefined, onClick: () => router.push(`${ROUTES.role}/${role.id}/edit`) },
      { label: "View", icon: undefined, onClick: () => router.push(`${ROUTES.role}/${role.id}/view`) },
    ],
  }), [roles, isLoading, error, deleteRole, router])

  return <EntityTable config={config} />
}
