"use client"

import { useParams } from "next/navigation"
import { useDocType } from "@/features/doc-type/hooks"
import { FormDocType } from "@/features/doc-type/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditDocTypePage() {
  const params = useParams<{ id: string }>()
  const { docType, isLoading, error } = useDocType(params?.id)

  const config: EntityEditPageConfig = {
    item: docType,
    isLoading,
    error,
    entityName: "doc type",
    baseUrl: ROUTES.docType,
    children: docType ? (
      <FormDocType mode="edit" docTypeId={docType.id} initialData={{ title: docType.title, description: docType.description }} />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
