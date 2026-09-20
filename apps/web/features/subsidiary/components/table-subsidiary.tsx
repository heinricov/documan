"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Subsidiary } from "@packages/validator"
import { Building } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { useSubsidiaries } from "../hooks/use-subsidiaries"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Subsidiary>[] = [
  ColumnSortDataTable<Subsidiary>({ accessorKey: "title", label: "Title" }),
  ColumnSortDataTable<Subsidiary>({ accessorKey: "name", label: "Nama" }),
  ColumnSortDataTable<Subsidiary>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Subsidiary>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataSubsidiary() {
  const router = useRouter()
  const { subsidiaries, isLoading, error, deleteSubsidiary } = useSubsidiaries()

  const config: EntityTableConfig<Subsidiary> = useMemo(() => ({
    items: subsidiaries,
    isLoading,
    error,
    removeItem: deleteSubsidiary,
    columns,
    getRowId: (s) => s.id,
    getRowLabel: (s) => s.title,
    entityName: "Subsidiary",
    entityNamePlural: "subsidiaries",
    title: "Subsidiaries",
    icon: <Building className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${subsidiaries.length} ${subsidiaries.length === 1 ? "subsidiary" : "subsidiaries"} in your workspace`,
    searchColumnId: ["title", "name"],
    searchPlaceholder: "Search subsidiaries...",
    columnLabels: { title: "Title", name: "Nama", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat subsidiaries..." : (error ?? "No subsidiaries match your search."),
    primaryAction: { title: "New Subsidiary", onClick: () => router.push(`${ROUTES.subsidiary}/add`) },
    rowActions: (sub) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.subsidiary}/${sub.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.subsidiary}/${sub.id}/view`) },
    ],
  }), [subsidiaries, isLoading, error, deleteSubsidiary, router])

  return <EntityTable config={config} />
}
