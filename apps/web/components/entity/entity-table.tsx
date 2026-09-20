"use client"

import { type ReactNode } from "react"
import { toast } from "@packages/ui/components/toast"
import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { getErrorMessage } from "@/lib/errors"

export interface EntityTableConfig<T extends { id: string }> {
  /** Data from useEntityList */
  items: T[]
  isLoading: boolean
  error: string | null
  /** Function to delete an item */
  removeItem: (item: T) => Promise<void>
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Get row ID */
  getRowId: (item: T) => string
  /** Get row label for accessibility */
  getRowLabel: (item: T) => string
  /** Entity name (singular) */
  entityName: string
  /** Entity name (plural) */
  entityNamePlural: string
  /** Table title */
  title: string
  /** Icon component */
  icon: ReactNode
  /** Description text */
  description: string
  /** Column IDs to search */
  searchColumnId: string[]
  /** Search placeholder */
  searchPlaceholder: string
  /** Column label map */
  columnLabels: Record<string, string>
  /** Loading/error message */
  noResultsMessage: string
  /** Initial sorting */
  initialSorting?: { id: string; desc: boolean }[]
  /** Primary action (e.g. "New Box") */
  primaryAction?: { title: string; onClick: () => void }
  /** Row actions */
  rowActions?: (item: T) => Array<{
    label: string
    icon?: ReactNode
    variant?: "default" | "destructive"
    separatorBefore?: boolean
    onClick: () => void
  }>
}

export function EntityTable<T extends { id: string }>({
  config,
}: {
  config: EntityTableConfig<T>
}) {
  const {
    items,
    isLoading,
    error,
    removeItem,
    columns,
    getRowId,
    getRowLabel,
    entityName,
    entityNamePlural,
    title,
    icon,
    description,
    searchColumnId,
    searchPlaceholder,
    columnLabels,
    noResultsMessage,
    initialSorting,
    primaryAction,
    rowActions,
  } = config

  async function handleDelete(item: T) {
    try {
      await removeItem(item)
      toast.add({
        type: "success",
        title: `${entityName} dihapus`,
        description: `${entityName} "${getRowLabel(item)}" berhasil dihapus.`,
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: `Gagal menghapus ${entityName.toLowerCase()}`,
        description: getErrorMessage(err, "Tidak dapat terhubung ke server."),
      })
    }
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <DataTable<T>
        data={items}
        columns={columns}
        getRowId={getRowId}
        getRowLabel={getRowLabel}
        entityName={entityName}
        entityNamePlural={entityNamePlural}
        title={title}
        icon={icon}
        description={description}
        searchColumnId={searchColumnId}
        searchPlaceholder={searchPlaceholder}
        columnLabels={columnLabels}
        noResultsMessage={noResultsMessage}
        initialSorting={initialSorting ?? [{ id: "createdAt", desc: true }]}
        primaryAction={primaryAction}
        rowActions={
          rowActions
            ? (item) => [
                ...(rowActions(item)),
                {
                  label: "Hapus",
                  icon: undefined,
                  variant: "destructive" as const,
                  separatorBefore: true,
                  onClick: () => void handleDelete(item),
                },
              ]
            : undefined
        }
      />
    </section>
  )
}
