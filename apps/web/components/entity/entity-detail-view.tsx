"use client"

import { type ReactNode } from "react"
import { Button } from "@packages/ui/components/button"
import { Pencil, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/format"

export interface DetailField {
  label: string
  value: ReactNode
  /** If true, render as mono font (for IDs) */
  mono?: boolean
}

export interface EntityDetailViewConfig {
  /** Entity data */
  item: Record<string, unknown> | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Entity name (lowercase) — e.g. "role" */
  entityName: string
  /** Icon component */
  icon: ReactNode
  /** Base URL for navigation */
  baseUrl: string
  /** Field rows to display */
  fields: DetailField[]
  /** The entity's primary display field (shown as title) */
  titleField: string
}

export function EntityDetailView({ config }: { config: EntityDetailViewConfig }) {
  const router = useRouter()
  const { item, isLoading, error, entityName, icon, baseUrl, fields, titleField } = config

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat {entityName}...</p>
      </section>
    )
  }

  if (error || !item) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} tidak ditemukan.`}
        </p>
        <Button type="button" variant="outline" onClick={() => router.push(baseUrl)}>
          Kembali ke daftar {entityName}
        </Button>
      </section>
    )
  }

  const title = String(item[titleField] ?? "")

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
              <span className="size-4 text-muted-foreground">{icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Detail {entityName}</p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(baseUrl)}>
              <ArrowLeft aria-hidden="true" />
              Kembali
            </Button>
            <Button type="button" onClick={() => router.push(`${baseUrl}/${item.id}/edit`)}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <dl className="divide-y">
            {fields.map((field) => (
              <div key={field.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
                <dd className={`text-sm sm:col-span-2 ${field.mono ? "font-mono text-xs break-all" : ""}`}>
                  {field.value ?? "—"}
                </dd>
              </div>
            ))}

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs break-all sm:col-span-2">{String(item.id)}</dd>
            </div>

            {typeof item.createdAt === "string" && (
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Dibuat</dt>
                <dd className="text-sm sm:col-span-2">{formatDate(item.createdAt)}</dd>
              </div>
            )}

            {typeof item.updatedAt === "string" && (
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Diperbarui</dt>
                <dd className="text-sm sm:col-span-2">{formatDate(item.updatedAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  )
}
