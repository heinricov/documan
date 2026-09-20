"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormBox } from "@/features/box/components"
import { useBox } from "@/features/box/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.box

export default function EditBoxPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const boxId = params?.id

  const { box, isLoading, error } = useBox(boxId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat box...</p>
      </section>
    )
  }

  if (error || !box) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Box tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar box
        </Button>
      </section>
    )
  }

  return (
    <FormBox
      mode="edit"
      boxId={box.id}
      initialData={{
        noBox: box.noBox,
        title: box.title,
        description: box.description,
      }}
    />
  )
}
