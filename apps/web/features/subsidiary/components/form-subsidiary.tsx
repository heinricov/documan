"use client"

import {
  CreateSubsidiarySchema,
  UpdateSubsidiarySchema,
  type Subsidiary,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Subsidiary",
  entityNamePlural: "Subsidiaries",
  baseUrl: ROUTES.subsidiary,
  createSchema: CreateSubsidiarySchema,
  updateSchema: UpdateSubsidiarySchema,
  createFn: (data) =>
    api.resources.subsidiaries.create(
      data as { title: string; name: string; logo?: string | null }
    ),
  updateFn: (id, data) => api.resources.subsidiaries.update(id, data as { title?: string; name?: string; logo?: string | null }),
  fields: [
    {
      name: "title",
      label: "Title",
      description: "Singkatan atau nama pendek subsidiary",
      placeholder: "cth. PTMB",
      required: true,
    },
    {
      name: "name",
      label: "Nama Lengkap",
      description: "Nama lengkap subsidiary",
      placeholder: "cth. PT Maju Bersama",
      required: true,
    },
    {
      name: "logo",
      label: "Logo URL",
      description: "URL logo subsidiary (opsional)",
      placeholder: "cth. https://example.com/logo.png",
    },
  ],
}

export type FormSubsidiaryMode = "create" | "edit"

export interface FormSubsidiaryProps {
  mode?: FormSubsidiaryMode
  subsidiaryId?: string
  initialData?: Pick<Subsidiary, "title" | "name" | "logo">
}

export function FormSubsidiary({ mode, subsidiaryId, initialData }: FormSubsidiaryProps) {
  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={subsidiaryId}
      initialData={initialData}
    />
  )
}
