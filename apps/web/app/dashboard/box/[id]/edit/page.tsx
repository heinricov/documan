"use client"

import { useParams } from "next/navigation"
import { useBox } from "@/features/box/hooks"
import { FormBox } from "@/features/box/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditBoxPage() {
  const params = useParams<{ id: string }>()
  const { box, isLoading, error } = useBox(params?.id)

  const config: EntityEditPageConfig = {
    item: box,
    isLoading,
    error,
    entityName: "box",
    baseUrl: ROUTES.box,
    children: box ? (
      <FormBox
        mode="edit"
        boxId={box.id}
        initialData={{
          noBox: box.noBox,
          title: box.title,
          description: box.description,
        }}
      />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
