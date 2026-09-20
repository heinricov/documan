"use client"

import {
  CreatePartnerSchema,
  UpdatePartnerSchema,
  type Partner,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Partner",
  entityNamePlural: "Partners",
  baseUrl: ROUTES.partner,
  createSchema: CreatePartnerSchema,
  updateSchema: UpdatePartnerSchema,
  createFn: (data) =>
    api.resources.partners.create(
      data as { name: string; description?: string | null; type: string }
    ),
  updateFn: (id, data) => api.resources.partners.update(id, data as { name?: string; description?: string | null; type?: string }),
  fields: [
    {
      name: "name",
      label: "Nama",
      description: "Nama partner (unik)",
      placeholder: "cth. PT Sumber Jaya",
      required: true,
    },
    {
      name: "description",
      label: "Deskripsi",
      description: "Penjelasan singkat partner ini (opsional)",
      placeholder: "cth. Supplier utama bahan baku",
      render: "textarea",
      maxLength: 200,
    },
    {
      name: "type",
      label: "Tipe",
      description: "Kategori partner (cth. supplier, logistics, bank)",
      placeholder: "cth. supplier",
      required: true,
    },
  ],
}

export type FormPartnerMode = "create" | "edit"

export interface FormPartnerProps {
  mode?: FormPartnerMode
  partnerId?: string
  initialData?: Pick<Partner, "name" | "description" | "type">
}

export function FormPartner({ mode, partnerId, initialData }: FormPartnerProps) {
  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={partnerId}
      initialData={initialData}
    />
  )
}
