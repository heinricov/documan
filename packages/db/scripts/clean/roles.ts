import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `roles` saja.
 * Perhatian: `roles` direferensikan `users`, jadi truncate CASCADE
 * ikut menghapus `users` yang memakai role ini.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:roles
 */

export async function cleanRoles(): Promise<void> {
  await cleanTable("roles")
}

runScript("Clean roles", import.meta.url, cleanRoles)