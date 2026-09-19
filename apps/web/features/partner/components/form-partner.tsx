"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"
import {
  CreatePartnerSchema,
  UpdatePartnerSchema,
  type Partner,
} from "@packages/validator"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.partner

export type FormPartnerMode = "create" | "edit"

export interface FormPartnerProps {
  mode?: FormPartnerMode
  partnerId?: string
  initialData?: Pick<Partner, "name" | "description" | "type">
}

export function FormPartner({
  mode = "create",
  partnerId,
  initialData,
}: FormPartnerProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    type?: string
  }>({})

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update Partner" : "Add Partner"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const name = (formData.get("name") as string)?.trim() ?? ""
          const rawDescription = (formData.get("description") as string)?.trim()
          const description =
            rawDescription && rawDescription.length > 0 ? rawDescription : null
          const type = (formData.get("type") as string)?.trim() ?? ""

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdatePartnerSchema : CreatePartnerSchema
          const parsed = schema.safeParse({ name, description, type })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (key === "name" || key === "description" || key === "type") {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !partnerId) {
            setFormError("ID partner tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && partnerId) {
              await api.resources.partners.update(partnerId, parsed.data)
              toast.add({
                type: "success",
                title: "Partner diperbarui",
                description: `Partner "${name}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.partners.create(
                parsed.data as { name: string; description?: string | null; type: string }
              )
              toast.add({
                type: "success",
                title: "Partner tersimpan",
                description: `Partner "${name}" berhasil dibuat.`,
              })
            }

            router.push(baseUrl)
            router.refresh()
          } catch (error) {
            setFormError(getErrorMessage(error))
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <FieldSetGroup
          legend={isEdit ? "Edit Partner" : "Partners"}
          description={
            isEdit
              ? "Perbarui data partner di bawah ini"
              : "Anda bisa menambahkan partner baru di sini"
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <FieldInput
            name="name"
            type="text"
            label="Nama"
            description="Nama partner (unik)"
            placeholder="cth. PT Sumber Jaya"
            required
            defaultValue={initialData?.name ?? ""}
            disabled={isLoading}
            error={errors.name}
          />

          <FieldTextArea
            name="description"
            label="Deskripsi"
            description="Penjelasan singkat partner ini (opsional)"
            placeholder="cth. Supplier utama bahan baku"
            defaultValue={initialData?.description ?? ""}
            disabled={isLoading}
            maxLength={200}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.description}
            </p>
          ) : null}

          <FieldInput
            name="type"
            type="text"
            label="Tipe"
            description="Kategori partner (cth. supplier, logistics, bank)"
            placeholder="cth. supplier"
            required
            defaultValue={initialData?.type ?? ""}
            disabled={isLoading}
            error={errors.type}
          />
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}