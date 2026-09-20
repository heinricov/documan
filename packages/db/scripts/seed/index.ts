import { prisma } from "../../src/client.js"
import { seedRoles } from "./roles.js"
import { seedUsers } from "./users.js"
import { seedDocTypes } from "./doc-types.js"
import { seedPartners } from "./partners.js"
import { seedBoxes } from "./boxes.js"
import { seedDocumentReceipts } from "./document-receipts.js"

/**
 * Seed SEMUA tabel sekaligus.
 * Urutan penting: roles dulu (roleId users), lalu users, lalu doc-types, lalu partners, lalu boxes, lalu document_receipts.
 *
 * Jalankan: pnpm --filter @packages/db db:seed
 */

const SEEDERS = [seedRoles, seedUsers, seedDocTypes, seedPartners, seedBoxes, seedDocumentReceipts]

try {
  for (const seed of SEEDERS) {
    await seed()
  }
  await prisma.$disconnect()
  process.stdout.write("Seed semua selesai.\n")
} catch (error) {
  process.stderr.write(`Seed semua gagal: ${String(error)}\n`)
  await prisma.$disconnect()
  process.exitCode = 1
}