import { prisma } from "../src/client.js"
import { hashPassword } from "@packages/auth"

/**
 * Seed dasar untuk tabel `roles` & `users`.
 * Idempotent — bisa dijalankan berulang kali (update/create by unique field).
 *
 * Jalankan: pnpm --filter @packages/db db:seed
 */

const ROLES = [
  { title: "admin", description: "Full access" },
  { title: "user", description: "Standard user access" },
] as const

/**
 * User default untuk testing login.
 */
const DEFAULT_USERS = [
  {
    username: "admin",
    email: "admin@documan.id",
    password: "admin1234",
    roleTitle: "admin",
  },
  {
    username: "user",
    email: "user@documan.id",
    password: "user1234",
    roleTitle: "user",
  },
] as const

/**
 * DocType default.
 */
const DEFAULT_DOC_TYPES = [
  { title: "do", description: "Delivery Order" },
  { title: "pv", description: "Payment Voucher" },
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

  // Seed default users (idempotent by email & username — keduanya unique)
  let insertedUsers = 0
  for (const user of DEFAULT_USERS) {
    const byEmail = await prisma.user.findFirst({
      where: { email: user.email },
    })
    const byUsername = await prisma.user.findFirst({
      where: { username: user.username },
    })

    if (byEmail || byUsername) continue

    const role = await prisma.role.findUnique({
      where: { title: user.roleTitle },
    })

    if (!role) continue

    const hashed = await hashPassword(user.password)

    await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: hashed,
        roleId: role.id,
      },
    })
    insertedUsers++
  }

  // Seed default doc types (idempotent by title — unique)
  let insertedDocTypes = 0
  for (const docType of DEFAULT_DOC_TYPES) {
    const existing = await prisma.docType.findUnique({
      where: { title: docType.title },
    })

    if (existing) continue

    await prisma.docType.create({
      data: {
        title: docType.title,
        description: docType.description,
      },
    })
    insertedDocTypes++
  }

  process.stdout.write(
    `Seed selesai: ${inserted} role dibuat, ${updated} role diperbarui, ${insertedUsers} user dibuat, ${insertedDocTypes} doc type dibuat.\n`
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