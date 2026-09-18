"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"
import { Shield, Pencil, ArrowLeft } from "lucide-react"

import { useRole } from "@/features/role/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.role

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function ViewRolePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const roleId = params?.id

  const { role, isLoading, error } = useRole(roleId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat role...</p>
      </section>
    )
  }

  if (error || !role) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Role tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar role
        </Button>
      </section>
    )
  }

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
              <Shield
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {role.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Detail role</p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(baseUrl)}
            >
              <ArrowLeft aria-hidden="true" />
              Kembali
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`${baseUrl}/${role.id}/edit`)}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <dl className="divide-y">
            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Nama
              </dt>
              <dd className="text-sm sm:col-span-2">{role.title}</dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Deskripsi
              </dt>
              <dd className="text-sm sm:col-span-2">
                {role.description?.trim() ? role.description : "—"}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Jumlah User
              </dt>
              <dd className="text-sm sm:col-span-2 font-semibold">
                {role.userCount ?? 0}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs break-all sm:col-span-2">
                {role.id}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Dibuat
              </dt>
              <dd className="text-sm sm:col-span-2">
                {formatDate(role.createdAt)}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Diperbarui
              </dt>
              <dd className="text-sm sm:col-span-2">
                {formatDate(role.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
