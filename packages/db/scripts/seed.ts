import { prisma } from "../src/client.js"

/**
 * Seed dasar untuk tabel `roles`.
 * Idempotent — bisa dijalankan berulang kali (update/create by unique title).
 *
 * Jalankan: pnpm --filter @packages/db db:seed
 */

const ROLES = [
  { title: "admin", description: "Full access" },
  { title: "editor", description: "Can manage content" },
  { title: "viewer", description: "Read-only access" },
] as const

async function seed(): Promise<void> {
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
    `Seed selesai: ${inserted} role dibuat, ${updated} role diperbarui.\n`
  )
}

try {
  await seed()
  await prisma.$disconnect()
} catch (error) {
  process.stderr.write(`Seed gagal: ${String(error)}\n`)
  await prisma.$disconnect()
  process.exitCode = 1
}