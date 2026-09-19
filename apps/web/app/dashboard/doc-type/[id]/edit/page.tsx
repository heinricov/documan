"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormDocType } from "@/features/doc-type/components"
import { useDocType } from "@/features/doc-type/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.docType

export default function EditDocTypePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const docTypeId = params?.id

  const { docType, isLoading, error } = useDocType(docTypeId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat doc type...</p>
      </section>
    )
  }

  if (error || !docType) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Doc type tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar doc type
        </Button>
      </section>
    )
  }

  return (
    <FormDocType
      mode="edit"
      docTypeId={docType.id}
      initialData={{
        title: docType.title,
        description: docType.description,
      }}
    />
  )
}