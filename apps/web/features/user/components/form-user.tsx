"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldSelect } from "@packages/ui/form/field-select"
import { toast } from "@packages/ui/components/toast"
import {
  CreateUserSchema,
  UpdateUserSchema,
  type User,
  type Role,
} from "@packages/validator"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.user

export type FormUserMode = "create" | "edit"

export interface FormUserProps {
  mode?: FormUserMode
  userId?: string
  initialData?: Pick<User, "username" | "email" | "roleId">
}

export function FormUser({
  mode = "create",
  userId,
  initialData,
}: FormUserProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    username?: string
    email?: string
    password?: string
    roleId?: string
  }>({})
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    let active = true

    async function loadRoles() {
      try {
        const data = await api.resources.roles.list({ limit: 100 })
        if (active) setRoles(data)
      } catch {
        // silently fail — role dropdown will be empty
      }
    }

    void loadRoles()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update User" : "Add User"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const username = (formData.get("username") as string)?.trim() ?? ""
          const email = (formData.get("email") as string)?.trim() ?? ""
          const password = (formData.get("password") as string) ?? ""
          const roleId = (formData.get("roleId") as string) ?? ""

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdateUserSchema : CreateUserSchema
          const parsed = schema.safeParse({
            username,
            email,
            ...(isEdit ? {} : { password }),
            roleId,
          })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (
                key === "username" ||
                key === "email" ||
                key === "password" ||
                key === "roleId"
              ) {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !userId) {
            setFormError("ID user tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && userId) {
              await api.resources.users.update(userId, parsed.data)
              toast.add({
                type: "success",
                title: "User diperbarui",
                description: `User "${username}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.users.create(
                parsed.data as {
                  username: string
                  email: string
                  password: string
                  roleId: string
                }
              )
              toast.add({
                type: "success",
                title: "User tersimpan",
                description: `User "${username}" berhasil dibuat.`,
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
          legend={isEdit ? "Edit User" : "Users"}
          description={
            isEdit
              ? "Perbarui data user di bawah ini"
              : "Anda bisa menambahkan user baru di sini"
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <FieldInput
            name="username"
            type="text"
            label="Username"
            description="Username unik (case-insensitive)"
            placeholder="cth. johndoe"
            required
            defaultValue={initialData?.username ?? ""}
            disabled={isLoading}
            error={errors.username}
          />

          <FieldInput
            name="email"
            type="email"
            label="Email"
            description="Email unik untuk login"
            placeholder="cth. john@example.com"
            required
            defaultValue={initialData?.email ?? ""}
            disabled={isLoading}
            error={errors.email}
          />

          {!isEdit && (
            <FieldInput
              name="password"
              type="password"
              label="Password"
              description="Minimal 8 karakter"
              placeholder="Masukkan password"
              required
              disabled={isLoading}
              error={errors.password}
            />
          )}

          <FieldSelect
            name="roleId"
            label="Role"
            description="Pilih role untuk user ini"
            placeholder="Pilih role..."
            emptyMessage="Tidak ada role tersedia."
            options={roles.map((role) => ({ label: role.title, value: role.id }))}
            defaultValue={initialData?.roleId ?? ""}
            required
            disabled={isLoading}
            error={errors.roleId}
          />
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}
