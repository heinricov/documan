"use client"

import { useParams } from "next/navigation"
import { useRole } from "@/features/role/hooks"
import { FormRole } from "@/features/role/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditRolePage() {
  const params = useParams<{ id: string }>()
  const { role, isLoading, error } = useRole(params?.id)

  const config: EntityEditPageConfig = {
    item: role,
    isLoading,
    error,
    entityName: "role",
    baseUrl: ROUTES.role,
    children: role ? (
      <FormRole mode="edit" roleId={role.id} initialData={{ title: role.title, description: role.description }} />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
