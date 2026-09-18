"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormSubsidiary } from "@/features/subsidiary/components"
import { useSubsidiary } from "@/features/subsidiary/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.subsidiary

export default function EditSubsidiaryPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const subsidiaryId = params?.id

  const { subsidiary, isLoading, error } = useSubsidiary(subsidiaryId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat subsidiary...</p>
      </section>
    )
  }

  if (error || !subsidiary) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Subsidiary tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar subsidiary
        </Button>
      </section>
    )
  }

  return (
    <FormSubsidiary
      mode="edit"
      subsidiaryId={subsidiary.id}
      initialData={{
        title: subsidiary.title,
        name: subsidiary.name,
        logo: subsidiary.logo,
      }}
    />
  )
}