"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { FieldSelect, type Option } from "@packages/ui/form/field-select"
import { toast } from "@packages/ui/components/toast"
import { Pencil, ArrowLeft } from "lucide-react"

import { getErrorMessage } from "@/lib/errors"
import { mapSchemaErrors } from "@/lib/validation"
import { formatDate } from "@/lib/format"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeParseable = { safeParse: (data: any) => any }

export interface EntityFormField {
  name: string
  type?: "text" | "email" | "password" | "number"
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  maxLength?: number
  /** Override default field rendering */
  render?: "input" | "textarea" | "select"
  /** Options for select field (required when render === "select") */
  options?: Option[]
  /** Render custom ReactNode instead of default field (for view mode) */
  customRender?: (value: unknown) => ReactNode
}

export interface EntityFormConfig {
  /** e.g. "Role", "Doc Type", "Box" */
  entityName: string
  /** e.g. "Roles", "Doc Types", "Boxes" */
  entityNamePlural: string
  /** ROUTES.xxx */
  baseUrl: string
  /** Zod schema for create */
  createSchema: SafeParseable
  /** Zod schema for update */
  updateSchema: SafeParseable
  /** Create API call */
  createFn: (data: unknown) => Promise<unknown>
  /** Update API call */
  updateFn: (id: string, data: unknown) => Promise<unknown>
  /** Field definitions */
  fields: EntityFormField[]
  /** Extra fields to render after standard fields */
  extraFields?: ReactNode
  /** Extract data from FormData before validation */
  extractData?: (formData: FormData) => Record<string, unknown>
}

export interface EntityFormProps {
  config: EntityFormConfig
  mode?: "create" | "edit" | "view"
  entityId?: string
  initialData?: Record<string, unknown>
}

function defaultExtractData(
  formData: FormData,
  fields: EntityFormField[]
): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const field of fields) {
    const raw = (formData.get(field.name) as string)?.trim() ?? ""
    if (field.type === "number") {
      data[field.name] = raw ? Number(raw) : undefined
    } else if (field.required) {
      data[field.name] = raw
    } else {
      data[field.name] = raw.length > 0 ? raw : null
    }
  }
  return data
}

export function EntityForm({
  config,
  mode = "create",
  entityId,
  initialData,
}: EntityFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"
  const {
    entityName,
    entityNamePlural,
    baseUrl,
    createSchema,
    updateSchema,
    createFn,
    updateFn,
    fields,
    extraFields,
    extractData,
  } = config

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fieldNames = fields.map((f) => f.name)
  const isView = mode === "view"
  const firstFieldName = fields[0]?.name

  if (isView) {
    return (
      <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
        <div className="mx-auto w-full max-w-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {firstFieldName && initialData?.[firstFieldName] != null
                  ? String(initialData[firstFieldName])
                  : entityName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Detail {entityName}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={() => router.push(baseUrl)}>
                <ArrowLeft aria-hidden="true" />
                Kembali
              </Button>
              {entityId && (
                <Button type="button" onClick={() => router.push(`${baseUrl}/${entityId}/edit`)}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <FieldSetGroup
                legend={`${entityName} Details`}
                description="Data hanya untuk dilihat, tidak bisa diubah dari sini"
              >
                {fields.map((field) => {
                  const value = initialData?.[field.name]
                  const displayValue =
                    field.customRender
                      ? field.customRender(value)
                      : value != null
                        ? String(value)
                        : "—"

                  return (
                    <div key={field.name} className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </dt>
                      <dd className="text-sm sm:col-span-2">{displayValue}</dd>
                    </div>
                  )
                })}

                {entityId && (
                  <div className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                    <dd className="font-mono text-xs break-all sm:col-span-2">{entityId}</dd>
                  </div>
                )}

                {typeof initialData?.createdAt === "string" && (
                  <div className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Dibuat</dt>
                    <dd className="text-sm sm:col-span-2">{formatDate(initialData.createdAt)}</dd>
                  </div>
                )}

                {typeof initialData?.updatedAt === "string" && (
                  <div className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Diperbarui</dt>
                    <dd className="text-sm sm:col-span-2">{formatDate(initialData.updatedAt)}</dd>
                  </div>
                )}
              </FieldSetGroup>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading
            ? "Menyimpan..."
            : isEdit
              ? `Update ${entityName}`
              : `Add ${entityName}`
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const rawData = extractData
            ? extractData(formData)
            : defaultExtractData(formData, fields)

          const schema = isEdit ? updateSchema : createSchema
          const parsed = schema.safeParse(rawData)

          if (!parsed.success) {
            setErrors(mapSchemaErrors(parsed, fieldNames))
            return
          }

          if (isEdit && !entityId) {
            setFormError(`ID ${entityName.toLowerCase()} tidak valid.`)
            return
          }

          const displayName = firstFieldName ? String(rawData[firstFieldName] ?? "") : entityName

          setIsLoading(true)

          try {
            if (isEdit && entityId) {
              await updateFn(entityId, parsed.data)
              toast.add({
                type: "success",
                title: `${entityName} diperbarui`,
                description: `${entityName} "${displayName}" berhasil diperbarui.`,
              })
            } else {
              await createFn(parsed.data)
              toast.add({
                type: "success",
                title: `${entityName} tersimpan`,
                description: `${entityName} "${displayName}" berhasil dibuat.`,
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
          legend={isEdit ? `Edit ${entityName}` : entityNamePlural}
          description={
            isEdit
              ? `Perbarui data ${entityName.toLowerCase()} di bawah ini`
              : `Anda bisa menambahkan ${entityName.toLowerCase()} baru di sini`
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          {fields.map((field) => {
            if (field.render === "select") {
              return (
                <FieldSelect
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  description={field.description}
                  placeholder={field.placeholder}
                  required={field.required}
                  options={field.options ?? []}
                  defaultValue={
                    initialData?.[field.name] != null
                      ? String(initialData[field.name])
                      : ""
                  }
                  disabled={isLoading}
                  error={errors[field.name]}
                />
              )
            }

            const isTextarea = field.render === "textarea"
            const Component = isTextarea ? FieldTextArea : FieldInput

            return (
              <Component
                key={field.name}
                name={field.name}
                type={isTextarea ? undefined : field.type}
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={isTextarea ? field.maxLength : undefined}
                defaultValue={
                  initialData?.[field.name] != null
                    ? String(initialData[field.name])
                    : ""
                }
                disabled={isLoading}
                error={errors[field.name]}
              />
            )
          })}

          {extraFields ? (
            <div className="space-y-4">{extraFields}</div>
          ) : null}
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}
