"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  type Role,
} from "@packages/validator/schemas/role"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { baseUrl } from "./table-role"

export type FormRoleMode = "create" | "edit"

export interface FormRoleProps {
  mode?: FormRoleMode
  roleId?: string
  initialData?: Pick<Role, "title" | "description">
}

export function FormRole({
  mode = "create",
  roleId,
  initialData,
}: FormRoleProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
  }>({})

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update Role" : "Add Role"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const title = (formData.get("title") as string)?.trim() ?? ""
          const rawDescription = (formData.get("description") as string)?.trim()
          const description =
            rawDescription && rawDescription.length > 0 ? rawDescription : null

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdateRoleSchema : CreateRoleSchema
          const parsed = schema.safeParse({ title, description })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (key === "title" || key === "description") {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !roleId) {
            setFormError("ID role tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && roleId) {
              await api.resources.roles.update(roleId, parsed.data)
              toast.add({
                type: "success",
                title: "Role diperbarui",
                description: `Role "${title}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.roles.create(
                parsed.data as { title: string; description?: string | null }
              )
              toast.add({
                type: "success",
                title: "Role tersimpan",
                description: `Role "${title}" berhasil dibuat.`,
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
          legend={isEdit ? "Edit Role" : "Roles"}
          description={
            isEdit
              ? "Perbarui data role di bawah ini"
              : "Anda bisa menambahkan role baru di sini"
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <FieldInput
            name="title"
            type="text"
            label="Nama Role"
            description="Nama unik role (case-insensitive)"
            placeholder="cth. Editor"
            required
            defaultValue={initialData?.title ?? ""}
            disabled={isLoading}
            error={errors.title}
          />

          <FieldTextArea
            name="description"
            label="Deskripsi Role"
            description="Penjelasan singkat peran ini (opsional)"
            placeholder="cth. Mengelola dokumen organisasi"
            defaultValue={initialData?.description ?? ""}
            disabled={isLoading}
            maxLength={200}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.description}
            </p>
          ) : null}
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}
