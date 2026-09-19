import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `roles`.
 * Idempotent — bisa dijalankan berulang kali (update/create by title).
 *
 * Langsung: pnpm --filter @packages/db db:seed:roles
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const ROLES = [
  { title: "admin", description: "Full access" },
  { title: "user", description: "Standard user access" },
] as const

export async function seedRoles(): Promise<void> {
  let inserted = 0
  let updated = 0

  for (const role of ROLES) {
    const existing = await prisma.role.findUnique({
      where: { title: role.title },
    })

    if (existing) {
      await prisma.role.update({
        where: { id: existing.id },
        data: { description: role.description },
      })
      updated++
    } else {
      await prisma.role.create({
        data: {
          title: role.title,
          description: role.description,
        },
      })
      inserted++
    }
  }

  process.stdout.write(
    `Seed roles selesai: ${inserted} role dibuat, ${updated} role diperbarui.\n`
  )
}

runScript("Seed roles", import.meta.url, seedRoles)