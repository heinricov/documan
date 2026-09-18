"use client"

import { useEffect, useState } from "react"
import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { User, Role } from "@packages/validator"
import { Eye, Pencil, Users, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import { useUsers } from "../hooks/use-users"

const baseUrl = ROUTES.user

const columns: DataTableColumn<User>[] = [
  ColumnSortDataTable<User>({
    accessorKey: "username",
    label: "Username",
  }),
  ColumnSortDataTable<User>({
    accessorKey: "email",
    label: "Email",
  }),
  ColumnSortDataTable<User>({
    accessorKey: "roleId",
    label: "Role",
  }),
  ColumnSortDataTable<User>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
  ColumnSortDataTable<User>({
    accessorKey: "updatedAt",
    label: "Updated",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function TableDataUser() {
  const router = useRouter()
  const { users, isLoading, error, deleteUser } = useUsers()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    let active = true

    async function loadRoles() {
      try {
        const data = await api.resources.roles.list({ limit: 100 })
        if (active) setRoles(data)
      } catch {
        // silently fail
      }
    }

    void loadRoles()

    return () => {
      active = false
    }
  }, [])

  const roleMap = new Map(roles.map((r) => [r.id, r.title]))

  const enrichedUsers = users.map((user) => ({
    ...user,
    roleId: roleMap.get(userRoleId(user)) ?? userRoleId(user),
  }))

  async function handleDelete(user: User) {
    try {
      await deleteUser(user)
      toast.add({
        type: "success",
        title: "User dihapus",
        description: `User "${user.username}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Gagal menghapus user",
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<User>
        data={enrichedUsers as unknown as User[]}
        columns={columns}
        getRowId={(user) => user.id}
        getRowLabel={(user) => user.username}
        entityName="user"
        entityNamePlural="users"
        title="Users"
        icon={
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${users.length} ${
          users.length === 1 ? "user" : "users"
        } in your workspace`}
        searchColumnId={["username", "email"]}
        searchPlaceholder="Search users..."
        columnLabels={{
          username: "Username",
          email: "Email",
          roleId: "Role",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage={
          isLoading
            ? "Memuat users..."
            : (error ?? "No users match your search.")
        }
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New User",
          onClick: () => router.push(`${baseUrl}/add`),
        }}
        rowActions={(user) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${user.id}/edit`),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => router.push(`${baseUrl}/${user.id}/view`),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            variant: "destructive",
            separatorBefore: true,
            onClick: () => void handleDelete(user),
          },
        ]}
      />
    </section>
  )
}

function userRoleId(user: User): string {
  return (user as unknown as { roleId?: string }).roleId ?? ""
}
