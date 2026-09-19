import { prisma } from "../../src/client.js"
import { cleanAllTables } from "../lib/clean-table.js"

/**
 * Hapus data SEMUA tabel sekaligus.
 * Urutan: doc_types, users, subsidiaries, roles (lihat `cleanAllTables`).
 *
 * Jalankan: pnpm --filter @packages/db db:clean
 */

try {
  await cleanAllTables()
  await prisma.$disconnect()
} catch (error) {
  process.stderr.write(`Clean semua gagal: ${String(error)}\n`)
  await prisma.$disconnect()
  process.exitCode = 1
}