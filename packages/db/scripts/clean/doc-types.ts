import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `doc_types` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:doc-types
 */

export async function cleanDocTypes(): Promise<void> {
  await cleanTable("doc_types")
}

runScript("Clean doc types", import.meta.url, cleanDocTypes)