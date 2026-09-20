"use client"

import { useParams } from "next/navigation"
import { FileText } from "lucide-react"

import { useDocType } from "@/features/doc-type/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewDocTypePage() {
  const params = useParams<{ id: string }>()
  const { docType, isLoading, error } = useDocType(params?.id)

  const config: EntityDetailViewConfig = {
    item: docType,
    isLoading,
    error,
    entityName: "doc type",
    icon: <FileText className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.docType,
    titleField: "title",
    fields: [
      { label: "Title", value: docType?.title },
      { label: "Deskripsi", value: docType?.description?.trim() ? docType.description : "—" },
    ],
  }

  return <EntityDetailView config={config} />
}
