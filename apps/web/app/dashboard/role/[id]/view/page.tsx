"use client"

import { useParams } from "next/navigation"
import { Shield } from "lucide-react"

import { useRole } from "@/features/role/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewRolePage() {
  const params = useParams<{ id: string }>()
  const { role, isLoading, error } = useRole(params?.id)

  const config: EntityDetailViewConfig = {
    item: role,
    isLoading,
    error,
    entityName: "role",
    icon: <Shield className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.role,
    titleField: "title",
    fields: [
      { label: "Nama", value: role?.title },
      { label: "Deskripsi", value: role?.description?.trim() ? role.description : "—" },
      { label: "Jumlah User", value: role?.userCount ?? 0 },
    ],
  }

  return <EntityDetailView config={config} />
}
