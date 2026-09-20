"use client"

import { useParams } from "next/navigation"
import { useSubsidiary } from "@/features/subsidiary/hooks"
import { FormSubsidiary } from "@/features/subsidiary/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditSubsidiaryPage() {
  const params = useParams<{ id: string }>()
  const { subsidiary, isLoading, error } = useSubsidiary(params?.id)

  const config: EntityEditPageConfig = {
    item: subsidiary,
    isLoading,
    error,
    entityName: "subsidiary",
    baseUrl: ROUTES.subsidiary,
    children: subsidiary ? (
      <FormSubsidiary mode="edit" subsidiaryId={subsidiary.id} initialData={{ title: subsidiary.title, name: subsidiary.name, logo: subsidiary.logo }} />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
