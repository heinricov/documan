"use client"

import * as React from "react"

import { createClient, ApiError } from "@packages/client"

import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import { ColumnBasic } from "@packages/ui/table/column-basic"
import { Eye, Pencil, Shield, Trash } from "lucide-react"
import { redirect } from "next/navigation"

type Role = {
  id: string
  name: string
  description: string
  members: number
  createdAt: string
  updatedAt: string
}

const roles: Role[] = [
  {
    id: "r-01",
    name: "Admin",
    description: "Full access to everything",
    members: 3,
    createdAt: "2026-06-12",
    updatedAt: "2026-06-13",
  },
  {
    id: "r-02",
    name: "Editor",
    description: "Can create and edit content",
    members: 8,
    createdAt: "2026-06-10",
    updatedAt: "2026-06-11",
  },
  {
    id: "r-03",
    name: "Viewer",
    description: "Read-only access",
    members: 14,
    createdAt: "2026-06-08",
    updatedAt: "2026-06-09",
  },
  {
    id: "r-04",
    name: "Analyst",
    description: "Can view reports and exports",
    members: 5,
    createdAt: "2026-05-29",
    updatedAt: "2026-05-30",
  },
  {
    id: "r-05",
    name: "Billing Manager",
    description: "Manages invoices and plans",
    members: 2,
    createdAt: "2026-05-21",
    updatedAt: "2026-05-22",
  },
  {
    id: "r-06",
    name: "Guest",
    description: "Temporary access for external users",
    members: 9,
    createdAt: "2026-05-18",
    updatedAt: "2026-05-19",
  },
  {
    id: "r-07",
    name: "Archived Reviewer",
    description: "Legacy role from the old workspace",
    members: 1,
    createdAt: "2026-04-22",
    updatedAt: "2026-04-23",
  },
]

const columns: DataTableColumn<Role>[] = [
  ColumnSortDataTable<Role>({
    accessorKey: "name",
    label: "Role",
    subtitleKey: "description",
  }),
  ColumnBasic<Role>({
    accessorKey: "members",
    label: "Members",
    format: "number",
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
  const [roleList, setRoleList] = React.useState<Role[]>(roles)

  function handleRemove(rows: Role[]) {
    const ids = new Set(rows.map((row) => row.id))
    setRoleList((prev) => prev.filter((role) => !ids.has(role.id)))
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<Role>
        data={roleList}
        columns={columns}
        getRowId={(role) => role.id}
        getRowLabel={(role) => role.name}
        entityName="role"
        entityNamePlural="roles"
        title="Roles"
        icon={
          <Shield className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        description={`${roleList.length} ${
          roleList.length === 1 ? "role" : "roles"
        } managing access to your workspace`}
        searchColumnId={["name", "description"]}
        searchPlaceholder="Search roles..."
        columnLabels={{
          name: "Role",
          members: "Members",
          createdAt: "Created",
          updatedAt: "Updated",
        }}
        noResultsMessage="No roles match your search."
        initialSorting={[{ id: "createdAt", desc: true }]}
        primaryAction={{
          title: "New Role",
          onClick: () => redirect("/role/add"),
        }}
        rowActions={(role) => [
          {
            label: "Edit",
            icon: <Pencil aria-hidden="true" />,
            onClick: () => console.log("edit"),
          },
          {
            label: "View",
            icon: <Eye aria-hidden="true" />,
            onClick: () => console.log("view"),
          },
          {
            label: "Hapus",
            icon: <Trash aria-hidden="true" />,
            onClick: () => handleRemove([role]),
          },
        ]}
      />
    </section>
  )
}
