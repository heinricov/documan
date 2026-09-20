"use client"

import { useParams } from "next/navigation"
import { Archive } from "lucide-react"

import { useBox } from "@/features/box/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewBoxPage() {
  const params = useParams<{ id: string }>()
  const { box, isLoading, error } = useBox(params?.id)

  const config: EntityDetailViewConfig = {
    item: box,
    isLoading,
    error,
    entityName: "box",
    icon: <Archive className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.box,
    titleField: "noBox",
    fields: [
      { label: "No Box", value: box?.noBox },
      { label: "Title", value: box?.title?.trim() ? box.title : "—" },
      { label: "Deskripsi", value: box?.description?.trim() ? box.description : "—" },
    ],
  }

  return <EntityDetailView config={config} />
}
