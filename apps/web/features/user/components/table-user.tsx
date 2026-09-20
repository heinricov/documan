"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { User } from "@packages/validator"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useUsers } from "../hooks/use-users"
import { useRoleTitleMap } from "@/lib/hooks"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

export function TableDataUser() {
  const router = useRouter()
  const { users, isLoading, error, deleteUser } = useUsers()
  const { getRoleTitle } = useRoleTitleMap()

  const enrichedUsers = useMemo(
    () => users.map((u) => ({ ...u, _roleTitle: getRoleTitle(u.roleId) })),
    [users, getRoleTitle]
  )

  const columns: DataTableColumn<(typeof enrichedUsers)[number]>[] = useMemo(() => [
    ColumnSortDataTable({ accessorKey: "username", label: "Username" }),
    ColumnSortDataTable({ accessorKey: "email", label: "Email" }),
    ColumnSortDataTable({ accessorKey: "_roleTitle", label: "Role" }),
    ColumnSortDataTable({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
    ColumnSortDataTable({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
  ], [])

  const config: EntityTableConfig<(typeof enrichedUsers)[number]> = useMemo(() => ({
    items: enrichedUsers,
    isLoading,
    error,
    removeItem: async (u) => { await deleteUser(u as User) },
    columns,
    getRowId: (u) => u.id,
    getRowLabel: (u) => u.username,
    entityName: "User",
    entityNamePlural: "users",
    title: "Users",
    icon: <Users className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${users.length} ${users.length === 1 ? "user" : "users"} in your workspace`,
    searchColumnId: ["username", "email"],
    searchPlaceholder: "Search users...",
    columnLabels: { username: "Username", email: "Email", _roleTitle: "Role", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat users..." : (error ?? "No users match your search."),
    primaryAction: { title: "New User", onClick: () => router.push(`${ROUTES.user}/add`) },
    rowActions: (user) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.user}/${user.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.user}/${user.id}/view`) },
    ],
  }), [enrichedUsers, isLoading, error, deleteUser, columns, users.length, router])

  return <EntityTable config={config} />
}
