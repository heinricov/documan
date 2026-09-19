import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `users` saja.
 * Tidak memengaruhi `roles` (users hanya memilik FK ke roles).
 *
 * Jalankan: pnpm --filter @packages/db db:clean:users
 */

export async function cleanUsers(): Promise<void> {
  await cleanTable("users")
}

runScript("Clean users", import.meta.url, cleanUsers)