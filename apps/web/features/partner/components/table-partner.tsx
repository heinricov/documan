"use client"

import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Partner } from "@packages/validator"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { usePartners } from "../hooks/use-partners"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Partner>[] = [
  ColumnSortDataTable<Partner>({ accessorKey: "name", label: "Nama" }),
  ColumnSortDataTable<Partner>({ accessorKey: "type", label: "Tipe" }),
  ColumnSortDataTable<Partner>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<Partner>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Partner>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataPartner() {
  const router = useRouter()
  const { partners, isLoading, error, deletePartner } = usePartners()

  const config: EntityTableConfig<Partner> = useMemo(() => ({
    items: partners,
    isLoading,
    error,
    removeItem: deletePartner,
    columns,
    getRowId: (p) => p.id,
    getRowLabel: (p) => p.name,
    entityName: "Partner",
    entityNamePlural: "partners",
    title: "Partners",
    icon: <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />,
    description: `${partners.length} ${partners.length === 1 ? "partner" : "partners"} in your workspace`,
    searchColumnId: ["name", "type", "description"],
    searchPlaceholder: "Search partners...",
    columnLabels: { name: "Nama", type: "Tipe", description: "Deskripsi", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat partners..." : (error ?? "No partners match your search."),
    primaryAction: { title: "New Partner", onClick: () => router.push(`${ROUTES.partner}/add`) },
    rowActions: (partner) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.partner}/${partner.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.partner}/${partner.id}/view`) },
    ],
  }), [partners, isLoading, error, deletePartner, router])

  return <EntityTable config={config} />
}
