"use client"

import { useParams } from "next/navigation"
import { usePartner } from "@/features/partner/hooks"
import { FormPartner } from "@/features/partner/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditPartnerPage() {
  const params = useParams<{ id: string }>()
  const { partner, isLoading, error } = usePartner(params?.id)

  const config: EntityEditPageConfig = {
    item: partner,
    isLoading,
    error,
    entityName: "partner",
    baseUrl: ROUTES.partner,
    children: partner ? (
      <FormPartner mode="edit" partnerId={partner.id} initialData={{ name: partner.name, description: partner.description, type: partner.type }} />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
