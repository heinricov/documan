"use client"

import { useParams } from "next/navigation"
import { Building2 } from "lucide-react"

import { usePartner } from "@/features/partner/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewPartnerPage() {
  const params = useParams<{ id: string }>()
  const { partner, isLoading, error } = usePartner(params?.id)

  const config: EntityDetailViewConfig = {
    item: partner,
    isLoading,
    error,
    entityName: "partner",
    icon: <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.partner,
    titleField: "name",
    fields: [
      { label: "Nama", value: partner?.name },
      { label: "Tipe", value: partner?.type },
      { label: "Deskripsi", value: partner?.description?.trim() ? partner.description : "—" },
    ],
  }

  return <EntityDetailView config={config} />
}
