"use client"

import { useEffect, useState } from "react"
import {
  CreateDocumentReceiptSchema,
  UpdateDocumentReceiptSchema,
  type DocumentReceipt,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"
import type { Option } from "@packages/ui/form/field-select"

export type FormDocumentReceiptMode = "create" | "edit"

export interface FormDocumentReceiptProps {
  mode?: FormDocumentReceiptMode
  documentReceiptId?: string
  initialData?: Pick<
    DocumentReceipt,
    "title" | "description" | "userId" | "docTypeId" | "subsidiaryId" | "partnerId" | "boxId"
  >
}

export function FormDocumentReceipt({
  mode,
  documentReceiptId,
  initialData,
}: FormDocumentReceiptProps) {
  const [userOptions, setUserOptions] = useState<Option[]>([])
  const [docTypeOptions, setDocTypeOptions] = useState<Option[]>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<Option[]>([])
  const [partnerOptions, setPartnerOptions] = useState<Option[]>([])
  const [boxOptions, setBoxOptions] = useState<Option[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [users, docTypes, subsidiaries, partners, boxes] = await Promise.all([
          api.resources.users.list({ limit: 100 }),
          api.resources.docTypes.list({ limit: 100 }),
          api.resources.subsidiaries.list({ limit: 100 }),
          api.resources.partners.list({ limit: 100 }),
          api.resources.boxes.list({ limit: 100 }),
        ])

        if (!active) return

        setUserOptions(users.map((u) => ({ value: u.id, label: u.username })))
        setDocTypeOptions(docTypes.map((d) => ({ value: d.id, label: d.title })))
        setSubsidiaryOptions(subsidiaries.map((s) => ({ value: s.id, label: s.title })))
        setPartnerOptions(partners.map((p) => ({ value: p.id, label: p.name })))
        setBoxOptions(boxes.map((b) => ({ value: b.id, label: b.noBox })))
      } catch {
        // silently fail — options will be empty
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const config: EntityFormConfig = {
    entityName: "Document Receipt",
    entityNamePlural: "Document Receipts",
    baseUrl: ROUTES.documentReceipt,
    createSchema: CreateDocumentReceiptSchema,
    updateSchema: UpdateDocumentReceiptSchema,
    createFn: (data) =>
      api.resources.documentReceipts.create(
        data as {
          title: string
          description?: string | null
          userId: string
          docTypeId: string
          subsidiaryId: string
          partnerId: string
          boxId: string
        }
      ),
    updateFn: (id, data) =>
      api.resources.documentReceipts.update(
        id,
        data as {
          title?: string
          description?: string | null
          userId?: string
          docTypeId?: string
          subsidiaryId?: string
          partnerId?: string
          boxId?: string
        }
      ),
    fields: [
      {
        name: "title",
        label: "Title",
        description: "Judul document receipt",
        placeholder: "cth. Invoice Januari 2026",
        required: true,
      },
      {
        name: "description",
        label: "Deskripsi",
        description: "Penjelasan singkat (opsional)",
        placeholder: "cth. Dokumen invoice dari partner X",
        render: "textarea",
        maxLength: 200,
      },
      {
        name: "userId",
        label: "User",
        description: "User yang menangani",
        render: "select",
        options: userOptions,
        required: true,
      },
      {
        name: "docTypeId",
        label: "Doc Type",
        description: "Jenis dokumen",
        render: "select",
        options: docTypeOptions,
        required: true,
      },
      {
        name: "subsidiaryId",
        label: "Subsidiary",
        description: "Anak perusahaan terkait",
        render: "select",
        options: subsidiaryOptions,
        required: true,
      },
      {
        name: "partnerId",
        label: "Partner",
        description: "Partner terkait",
        render: "select",
        options: partnerOptions,
        required: true,
      },
      {
        name: "boxId",
        label: "Box",
        description: "Box penyimpanan",
        render: "select",
        options: boxOptions,
        required: true,
      },
    ],
  }

  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={documentReceiptId}
      initialData={initialData}
    />
  )
}
