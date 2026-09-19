import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `subsidiaries` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:subsidiaries
 */

export async function cleanSubsidiaries(): Promise<void> {
  await cleanTable("subsidiaries")
}

runScript("Clean subsidiaries", import.meta.url, cleanSubsidiaries)