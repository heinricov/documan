"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"
import { Users, Pencil, ArrowLeft } from "lucide-react"

import { useUser } from "@/features/user/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.user

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

export default function ViewUserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params?.id

  const { user, isLoading, error } = useUser(userId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat user...</p>
      </section>
    )
  }

  if (error || !user) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "User tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar user
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
              <Users
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {user.username}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Detail user</p>
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
              onClick={() => router.push(`${baseUrl}/${user.id}/edit`)}
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
                Username
              </dt>
              <dd className="text-sm sm:col-span-2">{user.username}</dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="text-sm sm:col-span-2">{user.email}</dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Role ID
              </dt>
              <dd className="font-mono text-xs break-all sm:col-span-2">
                {user.roleId}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs break-all sm:col-span-2">
                {user.id}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Dibuat
              </dt>
              <dd className="text-sm sm:col-span-2">
                {formatDate(user.createdAt)}
              </dd>
            </div>

            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-muted-foreground">
                Diperbarui
              </dt>
              <dd className="text-sm sm:col-span-2">
                {formatDate(user.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
