"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormPartner } from "@/features/partner/components"
import { usePartner } from "@/features/partner/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.partner

export default function EditPartnerPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const partnerId = params?.id

  const { partner, isLoading, error } = usePartner(partnerId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat partner...</p>
      </section>
    )
  }

  if (error || !partner) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Partner tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar partner
        </Button>
      </section>
    )
  }

  return (
    <FormPartner
      mode="edit"
      partnerId={partner.id}
      initialData={{
        name: partner.name,
        description: partner.description,
        type: partner.type,
      }}
    />
  )
}