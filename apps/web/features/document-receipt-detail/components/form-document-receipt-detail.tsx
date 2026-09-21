"use client"

import { useEffect, useState } from "react"
import {
  CreateDocumentReceiptDetailSchema,
  UpdateDocumentReceiptDetailSchema,
  type DocumentReceiptDetail,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"
import type { Option } from "@packages/ui/form/field-select"

export type FormDocumentReceiptDetailMode = "create" | "edit"

export interface FormDocumentReceiptDetailProps {
  mode?: FormDocumentReceiptDetailMode
  documentReceiptDetailId?: string
  initialData?: Pick<
    DocumentReceiptDetail,
    | "documentReceiptId" | "docTypeId" | "subsidiaryId" | "partnerId"
    | "nomorDoc" | "nomorFaktur" | "nomorPl" | "nomorDo"
    | "nomorInv" | "nomorPv" | "nomorNota" | "description"
  >
}

export function FormDocumentReceiptDetail({
  mode,
  documentReceiptDetailId,
  initialData,
}: FormDocumentReceiptDetailProps) {
  const [docReceiptOptions, setDocReceiptOptions] = useState<Option[]>([])
  const [docTypeOptions, setDocTypeOptions] = useState<Option[]>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<Option[]>([])
  const [partnerOptions, setPartnerOptions] = useState<Option[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [docReceipts, docTypes, subsidiaries, partners] = await Promise.all([
          api.resources.documentReceipts.list({ limit: 100 }),
          api.resources.docTypes.list({ limit: 100 }),
          api.resources.subsidiaries.list({ limit: 100 }),
          api.resources.partners.list({ limit: 100 }),
        ])

        if (!active) return

        setDocReceiptOptions(docReceipts.map((dr) => ({ value: dr.id, label: dr.title })))
        setDocTypeOptions(docTypes.map((d) => ({ value: d.id, label: d.title })))
        setSubsidiaryOptions(subsidiaries.map((s) => ({ value: s.id, label: s.title })))
        setPartnerOptions(partners.map((p) => ({ value: p.id, label: p.name })))
      } catch {
        // silently fail
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const config: EntityFormConfig = {
    entityName: "Document Receipt Detail",
    entityNamePlural: "Document Receipt Details",
    baseUrl: ROUTES.documentReceiptDetail,
    createSchema: CreateDocumentReceiptDetailSchema,
    updateSchema: UpdateDocumentReceiptDetailSchema,
    createFn: (data) =>
      api.resources.documentReceiptDetails.create(data as Parameters<typeof api.resources.documentReceiptDetails.create>[0]),
    updateFn: (id, data) =>
      api.resources.documentReceiptDetails.update(id, data as Parameters<typeof api.resources.documentReceiptDetails.update>[1]),
    fields: [
      {
        name: "documentReceiptId",
        label: "Document Receipt",
        description: "Document receipt induk",
        render: "select",
        options: docReceiptOptions,
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
        name: "nomorDoc",
        label: "Nomor Dokumen",
        description: "Nomor dokumen (opsional)",
        placeholder: "cth. DOC-001",
      },
      {
        name: "nomorFaktur",
        label: "Nomor Faktur",
        description: "Nomor faktur (opsional)",
        placeholder: "cth. FAK-001",
      },
      {
        name: "nomorPl",
        label: "Nomor PL",
        description: "Nomor PL (opsional)",
        placeholder: "cth. PL-001",
      },
      {
        name: "nomorDo",
        label: "Nomor DO",
        description: "Nomor DO (opsional)",
        placeholder: "cth. DO-001",
      },
      {
        name: "nomorInv",
        label: "Nomor Invoice",
        description: "Nomor invoice (opsional)",
        placeholder: "cth. INV-001",
      },
      {
        name: "nomorPv",
        label: "Nomor PV",
        description: "Nomor PV (opsional)",
        placeholder: "cth. PV-001",
      },
      {
        name: "nomorNota",
        label: "Nomor Nota",
        description: "Nomor nota (opsional)",
        placeholder: "cth. NOTA-001",
      },
      {
        name: "description",
        label: "Deskripsi",
        description: "Penjelasan singkat (opsional)",
        render: "textarea",
        maxLength: 200,
      },
    ],
  }

  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={documentReceiptDetailId}
      initialData={initialData}
    />
  )
}
