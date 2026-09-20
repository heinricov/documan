"use client"

import { useParams } from "next/navigation"
import { Building } from "lucide-react"

import { useSubsidiary } from "@/features/subsidiary/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewSubsidiaryPage() {
  const params = useParams<{ id: string }>()
  const { subsidiary, isLoading, error } = useSubsidiary(params?.id)

  const config: EntityDetailViewConfig = {
    item: subsidiary,
    isLoading,
    error,
    entityName: "subsidiary",
    icon: <Building className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.subsidiary,
    titleField: "title",
    fields: [
      { label: "Title", value: subsidiary?.title },
      { label: "Nama Lengkap", value: subsidiary?.name },
      {
        label: "Logo",
        value: subsidiary?.logo?.trim() ? (
          <div className="flex items-center gap-3">
            <img src={subsidiary.logo} alt={`${subsidiary.title} logo`} className="h-10 w-10 rounded border object-contain" />
            <span className="font-mono text-xs break-all">{subsidiary.logo}</span>
          </div>
        ) : "—",
      },
    ],
  }

  return <EntityDetailView config={config} />
}
