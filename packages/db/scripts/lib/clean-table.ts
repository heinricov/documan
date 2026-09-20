import { prisma } from "../../src/client.js"

/**
 * Daftar tabel yang dikelola oleh script clean.
 * Urutan = urutan TRUNCATE saat clean semua sekaligus.
 */
export const TABLES = ["boxes", "partners", "doc_types", "users", "subsidiaries", "roles"] as const

export type TableName = (typeof TABLES)[number]

/**
 * Hapus SEMUA data di satu tabel.
 * `RESTART IDENTITY` mereset auto-increment (uuid tidak terpengaruh).
 * `CASCADE` ikut membershipkan tabel lain yang punya foreign key ke tabel ini
 * (mis. truncate `roles` CASCADE akan ikut menghapus `users`).
 */
export async function cleanTable(table: TableName): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`
  )
  process.stdout.write(`Truncate selesai: ${table} kosong.\n`)
}

/**
 * Hapus SEMUA tabel secara berurutan.
 */
export async function cleanAllTables(): Promise<void> {
  for (const table of TABLES) {
    await cleanTable(table)
  }
  process.stdout.write(`Truncate selesai: ${TABLES.join(", ")} kosong.\n`)
}