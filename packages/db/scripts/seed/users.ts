import { prisma } from "../../src/client.js"
import { hashPassword } from "@packages/auth"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `users` dengan user default untuk login.
 * Idempotent — skip jika email/username sudah ada.
 * Membutuhkan role admin & user (jalankan `db:seed:roles` dulu).
 *
 * Langsung: pnpm --filter @packages/db db:seed:users
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
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

export async function seedUsers(): Promise<void> {
  let inserted = 0

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

    if (!role) {
      process.stdout.write(
        `Seed users: role "${user.roleTitle}" tidak ada — lewati ${user.username}.\n`
      )
      continue
    }

    const hashed = await hashPassword(user.password)

    await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: hashed,
        roleId: role.id,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed users selesai: ${inserted} user dibuat.\n`)
}

runScript("Seed users", import.meta.url, seedUsers)