"use client"

import { type ReactNode } from "react"
import { Button } from "@packages/ui/components/button"
import { useRouter } from "next/navigation"

export interface EntityEditPageConfig {
  /** Entity data */
  item: Record<string, unknown> | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Entity name (lowercase) — e.g. "role" */
  entityName: string
  /** Base URL for navigation */
  baseUrl: string
  /** The form component to render */
  children: ReactNode
}

export function EntityEditPage({ config }: { config: EntityEditPageConfig }) {
  const router = useRouter()
  const { item, isLoading, error, entityName, baseUrl, children } = config

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

  return <>{children}</>
}
