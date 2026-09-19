import { prisma } from "../src/client.js"

/**
 * Truncate semua data dari tabel utama.
 * RESTART IDENTITY CASCADE mereset auto-increment & menghapus semua baris.
 *
 * Jalankan: pnpm --filter @packages/db tsx scripts/truncate.ts
 *
 * Setelah truncate, jalankan db:seed untuk membuat data awal kembali.
 */

const TABLES = ["doc_types", "users", "subsidiaries", "roles"]

async function truncate(): Promise<void> {
  const escaped = TABLES.map((t) => `"${t}"`).join(", ")

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${escaped} RESTART IDENTITY CASCADE`
  )

  process.stdout.write(
    `Truncate selesai: ${TABLES.join(", ")} kosong.\n`
  )
}

try {
  await truncate()
  await prisma.$disconnect()
} catch (error) {
  process.stderr.write(`Truncate gagal: ${String(error)}\n`)
  await prisma.$disconnect()
  process.exitCode = 1
}